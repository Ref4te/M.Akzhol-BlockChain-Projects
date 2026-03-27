import { 
    connectWallet, 
    sendPlayTransaction, 
    listenToEvents, 
    getContractBalance 
} from './blockchain.js';

/* Константы и настройки игры */
const E = { rock: "🪨", scissors: "✂️", paper: "📄" };
const L = { rock: "Камень", scissors: "Ножницы", paper: "Бумага" };
const C = ["rock", "scissors", "paper"]; 

let userAddress = null;
let betGwei = 1000; 
let playing = false;
let stats = { w: 0, l: 0, d: 0 };

const $ = (id) => document.getElementById(id);

/* Инициализация приложения */
async function init() {
    renderChoices();
    setupEventListeners();
}

/* 1. Рендер кнопок выбора (Камень, Ножницы, Бумага) */
function renderChoices() {
    const container = $("choices");
    container.innerHTML = "";
    C.forEach((type, index) => {
        const btn = document.createElement("button");
        btn.className = "choice-btn";
        btn.innerHTML = `<span class="e">${E[type]}</span><span class="l">${L[type]}</span>`;
        btn.onclick = () => handlePlay(index);
        container.appendChild(btn);
    });
}

/* 2. Обновление данных кошелька и баланса контракта */
async function refreshUserData(delayMs = 0) {
    if (!userAddress) return;
    if (delayMs > 0) await new Promise(r => setTimeout(r, delayMs));

    try {
        const data = await connectWallet(); 
        $("balance").textContent = `${parseFloat(data.balance).toFixed(6)} BNB`;
        
        const cBalance = await getContractBalance();
        $("contractBalance").textContent = `${parseFloat(cBalance).toFixed(6)} BNB`;
    } catch (e) {
        console.error("Ошибка обновления данных:", e);
    }
}

/* 3. Настройка обработчиков событий (Wallet, Пресеты, Ставки) */
function setupEventListeners() {
    // Подключение кошелька
    $("connectBtn").onclick = async () => {
        try {
            const data = await connectWallet();
            userAddress = data.address;
            $("userAddress").textContent = `Wallet: ${userAddress.slice(0,6)}...${userAddress.slice(-4)}`;
            $("balance").textContent = `${parseFloat(data.balance).toFixed(6)} BNB`;
            
            listenToEvents(onGameRequested, onGameFinished);
            refreshUserData();
            $("statusMsg").textContent = "Готов к игре!";
            $("connectBtn").style.display = "none";
        } catch (e) {
            $("statusMsg").textContent = "Ошибка подключения";
        }
    };

    const presetButtons = document.querySelectorAll('.preset[data-val]');
    const STEP = 1000;

    // Выбор фиксированной ставки (пресеты)
    presetButtons.forEach(btn => {
        btn.onclick = () => {
            if (playing) return;
            presetButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            betGwei = parseInt(btn.getAttribute('data-val'));
            $("betDisplay").textContent = betGwei.toLocaleString();
        };
    });

    // Ручное увеличение ставки
    $("plusBet").onclick = () => {
        if (playing) return;
        presetButtons.forEach(b => b.classList.remove('active'));
        betGwei += STEP;
        $("betDisplay").textContent = betGwei.toLocaleString();
    };

    // Ручное уменьшение ставки
    $("minusBet").onclick = () => {
        if (playing) return;
        if (betGwei > 1000) {
            presetButtons.forEach(b => b.classList.remove('active'));
            betGwei -= STEP;
            $("betDisplay").textContent = betGwei.toLocaleString();
        }
    };
}

