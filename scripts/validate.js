// Checks every country file and writes a coverage report and a review sheet.
const fs=require('fs'),D=__dirname+'/../data/';const codes=require(D+'codes.json');
const REQUIRED=[['content.about','About'],['content.standout.text','Standout fact'],['content.standout.source','Standout source'],['content.didYouKnow','Did you know?'],['geography.climate','Climate'],['government.nationalDay','National day']];
const get=(o,p)=>p.split('.').reduce((a,k)=>a&&a[k],o);const errs=[],rows=[],missing={};
const csv=v=>`"${String(v??'').replace(/"/g,'""')}"`;
for(const code of Object.keys(codes)){let f;try{f=JSON.parse(fs.readFileSync(D+`countries/${code}.json`))}catch(e){errs.push(`${code}: ${e.message}`);continue}
  if(f.code!==code)errs.push(`${code}: code field is ${f.code}`);
  if(!['draft','approved','flagged'].includes(f.status))errs.push(`${code}: status must be draft, approved or flagged`);
  for(const [p,l] of REQUIRED){const v=get(f,p);if(v==null||v===''||(Array.isArray(v)&&!v.length))(missing[code]??=[]).push(l);}
  const a=get(f,'content.about')||'';const words=a.split(/\s+/).filter(Boolean).length;
  for(const n of ['geography.coastlineKm','geography.forestPct','people.literacyPct']){const v=get(f,n);if(v!=null&&typeof v!=='number')errs.push(`${code}: ${n} must be a number`);}
  rows.push([code,f.name,f.status,words,a,get(f,'content.standout.category'),get(f,'content.standout.text'),get(f,'content.standout.source'),(get(f,'content.didYouKnow')||[]).join(' | '),f.reviewer||'',f.reviewNote||'']);}
fs.writeFileSync(D+'review.csv',['code,name,status,about_words,about,standout_category,standout,source,did_you_know,reviewer,note',...rows.map(r=>r.map(csv).join(','))].join('\n')+'\n');
const st=s=>rows.filter(r=>r[2]===s).length,complete=rows.length-Object.keys(missing).length;
fs.writeFileSync(D+'coverage.md',`# Content coverage\n\n- Countries: ${rows.length}\n- All required fields present: ${complete}\n- Approved: ${st('approved')} · Draft: ${st('draft')} · Flagged: ${st('flagged')}\n- About summaries under 60 words: ${rows.filter(r=>r[3]<60).length}\n\n${Object.keys(missing).length?'## Missing fields\n\n'+Object.entries(missing).map(([c,m])=>`- ${c}: ${m.join(', ')}`).join('\n')+'\n':''}`);
console.error(`${complete}/${rows.length} complete, ${st('approved')} approved, ${rows.filter(r=>r[3]<60).length} About summaries under 60 words`);
if(errs.length){console.error(errs.join('\n'));process.exit(1);}
