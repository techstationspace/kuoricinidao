// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

contract KuoriciniDao {
mapping (address => uint) balances;
mapping (address => string) names;

string public symbol="KUORI";
event Transfer(address indexed from, address indexed to, uint value);

constructor() public {
  balances[msg.sender] = 3500;
  names[msg.sender] = "asdrubale";
}

function balanceOf(address owner) public view returns(uint) {
  return balances[owner];
}

function nameOf(address owner) public view returns(string memory) {
  return names[owner];
}

function nameSet(string calldata name) public returns(bool) {
  names[msg.sender]=name;
  return true;
}

function transfer(address to, uint value) public returns(bool) {
  require(balances[msg.sender] >= value, "non hai abbastanza kuori");
  balances[to] += value;
  balances[msg.sender] -= value;
  emit Transfer(msg.sender, to, value);
  return true;
}

}
