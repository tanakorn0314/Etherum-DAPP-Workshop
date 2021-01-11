let web3;
let contract;
let account;

let tokenName;
let symbol;
let totalSupply;
let decimals;
let tokenBalance;

const contractAddress = '0x70f661a8d905f5cb3f481175341ebfcfb0469ed2';
const ABI = [
    {
        "inputs": [
            {
                "internalType": "string",
                "name": "name",
                "type": "string"
            },
            {
                "internalType": "string",
                "name": "symbol",
                "type": "string"
            }
        ],
        "stateMutability": "nonpayable",
        "type": "constructor"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "internalType": "address",
                "name": "owner",
                "type": "address"
            },
            {
                "indexed": true,
                "internalType": "address",
                "name": "spender",
                "type": "address"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "value",
                "type": "uint256"
            }
        ],
        "name": "Approval",
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
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "value",
                "type": "uint256"
            }
        ],
        "name": "Transfer",
        "type": "event"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "owner",
                "type": "address"
            },
            {
                "internalType": "address",
                "name": "spender",
                "type": "address"
            }
        ],
        "name": "allowance",
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
                "internalType": "address",
                "name": "spender",
                "type": "address"
            },
            {
                "internalType": "uint256",
                "name": "amount",
                "type": "uint256"
            }
        ],
        "name": "approve",
        "outputs": [
            {
                "internalType": "bool",
                "name": "",
                "type": "bool"
            }
        ],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "account",
                "type": "address"
            }
        ],
        "name": "balanceOf",
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
        "name": "decimals",
        "outputs": [
            {
                "internalType": "uint8",
                "name": "",
                "type": "uint8"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "spender",
                "type": "address"
            },
            {
                "internalType": "uint256",
                "name": "subtractedValue",
                "type": "uint256"
            }
        ],
        "name": "decreaseAllowance",
        "outputs": [
            {
                "internalType": "bool",
                "name": "",
                "type": "bool"
            }
        ],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "spender",
                "type": "address"
            },
            {
                "internalType": "uint256",
                "name": "addedValue",
                "type": "uint256"
            }
        ],
        "name": "increaseAllowance",
        "outputs": [
            {
                "internalType": "bool",
                "name": "",
                "type": "bool"
            }
        ],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "name",
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
        "name": "symbol",
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
        "name": "totalSupply",
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
                "internalType": "address",
                "name": "recipient",
                "type": "address"
            },
            {
                "internalType": "uint256",
                "name": "amount",
                "type": "uint256"
            }
        ],
        "name": "transfer",
        "outputs": [
            {
                "internalType": "bool",
                "name": "",
                "type": "bool"
            }
        ],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "sender",
                "type": "address"
            },
            {
                "internalType": "address",
                "name": "recipient",
                "type": "address"
            },
            {
                "internalType": "uint256",
                "name": "amount",
                "type": "uint256"
            }
        ],
        "name": "transferFrom",
        "outputs": [
            {
                "internalType": "bool",
                "name": "",
                "type": "bool"
            }
        ],
        "stateMutability": "nonpayable",
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

    // get account info
    web3.eth.getAccounts().then(accounts => {
        account = accounts[0];
        $('#account-display').html(`Current Account: ${account}`);
        reloadInfo();
    })

    // get network info
    web3.eth.net.getId().then(netId => {
        displayNetwork(netId);
        reloadInfo();
    });

    if (ethereum) {
        // account change event subscribe
        ethereum.on('accountsChanged', accounts => {
            account = accounts[0];
            $('#account-display').html(`Current Account: ${account}`);
            reloadInfo();
        });
        // network change event subscribe
        ethereum.on('chainChanged', (chainId) => {
            displayNetwork(web3.utils.hexToNumber(chainId));
            reloadInfo();
        });
    }
}

async function reloadInfo() {
    displayBalance();

    const results = await Promise.all([
        getTokenName(),
        getSymbol(),
        getDecimals(),
        getTotalSupply(),
        balanceOf(account)
    ]);

    tokenName = results[0]
    symbol = results[1]
    decimals = results[2]
    totalSupply = results[3]
    tokenBalance = results[4]

    displayTokenName();
    displayTotalSupply();
    displayTokenBalance();

}

// contract funtions - [getters]
function getTokenName() {
    return contract.methods.name().call();
}

function getSymbol() {
    return contract.methods.symbol().call();
}

function getDecimals() {
    return contract.methods.decimals().call();
}

function getTotalSupply() {
    return contract.methods.totalSupply().call();
}

function balanceOf(address) {
    return contract.methods.balanceOf(address).call({ from: account });
}

//contract functions - [setters]
function transfer(recipient, amount) {
    return contract.methods.transfer(recipient, amount).send({ from: account });
}

//contract events
function onTransfer() {
    return contract.events.Transfer();
}

//ui functions
function displayBalance() {
    return web3.eth.getBalance(account).then(result => {
        $("#balance-display").html(`Balance: ${web3.utils.fromWei(result)} Ether`);
    });
}

function displayTokenName() {
    $('#token-name').html(`${tokenName} (${symbol}) token`);
}

function displayTotalSupply() {
    $('#total-supply').html(`Total supply: ${fromToken(totalSupply)} ${symbol}`);
}

function displayTokenBalance() {
    $('#balance-of').html(`You have ${fromToken(tokenBalance)} ${symbol}`)
}

function displayNetwork(netId) {
    let network, warning;
    switch (netId) {
        case 1:
            network = 'Mainnet';
            warning = 'Please switch your network to Rinkeby';
            break
        case 2:
            network = 'Deprecated Morden';
            warning = 'Please switch your network to Rinkeby';
            break
        case 3:
            network = 'Ropsten';
            warning = 'Please switch your network to Rinkeby';
            break
        case 4:
            network = 'Rinkeby';
            break
        case 42:
            network = 'Kovan';
            warning = 'Please switch your network to Rinkeby';
            break
        default:
            network = 'Unknown';
            warning = 'Please switch your network to Rinkeby';
    }
    $('#network-display').html(`Network: ${network}`);
    if (warning) {
        $('#warning-display').show();
        $('#warning-display').html(warning);
    }
    else $('#warning-display').hide();
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
    const network = 'ropsten';
    return `https://${network}.etherscan.io/tx/${txHash}`;
}

function strListToHex(strList) {
    return strList.map(str => web3.utils.fromAscii(str).padEnd(66, "0"))
}

function hexToAscii(hex) {
    return web3.utils.toAscii(hex);
}

function numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function fromToken(amount) {
    if (decimals >= amount.length) {
        let diff = Number(decimals) - amount.length
        return '0.' + ''.padEnd(diff, '0') + amount;
    }
    let left = amount.substr(0, amount.length - Number(decimals));
    let right = amount.substr(amount.length - Number(decimals));
    return numberWithCommas(left) + "." + right;
}

function toToken(amount) {
    return amount.toString() + ''.padEnd(decimals, '0');
}

// DOM handlers
async function handleTransfer() {
    const recipient = $('#address-input').val();
    const amount = $('#amount-input').val();
    if (recipient.length > 0 && amount.length > 0) {
        try {
            await transfer(recipient, toToken(amount))
            reloadInfo();
        } catch (e) {
            console.error(e);
        }
    } else {
        console.log('Please input address and amount');
    }

}