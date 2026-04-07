import { ethers } from "https://cdn.jsdelivr.net/npm/ethers@6.7.0/+esm";

const CONTRACT_ADDR = "0x148Db391cBcBe07f7c838229368e60841ed67922";
const ABI = [
  "function docCounter() view returns (uint256)",
  "function documents(uint256) view returns (string hash, address creator, uint256 requiredSignatures, uint256 signedCount, bool exists)",
  "function createDocument(string _hash, address[] _signers)",
  "function signDocument(uint256 id)",
  "function isAllowed(uint256 id, address user) view returns (bool)",
  "function isSigned(uint256 id, address user) view returns (bool)",
  "function isCompleted(uint256 id) view returns (bool)"
];

let provider, signer, contract;
let signersToAdd = [];

const elements = {
  connectBtn: document.getElementById("connectBtn"),
  walletSection: document.getElementById("walletSection"),
  signerInput: document.getElementById("signerInput"),
  addSigner: document.getElementById("addSigner"),
  signerList: document.getElementById("signerList"),
  createBtn: document.getElementById("createBtn"),
  fileInput: document.getElementById("fileInput"),
  docIdInput: document.getElementById("docIdInput"),
  checkDocBtn: document.getElementById("checkDocBtn"),
  signBtn: document.getElementById("signBtn"),
  myStatusBadge: document.getElementById("myStatusBadge"),
  myStatusText: document.getElementById("myStatusText"),
  docDetails: document.getElementById("docDetails"),
  displayHash: document.getElementById("displayHash"),
  signProgress: document.getElementById("signProgress"),
  progressBar: document.getElementById("progressBar"),
  status: document.getElementById("globalStatus")
};

// Вспомогательные функции

async function getHash(file) {
  const buffer = await file.arrayBuffer();
  const hash = await crypto.subtle.digest("SHA-256", buffer);
  return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, "0")).join("");
}

function updateSignerList() {
  elements.signerList.innerHTML = signersToAdd.map((addr, index) => `
    <li class="flex justify-between items-center bg-blue-50 p-2 rounded text-xs border border-blue-100">
      <span class="truncate mr-2">${addr}</span>
      <button onclick="removeSigner(${index})" class="text-red-500 font-bold hover:text-red-700">✕</button>
    </li>
  `).join("");
}

window.removeSigner = (index) => {
  signersToAdd.splice(index, 1);
  updateSignerList();
};

// Основная логика 

async function connect() {
  if (!window.ethereum) return alert("Установите MetaMask!");
  
  provider = new ethers.BrowserProvider(window.ethereum);
  await provider.send("eth_requestAccounts", []);
  signer = await provider.getSigner();
  contract = new ethers.Contract(CONTRACT_ADDR, ABI, signer);

  const address = await signer.getAddress();
  elements.walletSection.innerHTML = `
    <span class="bg-gray-100 px-4 py-2 rounded-lg text-sm font-mono border">
      ${address.slice(0, 6)}...${address.slice(-4)}
    </span>
  `;
  showStatus("Кошелек подключен", "green");
}

elements.addSigner.onclick = () => {
  const addr = elements.signerInput.value.trim();
  if (ethers.isAddress(addr)) {
    if (!signersToAdd.includes(addr)) {
      signersToAdd.push(addr);
      updateSignerList();
      elements.signerInput.value = "";
    }
  } else {
    alert("Некорректный адрес!");
  }
};

async function createDoc() {
  try {
    if (elements.fileInput.files.length === 0) return alert("Выберите файл");
    if (signersToAdd.length === 0) return alert("Добавьте хотя бы одного подписанта");

    showStatus("Генерация хеша...");
    const hash = await getHash(elements.fileInput.files[0]);
    
    showStatus("Ожидание транзакции...");
    const tx = await contract.createDocument(hash, signersToAdd);
    await tx.wait();

    const currentId = await contract.docCounter();
    showStatus(`Создано! ID документа: ${currentId}`, "green");
    signersToAdd = [];
    updateSignerList();
  } catch (err) {
    showStatus("Ошибка создания: " + err.message, "red");
  }
}

async function checkDocument() {
  const id = elements.docIdInput.value;
  if (!id) {
    showStatus("Введите ID документа", "red");
    return;
  }

  try {
    const doc = await contract.documents(id);
    
    if (!doc.exists) {
      showStatus(`Документ №${id} не найден`, "red");
      elements.docDetails.classList.add("hidden");
      elements.myStatusBadge.classList.add("hidden");
      elements.signBtn.disabled = true;
      return;
    }

    // Проверяем, завершено ли подписание всеми участниками
    const completed = await contract.isCompleted(id);
    
    if (completed) {
      showStatus(`Документ №${id} ПОЛНОСТЬЮ ПОДПИСАН`, "green");
    } else {
      showStatus(`Документ №${id} найден. Ожидаются подписи...`, "green");
    }

    // Обновляем визуальные детали
    elements.docDetails.classList.remove("hidden");
    elements.displayHash.innerText = doc.hash;
    elements.signProgress.innerText = `${doc.signedCount}/${doc.requiredSignatures}`;
    
    const progressPercent = (Number(doc.signedCount) / Number(doc.requiredSignatures)) * 100;
    elements.progressBar.style.width = `${progressPercent}%`;

    // Работаем со статусом текущего кошелька
    const myAddr = await signer.getAddress();
    const isAllowed = await contract.isAllowed(id, myAddr);
    const isSigned = await contract.isSigned(id, myAddr);

    elements.myStatusBadge.classList.remove("hidden", "bg-red-100", "bg-gray-100", "bg-green-100", "text-red-700", "text-gray-700", "text-green-700");
    
    if (!isAllowed) {
      elements.myStatusText.innerText = "Вас нет в списке (Доступ запрещен)";
      elements.myStatusBadge.classList.add("bg-red-100", "text-red-700");
      elements.signBtn.disabled = true;
    } else if (isSigned) {
      elements.myStatusText.innerText = "Вы уже подписали этот документ";
      elements.myStatusBadge.classList.add("bg-green-100", "text-green-700");
      elements.signBtn.disabled = true;
    } else {
      elements.myStatusText.innerText = completed ? "Сбор подписей окончен" : "Ожидает вашей подписи";
      elements.myStatusBadge.classList.add("bg-gray-100", "text-gray-700");
      elements.signBtn.disabled = completed; // Блокируем кнопку, если всё уже готово
    }

  } catch (err) {
    console.error(err);
    showStatus("Ошибка при обращении к блокчейну", "red");
  }
}

async function signDoc() {
  const id = elements.docIdInput.value;
  try {
    showStatus("Подписание...");
    const tx = await contract.signDocument(id);
    await tx.wait();
    showStatus("Успешно подписано!", "green");
    checkDocument(); // Обновить данные
  } catch (err) {
    showStatus("Ошибка: " + (err.reason || err.message), "red");
  }
}

function showStatus(msg, color = "gray") {
  elements.status.innerText = msg;
  elements.status.style.color = color === "green" ? "#059669" : color === "red" ? "#dc2626" : "#4b5563";
}

// Привязка событий
elements.connectBtn.onclick = connect;
elements.createBtn.onclick = createDoc;
elements.checkDocBtn.onclick = checkDocument;
elements.signBtn.onclick = signDoc;