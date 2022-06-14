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
<<<<<<< HEAD
=======
  //uint[] memory defaultTokens;
  //newGroup.tokenIds = defaultTokens;
>>>>>>> bd18166529dabba5fd9a647799f566b81b26a86f
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
  

<<<<<<< HEAD

/*
* Tokens
*/

function createGToken(string calldata name, uint supply, uint duration, uint gid) public returns(bool){
  require(isAddressInGroup(msg.sender, gid), "user not authorized"); 
=======
/*
* Tokens
*/

function getToken(uint tokid, uint gid) public view returns(GToken memory) {
  require(isAddressInGroup(msg.sender, gid), "user not authorized");   
  return allTokens[tokid];
}

function createGToken(string calldata name, uint supply, uint duration, uint gid) public returns(bool){
  require(isAddressInGroup(msg.sender, gid), "user not authorized");

>>>>>>> bd18166529dabba5fd9a647799f566b81b26a86f
  GToken memory newToken = GToken ({
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

function getUserTokens(uint gid) public view returns(UToken[] memory) {
  require(isAddressInGroup(msg.sender, gid), "user not authorized"); 

  uint l = daoGroups[gid].tokenIds.length;
  uint m = userTokens[msg.sender].length;
  UToken[] memory utokens = new UToken[](l);

<<<<<<< HEAD
  for ( uint i=0; i < l; i++ ) {  //ciclo tutti i token del gruppo
    uint tokId = daoGroups[gid].tokenIds[i];
    utokens[i] = UToken ({ tokenId: tokId, balance: 0, xbalance: allTokens[tokId].roundSupply });
    for ( uint k=0; k < m ; k++ ){ // ciclo tutti i token dell'utente
      if ( userTokens[msg.sender][k].tokenId == tokId ) {
        utokens[i] = userTokens[msg.sender][k];

        uint newtime = allTokens[tokId].timestamp + allTokens[tokId].roundDuration;
        if ( block.timestamp > newtime ) {
          utokens[i].xbalance = allTokens[tokId].roundSupply;
=======
  for ( uint i = 0; i < l; i++ ) { // scorro i tokens del gruppo
    uint tokid = daoGroups[gid].tokenIds[i];
    utokens[i] = UToken ({ tokenId: tokid, balance: 0, xbalance: allTokens[tokid].roundSupply });
    for ( uint k = 0 ; k < m ; k++ ){ // scorro i token dell'utente
      if ( userTokens[msg.sender][k].tokenId == tokid ) {
        utokens[i] = userTokens[msg.sender][k];

        uint newtime = allTokens[tokid].timestamp + allTokens[tokid].roundDuration;
        if ( block.timestamp > newtime ) {
          utokens[i].xbalance = allTokens[tokid].roundSupply;
>>>>>>> bd18166529dabba5fd9a647799f566b81b26a86f
        }
      }
    }
  }
  return utokens;
}

<<<<<<< HEAD
function getToken(uint tokId, uint gid) public view returns(GToken memory) {
  require(isAddressInGroup(msg.sender, gid), "user not authorized"); 
  return allTokens[tokId];
}

=======
>>>>>>> bd18166529dabba5fd9a647799f566b81b26a86f
function transferToken(address receiver, uint tokid, uint qty, uint gid) public returns(bool) {
  require(isAddressInGroup(msg.sender, gid), "user not authorized"); 
  require(isAddressInGroup(receiver, gid), "user not authorized"); 
  require(isTokenInGroup(tokid, gid), "user not authorized"); 

  // retrieve sender usertoken if exists, senderxbalance
  uint senderxbalance = allTokens[tokid].roundSupply;
  uint senderPos = 0;
  bool senderCreate = true;

  for ( senderPos; senderPos < userTokens[msg.sender].length; senderPos++ ){
    if ( userTokens[msg.sender][senderPos].tokenId == tokid ) {
      senderxbalance = userTokens[msg.sender][senderPos].xbalance;
      senderCreate = false;
      break;
    }
  }

  // check if cycle is renewed and eventually write on chain
  if ( block.timestamp > (allTokens[tokid].timestamp + allTokens[tokid].roundDuration * 1 seconds) ) {
    senderxbalance = allTokens[tokid].roundSupply;
    uint newtimestamp = allTokens[tokid].timestamp;
    for ( uint k = 0 ; newtimestamp < block.timestamp; k++ ) {
      newtimestamp += allTokens[tokid].roundDuration;
    }
    allTokens[tokid].timestamp = newtimestamp;
  }

<<<<<<< HEAD
  require(senderxbalance > qty, "non hai abbastanza token");

  // retrieve receiver usertoken if exists, receiverbalance
  uint receiverbalance = 0;
  uint receiverPos = 0;
  bool receiverCreate = true;

=======
  require(senderxbalance >= qty, "non hai abbastanza token");

  // retrieve receiver usertoken if exists, receiverbalance
  uint receiverbalance = 0;
  uint receiverPos = 0;
  bool receiverCreate = true;

>>>>>>> bd18166529dabba5fd9a647799f566b81b26a86f
  for ( receiverPos; receiverPos < userTokens[receiver].length; receiverPos++ ){
    if ( userTokens[receiver][receiverPos].tokenId == tokid ) {
      receiverbalance = userTokens[receiver][receiverPos].balance;
      receiverCreate = false;
      break;
    }
  }
<<<<<<< HEAD

  // transaction
  senderxbalance -= qty;
  receiverbalance += qty;

=======

  // transaction
  senderxbalance -= qty;
  receiverbalance += qty;

>>>>>>> bd18166529dabba5fd9a647799f566b81b26a86f
  // write on blockchain
  if ( senderCreate ) {
    userTokens[msg.sender].push( UToken({ tokenId: tokid, balance: 0, xbalance: senderxbalance }));
  } else {
    userTokens[msg.sender][senderPos].xbalance = senderxbalance;
  }
  if ( receiverCreate ) {
    userTokens[receiver].push( UToken({ tokenId: tokid, balance: receiverbalance, xbalance: allTokens[tokid].roundSupply }));
  } else {
    userTokens[receiver][receiverPos].balance = receiverbalance;
  }

  return true;
}

function isTokenInGroup(uint tokid, uint gid) private view returns(bool) {
  for ( uint i = 0; i < daoGroups[gid].tokenIds.length; i++){
    if ( daoGroups[gid].tokenIds[i] == tokid ){
      return true;
    }
  }
  return false;
}


}
