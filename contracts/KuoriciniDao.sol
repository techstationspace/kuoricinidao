// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract KuoriciniDao {

  struct DaoGroup {
    string name;
    address[] members;
    uint[] tokenIds;
  }

  struct GToken {
    string name;
    uint roundSupply;
    uint roundDuration;
  }

  struct UToken {
    uint tokenId;
    uint gTokenBalance;
    uint xBalance;
  }

  mapping (address => string) names;
  mapping (address => UToken[]) userTokens;
  DaoGroup[] daoGroups;
  GToken[] allTokens;

  constructor() public {
    names[msg.sender] = "asdrubale";
    allTokens.push(GToken('kuori',10,1));
    allTokens.push(GToken('matite',5,1));
    allTokens.push(GToken('lampadine',7,1));
  }

  function createGroup(string calldata _name) public returns(bool) {
    address[] memory addr = new address[](1);
    addr[0] = msg.sender;
    uint[] memory defaultTokens = new uint[](3);
    defaultTokens[0] = 0;
    defaultTokens[1] = 2;
    defaultTokens[2] = 1;
    DaoGroup memory new_group = DaoGroup({ name: _name, members: addr, tokenIds: defaultTokens });
    daoGroups.push(new_group);
    return true;
  }

  function getToken(uint _tokenid) public view returns(GToken memory) {
    return allTokens[_tokenid];
  }

  function getGroup(uint _gid) public view returns(DaoGroup memory) {
    return daoGroups[_gid];
  }
  
  function getUserTokens(uint _gid) public view returns(UToken[] memory) {
    uint l = daoGroups[_gid].tokenIds.length;
    UToken[] memory _userTokens = new UToken[](l);
    for (uint w = 0; w < l; w++) {
      uint q = daoGroups[_gid].tokenIds[w];
      uint m = userTokens[msg.sender].length;
      bool matchFound = false;
      for (uint j = 0; j < m; j++) {
        if (userTokens[msg.sender][j].tokenId == q) {
          _userTokens[w]=userTokens[msg.sender][j];
          matchFound = true;
          break;
        }
      }
      if (matchFound == false) {
        _userTokens[w]=UToken({ tokenId: q, gTokenBalance: 0, xBalance: allTokens[q].roundSupply});
      }
    }
    return _userTokens;
  }

  function transferToken(uint _tokenId, address receiver, uint value) public returns(bool) {
    UToken memory _tokSender;
    bool matchFoundSender = false;
    uint s;
    uint r;
    for (s = 0; s < userTokens[msg.sender].length ; s++) {
      if (userTokens[msg.sender][s].tokenId == _tokenId) {
        _tokSender = userTokens[msg.sender][s];
        matchFoundSender = true;
        break;
      }
    }
    if (matchFoundSender == false){
      _tokSender = UToken({ tokenId: _tokenId, gTokenBalance: 0, xBalance: allTokens[_tokenId].roundSupply});
    }
    require(_tokSender.xBalance >= value, "non hai abbastanza token");
    UToken memory _tokReceiver;
    bool matchFoundReceiver = false;
    for ( r = 0; r < userTokens[receiver].length ; r++) {
      if (userTokens[receiver][r].tokenId == _tokenId) {
        _tokReceiver = userTokens[receiver][r];
        matchFoundReceiver = true;
        break;
      }
    }
    if ( matchFoundReceiver == false){
      _tokReceiver= UToken({ tokenId: _tokenId, gTokenBalance: 0, xBalance: allTokens[_tokenId].roundSupply});
    }
    _tokSender.xBalance -= value;
    _tokReceiver.gTokenBalance += value;
    if (matchFoundSender == true) {
      userTokens[msg.sender][s] = _tokSender;
    }
    else {
      userTokens[msg.sender].push( UToken({ tokenId: _tokenId, gTokenBalance: 0, xBalance: _tokSender.xBalance}));
    }
    if (matchFoundReceiver == true) {
      userTokens[receiver][r] = _tokReceiver;
    }
    else {
      userTokens[receiver].push( UToken({ tokenId: _tokenId, gTokenBalance: _tokReceiver.gTokenBalance, xBalance: allTokens[_tokenId].roundSupply}));
    }
    
    return true;
  }

  function getGroupNamefromId(uint _id) public view returns(string memory) {
    return daoGroups[_id].name;
  }

  function getGroupAddressfromId(uint _id) public view returns(address[] memory) {
    return daoGroups[_id].members;
  }

  function addAddresstoMembers(uint _id, address _addr) public returns(bool) {
    uint l = daoGroups[_id].members.length;
    address[] memory members = new address[](l+1);
    for (uint i = 0; i < l; i++) {
      members[i] = daoGroups[_id].members[i];
    }
    members[l] = _addr;
    daoGroups[_id].members = members;
    return true;
  }

  function myGroups() public view returns(uint[] memory) {
    uint lg = daoGroups.length;
    uint[] memory myGroups;
    for (uint i = 0; i < lg; i++) {
      uint lm = daoGroups[i].members.length;
      for (uint q = 0; q < lm; q++) {
        if(daoGroups[i].members[q] == msg.sender) {
          uint gl = myGroups.length;
          uint[] memory groups = new uint[](gl+1);
          for (uint w = 0; w < gl; w++) {
            groups[w] = myGroups[w];
          }
          groups[gl] = i;
          myGroups = groups;
        }
      }
    }
    return myGroups;
  }

  function nameOf(address owner) public view returns(string memory) {
    return names[owner];
  }

  function nameSet(string calldata name) public returns(bool) {
    names[msg.sender]=name;
    return true;
  }

  function resetRound(uint _tokenId, uint _groupId) public returns(bool) {
    address[] memory _members = daoGroups[_groupId].members;
    uint l = _members.length;
    for (uint s = 0; s < l ; s++) {
      address member = _members[s];
      uint lu = userTokens[member].length;
      for (uint w = 0; w < lu; w++) {
        if (userTokens[member][w].tokenId == _tokenId) {
          userTokens[member][w].xBalance = allTokens[_tokenId].roundSupply;
        }
      }
    }
    return true;
  }

}
