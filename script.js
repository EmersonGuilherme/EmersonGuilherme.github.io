'use strict';
(() => {
 const $ = id => document.getElementById(id);
 const root = document.documentElement;
 const storage = {get(k){try{return localStorage.getItem(k)}catch{return null}},set(k,v){try{localStorage.setItem(k,v)}catch{}}};
 let lang = storage.get('eg-language') === 'pt' ? 'pt' : 'en';
 let current = 'kafka';
 const evidence = new Map();
 const active = new Map(), runs = new Map(); let sequence=0;
 const wait = ms => new Promise(resolve=>setTimeout(resolve,ms));
 const T = (en,pt) => lang==='pt'?pt:en;
 const text = (el,value) => {el.textContent=String(value);return el};
 const node = (tag,cls,value) => {const el=document.createElement(tag);if(cls)el.className=cls;if(value!==undefined)text(el,value);return el};
 const rule = (id,pass,en,pt,observed) => ({id,pass:Boolean(pass),label:{en,pt},observed});
 const result = (checks,meta={}) => ({checks,meta,passed:checks.every(x=>x.pass),passedCount:checks.filter(x=>x.pass).length});
 const isObject = x => x!==null && typeof x==='object' && !Array.isArray(x);
 const parse = source => {try{return {value:JSON.parse(source),ok:true}}catch{return {ok:false}}};
 const pricePattern = /R\$\s*(\d+(?:[.,]\d{1,2})?)(?!\d|[.,]\d)/gi;
 const inputDefaults = {ai:{en:'The approved price is R$ 120. I will escalate your availability request to a human agent.',pt:'O preço aprovado é R$ 120. Vou encaminhar seu pedido de disponibilidade a um atendente humano.'}};
 function show(id,r){
   const box=$(id+'-output');box.replaceChildren();
   const head=node('div','resulthead');const badge=node('strong',r.passed?'pass':'fail',r.passed?T('PASS','APROVADO'):T('FAIL','REPROVADO'));
   head.append(badge,node('span','',`${r.passedCount}/${r.checks.length} ${T('checks passed','verificações aprovadas')}`));box.append(head);
   for(const check of r.checks){const row=node('div','checkrow');row.append(node('span','checkicon '+(check.pass?'pass':'fail'),check.pass?'✓':'×'),node('span','',check.label[lang]));box.append(row);}
 }
 function controls(id,locked){$( 'panel-'+id).querySelectorAll('button,input,textarea,select').forEach(el=>el.disabled=locked);$('export').disabled=active.size>0||!evidence.size;$('language').disabled=active.size>0;}
 function logLine(log,message,cls=''){const line=node('div','trace-line '+cls,message);log.append(line);log.scrollTop=log.scrollHeight;}
 async function animate(id,r,run){
   const box=$(id+'-output');box.replaceChildren();box.setAttribute('aria-busy','true');
   const head=node('div','resulthead');const status=node('strong','running',T('● RUNNING','● EXECUTANDO'));const counter=node('span','','0%');head.append(status,counter);
   const bar=node('progress','run-progress');bar.max=100;bar.value=0;bar.setAttribute('aria-label',T('Execution progress','Progresso da execução'));
   const meta=node('div','run-meta',`RUN #${run.number} · ${T('LOCAL EXECUTION','EXECUÇÃO LOCAL')}`);
   const checks=node('div','run-checks');const log=node('div','trace-console');log.setAttribute('role','log');log.setAttribute('aria-label',T('Execution log','Log de execução'));
   box.append(head,bar,meta,checks,log);
   const stamp=()=>`+${((performanceNow()-run.start)/1000).toFixed(2)}s`;
   const steps=r.checks.map(c=>{const row=node('div','checkrow pending');const icon=node('span','checkicon','○');row.append(icon,node('span','',c.label[lang]));checks.append(row);return {c,row,icon}});
   logLine(log,`${stamp()}  INIT  ${id.toUpperCase()} / #${run.number}`);
   const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
   const delay=reduced?50:420;
   await wait(delay);
   if(id==='performance' && r.meta.samples){const {values}=sample(r.meta.profile);for(let n=40;n<=values.length;n+=40){const subset=values.slice(0,n);chart(subset,r.meta.thresholds.p95Ms);$('perf-metrics').replaceChildren();for(const [label,value] of [['p50',quantile(subset,.5)+' ms'],['p95',quantile(subset,.95)+' ms'],['p99',quantile(subset,.99)+' ms'],[T('Samples','Amostras'),`${n}/${values.length}`]]){const m=node('div','metric');m.append(node('strong','',value),node('small','',label));$('perf-metrics').append(m)}bar.value=n/values.length*50;text(counter,Math.round(bar.value)+'%');logLine(log,`${stamp()}  SAMPLE  ${n}/${values.length}`);await wait(reduced?30:230)}}
   let done=0;for(const {c,row,icon} of steps){row.className='checkrow checking';text(icon,'◌');logLine(log,`${stamp()}  CHECK  ${c.id}`);await wait(delay);row.className='checkrow';icon.className='checkicon '+(c.pass?'pass':'fail');text(icon,c.pass?'✓':'×');logLine(log,`${stamp()}  ${c.pass?'PASS':'FAIL'}   ${c.id}`,c.pass?'pass':'fail');done++;bar.value=(id==='performance'&&r.meta.samples?50:0)+(id==='performance'&&r.meta.samples?50:100)*done/steps.length;text(counter,Math.round(bar.value)+'%');}
   run.elapsedMs=Math.round(performanceNow()-run.start);r.meta.presentationDurationMs=run.elapsedMs;r.meta.runNumber=run.number; evidence.set(id,r);runs.set(id,run);
   status.className=r.passed?'pass':'fail';text(status,r.passed?T('PASS · GATE OPEN','APROVADO · GATE LIBERADO'):T('FAIL · GATE BLOCKED','REPROVADO · GATE BLOQUEADO'));text(counter,`${r.passedCount}/${r.checks.length}`);text(meta,`RUN #${run.number} · ${(run.elapsedMs/1000).toFixed(2)}s · ${T('Presentation duration','Duração da apresentação')}`);logLine(log,`${stamp()}  GATE  ${r.passed?'PASS':'FAIL'}`,r.passed?'pass':'fail');box.setAttribute('aria-busy','false');active.delete(id);controls(id,false);
   if(id==='performance'&&r.meta.samples){const m=$('perf-metrics').lastElementChild;m.replaceChildren(node('strong','',r.meta.errorRate.toFixed(2)+'%'),node('small','',T('Error rate','Taxa de erros')));}
 }
 const performanceNow=()=>window.performance.now();
 function launch(id,fn){if(active.has(id))return;const run={number:++sequence,start:performanceNow()};active.set(id,run);controls(id,true);fn();}
 function save(id,r){if(active.has(id)){if(id==='performance'){$('perf-metrics').replaceChildren();$('perf-chart').replaceChildren();}animate(id,r,active.get(id));return;}evidence.set(id,r);show(id,r);$('export').disabled=active.size>0;}
 function jsonError(id,code){save(id,result([rule(code,false,'Input must be a valid JSON object.','A entrada deve ser um objeto JSON válido.')],{kind:'invalid-input'}));}
 function kafka(){const parsed=parse($('kafka-input').value);if(!parsed.ok||!isObject(parsed.value)){jsonError('kafka','json-object');return}const x=parsed.value;const ref=x.reference;const extra=Object.keys(x).filter(k=>!['event_id','amount','currency','reference'].includes(k));
   save('kafka',result([
    rule('event-id',typeof x.event_id==='string'&&x.event_id.trim().length>0,'event_id: non-empty string','event_id: texto não vazio',typeof x.event_id),
    rule('amount',typeof x.amount==='number'&&Number.isFinite(x.amount)&&x.amount>=0,'amount: finite number ≥ 0','amount: número finito ≥ 0',typeof x.amount),
    rule('currency',typeof x.currency==='string'&&/^[A-Z]{3}$/.test(x.currency),'currency: three uppercase letters','currency: três letras maiúsculas',typeof x.currency),
    rule('nullable-reference',ref===undefined||ref===null||typeof ref==='string','reference: null/string union; missing treated as default null','reference: union null/string; ausente assume null',ref===undefined?'default null':ref===null?'null':typeof ref),
    rule('known-fields',extra.length===0,'Only declared fields (strict demo policy)','Somente campos declarados (política estrita da demo)',extra.length)
   ],{kind:'illustrative-contract',scope:'No Kafka, Schema Registry or Avro runtime; strict demo field policy.'}));
 }
 function quantile(arr,q){const sorted=[...arr].sort((a,b)=>a-b);return sorted[Math.max(0,Math.ceil(sorted.length*q)-1)]}
 function sample(profile){let seed=91832;const next=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296}; const values=[];let errors=0;for(let i=0;i<240;i++){const n=next(),tail=next(),bad=next(); let latency=70+n*110+(tail>.91?tail*110:0);if(profile==='slow')latency=170+n*310+(tail>.78?tail*280:0);if(profile==='errors')latency=80+n*145+(tail>.91?tail*160:0);values.push(Math.round(latency));if(bad<(profile==='errors'?.075:0.003))errors++}return {values,errors};}
 function svgNode(tag,attrs){const el=document.createElementNS('http://www.w3.org/2000/svg',tag);Object.entries(attrs).forEach(([k,v])=>el.setAttribute(k,String(v)));return el}
 function chart(values,threshold){const svg=$('perf-chart');svg.replaceChildren();const W=700,H=170,left=40,right=15,top=12,bottom=28;const max=Math.max(100,Math.ceil(Math.max(...values,threshold)/100)*100);const y=x=>top+(H-top-bottom)*(1-x/max);const x=i=>left+i*(W-left-right)/(values.length-1);
   for(let i=0;i<=4;i++){const val=max*i/4;svg.append(svgNode('line',{x1:left,y1:y(val),x2:W-right,y2:y(val),stroke:'var(--line)','stroke-width':1}));const label=svgNode('text',{x:left-6,y:y(val)+4,fill:'var(--muted)','text-anchor':'end','font-size':10,'font-family':'monospace'});label.textContent=Math.round(val);svg.append(label);}
   svg.append(svgNode('polyline',{points:values.map((val,i)=>`${x(i).toFixed(1)},${y(val).toFixed(1)}`).join(' '),fill:'none',stroke:'var(--accent)','stroke-width':1.3,'stroke-linejoin':'round'}));
   svg.append(svgNode('line',{x1:left,y1:y(threshold),x2:W-right,y2:y(threshold),stroke:'var(--amber)','stroke-width':1.4,'stroke-dasharray':'5 5'}));
   const axis=svgNode('text',{x:left,y:H-9,fill:'var(--muted)','font-size':10,'font-family':'monospace'});axis.textContent=T(`${values.length} synthetic requests · ms · dashed = p95 limit`,`${values.length} requisições sintéticas · ms · tracejado = limite p95`);svg.append(axis);
 }
 function performance(){const rawLimit=$('perf-limit').value,rawErr=$('error-limit').value;const limit=Number(rawLimit),errorLimit=Number(rawErr);if(!rawLimit||!rawErr||!Number.isFinite(limit)||limit<1||limit>10000||!Number.isFinite(errorLimit)||errorLimit<0||errorLimit>100){$('perf-metrics').replaceChildren();$('perf-chart').replaceChildren();save('performance',result([rule('limits',false,'Enter a p95 limit from 1–10000 ms and an error limit from 0–100%.','Informe limite p95 de 1–10000 ms e taxa de erros de 0–100%.')],{kind:'invalid-input'}));return}
  const profile=$('perf-profile').value;const {values,errors}=sample(profile);const p50=quantile(values,.5),p95=quantile(values,.95),p99=quantile(values,.99),rate=errors/values.length*100;
  const metrics=$('perf-metrics');metrics.replaceChildren();for(const [label,value] of [['p50',`${p50} ms`],['p95',`${p95} ms`],['p99',`${p99} ms`],[T('Error rate','Taxa de erros'),`${rate.toFixed(2)}%`]]){const m=node('div','metric');m.append(node('strong','',value),node('small','',label));metrics.append(m)}chart(values,limit);
  save('performance',result([rule('p95-limit',p95<=limit,`p95 ${p95} ms ≤ ${limit} ms`,`p95 ${p95} ms ≤ ${limit} ms`,p95),rule('error-limit',rate<=errorLimit,`Error rate ${rate.toFixed(2)}% ≤ ${errorLimit}%`,`Taxa de erros ${rate.toFixed(2)}% ≤ ${errorLimit}%`,rate)],{kind:'synthetic-performance',profile,samples:values.length,p50,p95,p99,errorRate:rate,thresholds:{p95Ms:limit,errorPercent:errorLimit},quantile:'nearest-rank',scope:'Seeded local sample generation; no measured server requests or throughput.'}));
 }
 const fixtures={success:{status:200,headers:{'content-type':'application/json'},body:{id:'42',name:'Demo User',email:'demo@example.test'}},missing:{status:404,headers:{'content-type':'application/json'},body:{message:'User not found'}},bad:{status:200,headers:{'content-type':'text/plain'},body:{id:42,name:'',email:'invalid'}}};
 function fixture(){text($('api-input'),'');$('api-input').value=JSON.stringify(fixtures[$('api-fixture').value],null,2);api()}
 function api(){const parsed=parse($('api-input').value);if(!parsed.ok||!isObject(parsed.value)){jsonError('api','json-object');return}const x=parsed.value,body=x.body,scenario=$('api-fixture').value;const expected=scenario==='missing'?404:200;const content=isObject(x.headers)?x.headers['content-type']:undefined;
 const checks=[rule('status',x.status===expected,`HTTP status equals ${expected}`,`Status HTTP igual a ${expected}`,typeof x.status==='number'?x.status:typeof x.status),rule('content-type',typeof content==='string'&&content.split(';')[0].trim().toLowerCase()==='application/json','Content-Type is application/json','Content-Type é application/json'),rule('body-object',isObject(body),'Response body is an object','Corpo da resposta é um objeto')];
 if(expected===404){checks.push(rule('error-message',isObject(body)&&typeof body.message==='string'&&body.message.trim().length>0,'Error message is present','Mensagem de erro presente'))}else{checks.push(rule('user-id',isObject(body)&&body.id==='42','Expected user id is the string "42"','ID esperado é a string "42"'),rule('user-name',isObject(body)&&typeof body.name==='string'&&body.name.trim().length>0,'User name is non-empty','Nome não vazio'),rule('user-email',isObject(body)&&typeof body.email==='string'&&/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email),'Email has a basic valid format','Email tem formato básico válido'))}
 save('api',result(checks,{kind:'local-api-fixture',scenario,expectedStatus:expected,scope:'Local JSON assertions; no HTTP requests, REST Assured, Cypress or Playwright runtime.'}));
 }
 function ai(){const value=$('ai-input').value.trim();const prices=[...value.matchAll(pricePattern)].map(m=>Number(m[1].replace(',','.')));const escalation=/\b(escalat\w*|encaminh\w*|human agent|atendente humano|atendimento humano)\b/i.test(value);const sensitive=/\b(cpf|password|senha|ssn|social security|credit card|cart[aã]o de cr[eé]dito)\b/i.test(value);
 save('ai',result([rule('nonempty',value.length>0,'Response is non-empty','Resposta não vazia'),rule('approved-price',prices.length>0&&prices.every(p=>p===120),'Recognized R$ amounts all equal approved R$ 120','Valores R$ reconhecidos iguais ao preço aprovado de R$ 120',prices.length),rule('escalation',escalation,'Escalation keyword is present','Palavra-chave de encaminhamento presente'),rule('sensitive-keywords',!sensitive,'No sensitive-data keywords detected','Nenhuma palavra-chave de dado sensível detectada')],{kind:'deterministic-policy-heuristics',scope:'Limited regex/keyword checks; not semantic understanding, LLM-as-a-Judge, security validation or compliance certification.'}));
 }
 function choose(id,focus=false){if(!['kafka','performance','api','ai'].includes(id))return;current=id;for(const tab of document.querySelectorAll('[data-lab]')){const on=tab.dataset.lab===id;tab.setAttribute('aria-selected',String(on));tab.tabIndex=on?0:-1;$(tab.getAttribute('aria-controls')).hidden=!on;if(on&&focus)tab.focus()};}
 function localize(){root.lang=lang==='pt'?'pt-BR':'en';document.querySelectorAll('[data-en][data-pt]').forEach(el=>text(el,el.dataset[lang]));text($('language'),lang==='pt'?'EN':'PT');$('language').setAttribute('aria-label',T('Mudar para português','Switch to English'));const aiInput=$('ai-input');if(!active.has('ai')&&Object.values(inputDefaults.ai).includes(aiInput.value)){aiInput.value=inputDefaults.ai[lang]}for(const [id,r] of evidence)if(!active.has(id))show(id,r);if(!active.has('performance')&&evidence.has('performance'))performance();}
 function setTheme(theme){root.dataset.theme=theme==='light'?'light':'dark';storage.set('eg-theme',root.dataset.theme);text($('theme'),root.dataset.theme==='dark'?'☀':'☾');$('theme').setAttribute('aria-pressed',String(root.dataset.theme==='light'))}
 function exportEvidence(){if(!evidence.size)return;const payload={format:'eg-portfolio-evidence-v1',generatedAt:new Date().toISOString(),language:lang,scope:'Educational local checks only. No client systems or actual benchmarks. Inputs are intentionally excluded.',labs:Object.fromEntries([...evidence].map(([id,r])=>[id,{passed:r.passed,passedCount:r.passedCount,total:r.checks.length,meta:r.meta,checks:r.checks.map(c=>({id:c.id,pass:c.pass,label:c.label[lang],observed:c.observed}))}]))};const blob=new Blob([JSON.stringify(payload,null,2)],{type:'application/json'});const url=URL.createObjectURL(blob);const a=node('a');a.href=url;a.download='quality-lab-evidence.json';document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000)}
 $('language').addEventListener('click',()=>{lang=lang==='pt'?'en':'pt';storage.set('eg-language',lang);localize()});$('theme').addEventListener('click',()=>setTheme(root.dataset.theme==='dark'?'light':'dark'));setTheme(storage.get('eg-theme')==='light'?'light':'dark');
 const tabs=[...document.querySelectorAll('[data-lab]')];tabs.forEach((tab,i)=>{tab.addEventListener('click',()=>choose(tab.dataset.lab));tab.addEventListener('keydown',ev=>{let j;if(ev.key==='ArrowRight')j=(i+1)%tabs.length;else if(ev.key==='ArrowLeft')j=(i+tabs.length-1)%tabs.length;else if(ev.key==='Home')j=0;else if(ev.key==='End')j=tabs.length-1;else return;ev.preventDefault();choose(tabs[j].dataset.lab,true)})});document.querySelectorAll('[data-open-lab]').forEach(a=>a.addEventListener('click',()=>choose(a.dataset.openLab)));
 $('kafka-run').addEventListener('click',()=>launch('kafka',kafka));$('kafka-bad').addEventListener('click',()=>{$('kafka-input').value=JSON.stringify({event_id:'',amount:-10,currency:'br',reference:123,extra:true},null,2);launch('kafka',kafka)});$('perf-run').addEventListener('click',()=>launch('performance',performance));$('api-fixture').addEventListener('change',fixture);$('api-run').addEventListener('click',()=>launch('api',api));$('ai-run').addEventListener('click',()=>launch('ai',ai));$('ai-bad').addEventListener('click',()=>{$('ai-input').value=T('The price is R$ 500. Send your password to proceed.','O preço é R$ 500. Envie sua senha para continuar.');launch('ai',ai)});$('export').addEventListener('click',exportEvidence);$('print').addEventListener('click',()=>{document.querySelector('.earlier').open=true;window.print()});
 $('api-input').value=JSON.stringify(fixtures.success,null,2);$('ai-input').value=inputDefaults.ai[lang];localize();for(const id of ['kafka','performance','api','ai']){const out=$(id+'-output');out.replaceChildren(node('div','run-meta',T('READY · RUN A TEST','PRONTO · EXECUTE UM TESTE')));}$('export').disabled=true;choose(current);
})();
