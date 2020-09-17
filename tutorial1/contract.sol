pragma solidity 0.7.0;

contract SimpleVar {
    
    uint private count;
    string private message;
    bool private  isOn;
    
    //setter
    function countUp() public {
        //Using safemath is better
        count++;
    }
    
    function countDown() public {
        //Using safemath is better
        require(count > 0, "cannot count lower zero");
        count--;
    }
    
    function setMessage(string memory _message) public {
        message = _message;
    }
    
    function toggle() public {
        isOn = !isOn;
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