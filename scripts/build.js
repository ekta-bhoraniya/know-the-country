// Merges every source into one data bundle and writes it into the page.
// Priority for each field: data/countries/<CODE>.json > imported (World Bank, Wikidata) > world-countries.
const fs=require('fs'),R=__dirname+'/../',D=R+'data/',B=R+'build/';
const wc=require('world-countries'),codes=require(D+'codes.json');
const wb=require(D+'imported/worldbank.json'),wd=require(D+'imported/wikidata.json');
const topo=require(B+'countries.json'),a1=require(B+'admin1.json'),adm0=require(B+'adm0.json');
const tz={};for(const l of fs.readFileSync('/usr/share/zoneinfo/zone.tab','utf8').split('\n')){if(!l||l[0]=='#')continue;const [cc,co,name]=l.split('\t');
  const m=co.match(/([+-]\d+)([+-]\d+)/),dm=(s,L)=>{const d=s.slice(1);return (s[0]=='-'?-1:1)*(+d.slice(0,L)+ +d.slice(L,L+2)/60+(d.length>L+2?+d.slice(L+2)/3600:0));};
  (tz[cc]??=[]).push([name,+dm(m[1],2).toFixed(2),+dm(m[2],3).toFixed(2)]);}
const LEFT=new Set('AUS BGD BHS BRB BTN BWA BRN CYP DMA FJI GBR GRD GUY IND IDN IRL JAM JPN KEN KIR LSO MWI MYS MDV MLT MUS MOZ NAM NRU NPL NZL PAK PNG KNA LCA VCT WSM SYC SGP SLB ZAF LKA SUR SWZ TZA THA TLS TON TTO TUV UGA ZMB ZWE ATG'.split(' '));
const cap=s=>s&&s[0].toUpperCase()+s.slice(1);const real=s=>s&&!/^Q\d+$/.test(s);const pick=(...v)=>v.find(x=>x!=null&&x!=='');
const meta={};
for(const c of wc){const code=c.cca3;if(!codes[code])continue;
  const f=JSON.parse(fs.readFileSync(D+`countries/${code}.json`));const w=wb.countries[code]||{},k=wd.countries[code]||{};
  const g=f.geography,p=f.people,gov=f.government,e=f.economy;
  const pop=e.population||w.population,gdp=e.gdpUsd||w.gdpUsd;
  const hp=g.highestPoint||(k.highestPoint&&real(k.highestPoint.name)&&k.highestPoint.m?k.highestPoint:null);
  const join=a=>a&&a.filter(real).join(' and ')||null;
  meta[code]={name:c.name.common,official:c.name.official,flag:c.flag,cap:c.capital,region:c.region,sub:c.subregion,
    lang:Object.values(c.languages||{}),cur:Object.values(c.currencies||{}).map(x=>x.name+(x.symbol?` (${x.symbol})`:'')),area:c.area,a0:adm0[code]||code,
    pop:pop&&pop.value,popYear:pop&&pop.year,gdp:gdp&&gdp.value,gdpYear:gdp&&gdp.year,
    gov:pick(gov.type,k.government&&cap(k.government[0])),hos:pick(gov.headOfState,join(k.headOfState)),hog:pick(gov.headOfGovernment,join(k.headOfGovernment)),
    leadersAsOf:gov.headOfState?'Jun 2026':'Wikidata, '+wd.fetched.slice(0,7),facts:f.content.didYouKnow,full:f.status==='approved',status:f.status,
    tz:tz[c.cca2]||[],idd:c.idd&&c.idd.root?(c.idd.suffixes&&c.idd.suffixes.length==1?c.idd.root+c.idd.suffixes[0]:c.idd.root):null,tld:(c.tld||[])[0],landlocked:c.landlocked,drive:LEFT.has(code)?'Left':'Right',
    v1:{about:f.content.about,standout:f.content.standout&&{cat:f.content.standout.category,text:f.content.standout.text,src:f.content.standout.source},
      forest:pick(g.forestPct,w.forestPct&&Math.round(w.forestPct.value)),coast:g.coastlineKm,high:hp&&[hp.name,hp.m],river:g.longestRiver&&[g.longestRiver.name,g.longestRiver.km],climate:g.climate,
      age:p.medianAge,life:pick(p.lifeExpectancy,w.lifeExpectancy&&Math.round(w.lifeExpectancy.value)),lit:pick(p.literacyPct,w.literacyPct&&Math.round(w.literacyPct.value)),urban:pick(p.urbanPct,w.urbanPct&&Math.round(w.urbanPct.value)),
      day:gov.nationalDay,...f.symbols,unesco:f.practical.unescoSites}};
}
const bundle='window.KTS='+JSON.stringify({countries:topo,admin1:a1,meta})+';';
const html=fs.readFileSync(R+'src/template.html','utf8').replace('/*DATA*/',()=>bundle);
fs.writeFileSync(R+'index.html',html);console.error('index.html',Math.round(html.length/1024),'KB,',Object.keys(meta).length,'countries');
