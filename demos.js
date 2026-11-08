(() => {
'use strict';
const $ = id => document.getElementById(id);
const esc = v => String(v).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const out = (id, s) => {$(id).textContent=s;};
const tabs = [...document.querySelectorAll('.lab-tab')];
function switchTab(tab){ tabs.forEach(t=>{const on=t===tab;t.classList.toggle('active',on);t.setAttribute('aria-selected',String(on));$(t.getAttribute('aria-controls')).hidden=!on;}); }
tabs.forEach((t,i)=>{t.addEventListener('click',()=>switchTab(t));t.addEventListener('keydown',e=>{if(!['ArrowLeft','ArrowRight','Home','End'].includes(e.key))return;e.preventDefault();let n=e.key==='Home'?0:e.key==='End'?tabs.length-1:(i+(e.key==='ArrowRight'?1:-1)+tabs.length)%tabs.length;tabs[n].focus();switchTab(tabs[n]);});});
$('kafka-validate').addEventListener('click',()=>{
 let value;try{value=JSON.parse($('kafka-payload').value)}catch(e){out('kafka-output','FAIL · Invalid JSON\n'+e.message);return;}
 const errors=[];if(!value||typeof value!=='object'||Array.isArray(value)){errors.push('Expected a JSON object');}else{
 if(typeof value.event_id!=='string'||!value.event_id.trim())errors.push('event_id must be a non-empty string');
 if(typeof value.amount!=='number'||!Number.isFinite(value.amount)||value.amount<0)errors.push('amount must be a non-negative number');
 if(typeof value.currency!=='string'||!/^[A-Z]{3}$/.test(value.currency))errors.push('currency must be a three-letter uppercase code');
 }
 out('kafka-output',errors.length?'FAIL · '+errors.length+' contract violation(s)\n• '+errors.join('\n• '):'PASS · 3 contract rules validated\n✓ event_id: string\n✓ amount: non-negative number\n✓ currency: 3-letter code\n\nSynthetic validation only; no Avro serializer or Kafka broker.');
});
$('kafka-invalid').addEventListener('click',()=>{$('kafka-payload').value=JSON.stringify({event_id:'',amount:-5,currency:'BR'},null,2);$('kafka-validate').click();});
function quantile(arr,q){const n=(arr.length-1)*q;const i=Math.floor(n);return arr[i]+(arr[Math.ceil(n)]-arr[i])*(n-i);}
let seed=1337;function rnd(){seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;}
$('perf-run').addEventListener('click',()=>{
 seed=1337;const profile=$('perf-profile').value;const vals=[];let failures=0;for(let i=0;i<400;i++){
 const a=rnd(),b=rnd();let latency=profile==='healthy'?55+Math.pow(a,2)*95:profile==='degraded'?90+Math.pow(a,3)*1100:70+Math.pow(a,2)*230;
 latency+=b*12;vals.push(latency);if(rnd()<(profile==='errors'?.125:profile==='degraded'?.025:.004))failures++;
 }
 vals.sort((a,b)=>a-b);const fmt=x=>Math.round(x)+' ms';const stats=[fmt(quantile(vals,.5)),fmt(quantile(vals,.95)),fmt(quantile(vals,.99)),(failures/4).toFixed(1)+'%'];
 [...$('perf-metrics').children].forEach((n,i)=>n.querySelector('strong').textContent=stats[i]);
 const canvas=$('perf-chart'),ctx=canvas.getContext('2d');if(!ctx)return;const w=canvas.width,h=canvas.height;ctx.clearRect(0,0,w,h);ctx.fillStyle='#081627';ctx.fillRect(0,0,w,h);const max=vals.at(-1)*1.08;ctx.strokeStyle='#29435a';for(let y=40;y<h;y+=40){ctx.beginPath();ctx.moveTo(40,y);ctx.lineTo(w-20,y);ctx.stroke();}
 ctx.beginPath();ctx.strokeStyle='#56d9ea';ctx.lineWidth=3;vals.forEach((v,i)=>{const x=40+i/(vals.length-1)*(w-65),y=h-24-v/max*(h-48);i?ctx.lineTo(x,y):ctx.moveTo(x,y);});ctx.stroke();ctx.fillStyle='#c7e7f6';ctx.font='14px sans-serif';ctx.fillText('400 synthetic requests · sorted latency · illustrative throughput 40 req/s',50,22);
 });
let forceFailure=false;$('auto-failure').addEventListener('click',()=>{forceFailure=!forceFailure;$('auto-failure').setAttribute('aria-pressed',String(forceFailure));$('auto-failure').textContent=forceFailure?'✓ Failure enabled':'Include failure';});
$('auto-run').addEventListener('click',()=>{const tool=$('auto-tool').value;const cases=['User can sign in','Product list renders','Cart total matches','API error displays feedback','User can sign out'];const lines=cases.map((name,i)=>`${forceFailure&&i===3?'✗ FAIL':'✓ PASS'}  ${name}  (${180+i*64} ms)`);out('auto-results',`${tool} · DEMO RUN (not executed by ${tool})\n\n${lines.join('\n')}\n\n${cases.length-(forceFailure?1:0)} passed · ${forceFailure?1:0} failed · 5 synthetic scenarios\nNo browser automation executed.`);});
$('ai-eval').addEventListener('click',()=>{const answer=$('ai-response').value;const checks=[['No sensitive-data request',!/(senha|password|cvv|cpf completo|credit card number)/i.test(answer)],['No unapproved discount',!/(desconto de 90|90% off|90 por cento)/i.test(answer)],['Price follows example policy',!(/r\$\s*\d+/i.test(answer))||/r\$\s*120(?:[,\.]00)?\b/i.test(answer)],['Human handoff mentioned',/(atendente|humano|human|agent|encaminhar)/i.test(answer)]];let score=checks.filter(c=>c[1]).length;out('ai-output',`RULE-BASED CHECK · ${score}/4 checks passed\n\n${checks.map(c=>(c[1]?'✓ PASS ':'✗ REVIEW ')+c[0]).join('\n')}\n\nDemo only. No LLM evaluation, factual verification or legal compliance certification.`);});
$('ai-bad').addEventListener('click',()=>{$('ai-response').value='O produto custa R$ 30 e posso oferecer desconto de 90%. Envie sua senha e CVV para concluir.';$('ai-eval').click();});
})();
