// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

contract KuoriciniDao {
mapping (address => uint) balances;
string public symbol="KUORI";
event Transfer(address indexed from, address indexed to, uint value);

constructor() public {
  balances[msg.sender] = 10;
}

function balanceOf(address owner) public view returns(uint) {
  return balances[owner];
}

function transfer(address to, uint value) public returns(bool) {
  require(balances[msg.sender] >= value, "non hai abbastanza kuori");
  balances[to] += value;
  balances[msg.sender] -= value;
  emit Transfer(msg.sender, to, value);
  return true;
}

}
