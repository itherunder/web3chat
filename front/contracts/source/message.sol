pragma solidity ^0.8.0;

contract Message {
    address _owner;
    struct MessageT {
        address from;
        bytes message;
    }
    event SendMessage(address indexed _from, address indexed _to);
    
    constructor() {
        _owner = tx.origin;
    }

    function sendMessage(bytes memory message) public {

    }
}
