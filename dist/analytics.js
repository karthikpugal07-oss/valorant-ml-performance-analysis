export const mean = a => a.reduce((s,x)=>s+x,0)/a.length;
export function summarise(matches) {
 const total=k=>matches.reduce((s,m)=>s+m[k],0), adrs=matches.map(m=>m.damage/m.rounds);
 return {adr:total('damage')/total('rounds'),kd:total('kills')/total('deaths'),opening:total('firstDeaths')/total('rounds'),sd:Math.sqrt(mean(adrs.map(x=>(x-mean(adrs))**2))),win:100*matches.filter(m=>m.win).length/matches.length,hs:100*total('headHits')/total('totalHits')};
}
export const vector=m=>[m.adr,m.kd,m.opening,m.sd];
export const distance=(a,b)=>a.reduce((s,x,i)=>s+(x-b[i])**2,0);
export function analyse(matches,model){
 const metrics=summarise(matches),x=vector(metrics),z=x.map((v,i)=>(v-model.means[i])/model.scales[i]);
 const distances=model.centres.map(c=>distance(z,c)),cluster=distances.indexOf(Math.min(...distances));
 const peers=model.referenceByWindow[String(matches.length)];if(!peers)throw new Error('Unsupported match window');
 const percentiles=x.map((v,i)=>100*peers.filter(r=>i<2?r[i]<v:r[i]>v).length/peers.length);
 return {metrics,cluster,label:model.labels[cluster],percentiles,referenceCount:peers.length};
}
