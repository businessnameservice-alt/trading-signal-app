const $=id=>document.getElementById(id);
const demo={AAPL:335.52,MSFT:495.00,NVDA:218.84,TSLA:367.83,AMZN:251.11};
let current=null;let trades=JSON.parse(localStorage.getItem('signalLabTrades')||'[]');
function money(n){return '$'+Number(n).toLocaleString(undefined,{minimumFractionDigits:2,maximumFractionDigits:2})}
function hash(s){return [...s].reduce((a,c)=>((a<<5)-a)+c.charCodeAt(0),0)}
function analyze(symbol){
 const base=demo[symbol]||Math.max(10,Math.abs(hash(symbol)%50000)/100);
 // Deterministic demo score: placeholder until secure backend supplies historical/live indicators.
 const score=Math.abs(hash(symbol+new Date().toISOString().slice(0,10)))%100;
 const action=score>=68?'BUY':score<=25?'SELL':'WAIT';
 const direction=action==='SELL'?-1:1; const stopPct=.018,targetPct=.04;
 const entry=base; const stop=entry*(1-direction*stopPct); const target=entry*(1+direction*targetPct);
 current={symbol,price:base,action,entry,stop,target,rr:targetPct/stopPct};
 renderSignal();
}
function renderSignal(){
 const x=current;if(!x)return;$('signalSymbol').textContent=x.symbol;$('price').textContent=money(x.price);
 const badge=$('signalBadge');badge.textContent=x.action;badge.className='badge '+x.action.toLowerCase();
 if(x.action==='WAIT'){$('entry').textContent=$('stop').textContent=$('target').textContent=$('rr').textContent='—';$('reason').textContent='WAIT: the demo strategy does not have enough alignment to open a simulated position. Waiting is an intentional trading decision.';$('paperTrade').disabled=true;}
 else{$('entry').textContent=money(x.entry);$('stop').textContent=money(x.stop);$('target').textContent=money(x.target);$('rr').textContent='1 : '+x.rr.toFixed(2);$('reason').textContent=x.action+' setup: this Version 1 signal is a deterministic demonstration of the workflow. It is not a prediction or profit guarantee. Live indicator calculations will replace this placeholder logic.';$('paperTrade').disabled=false;}
 updateRisk();
}
function updateRisk(){const riskPct=Math.min(2,Math.max(.1,Number($('risk').value)||1));const dollars=10000*riskPct/100;$('maxRisk').textContent=money(dollars);if(!current||current.action==='WAIT')return $('shares').textContent='—';const perShare=Math.abs(current.entry-current.stop);$('shares').textContent=Math.floor(dollars/perShare).toString();}
function renderHistory(){const body=$('history');if(!trades.length){body.innerHTML='<tr class="empty"><td colspan="6">No paper trades yet.</td></tr>';return}body.innerHTML=trades.map(t=>`<tr><td><b>${t.symbol}</b></td><td>${money(t.entry)}</td><td>${money(t.stop)}</td><td>${money(t.target)}</td><td>${t.shares}</td><td>${t.action} · OPEN</td></tr>`).join('');}
$('scanForm').addEventListener('submit',e=>{e.preventDefault();const s=$('symbol').value.trim().toUpperCase().replace(/[^A-Z.-]/g,'');if(s)analyze(s)});
$('risk').addEventListener('input',updateRisk);
$('paperTrade').addEventListener('click',()=>{if(!current||current.action==='WAIT')return;const shares=Number($('shares').textContent);trades.unshift({...current,shares,createdAt:new Date().toISOString()});localStorage.setItem('signalLabTrades',JSON.stringify(trades));renderHistory();});
$('reset').addEventListener('click',()=>{trades=[];localStorage.removeItem('signalLabTrades');renderHistory();});
renderHistory();updateRisk();