import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {analyse,summarise,mean,vector,distance} from '../dist/analytics.js';
const model=JSON.parse(readFileSync('dist/model.json')),data=JSON.parse(readFileSync('dist/demo.json'));
assert.equal(model.type,'KMeans');assert.equal(model.centres.length,3);assert.equal(model.trainingSamples,600);
assert.equal(new Set(data.profiles.map(p=>p.id)).size,3);
const groups=new Set();for(const p of data.profiles){assert.equal(p.matches.length,40);for(const n of [10,20,40]){const a=analyse(p.matches.slice(-n),model);assert(a.percentiles.every(v=>Number.isFinite(v)&&v>=0&&v<=100));assert.equal(a.referenceCount,600);assert(model.labels.includes(a.label));if(n===20)groups.add(a.cluster)}for(const r of p.matches){assert.equal(r.rounds,r.score.split(' : ').map(Number).reduce((a,b)=>a+b));assert(r.headHits<=r.totalHits);assert(r.deaths>0)}}
assert.equal(groups.size,3,'Demo IDs must exercise distinct learned patterns');
assert.throws(()=>analyse(data.profiles[0].matches.slice(-7),model),/Unsupported/);
const peers=model.referenceByWindow['20'],zs=peers.map(r=>r.map((v,i)=>(v-model.means[i])/model.scales[i]));
const clustered=mean(zs.map(z=>Math.min(...model.centres.map(c=>distance(z,c))))),baseline=mean(zs.map(z=>distance(z,[0,0,0,0])));
assert(clustered<baseline,'Learned clusters should reduce dispersion relative to one group');
const one=summarise([{rounds:10,damage:1500,kills:10,deaths:5,firstDeaths:1,win:true,headHits:5,totalHits:20}]);assert.equal(one.adr,150);assert.equal(one.kd,2);assert.equal(one.hs,25);assert.equal(one.sd,0);
const html=readFileSync('dist/index.html','utf8');for(const [,f]of html.matchAll(/(?:src|href)="([^"#]+)"/g))if(!f.startsWith('http')&&f!=='./')assert(existsSync('dist/'+f));
const app=readFileSync('dist/app.js','utf8');assert(!/predict\(|predictedADR|riot-form|Random Forest/.test(app));
console.log('PASS: three independent IDs, all match windows, learned groups, peer percentiles, metric correctness, assets and removed forecast.');
console.log(JSON.stringify({clusterDispersion:clustered,singleGroupDispersion:baseline}));
