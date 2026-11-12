const fs=require('fs'),P=__dirname+'/../';
const wc=require(P+'tools/node_modules/world-countries/countries.json');
const cur=require('../data/curated.json'),v1=require('../data/v1.json');
const tz={};for(const l of fs.readFileSync('/usr/share/zoneinfo/zone.tab','utf8').split('\n')){if(!l||l[0]=='#')continue;const [cc,co,name]=l.split('\t');const m=co.match(/([+-]\d+)([+-]\d+)/);const dm=s=>{const sg=s[0]=='-'?-1:1,d=s.slice(1);const deg=d.length%2?(d.length>6?3:3):2;const L=(d.length==4||d.length==6)?2:3;return sg*(+d.slice(0,L)+ +d.slice(L,L+2)/60+(d.length>L+2?+d.slice(L+2)/3600:0));};(tz[cc]??=[]).push([name,+dm(m[1]).toFixed(2),+dm(m[2]).toFixed(2)]);}
const LEFT=new Set('AUS BGD BHS BRB BTN BWA BRN CYP DMA FJI GBR GRD GUY IND IDN IRL JAM JPN KEN KIR LSO MWI MYS MDV MLT MUS MOZ NAM NRU NPL NZL PAK PNG KNA LCA VCT WSM SYC SGP SLB ZAF LKA SUR SWZ TZA THA TLS TON TTO TUV UGA ZMB ZWE ATG'.split(' '));
const topo=require(P+'out/countries.json'), a1=require(P+'out/admin1.json');
const ne=JSON.parse(fs.readFileSync(P+'ne/ne_10m_admin_0_countries_ind.geojson'));
const neBy={};for(const f of ne.features){const p=f.properties;const id=p.ISO_A3_EH=='-99'?p.ADM0_A3:p.ISO_A3_EH;if(!neBy[id]||p.ADM0_A3==id)neBy[id]=p;}
const ids=new Set(topo.objects[Object.keys(topo.objects)[0]].geometries.map(g=>g.properties.id));
const meta={},missing=[];
for(const c of wc){ if(!(c.unMember||c.cca3=='VAT'||c.cca3=='PSE'))continue;
 if(!ids.has(c.cca3)){missing.push(c.cca3);continue;}
 const n=neBy[c.cca3],k=cur[c.cca3]||{};
 meta[c.cca3]={name:c.name.common,official:c.name.official,flag:c.flag,cap:c.capital,region:c.region,sub:c.subregion,
  lang:Object.values(c.languages||{}),cur:Object.values(c.currencies||{}).map(x=>x.name+(x.symbol?` (${x.symbol})`:'')),
  area:c.area, a0:n.ADM0_A3,
  pop:k.pop||n.POP_EST||null, popYear:k.pop?(k.popYear||2024):n.POP_YEAR,
  gdp:k.gdp||(n.GDP_MD>0?n.GDP_MD*1e6:null), gdpYear:k.gdp?(k.gdpYear||2024):n.GDP_YEAR,
  gov:k.gov,tz:tz[c.cca2]||[],idd:c.idd&&c.idd.root?(c.idd.suffixes&&c.idd.suffixes.length==1?c.idd.root+c.idd.suffixes[0]:c.idd.root):null,tld:(c.tld||[])[0],landlocked:c.landlocked,drive:LEFT.has(c.cca3)?'Left':'Right',v1:v1[c.cca3]||null,hos:k.hos,hog:k.hog,facts:k.facts,cur8:!!k.facts};
}
console.error('no tz',Object.entries(meta).filter(([k,v])=>!v.tz.length).map(([k])=>k));console.error('missing',missing, Object.keys(meta).length);
const a1codes=new Set(a1.objects[Object.keys(a1.objects)[0]].geometries.map(g=>g.properties.adm0_a3));
console.error('no admin1 match', Object.entries(meta).filter(([k,v])=>!a1codes.has(v.a0)).map(([k])=>k).join(','));
fs.writeFileSync(P+'out/data.js','window.KTS={countries:'+JSON.stringify(topo)+',admin1:'+JSON.stringify(a1)+',meta:'+JSON.stringify(meta)+'};');
console.error(fs.statSync(P+'out/data.js').size);
