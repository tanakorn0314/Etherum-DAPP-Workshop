let web3;
let contract;
let account;

let logId = 0;
let logs = [];

let historyId = 0;
let historyList = [];

let shareList = [];
let numShare = 0;

// for prevent double emiting purpose
let emittedEvents = {};

const contractAddress = '0xDb68Bff92D959680c1CFb10e8331e7Ceb075a640';
const ABI = [
	{
		"inputs": [],
		"name": "deposit",
		"outputs": [],
		"stateMutability": "payable",
		"type": "function"
	},
	{
		"inputs": [],
		"stateMutability": "nonpayable",
		"type": "constructor"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"internalType": "address",
				"name": "sender",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "amount",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "remain",
				"type": "uint256"
			}
		],
		"name": "Received",
		"type": "event"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "amount",
				"type": "uint256"
			}
		],
		"name": "withdraw",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"internalType": "address",
				"name": "sender",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "amount",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "remain",
				"type": "uint256"
			}
		],
		"name": "Withdrew",
		"type": "event"
	},
	{
		"inputs": [],
		"name": "numShare",
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
		"inputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"name": "shareList",
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
]
// onload
$(() => {

    if (window.ethereum) {
        web3 = new Web3(ethereum);
        try {
            ethereum.enable().then(result => {
                startApp()
            })
        }
        catch (err) {
            console.log(err);
        }
    }
    else if (typeof web3 !== 'undefined') {
        web3 = new Web3(web3.currentProvider);
        startApp();
    } else {
        console.log('No web3? You should consider trying MetaMask!')
        web3 = new Web3(new Web3.providers.HttpProvider("https://rpc.tch.in.th"));
        startApp();
    }

})


// app functions
function startApp() {

    contract = new web3.eth.Contract(ABI, contractAddress);

    web3.eth.getAccounts().then(accounts => {
        account = accounts[0];
        $('#account-display').html(`Current Account: ${account}`);
        reloadInfo();
    })

    web3.eth.net.getId().then(netId => {
        displayNetwork(netId);
        reloadInfo();
    });

    if (ethereum) {
        ethereum.on('accountsChanged', accounts => {
            account = accounts[0];
            $('#account-display').html(`Current Account: ${account}`);
            reloadInfo();
        });
        ethereum.on('chainChanged', (chainId) => {
            displayNetwork(web3.utils.hexToNumber(chainId));
            reloadInfo();
        });
    }

    getNumShare().then(async num => {

        for (let i = 0; i < +num; i++) {
            shareList[i] = await getShareList(i);
        }

        displayShareList();
        reloadInfo();
    });

    web3.eth.getBalance(contractAddress).then(result => {
        $("#pool-balance").html(`${web3.utils.fromWei(result)} Ether`);
    });

    contract.getPastEvents('Received', { fromBlock: 0, toBlock: 'latest' }).then(events => {
        events.forEach(event => {
            const { sender, amount } = event.returnValues;
            console.log('event', event);
            addHistory(`
                <li>
                    <a target="_blank" href="${getEtherscanLink(event.transactionHash)}">
                        Donated ${web3.utils.fromWei(amount, 'ether')} ETH by ${sender}
                    </a>
                </li>
            `)
        })
    });

    contract.getPastEvents('Withdrew', { fromBlock: 0, toBlock: 'latest' }).then(events => {
        events.forEach(event => {
            const { sender, amount } = event.returnValues;
            addHistory(`
                <li>
                    <a target="_blank" href="${getEtherscanLink(event.transactionHash)}">
                        Withdrawn ${web3.utils.fromWei(amount, 'ether')} ETH by ${sender}
                    </a>
                </li>
            `)
        })


    })

    onReceived().on('data', event => {
        const { sender, amount, remain } = event.returnValues;
        if (!emittedEvents[event.transactionHash]) {
            addHistory(`
                <li>
                    <a target="_blank" href="${getEtherscanLink(event.transactionHash)}">
                        Donated ${web3.utils.fromWei(amount, 'ether')} ETH by ${sender}
                    </a>
                </li>
            `);
            emittedEvents[event.transactionHash] = event;
        }

        $("#pool-balance").html(`${web3.utils.fromWei(remain)} Ether`);
    });

    onWithdrew().on('data', event => {
        const { sender, amount, remain } = event.returnValues;
        if (!emittedEvents[event.transactionHash]) {
            addHistory(`
                <li>
                    <a target="_blank" href="${getEtherscanLink(event.transactionHash)}">
                        Withdrawn ${web3.utils.fromWei(amount, 'ether')} ETH by ${sender}
                    </a>
                </li>
            `)
            emittedEvents[event.transactionHash] = event;
        }

        $("#pool-balance").html(`${web3.utils.fromWei(remain)} Ether`);
    })

}

