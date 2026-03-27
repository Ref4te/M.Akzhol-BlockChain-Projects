const E = {
  rock: "🪨",
  paper: "📄",
  scissors: "✂️"
};

const L = {
  rock: "Камень",
  paper: "Бумага",
  scissors: "Ножницы"
};

const C = ["rock", "paper", "scissors"];

let balance = 1000;
let bet = 100;
let playing = false;
let stats = { w: 0, l: 0, d: 0 };
let history = [];

function $(id) {
  return document.getElementById(id);
}

function fmt(n) {
  return n.toLocaleString("ru-RU");
}

function render() {
  $("balance").textContent = fmt(balance) + " 💎";
  $("betDisplay").textContent = fmt(bet) + " 💎";
  $("sW").textContent = stats.w;
  $("sL").textContent = stats.l;
  $("sD").textContent = stats.d;

  $("restart").style.display = balance <= 0 && !playing ? "block" : "none";

  document.querySelectorAll(".choice-btn").forEach(b => {
    b.disabled = playing || bet > balance || bet <= 0;
  });

  renderPresets();
}

function renderPresets() {
  const p = $("presets");
  p.innerHTML = "";

  [50, 100, 250, 500].forEach(v => {
    const b = document.createElement("button");
    b.className = "preset" + (bet === v ? " active" : "");
    b.textContent = v;
    b.onclick = () => {
      bet = Math.min(balance, v);
      render();
    };
    p.appendChild(b);
  });

  const a = document.createElement("button");
  a.className = "preset allin";
  a.textContent = "ALL IN";
  a.onclick = () => {
    bet = balance;
    render();
  };
  p.appendChild(a);
}

function changeBet(d) {
  if (playing) return;
  bet = Math.max(10, Math.min(balance, bet + d));
  render();
}

function getResult(p, c) {
  if (p === c) return "draw";

  if (
    (p === "rock" && c === "scissors") ||
    (p === "scissors" && c === "paper") ||
    (p === "paper" && c === "rock")
  ) {
    return "win";
  }

  return "lose";
}

function play(choice) {
  if (playing || bet > balance || bet <= 0) return;

  playing = true;

  $("playerEmoji").textContent = E[choice];
  $("playerEmoji").className = "emoji pop-in";
  $("playerName").textContent = L[choice];

  $("resultBox").innerHTML = "";
  $("resultBox").className = "result-text";

  $("cpuName").textContent = "";

  render();

  let count = 0;

  const iv = setInterval(() => {
    const r = C[Math.floor(Math.random() * 3)];
    $("cpuEmoji").textContent = E[r];
    count++;

    if (count > 8) {
      clearInterval(iv);

      const cpu = C[Math.floor(Math.random() * 3)];
      $("cpuEmoji").textContent = E[cpu];
      $("cpuEmoji").className = "emoji pop-in";
      $("cpuName").textContent = L[cpu];

      const res = getResult(choice, cpu);
      const payout = res === "win" ? bet * 2 : res === "draw" ? bet : 0;

      balance = balance - bet + payout;

      stats.w += res === "win" ? 1 : 0;
      stats.l += res === "lose" ? 1 : 0;
      stats.d += res === "draw" ? 1 : 0;

      const payoutDisplay = res === "win" ? bet : res === "draw" ? 0 : -bet;

      history.unshift({
        p: choice,
        c: cpu,
        r: res,
        pay: payoutDisplay
      });

      if (history.length > 20) history.pop();

      showResult(res);
      renderHistory();

      setTimeout(() => {
        playing = false;
        render();
      }, 800);
    }
  }, 100);
}

function showResult(res) {
  const rb = $("resultBox");
  const txt = res === "win" ? "ПОБЕДА!" : res === "lose" ? "ПРОИГРЫШ" : "НИЧЬЯ";

  rb.className = "result-text " + res + " pop-result";

  let html = txt;

  if (res === "win") html += '<span class="payout">+' + fmt(bet) + " 💎</span>";
  if (res === "lose") html += '<span class="payout">-' + fmt(bet) + " 💎</span>";

  rb.innerHTML = html;
  render();
}

function renderHistory() {
  $("historySection").style.display = history.length ? "block" : "none";

  const hl = $("historyList");
  hl.innerHTML = "";

  history.forEach(g => {
    const d = document.createElement("div");
    d.className = "history-item";

    const cls = g.pay > 0 ? "pos" : g.pay < 0 ? "neg" : "neu";

    d.innerHTML = `<span>${E[g.p]} vs ${E[g.c]}</span><span class="${cls}">${g.pay > 0 ? "+" : ""}${g.pay} 💎</span>`;
    hl.appendChild(d);
  });
}

function resetGame() {
  balance = 1000;
  bet = 100;
  stats = { w: 0, l: 0, d: 0 };
  history = [];

  $("playerEmoji").textContent = "";
  $("playerName").textContent = "";
  $("cpuEmoji").textContent = "";
  $("cpuName").textContent = "";
  $("resultBox").innerHTML = "";

  renderHistory();
  render();
}

C.forEach(c => {
  const b = document.createElement("button");
  b.className = "choice-btn";
  b.innerHTML = `<span class="e">${E[c]}</span><span class="l">${L[c]}</span>`;
  b.onclick = () => play(c);
  $("choices").appendChild(b);
});

render();