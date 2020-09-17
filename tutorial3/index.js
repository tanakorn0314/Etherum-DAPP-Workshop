let web3;
let contract;
let account;

let logId = 0;
let logs = [];

let proposals = [];
let closeDate;
let voter;
let canVote = false;
let chairPerson;

const contractAddress = '0xc45BAC75f39094de59C4B7C13e0FC1b1DfF7C3C6';
const ABI = [
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
                "name": "voter",
                "type": "address"
            }
        ],
        "name": "GaveRightToVote",
        "type": "event"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "voter",
                "type": "address"
            }
        ],
        "name": "giveRightToVote",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "proposal",
                "type": "uint256"
            }
        ],
        "name": "vote",
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
                "name": "proposal",
                "type": "uint256"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "voteCount",
                "type": "uint256"
            }
        ],
        "name": "Voted",
        "type": "event"
    },
    {
        "inputs": [],
        "name": "chairperson",
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
        "name": "closeDate",
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
        "name": "numProposals",
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
        "name": "proposalNames",
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
        "inputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "name": "proposals",
        "outputs": [
            {
                "internalType": "string",
                "name": "name",
                "type": "string"
            },
            {
                "internalType": "uint256",
                "name": "voteCount",
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
                "name": "",
                "type": "address"
            }
        ],
        "name": "voters",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "weight",
                "type": "uint256"
            },
            {
                "internalType": "bool",
                "name": "voted",
                "type": "bool"
            },
            {
                "internalType": "uint256",
                "name": "vote",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "winnerName",
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
        "name": "winnigProposal",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "winningProposal_",
                "type": "uint256"
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

    getNumProposals().then(async num => {
        for (let i = 0; i < +num; i++) {
            proposals[i] = await getProposals(i);
        }
        displayProposals();
        displayStatus();
    });

    getCloseDate().then(date => {
        closeDate = new Date(+date * 1000);

        const iv = setInterval(async () => {

            if (new Date().valueOf() < closeDate.valueOf()) {
                displayDate();
            } else {
                canVote = false;
                displayDate();
                displayProposals();

                const winner = await getWinnerName();

                $('#winner').html(`The winner is ${winner}`);
                clearInterval(iv);
            }

        }, 1000);

    });

    onVoted().on('data', (event) => {
        const { proposal, voteCount } = event.returnValues;
        proposals[proposal].voteCount = voteCount;
        displayProposals();
    });

    onGaveRightToVote().on('data', () => {
        reloadInfo();
    })
}

function reloadInfo() {
    displayBalance();

    getVoters(account).then(v => {
        voter = v;
        canVote = +voter.weight === 1 && !voter.voted;
        displayStatus();
        displayProposals();
    });

    getChairperson().then(cp => {
        chairPerson = cp;
        $('#chairperson-address').html(`(${chairPerson})`);

        if (account.toLowerCase() === chairPerson.toLowerCase()) {
            $('#managePanel').show();
        } else {
            $('#managePanel').hide();
        }
    })

}

// contract funtions - [getters]
function getChairperson() {
    return contract.methods.chairperson().call();
}

function getNumProposals() {
    return contract.methods.numProposals().call();
}

function getCloseDate() {
    return contract.methods.closeDate().call();
}

function getVoters(address) {
    return contract.methods.voters(address).call();
}

function getProposals(index) {
    return contract.methods.proposals(index).call();
}

function getWinnigProposal() {
    return contract.methods.winnigProposal().call();
}

function getWinnerName() {
    return contract.methods.winnerName().call();
}

//contract functions - [setters]
function giveRightToVote(voter) {
    return contract.methods.giveRightToVote(voter).send({ from: account });
}

function vote(proposal) {
    return contract.methods.vote(proposal).send({ from: account });
}

//contract events
function onVoted() {
    return contract.events.Voted();
}

function onGaveRightToVote() {
    return contract.events.GaveRightToVote();
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

function showPendings() {
    $('#pending-tx').empty();
    pendings.forEach(pending => {
        $('#pending-tx').append(pending.html);
    })
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

async function displayProposals() {

    $('#proposals').empty();

    proposals.forEach((proposal, index) => {
        let img = '';

        switch (proposal.name) {
            case 'John Wick': img = 'john.jpg'; break;
            case 'Michael Scofield': img = 'michael.png'; break;
            case 'Dominic toretto': img = 'dominic.jpg'; break;
        }

        $('#proposals').append(`
            <div class="card col-3 mx-1 p-2" style="width: 18rem;">
                <img src="./assets/${img}" class="card-img-top h-50">
                <div class="card-body text-center">
                    <p class="card-text">${proposal.name}</p>
                    <button class='btn btn-primary' ${canVote ? '' : 'disabled'} onclick="handleVote(${index})">${proposal.voteCount} Votes</button>
                </div>
            </div>
        `);

    });

}

function displayDate() {
    const now = new Date();

    if (now.valueOf() < closeDate.valueOf()) {
        const diff = closeDate.valueOf() - now.valueOf();
        const remainHour = Math.floor(diff / 1000 / 60 / 60 % 24);
        const remainMinute = Math.floor(diff / 1000 / 60 % 60);
        const remainSecond = Math.floor(diff / 1000 % 60);

        $('#voting-time').html(`Voting will be closed in ${remainHour} : ${remainMinute} : ${remainSecond}`);
    } else {
        $('#voting-time').html(`Voting is closed`);
    }

}

function displayStatus() {
    const { vote, voted, weight } = voter;
    if (voted) {
        $('#status').html(`You've voted ${proposals[+vote] ? proposals[+vote].name : ''}`);
    } else if (+weight === 0) {
        $('#status').html(`You have no right to vote please contact a chairperson`);
    } else if (canVote) {
        $('#status').html(`Select a proposal to vote`);
    }
}

function displayLogs() {
    $('#logs').empty();

    logs.forEach(log => $('#logs').append(log.html));
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

function strListToHex(strList) {
    return strList.map(str => web3.utils.fromAscii(str).padEnd(66, "0"))
}

function hexToAscii(hex) {
    return web3.utils.toAscii(hex);
}

// DOM handlers
function handleGiveRight() {
    const address = $('#address-input').val();

    let log;

    giveRightToVote(address)
        .on('transactionHash', () => {
            log = addLog(`<li>Give right to ${address} (Pending)</li>`)
        })
        .on('receipt', (receipt) => {
            updateLog(log.id, `
                <li>Give right to ${address} <a target="_blank" href="${getEtherscanLink(receipt.transactionHash)}">${getEtherscanLink(receipt.transactionHash)}</a></li>
            `)
        })
}

function handleVote(proposal) {
    let log;

    vote(proposal)
        .on('transactionHash', () => {
            log = addLog(`<li>Vote to ${proposals[proposal].name} (Pending)</li>`)
        })
        .on('receipt', (receipt) => {
            updateLog(log.id, `
                <li>Vote to ${proposals[proposal].name} <a target="_blank" href="${getEtherscanLink(receipt.transactionHash)}">${getEtherscanLink(receipt.transactionHash)}</a></li>
            `)
        })
}