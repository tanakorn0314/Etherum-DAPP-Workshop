let web3;
let contract;

let pendingId = 0;
let pendings = [];
let finished = [];

let message = "This is message";
let number = 5;
let bool = true;
let account = '';

const contractAddress = '0xF08f8EE476b7Edf04c99f3Bc503C83Ea8d8B116D';
const ABI = [
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
				"name": "count",
				"type": "uint256"
			}
		],
		"name": "CountChange",
		"type": "event"
	},
	{
		"inputs": [],
		"name": "countDown",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "countUp",
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
				"internalType": "string",
				"name": "message",
				"type": "string"
			}
		],
		"name": "MessageChange",
		"type": "event"
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
				"internalType": "bool",
				"name": "isOn",
				"type": "bool"
			}
		],
		"name": "OnStatusChange",
		"type": "event"
	},
	{
		"inputs": [
			{
				"internalType": "string",
				"name": "_message",
				"type": "string"
			}
		],
		"name": "setMessage",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "toggle",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "getCount",
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
		"name": "getMessage",
		"outputs": [
			{
				"internalType": "string",
				"name": "",
				"type": "string"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "getOnStatus",
		"outputs": [
			{
				"internalType": "bool",
				"name": "",
				"type": "bool"
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

    onMessageChange().on('data', event => {
        const { returnValues } = event;
        const { sender, message } = returnValues;
        $('#updated-string').html(` (Updated by ${sender})`);
        $('#string-display').html(message);
    });

    onCountChange().on('data', event => {
        const { returnValues } = event;
        const { sender, count } = returnValues;
        $('#updated-number').html(` (Updated by ${sender})`);
        $('#number-display').html(count);
    });

    onOnStatusChange().on('data', event => {
        const { returnValues } = event;
        const { sender, isOn } = returnValues;
        $('#updated-boolean').html(` (Updated by ${sender})`);
        displayLight(isOn);
    });

}

function reloadInfo() {

    displayBalance();

    getMessage().then(msg => {
        $('#string-display').html(msg);
    });

    getCount().then(count => {
        $('#number-display').html(count);
    });

    getOnStatus().then(isOn => {
        displayLight(isOn);
    });


}

// contract funtions - [getters]
function getMessage() {
    return contract.methods.getMessage().call();
}

function getCount() {
    return contract.methods.getCount().call();
}

function getOnStatus() {
    return contract.methods.getOnStatus().call();
}

function getLatestUser() {
    return contract.methods.getLatestUser().call();
}

//contract functions - [setters]
function setMessage(message) {
    return contract.methods.setMessage(message).send({ from: account });
}

function countUp() {
    return contract.methods.countUp().send({ from: account });
}

function countDown() {
    return contract.methods.countDown().send({ from: account });
}

function toggle() {
    return contract.methods.toggle().send({ from: account });
}

function updateUser() {
    return contract.methods.updateUser().send({ from: account });
}

//contract events
function onCountChange() {
    return contract.events.CountChange();
}

function onMessageChange() {
    return contract.events.MessageChange();
}

function onOnStatusChange() {
    return contract.events.OnStatusChange();
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

function displayLight(isOn) {
    if (isOn) {
        $('#bool-display').removeClass('alert-dark');
        $('#bool-display').addClass('alert-warning');
        $('#bool-display').html("Light is on!");
    } else {
        $('#bool-display').removeClass('alert-warning');
        $('#bool-display').addClass('alert-dark');
        $('#bool-display').html("Light is off!");
    }
}

function showPendings() {
    $('#pending-tx').empty();
    pendings.forEach(pending => {
        $('#pending-tx').append(pending.html);
    })
}

function pushPending(html) {
    const pendingObj = { id: pendingId, html }
    pendings.push(pendingObj);
    showPendings();
    pendingId++;
    return pendingObj;
}

function removePending(id) {
    pendings = pendings.filter((p, i) => p.id !== id);
    showPendings();
}

// account funcions
function updateAddress() {
    if (window.ethereum) {
        window.ethereum.on('accountsChanged', accounts => {
            console.log('test', accounts);
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
function sendMessage() {
    const messageInput = $('#message-input').val();

    let p;

    return setMessage(messageInput)
        .on('transactionHash', () => {
            p = pushPending(`<li>sendMessage("${messageInput}")</li>`);
            displayBalance();
        })
        .on('receipt', async (receipt) => {
            $('#finished-tx').append(`
                <li>sendMessage("${messageInput}"): <a target="_blank" href="${getEtherscanLink(receipt.transactionHash)}">${getEtherscanLink(receipt.transactionHash)}</a></li>
            `);

            const updatedMessage = await getMessage();
            $('#string-display').html(updatedMessage);

            removePending(p.id);
        })
}

function handleCountUp() {
    let p;

    return countUp()
        .on('transactionHash', () => {
            p = pushPending(`<li>Count up</li>`);
        })
        .on('receipt', async (receipt) => {
            $('#finished-tx').append(`
                <li>Count up: <a target="_blank" href="${getEtherscanLink(receipt.transactionHash)}">${getEtherscanLink(receipt.transactionHash)}</a></li>
            `);

            const count = await getCount();
            $('#number-display').html(count);
            removePending(p.id);
        })
}

async function handleCountDown() {
    let p;

    return countDown()
        .on('transactionHash', () => {
            p = pushPending(`<li>Count down</li>`);
        })
        .on('receipt', async (receipt) => {
            $('#finished-tx').append(`
                <li>Count down: <a target="_blank" href="${getEtherscanLink(receipt.transactionHash)}">${getEtherscanLink(receipt.transactionHash)}</a></li>
            `);

            const count = await getCount();
            $('#number-display').html(count);
            removePending(p.id);
        })
}


async function toggleLight() {
    let p;

    return toggle()
        .on('transactionHash', () => {
            p = pushPending(`<li>Toggle</li>`)
        })
        .on('receipt', async (receipt) => {
            $('#finished-tx').append(`
                <li>Toggle: <a target="_blank" href="${getEtherscanLink(receipt.transactionHash)}">${getEtherscanLink(receipt.transactionHash)}</a></li>
            `);

            const isOn = await getOnStatus();
            displayLight(isOn)
            removePending(p.id);
        })
}
