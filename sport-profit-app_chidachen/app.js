const fmt = n => Math.round(Number(n)||0).toLocaleString("zh-TW");
const pct = n => `${(Number(n)||0).toFixed(2)}%`;

function calc(target, awayOdds, homeOdds, profitRatePct){
  target = Number(target); awayOdds = Number(awayOdds); homeOdds = Number(homeOdds);
  const profitRate = Number(profitRatePct) / 100;
  if(!target || !awayOdds || !homeOdds) return null;

  const awayBet = target * homeOdds / (awayOdds + homeOdds);
  const homeBet = target - awayBet;
  const awayReturn = awayBet * awayOdds;
  const homeReturn = homeBet * homeOdds;
  const safeReturn = Math.min(awayReturn, homeReturn);
  const hedgeLoss = target - safeReturn;
  const profit = target * profitRate;
  const netCost = hedgeLoss - profit;
  const netRate = netCost / target * 100;

  return {target, awayOdds, homeOdds, awayBet, homeBet, awayReturn, homeReturn, hedgeLoss, profit, netCost, netRate};
}

function renderResult(r){
  if(!r) return "<div class='card'>請輸入正確數字</div>";
  const netClass = r.netCost <= 0 ? "positive" : "warning";
  return `<div class="card">
    <div class="grid">
      <div class="item"><small>客隊下注</small><b>${fmt(r.awayBet)}</b></div>
      <div class="item"><small>主隊下注</small><b>${fmt(r.homeBet)}</b></div>
      <div class="item"><small>客勝回收</small><b>${fmt(r.awayReturn)}</b></div>
      <div class="item"><small>主勝回收</small><b>${fmt(r.homeReturn)}</b></div>
      <div class="item"><small>對沖損失</small><b>${fmt(r.hedgeLoss)}</b></div>
      <div class="item"><small>利潤 6.25%</small><b>${fmt(r.profit)}</b></div>
      <div class="item full ${netClass}"><small>淨成本</small><b>${fmt(r.netCost)}</b></div>
      <div class="item full ${netClass}"><small>淨成本率</small><b>${pct(r.netRate)}</b></div>
    </div>
  </div>`;
}

function updateCalc(){
  const r = calc(target.value, awayOdds.value, homeOdds.value, profitRate.value);
  result.innerHTML = renderResult(r);
  localStorage.setItem("sportCalc", JSON.stringify({
    target: target.value, awayOdds: awayOdds.value, homeOdds: homeOdds.value, profitRate: profitRate.value
  }));
}

function updateCompare(){
  const t = Number(compareTarget.value);
  const rate = Number(profitRate.value || 6.25);
  const rows = oddsList.value.split(/\n+/).map(line => {
    const nums = line.match(/\d+(\.\d+)?/g);
    if(!nums || nums.length < 2) return null;
    return calc(t, nums[0], nums[1], rate);
  }).filter(Boolean).sort((a,b)=>a.netCost-b.netCost);

  compareResult.innerHTML = rows.map((r,i)=>`
    <div class="compare-card">
      <div class="rank">#${i+1}　客 ${r.awayOdds} / 主 ${r.homeOdds}</div>
      <div class="grid">
        <div class="item"><small>客隊下注</small><b>${fmt(r.awayBet)}</b></div>
        <div class="item"><small>主隊下注</small><b>${fmt(r.homeBet)}</b></div>
        <div class="item"><small>對沖損失</small><b>${fmt(r.hedgeLoss)}</b></div>
        <div class="item"><small>利潤</small><b>${fmt(r.profit)}</b></div>
        <div class="item full ${r.netCost<=0?'positive':'warning'}"><small>淨成本</small><b>${fmt(r.netCost)}（${pct(r.netRate)}）</b></div>
      </div>
    </div>
  `).join("");
}

document.querySelectorAll(".tab").forEach(btn=>{
  btn.onclick=()=>{
    document.querySelectorAll(".tab,.page").forEach(el=>el.classList.remove("active"));
    btn.classList.add("active");
    document.getElementById(btn.dataset.page).classList.add("active");
  };
});

try{
  const saved = JSON.parse(localStorage.getItem("sportCalc")||"{}");
  if(saved.target) target.value=saved.target;
  if(saved.awayOdds) awayOdds.value=saved.awayOdds;
  if(saved.homeOdds) homeOdds.value=saved.homeOdds;
  if(saved.profitRate) profitRate.value=saved.profitRate;
}catch(e){}

calcBtn.onclick = updateCalc;
compareBtn.onclick = updateCompare;
[target, awayOdds, homeOdds, profitRate].forEach(x=>x.addEventListener("input", updateCalc));
updateCalc();
updateCompare();

if("serviceWorker" in navigator){
  window.addEventListener("load",()=>navigator.serviceWorker.register("./sw.js"));
}
