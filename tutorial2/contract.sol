pragma solidity 0.7.0;

contract SimpleEvent {
    
    uint private count;
    string private message;
    bool private  isOn;
    
    event CountChange(address sender, uint count);
    event MessageChange(address sender, string message);
    event OnStatusChange(address sender, bool isOn);
    
    //setter
    function countUp() public {
        //Using safemath is better
        count++;
        emit CountChange(msg.sender, count);
    }
    
    function countDown() public {
        //Using safemath is better
        require(count > 0, "cannot count lower zero");
        count--;
        emit CountChange(msg.sender, count);
    }
    
    function setMessage(string memory _message) public {
        message = _message;
        emit MessageChange(msg.sender, message);
    }
    
    function toggle() public {
        isOn = !isOn;
        emit OnStatusChange(msg.sender, isOn);
    }
    
    //getter
    function getCount() public view returns (uint) {
        return count;
    }
    
    function getMessage() public view returns (string memory) {
        return message;
    }
    
    function getOnStatus() public view returns (bool) {
        return isOn;
    }
    
    
}