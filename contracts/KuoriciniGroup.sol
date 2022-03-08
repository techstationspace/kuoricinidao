// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

contract KuoriciniGroup {
  uint public count;
  
  constructor() public {
    count=10;
  }
    
  function increment() external returns(bool) {
      count += 1;
      return true;
  }

  function getCount() public returns(uint) {
      return count;    
  }

}