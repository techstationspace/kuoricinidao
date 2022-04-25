// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

contract KuoriciniDao {

struct DaoGroup {
  string name;
  address[] members;
}

DaoGroup[] daoGroups;

mapping (address => uint) balances;
mapping (address => string) names;
mapping (address => uint[] ) userGroups;

string public symbol="KUORI";
event Transfer(address indexed from, address indexed to, uint value);

constructor() public {
  balances[msg.sender] = 10;
}

function createGroup(string calldata groupName) public returns(bool){
  DaoGroup memory newGroup;
  newGroup.name=groupName;
  address[] memory _members = new address[](1);
  _members[0]=msg.sender;
  newGroup.members=_members;
  daoGroups.push(newGroup);
  userGroups[msg.sender].push(daoGroups.length-1);
  return true;
}

function allGroups() public view returns(DaoGroup[] memory){
  return daoGroups;
} 

function group(uint gid) public view returns(DaoGroup memory){
  require(isAddressInGroup(msg.sender, gid), "user not authorized"); 
  return daoGroups[gid];
}

function myGroups() public view returns(uint[] memory) {
  return userGroups[msg.sender];
}

function addAddresstoGroup(address addr, uint gid) public returns(bool){
  require(isAddressInGroup(msg.sender, gid), "user not authorized"); 
  require(!isAddressInGroup(addr, gid), "address already present"); 
  daoGroups[gid].members.push(addr);
  userGroups[addr].push(gid);
  return true;
} 

function isAddressInGroup(address addr, uint gid) private view returns(bool) {
  for ( uint i = 0; i < daoGroups[gid].members.length; i++){
    if ( daoGroups[gid].members[i] == addr ){
      return true;
    }
  }
  return false;
}

function balanceOf(address owner) public view returns(uint) {
  return balances[owner];
}

function nameOf(address owner) public view returns(string memory) {
  return names[owner];
}

function setName(string calldata name) public returns(bool){
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
