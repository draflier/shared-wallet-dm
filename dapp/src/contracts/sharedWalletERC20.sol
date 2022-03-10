// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract SharedWalletERC20 {
    IERC20 public m_token;
    string public walletName;
    uint256 public walletBalance;
    mapping(address => bool) private walletOwner;

    constructor(address addrToken) {
        m_token = IERC20(addrToken);
        walletOwner[msg.sender] = true;
    }

    modifier isWalletOwner(address addrCaller)
    {
        require(walletOwner[addrCaller] == true,"You must be the owner to call this function");
        _;
    }

    function depositMoney(uint256 intAmt) public payable isWalletOwner(msg.sender) {        
        //walletBalance += msg.value;
        m_token.transferFrom(msg.sender,address(this),intAmt);
    }

    function setWalletName(string memory _name) external isWalletOwner(msg.sender) {
        walletName = _name;
    }

    function withDrawMoney(uint256 intAmt) public payable isWalletOwner(msg.sender) {
        walletBalance -= intAmt;
        m_token.transfer(msg.sender,intAmt);
    }

    function getWalletBalance() external view returns (uint256) {
        return walletBalance;
    }

    //Adds Wallet Owner
    function addWalletOwner(address addrNewOwner) public isWalletOwner(msg.sender)
    {
        walletOwner[addrNewOwner] = true;
    }

    //allows the frontend to check if the current address is wallet owner
    function chkWalletOwner() public view returns (bool)
    {
        if (walletOwner[msg.sender] == true)
        {
            return true;
        }
        return false;
    }
}

