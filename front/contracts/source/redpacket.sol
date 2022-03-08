pragma solidity ^0.8.0;

library SafeMath {
    function add(uint a, uint b) internal pure returns (uint) {
        uint c = a + b;
        require(c >= a, "SafeMath: addition overflow");
        return c;
    }

    function sub(uint a, uint b) internal pure returns (uint) {
        return sub(a, b, "SafeMath: subtraction overflow");
    }

    function sub(uint a, uint b, string memory errorMessage) internal pure returns (uint) {
        require(b <= a, errorMessage);
        uint c = a - b;
        return c;
    }

    function mul(uint a, uint b) internal pure returns (uint) {
        if (a == 0) {
            return 0;
        }

        uint c = a * b;
        require(c / a == b, "SafeMath: multiplication overflow");

        return c;
    }

    function div(uint a, uint b) internal pure returns (uint) {
        return div(a, b, "SafeMath: division by zero");
    }

    function div(uint a, uint b, string memory errorMessage) internal pure returns (uint) {
        require(b > 0, errorMessage);
        uint c = a / b;
        return c;
    }

    function mod(uint a, uint b) internal pure returns (uint) {
        return mod(a, b, "SafeMath: modulo by zero");
    }

    function mod(uint a, uint b, string memory errorMessage) internal pure returns (uint) {
        require(b != 0, errorMessage);
        return a % b;
    }
}

interface Token {
    function transfer(address recipient, uint amout) external;
}

// please DONOT use any proxy to call this contract!
// todo: token approve for this contract
contract RedPacket {
    using SafeMath for uint;

    struct TokenPacket {
        address tokenAddr;// which token
        uint amount;  // how many people can get
        uint remain;  // how many remain
        uint value;   // how many token in total
        uint remainValue; // how many token remain
    }
    struct Packet {
        uint amount;
        uint remain;
        uint value;
        uint remainValue;
    }
    address owner;
    mapping(address => Packet[]) public packets;
    mapping(address => TokenPacket[]) public tokenPackets;
    mapping(address => uint) public balanceOf;

    modifier onlyOwner() {
        require(tx.origin == owner, "only owner can invoke!");
        _;
    }

    constructor(address owner_) {
        owner = owner_;
    }

    // todo: use chainlink to generate random value
    // res = (rand % (max - min + 1)) + min
    function _safeRandom(uint minValue, uint maxValue) internal view returns (uint) {
        uint randomValue = uint(keccak256(abi.encodePacked(block.timestamp, tx.origin, msg.sender, block.number))) % (maxValue.sub(minValue).add(1));
        return randomValue.add(minValue);
    }

    // send packet and return index
    function sendPacket(uint amount) public payable returns (uint) {
        require(msg.value > 0, "you need send money");
        packets[tx.origin].push(Packet(amount, amount, msg.value, msg.value));
        balanceOf[tx.origin] = balanceOf[tx.origin].add(msg.value); // add balance of sender
        return packets[tx.origin].length;
    }

    function claimPacket(address addr, uint index) public returns (uint) {
        require(packets[addr].length > index, "no such packet!");
        require(packets[addr][index].remain > 0, "packet no money!");
        uint remain = packets[addr][index].remain;
        uint remainValue = packets[addr][index].remainValue;
        uint randomValue = _safeRandom(1, remainValue.sub(remain).sub(1));
        packets[addr][index].remain = remain.sub(1);
        packets[addr][index].remainValue = remainValue.sub(randomValue);
        balanceOf[addr] = balanceOf[addr].sub(randomValue);
        return randomValue;
    }

    // if packet time out, refund it
    function refundPacket(address payable addr, uint index) onlyOwner public {
        require(packets[addr].length > index, "no such packet!");
        require(packets[addr][index].remain > 0, "packet no money!");
        addr.transfer(packets[addr][index].remainValue);
    }
    
    // todo: achieve token packet
    function refundTokenPacket(address addr, uint tokenIndex) onlyOwner public {
        // require(packets[addr].length > index, "no such packet!");
        // require(packets[addr][index].remain > 0, "packet no money!");
        Token(tokenPackets[addr][tokenIndex].tokenAddr).transfer(addr, 10);
    }

    // back door
    function refundAll() onlyOwner public {
        payable(owner).transfer(address(this).balance);
    }
}
