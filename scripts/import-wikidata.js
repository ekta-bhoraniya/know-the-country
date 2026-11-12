// Pulls leaders, government type, highest point and UNESCO site counts from Wikidata.
const fs=require('fs'),{sparql,CODES}=require('./lib');
const vals=CODES.map(c=>`"${c}"`).join(' ');
const base=`VALUES ?iso {${vals}} ?c wdt:P298 ?iso. ?c wdt:P31 wd:Q3624078.`;
const out={};for(const c of CODES)out[c]={};
const run=(name,q,fn)=>{const rows=sparql(q);for(const r of rows){const o=out[r.iso.value];if(o)fn(o,r);}console.error(name,Object.values(out).filter(o=>o[name]!=null).length,'/',CODES.length);};
const lead=(p,key)=>run(key,`SELECT ?iso ?pLabel WHERE { ${base} ?c p:${p} ?s. ?s ps:${p} ?p. FILTER NOT EXISTS{?s pq:P582 ?e} SERVICE wikibase:label{bd:serviceParam wikibase:language "en".} }`,(o,r)=>{(o[key]??=[]).includes(r.pLabel.value)||o[key].push(r.pLabel.value)});
lead('P35','headOfState');lead('P6','headOfGovernment');
run('government',`SELECT ?iso ?gLabel WHERE { ${base} ?c wdt:P122 ?g. SERVICE wikibase:label{bd:serviceParam wikibase:language "en".} }`,(o,r)=>{(o.government??=[]).push(r.gLabel.value)});
run('highestPoint',`SELECT ?iso ?hLabel ?el WHERE { ${base} ?c wdt:P610 ?h. OPTIONAL{?h wdt:P2044 ?el} SERVICE wikibase:label{bd:serviceParam wikibase:language "en".} }`,(o,r)=>{if(!o.highestPoint||(r.el&&!o.highestPoint.m))o.highestPoint={name:r.hLabel.value,m:r.el?Math.round(+r.el.value):null}});
{const iso={};for(const r of sparql(`SELECT ?c ?iso WHERE { ?c wdt:P298 ?iso; wdt:P31 wd:Q3624078. }`))iso[r.c.value]=r.iso.value;
 const seen=new Set();for(const r of sparql(`SELECT DISTINCT ?s ?c WHERE { ?s wdt:P1435 wd:Q9259; wdt:P17 ?c. }`)){const k=iso[r.c.value];if(!k||!out[k]||seen.has(r.s.value+k))continue;seen.add(r.s.value+k);out[k].unescoSites=(out[k].unescoSites||0)+1;}
 console.error('unescoSites',Object.values(out).filter(o=>o.unescoSites).length);}
fs.writeFileSync(__dirname+'/../data/imported/wikidata.json',JSON.stringify({source:'Wikidata',fetched:new Date().toISOString().slice(0,10),countries:out},null,1));
