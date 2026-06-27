const PROFIT_RATE = 0.0625;

const fmt = n => Math.round(Number(n)||0).toLocaleString("zh-TW");
const pct = n => `${(Number(n)||0).toFixed(2)}%`;

function calc(target, awayOdds, homeOdds){
  target = Number(target);
  awayOdds = Number(awayOdds);
  homeOdds = Number(homeOdds);
  if(!target || !awayOdds || !homeOdds) return null;

  const awayBet = target * homeOdds / (awayOdds + homeOdds);
  const homeBet = target - awayBet;
  const awayReturn = awayBet * awayOdds;
  const homeReturn = homeBet * homeOdds;
  const safeReturn = Math.min(awayReturn, homeReturn);
  const payoutRate = safeReturn / target * 100;
  const hedgeLoss = target - safeReturn;
  const profit = target * PROFIT_RATE;
  const loss = hedgeLoss - profit;
  const lossRate = loss / target * 100;

  return {target, awayOdds, homeOdds, awayBet, homeBet, awayReturn, homeReturn, safeReturn, payoutRate, hedgeLoss, profit, loss, lossRate};
}

function renderResult(r){
  if(!r) return "<div class='result-card'>請輸入正確數字</div>";
  const lossClass = r.loss <= 0 ? "good" : "bad";
  return `<div class="result-card">
    <div class="grid">
      <div class="item full info"><small>獎金支出率</small><b>${pct(r.payoutRate)}</b></div>
      <div class="item"><small>客隊下注</small><b>${fmt(r.awayBet)}</b></div>
      <div class="item"><small>主隊下注</small><b>${fmt(r.homeBet)}</b></div>
      <div class="item"><small>客勝回收</small><b>${fmt(r.awayReturn)}</b></div>
      <div class="item"><small>主勝回收</small><b>${fmt(r.homeReturn)}</b></div>
      <div class="item"><small>對沖損失</small><b>${fmt(r.hedgeLoss)}</b></div>
      <div class="item"><small>利潤 6.25%</small><b>${fmt(r.profit)}</b></div>
      <div class="item full ${lossClass}"><small>損失</small><b>${fmt(r.loss)}</b></div>
      <div class="item full ${lossClass}"><small>損失率</small><b>${pct(r.lossRate)}</b></div>
    </div>
  </div>`;
}

function updateCalc(){
  const r = calc(target.value, awayOdds.value, homeOdds.value);
  result.innerHTML = renderResult(r);
}

function addOddsRow(away="1.75", home="1.75"){
  const row = document.createElement("div");
  row.className = "odds-row";
  row.innerHTML = `
    <div class="odds-row-head">
      <span>第 ${oddsRows.children.length + 1} 組</span>
      <button class="remove" type="button">刪除</button>
    </div>
    <div class="odds-inputs">
      <label>客隊賠率
        <input class="cmp-away" type="number" inputmode="decimal" step="0.01" value="${away}">
      </label>
      <label>主隊賠率
        <input class="cmp-home" type="number" inputmode="decimal" step="0.01" value="${home}">
      </label>
    </div>`;
  row.querySelector(".remove").onclick = () => {
    row.remove();
    renumberRows();
    updateCompare();
  };
  row.querySelectorAll("input").forEach(i => i.addEventListener("input", updateCompare));
  oddsRows.appendChild(row);
}

function renumberRows(){
  [...oddsRows.children].forEach((row, i)=>{
    row.querySelector(".odds-row-head span").textContent = `第 ${i+1} 組`;
  });
}

function updateCompare(){
  const t = Number(compareTarget.value);
  const rows = [...oddsRows.children].map(row=>{
    return calc(t, row.querySelector(".cmp-away").value, row.querySelector(".cmp-home").value);
  }).filter(Boolean).sort((a,b)=>a.loss-b.loss);

  compareResult.innerHTML = rows.map((r,i)=>`
    <div class="compare-card">
      <div class="rank">#${i+1}　客 ${r.awayOdds} / 主 ${r.homeOdds}</div>
      <div class="grid">
        <div class="item full info"><small>獎金支出率</small><b>${pct(r.payoutRate)}</b></div>
        <div class="item"><small>客隊下注</small><b>${fmt(r.awayBet)}</b></div>
        <div class="item"><small>主隊下注</small><b>${fmt(r.homeBet)}</b></div>
        <div class="item"><small>對沖損失</small><b>${fmt(r.hedgeLoss)}</b></div>
        <div class="item"><small>利潤</small><b>${fmt(r.profit)}</b></div>
        <div class="item full ${r.loss<=0?'good':'bad'}"><small>損失</small><b>${fmt(r.loss)}（${pct(r.lossRate)}）</b></div>
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

document.querySelectorAll(".quick button").forEach(btn=>{
  btn.onclick=()=>{
    target.value = btn.dataset.target;
    compareTarget.value = btn.dataset.target;
    updateCalc();
    updateCompare();
  };
});

[target, awayOdds, homeOdds].forEach(x=>x.addEventListener("input", updateCalc));
compareTarget.addEventListener("input", updateCompare);
calcBtn.onclick = updateCalc;
addRowBtn.onclick = () => { addOddsRow("",""); };
compareBtn.onclick = updateCompare;

[["1.75","1.75"],["1.80","1.80"],["1.85","1.85"],["1.90","1.90"]].forEach(x=>addOddsRow(x[0],x[1]));

updateCalc();
updateCompare();

if("serviceWorker" in navigator){
  window.addEventListener("load",()=>navigator.serviceWorker.register("./sw.js"));
}