/* 4. Логика начала игры и отправка транзакции */
async function handlePlay(choiceIndex) {
    if (!userAddress) return alert("Сначала подключите кошелек!");
    if (playing) return;

    try {
        playing = true;
        setUIState(true);
        
        const choiceKey = C[choiceIndex];
        $("playerEmoji").textContent = E[choiceKey];
        $("playerEmoji").className = "emoji pop-in";
        $("playerName").textContent = L[choiceKey];
        $("cpuEmoji").textContent = "❓";
        $("resultBox").innerHTML = "";
        $("statusMsg").textContent = "Подтвердите транзакцию в MetaMask...";

        const betInWei = ethers.utils.parseUnits(betGwei.toString(), "gwei");
        
        await sendPlayTransaction(choiceIndex, betInWei);
        
        refreshUserData(1000);
        $("statusMsg").textContent = "Ждем оракула (Chainlink VRF)...";
        startShuffleAnimation();

    } catch (e) {
        console.error(e);
        $("statusMsg").textContent = "Ошибка транзакции";
        playing = false;
        setUIState(false);
    }
}

/* 5. Завершение игры и обработка результата от блокчейна */
function onGameFinished(data) {
    if (!playing) return; 
    stopShuffleAnimation();
    
    const cpuChoiceKey = C[data.casinoChoice];
    $("cpuEmoji").textContent = E[cpuChoiceKey];
    $("cpuEmoji").className = "emoji pop-in";
    $("cpuName").textContent = L[cpuChoiceKey];

    let res = "draw";
    if (data.result === "You Win!") {
        res = "win"; stats.w++;
    } else if (data.result === "Lose") {
        res = "lose"; stats.l++;
    } else {
        stats.d++;
    }

    showResult(res, data.payout);
    updateStats();
    
    // ДОБАВЛЯЕМ В ИСТОРИЮ
    addHistoryItem(data, res);

    refreshUserData(15000); 
    
    playing = false;
    setUIState(false);
    $("statusMsg").textContent = "Раунд завершен!";
}

/* Вспомогательные функции UI и анимаций */

// Добавление записи в историю транзакций
function addHistoryItem(data, res) {
    const list = $("historyList");
    const section = $("historySection");
    
    // Показываем секцию, если это первая игра
    if (section.style.display === "none") section.style.display = "block";

    const item = document.createElement("div");
    item.className = "history-item";
    
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const resClass = res === "win" ? "pos" : res === "lose" ? "neg" : "neu";
    const resText = res === "win" ? "Победа" : res === "lose" ? "Проигрыш" : "Ничья";

    item.innerHTML = `
        <span>${time} — ${resText}</span>
        <span class="${resClass}">${res === "win" ? "+" + data.payout : "0.00"} BNB</span>
    `;

    // Добавляем новую запись в начало списка
    list.prepend(item);
}

// Блокировка интерфейса
function setUIState(isDisabled) {
    const btns = document.querySelectorAll('.choice-btn, .bet-btn, .preset');
    btns.forEach(b => b.disabled = isDisabled);
}

// Анимация перемешивания выбора компьютера
let shuffleInterval;
function startShuffleAnimation() {
    shuffleInterval = setInterval(() => {
        const r = C[Math.floor(Math.random() * 3)];
        $("cpuEmoji").textContent = E[r];
    }, 120);
}

function stopShuffleAnimation() { clearInterval(shuffleInterval); }

// Отображение текста результата
function showResult(res, payout) {
    const rb = $("resultBox");
    const txt = res === "win" ? "ПОБЕДА!" : res === "lose" ? "ПРОИГРЫШ" : "НИЧЬЯ";
    rb.className = "result-text " + res + " pop-result";
    const payoutHtml = parseFloat(payout) > 0 ? `<div class="payout">+${payout} BNB</div>` : "";
    rb.innerHTML = `${txt}${payoutHtml}`;
}

// Обновление счетчиков побед/поражений
function updateStats() {
    $("sW").textContent = stats.w;
    $("sL").textContent = stats.l;
    $("sD").textContent = stats.d;
}

// Логирование запроса к блокчейну
function onGameRequested(data) {
    console.log("Запрос зафиксирован в блокчейне ID:", data.requestId);
}

init();