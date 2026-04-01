import { ethers } from "https://cdn.jsdelivr.net/npm/ethers@6.7.0/+esm";

const CONTRACT = "0x67C0234E58F8F200fc79E0Db81714844E1b8360f";

const ABI = [
    "function mint() payable",
    "function totalSupply() view returns (uint256)",
    "function tokenURI(uint256) view returns (string)",
    "function tokensOfOwner(address) view returns (uint256[])"
];

let provider, signer, contract;

async function connect() {
    provider = new ethers.BrowserProvider(window.ethereum);
    await provider.send("eth_requestAccounts", []);

    signer = await provider.getSigner();
    contract = new ethers.Contract(CONTRACT, ABI, signer);

    updateSupply();
    loadNFTs();
}

async function updateSupply() {
    const s = await contract.totalSupply();
    document.getElementById("supply").innerText = s;
}

async function mint() {
    const tx = await contract.mint({
        value: ethers.parseEther("0.001")
    });

    await tx.wait();

    updateSupply();
    loadNFTs();
}

async function loadNFTs() {
    const addr = await signer.getAddress();
    const ids = await contract.tokensOfOwner(addr);

    const container = document.getElementById("nfts");
    container.innerHTML = "";

    for (let id of ids) {
            const uri = await contract.tokenURI(id);
            const url = uri.replace("ipfs://", "https://turquoise-adjacent-squid-867.mypinata.cloud/ipfs/");

            const meta = await fetch(url).then(r => r.json());
            const img = meta.image.replace("ipfs://", "https://turquoise-adjacent-squid-867.mypinata.cloud/ipfs/");

            const div = document.createElement("div");
            div.className = "nft-card"; // Добавим класс для стилей
            
            // Генерируем HTML для атрибутов
            const attributesHtml = meta.attributes.map(attr => {
                const isNumber = typeof attr.value === 'number';
                return `
                    <div class="attr-box ${isNumber ? 'boost' : 'text'}">
                        <span class="label">${attr.trait_type}</span>
                        <span class="value">${attr.value}${isNumber ? '%' : ''}</span>
                    </div>
                `;
            }).join('');

            div.innerHTML = `
                <h3>${meta.name}</h3>
                <div class="img-container">
                    <img src="${img}" width="180">
                </div>
                
                <div class="info">
                    <p class="desc">${meta.description}</p>
                    
                    <div class="stats-grid">
                        ${attributesHtml}
                    </div>
                    
                    <a href="${meta.external_url}" target="_blank" class="wiki-link">Wiki Page</a>
                </div>
            `;

            container.appendChild(div);
    }
}

document.getElementById("connect").onclick = connect;
document.getElementById("mint").onclick = mint;