import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {MAPS,AGENTS,recommend,candidateFeatures} from '../dist/recommender.js';
const model=JSON.parse(readFileSync('dist/recommender-model.json')),data=JSON.parse(readFileSync('dist/demo.json'));
assert.equal(model.weights.length,53);assert(model.metrics.logLoss<model.baseline.logLoss);assert(model.metrics.brier<model.baseline.brier);
for(const p of data.profiles)for(const n of [10,20,40])for(const map of MAPS){
 const results=recommend(p.matches.slice(-n),map,p.role,model);
 assert.equal(results.length,8);assert.equal(new Set(results.map(r=>r.name)).size,8);
 assert(results.every((r,i)=>r.probability>0&&r.probability<1&&(!i||r.probability<=results[i-1].probability)));
 for(const r of results)assert.equal(r.experience,p.matches.slice(-n).filter(m=>m.agent===r.name).length);
 for(const role of ['Controller','Sentinel','Duelist','Initiator'])assert(recommend(p.matches,map,p.role,model,role).every(r=>r.role===role));
}
const p=data.profiles[0];assert(new Set(MAPS.map(map=>recommend(p.matches,map,p.role,model)[0].name)).size>1,'Map must influence the shortlist');
const empty=recommend([],'Ascent','Duelist',model);assert(empty.every(r=>r.experience===0&&Number.isFinite(r.probability)));
assert.throws(()=>recommend([],'invalid','Duelist',model));assert.throws(()=>recommend([],'Ascent','Duelist',model,'invalid'));
const x=candidateFeatures(p.matches,'Ascent','Jett',p.role).x;assert.equal(x.length,53);assert.equal(x.slice(1,49).reduce((a,b)=>a+b),1);
assert.notDeepEqual(recommend(data.profiles[0].matches,'Ascent','Duelist',model).map(r=>r.probability),recommend(data.profiles[2].matches,'Ascent','Duelist',model).map(r=>r.probability));
console.log('PASS: 54 map/profile/window combinations, roles, personalised inference, missing history and invalid input.');
