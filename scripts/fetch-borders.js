// Downloads Natural Earth borders (India point of view) and simplifies them into build/.
const fs=require('fs'),{execFileSync}=require('child_process');
const B=__dirname+'/../build/',RAW='https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/';
fs.mkdirSync(B+'raw',{recursive:true});
for(const f of ['ne_10m_admin_0_countries_ind.geojson','ne_10m_admin_1_states_provinces.geojson'])
  if(!fs.existsSync(B+'raw/'+f)){console.error('downloading',f);execFileSync('curl',['-sSfL','-o',B+'raw/'+f,RAW+f]);}
const ms=(...a)=>execFileSync(require.resolve('mapshaper/bin/mapshaper'),a,{stdio:'inherit'});
ms(B+'raw/ne_10m_admin_0_countries_ind.geojson','-each','id = ISO_A3_EH=="-99" ? ADM0_A3 : ISO_A3_EH','-filter-fields','id,NAME','-simplify','5%','weighted','keep-shapes','-o',B+'countries.json','format=topojson','quantization=100000');
ms(B+'raw/ne_10m_admin_1_states_provinces.geojson','-filter-fields','name,adm0_a3','-simplify','1.2%','weighted','keep-shapes','-o',B+'admin1.json','format=topojson','quantization=50000');
// Natural Earth's admin-0 code for each country, used to match states and provinces.
const ne=JSON.parse(fs.readFileSync(B+'raw/ne_10m_admin_0_countries_ind.geojson'));const a0={};
for(const {properties:p} of ne.features){const id=p.ISO_A3_EH=='-99'?p.ADM0_A3:p.ISO_A3_EH;if(!a0[id]||p.ADM0_A3==id)a0[id]=p.ADM0_A3;}
fs.writeFileSync(B+'adm0.json',JSON.stringify(a0));
