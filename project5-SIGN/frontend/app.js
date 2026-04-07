import { ethers } from "https://cdn.jsdelivr.net/npm/ethers@6.7.0/+esm";

const CONTRACT = "0x148Db391cBcBe07f7c838229368e60841ed67922";

const ABI = [
  "function createDocument(string _hash, address[] _signers)",
  "function signDocument(uint256 id)",
  "function isAllowed(uint256 id, address user) view returns (bool)",
  "function isSigned(uint256 id, address user) view returns (bool)",
  "function isCompleted(uint256 id) view returns (bool)"
];

let provider, signer, contract;

async function getHash(file) {
  const buffer = await file.arrayBuffer();
  const hash = await crypto.subtle.digest("SHA-256", buffer);

  return Array.from(new Uint8Array(hash))
    .map(b => b.toString(16).padStart(2, "0"))
    .join("");
}

async function connect() {
  provider = new ethers.BrowserProvider(window.ethereum);
  await provider.send("eth_requestAccounts", []);
  signer = await provider.getSigner();
  //console.log("Address value:", contractAddress);
  contract = new ethers.Contract(CONTRACT, ABI, signer);
}

async function createDoc() {
  console.log("CREATE");

  const fileInput = document.getElementById("fileInput");

  if (!fileInput || fileInput.files.length === 0) {
    statusDisplay.innerText = "Select file ❌";
    return;
  }

  const file = fileInput.files[0];

  // 1. Получаем значение, убираем пробелы по краям
  const rawValue = document.getElementById("signers").value.trim();

  // 2. Разбиваем и очищаем каждый адрес от случайных пробелов
  // filter(Boolean) удалит пустые строки из массива
  const signers = rawValue.split(",").map(s => s.trim()).filter(Boolean);

  // 3. Теперь проверка будет работать идеально
  if (signers.length === 0) {
    statusDisplay.innerText = "Enter signers ❌";
    return;
  }

  const hash = await getHash(file);

  const tx = await contract.createDocument(hash, signers);
  await tx.wait();

  statusDisplay.innerText = "Created ✅";
}

async function signDoc() {
  // 1. Убеждаемся, что элементы получены
  const docIdInput = document.getElementById("docId"); // проверьте ID в HTML!

  try {
    const id = docIdInput.value;
    if (!id) {
      statusDisplay.innerText = "Enter Document ID ❌";
      return;
    }

    statusDisplay.innerText = "Checking permissions...";
    const addr = await signer.getAddress();

    // 2. Проверка доступа
    const ok = await contract.isAllowed(id, addr);

    if (!ok) {
      statusDisplay.innerText = "Not allowed ❌";
      return;
    }

    // 3. Подпись
    statusDisplay.innerText = "Signing... Please confirm in wallet";
    const tx = await contract.signDocument(id);

    statusDisplay.innerText = "Waiting for block confirmation...";
    await tx.wait();

    statusDisplay.innerText = "Signed successfully! ✅";
  } catch (error) {
    console.error(error);
    statusDisplay.innerText = "Error: " + (error.reason || error.message);
  }
}

const statusDisplay = document.getElementById("status");
document.getElementById("connect").onclick = connect;
document.getElementById("create").onclick = createDoc;
document.getElementById("sign").onclick = signDoc;