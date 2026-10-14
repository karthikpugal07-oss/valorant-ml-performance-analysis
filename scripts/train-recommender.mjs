import {writeFileSync} from 'node:fs';
import {MAPS,AGENTS,candidateFeatures,sigmoid} from '../dist/recommender.js';
let seed=270619;const random=()=>((seed=(Math.imul(seed,1664525)+1013904223)>>>0)/4294967296);
const roles=['Duelist','Controller','Initiator','Sentinel'];
// Deliberately simulated map affinities. These are not factual meta statistics.
const affinities=MAPS.map((_,m)=>AGENTS.map((_,a)=>Math.sin((m+1)*(a+2)*1.7)*.85));
const train=[],test=[];
for(let player=0;player<240;player++){
 const history=[],role=roles[player%roles.length],skill=(random()-.5)*.6;
 for(let time=0;time<65;time++){
  const map=MAPS[Math.floor(random()*MAPS.length)],agent=AGENTS[Math.floor(random()*AGENTS.length)];
  const {x}=candidateFeatures(history,map,agent.name,role),num=x.slice(-4);
  const p=sigmoid(-.15+affinities[MAPS.indexOf(map)][AGENTS.indexOf(agent)]+.65*num[0]+1.1*num[1]+.4*num[2]+.55*num[3]+skill),win=random()<p;
  if(time>=10)(player<190?train:test).push({x,y:Number(win),player,time});
  history.push({agent:agent.name,map,win,rounds:22,damage:Math.round(22*(125+random()*40+skill*20))});
 }
}
const weights=Array(53).fill(0);
for(let epoch=0;epoch<350;epoch++){
 const grad=weights.map(()=>0);
 for(const {x,y}of train){let z=0;for(let i=0;i<x.length;i++)z+=weights[i]*x[i];const e=sigmoid(z)-y;for(let i=0;i<x.length;i++)if(x[i])grad[i]+=e*x[i]}
 for(let i=0;i<weights.length;i++)weights[i]-=.7*(grad[i]/train.length+(i?.001*weights[i]:0));
}
const base=train.reduce((s,r)=>s+r.y,0)/train.length;
const evaluate=fn=>{let loss=0,brier=0,correct=0;for(const r of test){const p=fn(r);loss-=r.y*Math.log(p)+(1-r.y)*Math.log(1-p);brier+=(p-r.y)**2;correct+=Number((p>=.5)===Boolean(r.y))}return{logLoss:loss/test.length,brier:brier/test.length,accuracy:correct/test.length}};
const metrics=evaluate(r=>sigmoid(r.x.reduce((s,x,i)=>s+x*weights[i],0))),baseline=evaluate(()=>base);
const support=Object.fromEntries(MAPS.map((map,m)=>[map,Object.fromEntries(AGENTS.map((a,j)=>[a.name,train.filter(r=>r.x[1+m*8+j]===1).length]))]));
const model={type:'LogisticRegression',synthetic:true,seed:270619,weights,trainingRows:train.length,testRows:test.length,trainingPlayers:190,testPlayers:50,metrics,baseline,support,featureCount:53,split:'Disjoint players; features use only earlier matches',candidateAgents:AGENTS.length};
writeFileSync('dist/recommender-model.json',JSON.stringify(model));console.log(JSON.stringify({trainingRows:model.trainingRows,testRows:model.testRows,metrics,baseline}));
