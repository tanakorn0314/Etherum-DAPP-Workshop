// SPDX-License-Identifier: MIT
pragma solidity ^0.6.10;

import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/v3.0.0/contracts/token/ERC20/ERC20.sol";

contract Token is ERC20 {
    constructor (string memory name, string memory symbol)
        ERC20(name, symbol)
        public
    {
        _mint(msg.sender, 100 * 10 ** uint(decimals()));
    }
}