function reloadInfo() {
    displayBalance();

    if (shareList.map(share => share.toLowerCase()).includes(account.toLowerCase())) {
        $('#withdraw-panel').show();
    } else {
        $('#withdraw-panel').hide();
    }
}

// contract funtions - [getters]
function getShareList(index) {
    return contract.methods.shareList(index).call();
}

function getNumShare() {
    return contract.methods.numShare().call();
}

//contract functions - [setters]
function withdraw(amount) {
    return contract.methods.withdraw(amount).send({ from: account });
}

function deposit(value) {
    return contract.methods.deposit().send({ from: account, value })
}

//contract events
function onReceived() {
    return contract.events.Received();
}

function onWithdrew() {
    return contract.events.Withdrew();
}

//ui functions
function displayBalance() {
    return web3.eth.getBalance(account).then(result => {
        $("#balance-display").html(`Balance: ${web3.utils.fromWei(result)} Ether`);
    });
}

function displayNetwork(netId) {
    let network, warning;
    switch (netId) {
        case 1:
            network = 'Mainnet';
            warning = 'Please switch your network to Kovan';
            break
        case 2:
            network = 'Deprecated Morden';
            warning = 'Please switch your network to Kovan';
            break
        case 3:
            network = 'Ropsten';
            warning = 'Please switch your network to Kovan';
            break
        case 4:
            network = 'Rinkeby';
            warning = 'Please switch your network to Kovan';
            break
        case 42:
            network = 'Kovan';
            break
        default:
            network = 'Unknown';
            warning = 'Please switch your network to Kovan';
    }
    $('#network-display').html(`Network: ${network}`);
    if (warning) {
        $('#warning-display').show();
        $('#warning-display').html(warning);
    }
    else $('#warning-display').hide();
}

function addLog(html) {
    const log = { id: logId, html };
    logs.push(log);
    logId++;
    displayLogs();
    return log;
}

function updateLog(id, html) {
    logs = logs.map(log => log.id === id ? { id, html } : log);
    displayLogs();
}

function displayLogs() {
    $('#logs').empty();

    logs.forEach(log => $('#logs').append(log.html));
}

function addHistory(html) {
    const history = { id: historyId, html };
    historyList.push(history);
    historyId++;
    displayHistory();
    return history;
}

function updateHisory(id, html) {
    historyList = historyList.map(history => history.id === id ? { id, html } : history);
    displayHistory();
}

function displayHistory() {
    $('#history').empty();

    historyList.forEach(log => $('#history').append(log.html));
}

function displayShareList() {

    $('#share-list').empty();

    const images = ['children.jpg', 'hospital.jpg', 'school.jpg'];
    const names = ['Children', 'Hospital', 'School']

    shareList.forEach((share, index) => {

        $('#share-list').append(`
            <div class="card col-3 mx-1 p-2" style="width: 18rem;">
                <img src="./assets/${images[index]}" class="card-img-top h-50">
                <div class="card-body text-center">
                    <h6 class='card-text'>For ${names[index]}</h6>
                    <p class="card-text">${share}</p>
                </div>
            </div>
        `);

    });

}

// account funcions
function updateAddress() {
    if (window.ethereum) {
        window.ethereum.on('accountsChanged', accounts => {
            account = accounts[0];
            $('#account-display').html(`Current Account: ${account}`);
        });
    }
}

// helpers
function getEtherscanLink(txHash) {
    const network = 'kovan';
    return `https://${network}.etherscan.io/tx/${txHash}`;
}

// DOM handlers
function donate() {
    let log;

    const val = $('#balance-input').val();

    if (!isNaN(+val)) {
        deposit(web3.utils.toWei(val, 'ether'))
            .on('transactionHash', () => {
                log = addLog(`<li>Donate ${val} ETH (Pending)</li>`)
            })
            .on('receipt', receipt => {
                updateLog(log.id, `
                    <li>Donate ${val} ETH <a target="_blank" href="${getEtherscanLink(receipt.transactionHash)}">${getEtherscanLink(receipt.transactionHash)}</a></li>
                `)
            })
    } else {
        alert('Please input number');
    }

}

function handleWithdraw() {
    let log;

    const val = $('#withdraw-input').val();

    if (!isNaN(+val)) {
        withdraw(web3.utils.toWei(val, 'ether'))
            .on('transactionHash', () => {
                log = addLog(`<li>Withdraw ${val} ETH (Pending)</li>`)
            })
            .on('receipt', receipt => {
                updateLog(log.id, `
                    <li>Withdraw ${val} ETH <a target="_blank" href="${getEtherscanLink(receipt.transactionHash)}">${getEtherscanLink(receipt.transactionHash)}</a></li>
                `)
            })
    } else {
        alert('Please input number');
    }
}