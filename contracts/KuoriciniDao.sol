// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

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
  uint timestamp;
}

struct UToken {
  uint tokenId;
  uint balance;
  uint xbalance;
}

DaoGroup[] daoGroups;
GToken[] allTokens;

mapping (address => string) names;
mapping (address => uint[] ) userGroups;
mapping (address => UToken[] ) userTokens;


constructor() {
}

/*
* Users and Groups
*
*/

function createGroup(string calldata groupName) public returns(bool){
  DaoGroup memory newGroup;
  newGroup.name=groupName;
  address[] memory _members = new address[](1);
  _members[0]=msg.sender;
  newGroup.members=_members;
  uint[] memory defaultTokens;
  newGroup.tokenIds = defaultTokens;
  daoGroups.push(newGroup);
  userGroups[msg.sender].push(daoGroups.length-1);
  return true;
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

function setName(string calldata name) public returns(bool){
  names[msg.sender]=name;
  return true;
}

function nameOf(address owner) public view returns(string memory) {
  return names[owner];
}


/* 
*   Tokens
* 
*/
function getToken(uint tokid, uint gid) public view returns(GToken memory) {
  require(isAddressInGroup(msg.sender, gid), "user not authorized");   
  return allTokens[tokid];
}

function createGToken(string calldata name, uint supply, uint duration, uint gid) public returns(bool){
  require(isAddressInGroup(msg.sender, gid), "user not authorized");   

  GToken memory newToken = GToken({
    name: name,
    roundSupply: supply,
    roundDuration: duration,
    timestamp: block.timestamp
  });
  allTokens.push(newToken);

  uint l = allTokens.length;
  daoGroups[gid].tokenIds.push(l-1);
  return true;
}

function getUserTokens(uint gid) public view returns(UToken[] memory){
  require(isAddressInGroup(msg.sender, gid), "user not authorized");   

  uint l = daoGroups[gid].tokenIds.length;
  uint m = userTokens[msg.sender].length;
  UToken[] memory _userTokens = new UToken[](l);

  for ( uint i = 0 ; i < l ; i++ ) { // scorro i tokens del gruppo
    uint tokid = daoGroups[gid].tokenIds[i];
    _userTokens[i] = UToken({ tokenId: tokid, balance: 0, xbalance: allTokens[tokid].roundSupply });

    for ( uint j = 0 ; j < m ; j++ ) { // scorro i tokens dell'utente
      if ( userTokens[msg.sender][j].tokenId == tokid ){
        _userTokens[i] = userTokens[msg.sender][j];

        uint newtime = allTokens[tokid].timestamp + allTokens[tokid].roundDuration;
        if ( block.timestamp > newtime ) {
          _userTokens[i].xbalance = allTokens[tokid].roundSupply;
        }

      }
    }

  }

  return _userTokens;

}

function transferToken(uint tokenId, address receiver, uint value, uint gid) public returns(bool) {
  require(isAddressInGroup(msg.sender, gid), "sender not authorized");   
  require(isAddressInGroup(receiver, gid), "receiver not authorized");
  require(isTokenInGroup(tokenId, gid), "token not authorized");

  bool senderCreate = true;
  uint senderxbalance = allTokens[tokenId].roundSupply;
  uint senderPos = 0;
  for (senderPos; senderPos < userTokens[msg.sender].length ; senderPos++) {
    if (userTokens[msg.sender][senderPos].tokenId == tokenId) {
      senderxbalance = userTokens[msg.sender][senderPos].xbalance;
      senderCreate = false;
      break;
    }
  }
  
  if (block.timestamp > (allTokens[tokenId].timestamp + allTokens[tokenId].roundDuration * 1 seconds) ) {
    senderxbalance = allTokens[tokenId].roundSupply;
    uint _newTimestamp = allTokens[tokenId].timestamp;
    for (uint k = 0; _newTimestamp < block.timestamp ; k++) {
      _newTimestamp += allTokens[tokenId].roundDuration * k; 
    }
    allTokens[tokenId].timestamp=_newTimestamp;
  }
  
  require(senderxbalance >= value, "non hai abbastanza token");

  uint receiverbalance = 0;
  bool receiverCreate = true;
  uint receiverPos = 0;

  for ( receiverPos; receiverPos < userTokens[receiver].length ; receiverPos++) {
    if (userTokens[receiver][receiverPos].tokenId == tokenId) {
      receiverbalance = userTokens[receiver][receiverPos].balance;
      receiverCreate = false;
      break;
    }
  }

  senderxbalance -= value;
  receiverbalance += value;

  if ( senderCreate ) {
    userTokens[msg.sender].push( UToken({ tokenId: tokenId, balance: 0, xbalance: senderxbalance}));
  }
  else {
    userTokens[msg.sender][senderPos].xbalance = senderxbalance;
  }
  if ( receiverCreate ) {
    userTokens[receiver].push( UToken({ tokenId: tokenId, balance: receiverbalance, xbalance: allTokens[tokenId].roundSupply}));
  }
  else {
    userTokens[receiver][receiverPos].balance = receiverbalance;
  }
  return true;
}

function isTokenInGroup(uint tokId, uint gid) private view returns(bool) {
  for ( uint i = 0; i < daoGroups[gid].tokenIds.length; i++){
    if ( daoGroups[gid].tokenIds[i] == tokId ){
      return true;
    }
  }
  return false;
}

}
