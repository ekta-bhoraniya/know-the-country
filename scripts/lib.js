// Shared helpers. HTTP goes through curl so it respects HTTPS_PROXY in any environment.
const {execFileSync}=require('child_process');
exports.getJSON=(url,headers={})=>JSON.parse(execFileSync('curl',['-sSfL','-A','know-the-country-build/1.0',...Object.entries(headers).flatMap(([k,v])=>['-H',`${k}: ${v}`]),url],{maxBuffer:1<<28}).toString());
exports.sparql=q=>exports.getJSON('https://query.wikidata.org/sparql?format=json&query='+encodeURIComponent(q),{Accept:'application/sparql-results+json'}).results.bindings;
exports.CODES=Object.keys(require('../data/codes.json'));
