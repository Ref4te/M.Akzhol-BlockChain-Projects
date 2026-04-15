import { ethers } from "https://cdn.jsdelivr.net/npm/ethers@6.13.4/+esm";

const CONTRACT_ADDRESS = "0x5FA2BDe7c9B05F9478F4BB5B4454d31a4E0600db";

const ABI = [
    "function chairperson() view returns (address)",
    "function giveRightToVote(address voter)",
    "function delegate(address to)",
    "function vote(uint proposal)",
    "function winningProposal() view returns (uint)",
    "function winnerName() view returns (bytes32)",
    "function proposals(uint) view returns (bytes32 name, uint voteCount)",
    "function voters(address) view returns (uint weight, bool voted, address delegate, uint vote)"
];

let provider = null;
let signer = null;
let contract = null;

const connectBtn = document.getElementById("connectBtn");
const loadVoterBtn = document.getElementById("loadVoterBtn");
const loadProposalsBtn = document.getElementById("loadProposalsBtn");
const giveRightBtn = document.getElementById("giveRightBtn");
const delegateBtn = document.getElementById("delegateBtn");
const voteBtn = document.getElementById("voteBtn");
const winnerBtn = document.getElementById("winnerBtn");

const accountLabel = document.getElementById("account");
const chairpersonLabel = document.getElementById("chairperson");
const contractAddressLabel = document.getElementById("contractAddressLabel");
const statusLabel = document.getElementById("status");

const voterWeight = document.getElementById("voterWeight");
const voterVoted = document.getElementById("voterVoted");
const voterDelegate = document.getElementById("voterDelegate");
const voterVote = document.getElementById("voterVote");

const proposalsList = document.getElementById("proposalsList");
const voterAddressInput = document.getElementById("voterAddress");
const delegateAddressInput = document.getElementById("delegateAddress");
const proposalIndexInput = document.getElementById("proposalIndex");
const winnerResult = document.getElementById("winnerResult");
const winnerIndex = document.getElementById("winnerIndex");

contractAddressLabel.innerText = CONTRACT_ADDRESS;

function setStatus(message) {
    statusLabel.innerText = message;
}

function bytes32ToString(value) {
    try {
        return ethers.decodeBytes32String(value);
    } catch {
        return value;
    }
}

async function connectWallet() {
    try {
        if (!window.ethereum) {
            setStatus("MetaMask не найден");
            return;
        }

        provider = new ethers.BrowserProvider(window.ethereum);
        await provider.send("eth_requestAccounts", []);
        signer = await provider.getSigner();
        contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, signer);

        const account = await signer.getAddress();
        const chair = await contract.chairperson();

        accountLabel.innerText = account;
        chairpersonLabel.innerText = chair;
        setStatus("Подключено");

        await loadVoterStatus();
        await loadProposals();
        await loadWinner();
    } catch (error) {
        console.error(error);
        setStatus(error.shortMessage || error.message);
    }
}

async function loadVoterStatus() {
    try {
        if (!contract || !signer) return;

        const account = await signer.getAddress();
        const voter = await contract.voters(account);

        voterWeight.innerText = voter.weight.toString();
        voterVoted.innerText = voter.voted ? "Да" : "Нет";
        voterDelegate.innerText = voter.delegate === ethers.ZeroAddress ? "-" : voter.delegate;
        voterVote.innerText = voter.voted ? voter.vote.toString() : "-";
    } catch (error) {
        console.error(error);
        setStatus(error.shortMessage || error.message);
    }
}

async function loadProposals() {
    try {
        if (!contract) return;

        proposalsList.innerHTML = "";
        let winner = null;

        try {
            winner = Number(await contract.winningProposal());
        } catch {}

        let index = 0;

        while (true) {
            try {
                const proposal = await contract.proposals(index);
                const item = document.createElement("div");
                item.className = "proposal-item";
                item.innerHTML = `
                    <strong>#${index}</strong><br>
                    Название: ${bytes32ToString(proposal.name)}<br>
                    Голосов: ${proposal.voteCount.toString()}
                `;
                if (winner !== null && winner === index) {
                    item.style.border = "2px solid green";
                }
                proposalsList.appendChild(item);
                index++;
            } catch {
                break;
            }
        }
    } catch (error) {
        console.error(error);
        setStatus(error.shortMessage || error.message);
    }
}

async function giveRightToVote() {
    try {
        const voter = voterAddressInput.value.trim();
        if (!voter) {
            setStatus("Введите адрес");
            return;
        }

        const tx = await contract.giveRightToVote(voter);
        await tx.wait();

        setStatus("Право голоса выдано");
    } catch (error) {
        console.error(error);
        setStatus(error.shortMessage || error.message);
    }
}

async function delegateVote() {
    try {
        const to = delegateAddressInput.value.trim();
        if (!to) {
            setStatus("Введите адрес делегата");
            return;
        }

        const tx = await contract.delegate(to);
        await tx.wait();

        setStatus("Голос делегирован");
        await loadVoterStatus();
        await loadProposals();
        await loadWinner();
    } catch (error) {
        console.error(error);
        setStatus(error.shortMessage || error.message);
    }
}

async function voteProposal() {
    try {
        const proposalIndex = proposalIndexInput.value.trim();
        if (proposalIndex === "") {
            setStatus("Введите индекс предложения");
            return;
        }

        const tx = await contract.vote(proposalIndex);
        await tx.wait();

        setStatus("Голос учтён");
        await loadVoterStatus();
        await loadProposals();
        await loadWinner();
    } catch (error) {
        console.error(error);
        setStatus(error.shortMessage || error.message);
    }
}

async function loadWinner() {
    try {
        if (!contract) return;

        const winnerName = await contract.winnerName();
        const winnerProposal = await contract.winningProposal();

        winnerResult.innerText = bytes32ToString(winnerName);
        winnerIndex.innerText = winnerProposal.toString();
    } catch (error) {
        console.error(error);
        setStatus(error.shortMessage || error.message);
    }
}

connectBtn.addEventListener("click", connectWallet);
loadVoterBtn.addEventListener("click", loadVoterStatus);
loadProposalsBtn.addEventListener("click", loadProposals);
giveRightBtn.addEventListener("click", giveRightToVote);
delegateBtn.addEventListener("click", delegateVote);
voteBtn.addEventListener("click", voteProposal);
winnerBtn.addEventListener("click", loadWinner);