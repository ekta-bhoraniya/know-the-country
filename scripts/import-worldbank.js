// Pulls the most recent non-empty value of each indicator for every country.
const fs=require('fs'),{getJSON,CODES}=require('./lib');
const IND={population:'SP.POP.TOTL',gdpUsd:'NY.GDP.MKTP.CD',forestPct:'AG.LND.FRST.ZS',lifeExpectancy:'SP.DYN.LE00.IN',literacyPct:'SE.ADT.LITR.ZS',urbanPct:'SP.URB.TOTL.IN.ZS'};
const out={};for(const c of CODES)out[c]={};
for(const [k,id] of Object.entries(IND)){
  const [,rows]=getJSON(`https://api.worldbank.org/v2/country/all/indicator/${id}?format=json&mrnev=1&per_page=500`);
  for(const r of rows||[])if(out[r.countryiso3code]&&r.value!=null)out[r.countryiso3code][k]={value:r.value,year:+r.date};
  console.error(k,Object.values(out).filter(o=>o[k]).length,'/',CODES.length);
}
fs.writeFileSync(__dirname+'/../data/imported/worldbank.json',JSON.stringify({source:'World Bank Open Data',fetched:new Date().toISOString().slice(0,10),countries:out},null,1));
