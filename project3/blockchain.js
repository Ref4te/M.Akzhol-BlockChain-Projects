// blockchain.js

/* Конфигурация контракта и ABI */
const contractAddress = "0x2F7760aA2cDF32D414504b8cC7Ee699055F231E6";
const abi = [
	{
		"inputs": [],
		"name": "acceptOwnership",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "subscriptionId",
				"type": "uint256"
			}
		],
		"stateMutability": "payable",
		"type": "constructor"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "have",
				"type": "address"
			},
			{
				"internalType": "address",
				"name": "want",
				"type": "address"
			}
		],
		"name": "OnlyCoordinatorCanFulfill",
		"type": "error"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "have",
				"type": "address"
			},
			{
				"internalType": "address",
				"name": "owner",
				"type": "address"
			},
			{
				"internalType": "address",
				"name": "coordinator",
				"type": "address"
			}
		],
		"name": "OnlyOwnerOrCoordinator",
		"type": "error"
	},
	{
		"inputs": [],
		"name": "ReentrancyGuardReentrantCall",
		"type": "error"
	},
	{
		"inputs": [],
		"name": "ZeroAddress",
		"type": "error"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"internalType": "address",
				"name": "vrfCoordinator",
				"type": "address"
			}
		],
		"name": "CoordinatorSet",
		"type": "event"
	},
	{
		"inputs": [],
		"name": "deposit",
		"outputs": [],
		"stateMutability": "payable",
		"type": "function"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "uint256",
				"name": "requestId",
				"type": "uint256"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "player",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "uint8",
				"name": "playerChoice",
				"type": "uint8"
			},
			{
				"indexed": false,
				"internalType": "uint8",
				"name": "casinoChoice",
				"type": "uint8"
			},
			{
				"indexed": false,
				"internalType": "string",
				"name": "result",
				"type": "string"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "payout",
				"type": "uint256"
			}
		],
		"name": "GameFinished",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "uint256",
				"name": "requestId",
				"type": "uint256"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "player",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "uint8",
				"name": "playerChoice",
				"type": "uint8"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "bet",
				"type": "uint256"
			}
		],
		"name": "GameRequested",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "from",
				"type": "address"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "to",
				"type": "address"
			}
		],
		"name": "OwnershipTransferRequested",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "from",
				"type": "address"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "to",
				"type": "address"
			}
		],
		"name": "OwnershipTransferred",
		"type": "event"
	},
	{
		"inputs": [],
		"name": "playPaper",
		"outputs": [],
		"stateMutability": "payable",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "playRock",
		"outputs": [],
		"stateMutability": "payable",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "playScissors",
		"outputs": [],
		"stateMutability": "payable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "requestId",
				"type": "uint256"
			},
			{
				"internalType": "uint256[]",
				"name": "randomWords",
				"type": "uint256[]"
			}
		],
		"name": "rawFulfillRandomWords",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "_vrfCoordinator",
				"type": "address"
			}
		],
		"name": "setCoordinator",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "to",
				"type": "address"
			}
		],
		"name": "transferOwnership",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "withdrawAll",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "callbackGasLimit",
		"outputs": [
			{
				"internalType": "uint32",
				"name": "",
				"type": "uint32"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "getBalance",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "getRules",
		"outputs": [
			{
				"internalType": "string",
				"name": "",
				"type": "string"
			}
		],
		"stateMutability": "pure",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "keyHash",
		"outputs": [
			{
				"internalType": "bytes32",
				"name": "",
				"type": "bytes32"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "lastRound",
		"outputs": [
			{
				"internalType": "address",
				"name": "player",
				"type": "address"
			},
			{
				"internalType": "uint8",
				"name": "playerChoice",
				"type": "uint8"
			},
			{
				"internalType": "uint8",
				"name": "randomNumber",
				"type": "uint8"
			},
			{
				"internalType": "string",
				"name": "result",
				"type": "string"
			},
			{
				"internalType": "uint256",
				"name": "bet",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "MIN_BET",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "numWords",
		"outputs": [
			{
				"internalType": "uint32",
				"name": "",
				"type": "uint32"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "owner",
		"outputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "requestConfirmations",
		"outputs": [
			{
				"internalType": "uint16",
				"name": "",
				"type": "uint16"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "s_subscriptionId",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "s_vrfCoordinator",
		"outputs": [
			{
				"internalType": "contract IVRFCoordinatorV2Plus",
				"name": "",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "vrfCoordinator",
		"outputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	}
];

/* Настройки сети (BSC Testnet), потому, что дефолтный сеть имел ограничение на запросы и ломал игру */
const PUBLIC_RPC = "https://bsc-testnet.publicnode.com";

let provider; 
let readOnlyProvider;
let signer;
let contract;
let readOnlyContract;
let lastProcessedRequestId = null;

/* Подключение кошелька MetaMask и инициализация провайдеров */
export async function connectWallet() {
    if (window.ethereum) {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        const address = accounts[0];

        provider = new ethers.providers.Web3Provider(window.ethereum);
        readOnlyProvider = new ethers.providers.JsonRpcProvider(PUBLIC_RPC);
        
        signer = provider.getSigner();
        contract = new ethers.Contract(contractAddress, abi, signer);
        readOnlyContract = new ethers.Contract(contractAddress, abi, readOnlyProvider);

        const balance = await provider.getBalance(address);

        return {
            address: address,
            balance: ethers.utils.formatEther(balance)
        };
    } else {
        throw new Error("MetaMask не установлен");
    }
}

/* Вызов функций контракта для совершения хода */
export async function sendPlayTransaction(choice, valueInWei) {
    const options = { value: valueInWei };
    let tx;
    
    // Выбор функции в зависимости от индекса (0-Камень, 1-Ножницы, 2-Бумага)
    if (choice === 0) tx = await contract.playRock(options);
    else if (choice === 1) tx = await contract.playScissors(options);
    else if (choice === 2) tx = await contract.playPaper(options);

    console.log("Транзакция отправлена:", tx.hash);
    return await tx.wait(); 
}

/* Получение баланса смарт-контракта */
export async function getContractBalance() {
    const p = readOnlyProvider || new ethers.providers.JsonRpcProvider(PUBLIC_RPC);
    const balance = await p.getBalance(contractAddress);
    return ethers.utils.formatEther(balance);
}

/* Мониторинг событий блокчейна для получения результата игры */
export function listenToEvents(onRequested, onFinished) {
    if (!readOnlyContract) return;

    console.log("Мониторинг событий запущен...");

    // Опрос событий каждые 5 секунд (Polling)
    setInterval(async () => {
        try {
            const userAddr = await signer.getAddress();
            const filter = readOnlyContract.filters.GameFinished(null, userAddr);
            const logs = await readOnlyContract.queryFilter(filter, -20, "latest");

            if (logs.length > 0) {
                const lastLog = logs[logs.length - 1];
                const data = lastLog.args;
                const reqId = data.requestId.toString();

                // Проверка, чтобы не обрабатывать один и тот же результат дважды
                if (reqId !== lastProcessedRequestId) {
                    lastProcessedRequestId = reqId;
                    console.log("Результат игры получен!");
                    onFinished({
                        requestId: reqId,
                        casinoChoice: data.casinoChoice,
                        result: data.result,
                        payout: ethers.utils.formatEther(data.payout)
                    });
                }
            }
        } catch (e) {
            console.warn("RPC временно занят...");
        }
    }, 5000); 
}