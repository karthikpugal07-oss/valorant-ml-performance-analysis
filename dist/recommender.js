export const MAPS=['Ascent','Haven','Bind','Lotus','Split','Sunset'];
export const AGENTS=[{name:'Jett',role:'Duelist'},{name:'Raze',role:'Duelist'},{name:'Reyna',role:'Duelist'},{name:'Omen',role:'Controller'},{name:'Brimstone',role:'Controller'},{name:'Sova',role:'Initiator'},{name:'Cypher',role:'Sentinel'},{name:'Killjoy',role:'Sentinel'}];
export const sigmoid=z=>1/(1+Math.exp(-Math.max(-35,Math.min(35,z))));
export function candidateFeatures(history,map,agent,preferredRole){
 if(!MAPS.includes(map)||!AGENTS.some(a=>a.name===agent))throw new Error('Unsupported map or agent');
 const h=history.filter(m=>m.agent===agent),n=h.length,w=h.filter(m=>m.win).length,rounds=h.reduce((s,m)=>s+m.rounds,0);
 const adr=rounds?h.reduce((s,m)=>s+m.damage,0)/rounds:140;
 const numeric=[Math.min(n,40)/40,((w+3)/(n+6)-.5)*2,(adr-140)/70,AGENTS.find(a=>a.name===agent).role===preferredRole?1:0];
 const pair=MAPS.indexOf(map)*AGENTS.length+AGENTS.findIndex(a=>a.name===agent);
 return {x:[1,...Array.from({length:MAPS.length*AGENTS.length},(_,i)=>i===pair?1:0),...numeric],n,w,adr,mapMatches:h.filter(m=>m.map===map).length};
}
export function recommend(history,map,role,model,filter='All'){
 if(!['All','Duelist','Controller','Initiator','Sentinel'].includes(filter))throw new Error('Unsupported role filter');
 return AGENTS.filter(a=>filter==='All'||a.role===filter).map(agent=>{
  const f=candidateFeatures(history,map,agent.name,role),contributions=f.x.map((v,i)=>v*model.weights[i]);
  return {...agent,probability:sigmoid(contributions.reduce((s,x)=>s+x,0)),experience:f.n,wins:f.w,mapMatches:f.mapMatches,adr:f.adr,
   evidence:f.n<5?'Very limited personal history':f.n<15?'Limited personal history':'More personal history',
   signals:[{name:'Map–agent pattern',value:contributions.slice(1,49).reduce((s,x)=>s+x,0)},{name:'Agent experience',value:contributions[49]},{name:'Prior agent results',value:contributions[50]},{name:'Prior agent damage',value:contributions[51]},{name:'Preferred role',value:contributions[52]}]};
 }).sort((a,b)=>b.probability-a.probability||a.name.localeCompare(b.name));
}
