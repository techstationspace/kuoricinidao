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

    for ( uint j = 0 ; j < m ; i++ ) { // scorro i tokens dell'utente
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

function retrieveUToken(address addr, uint tokId) private returns(UToken memory, uint userTokId) {

  UToken memory tokSender = UToken({ tokenId: tokId, balance: 0, xbalance: allTokens[tokId].roundSupply});
  uint s;
  bool m = false;
  for ( s = 0; s < userTokens[addr].length ; s++ ) {
    if ( userTokens[addr][s].tokenId == tokId) {
      tokSender.balance = userTokens[addr][s].balance;
      tokSender.xbalance = userTokens[addr][s].xbalance;
      m = true;
      break;
    }
  }
  // create entry if not present
  if ( !m ) {
    userTokens[msg.sender].push(tokSender);
    s = userTokens[msg.sender].length -1;
  }
  return ( tokSender, s);

} 

function transferToken(uint tokId, address receiver, uint qty, uint gid) public returns(bool) {
  require(isAddressInGroup(msg.sender, gid), "sender not authorized");   
  require(isAddressInGroup(receiver, gid), "receiver not authorized");
  require(isTokenInGroup(tokId, gid), "token not authorized");
  
  // retrieve sender token 
  (UToken memory tokSender, uint sTokId) = retrieveUToken(msg.sender, tokId);

  // update token if cycle is passed
  /*
  if ( block.timestamp > (allTokens[tokId].timestamp + allTokens[tokId].roundSupply) ) {
    tokSender.xbalance = allTokens[tokId].roundSupply;
    uint newtimestamp = allTokens[tokId].timestamp;
    while ( newtimestamp < block.timestamp ) {
      newtimestamp += allTokens[tokId].roundSupply;
    }
    allTokens[tokId].timestamp = newtimestamp;
  }
  */
  require(tokSender.xbalance >= qty, "not enough balance" );

  // retrieve receiver token  
  (UToken memory tokReceiver, uint rTokId) = retrieveUToken(receiver, tokId);

  // actual transaction
  tokSender.xbalance -= qty;
  tokReceiver.balance += qty;

  // update userTokens
//  userTokens[msg.sender][sTokId] = tokSender;
//  userTokens[receiver][rTokId] = tokReceiver;

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
