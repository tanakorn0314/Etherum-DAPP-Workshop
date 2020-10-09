pragma solidity >0.6.99 <0.8.0;

contract Share {
    
    address[] public shareList = [
        0xDBFAEfAf98e2eACb5CD660152AC4D49640C8c96F, 
        0xB775F3aFAd739E25B09A2cb7706583008AF89Acd, 
        0xE014B31FA213E464D79c41FBeE1EaB6855D8B455
    ];
    uint public numShare;
    
    event Received(address sender, uint amount, uint remain);
    event Withdrew(address sender, uint amount, uint remain);
    
    constructor() {
        numShare = shareList.length;
    }
    
    function withdraw(uint amount) public {
        require(amount <= address(this).balance, "Not enough balance");
        
        address account;
        for (uint i = 0; i < shareList.length; i++) {
            if (shareList[i] == msg.sender) {
                account = shareList[i];
            }
        }
        
        require(account != address(0), "You have no right to get money");
        
        msg.sender.transfer(amount);
        
        emit Withdrew(msg.sender, amount, address(this).balance);
    }
    
    function deposit() public payable {
        emit Received(msg.sender, msg.value, address(this).balance);
    }
    
}