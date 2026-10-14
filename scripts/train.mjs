import {writeFileSync} from 'node:fs';
import {mean,summarise,vector,distance} from '../dist/analytics.js';
let seed=74021;const random=()=>((seed=(Math.imul(seed,1664525)+1013904223)>>>0)/4294967296);
const noise=()=>Array.from({length:6},random).reduce((s,x)=>s+x,0)-3;
const maps=['Ascent','Haven','Bind','Lotus','Split','Sunset'];
function makeMatches(kind){
 const styles=[{adr:175,kd:1.25,opening:.19,spread:42},{adr:157,kd:1.18,opening:.08,spread:14},{adr:112,kd:.78,opening:.14,spread:27}];
 const s=styles[kind],offset=noise()*8;
 return Array.from({length:40},(_,i)=>{
  const win=random()<[.53,.58,.39][kind],enemy=5+Math.floor(random()*8),rounds=13+enemy;
  const adr=Math.max(60,s.adr+offset+noise()*s.spread),deaths=9+Math.floor(random()*10),totalHits=70+Math.floor(random()*45);
  return{id:i+1,map:maps[i%maps.length],agent:['Jett','Jett','Raze','Jett','Reyna'][i%5],win,score:win?`13 : ${enemy}`:`${enemy} : 13`,rounds,kills:Math.max(3,Math.round(deaths*(s.kd+noise()*.2))),deaths,assists:2+Math.floor(random()*8),damage:Math.round(rounds*adr),firstDeaths:Math.max(0,Math.round(rounds*s.opening+noise()*1.7)),headHits:Math.round(totalHits*(.19+random()*.13)),totalHits};
 });
}
const peers=Array.from({length:600},(_,i)=>makeMatches(i%3)),rows=peers.map(m=>vector(summarise(m.slice(-20))));
const means=rows[0].map((_,i)=>mean(rows.map(r=>r[i]))),scales=means.map((v,i)=>Math.sqrt(mean(rows.map(r=>(r[i]-v)**2)))||1);
const zs=rows.map(r=>r.map((v,i)=>(v-means[i])/scales[i]));
let centres=[zs[0],zs[1],zs[2]].map(r=>[...r]),iterations=0;
for(;iterations<100;iterations++){
 const groups=[[],[],[]];for(const z of zs){const ds=centres.map(c=>distance(z,c));groups[ds.indexOf(Math.min(...ds))].push(z)}
 const next=groups.map((g,i)=>g.length?centres[i].map((_,j)=>mean(g.map(r=>r[j]))):centres[i]);
 const movement=mean(next.map((c,i)=>distance(c,centres[i])));centres=next;if(movement<1e-9)break;
}
const raw=centres.map(c=>c.map((v,i)=>v*scales[i]+means[i]));
const low=raw.map(r=>r[0]).indexOf(Math.min(...raw.map(r=>r[0]))),other=[0,1,2].filter(i=>i!==low),steady=raw[other[0]][3]<raw[other[1]][3]?other[0]:other[1];
const labels=raw.map((_,i)=>i===low?'Developing fundamentals':i===steady?'Consistent contributor':'High-impact, high-variance');
const model={type:'KMeans',dataSource:'synthetic',seed:74021,trainingSamples:rows.length,features:['adr','kd','openingDeathRate','adrStdDev'],means,scales,centres,labels,iterations:iterations+1,meanSquaredDistance:mean(zs.map(z=>Math.min(...centres.map(c=>distance(z,c))))),referenceByWindow:Object.fromEntries([10,20,40].map(n=>[n,peers.map(m=>vector(summarise(m.slice(-n))))]))};
const profiles=[['NOX01','nox',0],['SAGE02','sage',1],['ROOKIE03','rookie',2]].map(([id,name,kind])=>({id,name,rank:'Diamond 2',role:'Duelist',matches:makeMatches(kind)}));
writeFileSync('dist/model.json',JSON.stringify(model));writeFileSync('dist/demo.json',JSON.stringify({fictional:true,profiles}));console.log(JSON.stringify({model:model.type,players:rows.length,labels,iterations:model.iterations}));
