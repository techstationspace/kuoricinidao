// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;
import "./KuoriciniGroup.sol";

contract KuoriciniDao {

  struct DaoGroup {
    string name;
    address[] members;
  }
  Daogroup[] public daoGroups;

  mapping (address => uint) balances;
  mapping (address => string) names;
  KuoriciniGroup kuoricinigroupContract;

  string public symbol="KUORI";
  event Transfer(address indexed from, address indexed to, uint value);

  constructor(address _addr) public {
    balances[msg.sender] = 3500;
    names[msg.sender] = "asdrubale";
    kuoricinigroupContract =  KuoriciniGroup(_addr);
    daoGroups.name = "The original Group";
    daoGroups.members[0] = msg.sender;
  }

  function addGroup(string memory _name) public returns(bool){
    Group storage new_group;
    new_group.id = 2;
    new_group.name = _name;
    return true;
  }

  function getGroupNamefromId(uint _id) public view returns(string memory) {

  }

  function modifyLeader(uint _age, string memory _name) public returns(bool) {
    Group storage new_first_group = first_group;
    new_first_group.age = _age;
    new_first_group.name = _name;
    return true;
  }

  function getLeaderAge() public view returns(uint) {
    return module_leader.age;
  }

  function getLeaderName() public view returns(string memory) {
    return module_leader.name;
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

  function counter() public returns(bool) {
    kuoricinigroupContract.increment();
    return true;
  }

  function getCount() public returns(uint) {
    return kuoricinigroupContract.getCount();
    }

}
