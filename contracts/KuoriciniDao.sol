// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./Voting.sol";

contract KuoriciniDao {

  struct DaoGroup {
    string name;
    address[] members;
    uint[] tokenIds;
    uint[] candidatesIds;
    uint voteThreshold;
  }
  
  struct Candidate {
    address candidateAddress;
    uint votes;
    address[] voters;
  }

  struct GToken {
    string name;
    uint roundSupply;
    uint roundDuration;
    uint timestamp;
  }

  struct UToken {
    uint tokenId;
    uint gTokenBalance;
    uint xBalance;
  }

  mapping (address => string) names;
  mapping (address => UToken[]) userTokens;
//  mapping (string )
  DaoGroup[] daoGroups;
  GToken[] allTokens;
  Candidate[] allCandidates;

  constructor() public {
  }

  function createGroup(string calldata _name) public returns(bool) {
    address[] memory addr = new address[](1);
    addr[0] = msg.sender;
    uint[] memory defaultTokens;
    uint[] memory defaultCandidates;
    uint threshold = 5;
    DaoGroup memory new_group = DaoGroup({ name: _name, members: addr, tokenIds: defaultTokens, candidatesIds: defaultCandidates, voteThreshold: threshold });
    daoGroups.push(new_group);
    return true;
  }

  function getGroup(uint _gid) public view returns(DaoGroup memory) {
    return daoGroups[_gid];
  }

  function random(string calldata name) public view returns (uint) {
    return uint(keccak256(abi.encodePacked(block.timestamp, block.difficulty, msg.sender, name))) % 1000;
  }

  function random() public view returns (uint) {
    return uint(keccak256(abi.encodePacked(block.timestamp, block.difficulty, msg.sender))) % 20;
}

function test() public payable returns(string memory) {
  string memory allchars = "abcdefghilmnopqrstuvz";
  bytes memory byteschars = bytes(allchars);
//   bytes memory newchars = new bytes(9);
//   for (uint i=0; i< 10; i++) {
//     uint r = random();
//     newchars[i] = byteschars[r];
//   }
//   return string(newchars);
  return string(byteschars);
  }


/*
*   Tokens
*
*/

  function getToken(uint _tokenid) public view returns(GToken memory) {
    return allTokens[_tokenid];
  }

  
  function createGToken(string calldata _name, uint _supply, uint _duration, uint _groupId) public returns(bool){
    allTokens.push(GToken({
      name: _name,
      roundSupply: _supply,
      roundDuration: _duration,
      timestamp: block.timestamp
    }));
    uint l = allTokens.length;
    daoGroups[_groupId].tokenIds.push(l-1);
    return true;
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
          uint newtime = allTokens[q].timestamp + allTokens[q].roundDuration;
          if (block.timestamp > newtime ) {
            _userTokens[w].xBalance = allTokens[q].roundSupply;
          }      
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
    
    if (block.timestamp > (allTokens[_tokenId].timestamp + allTokens[_tokenId].roundDuration * 1 seconds) ) {
      _tokSender.xBalance = allTokens[_tokenId].roundSupply;
      uint _newTimestamp = allTokens[_tokenId].timestamp;
      for (uint k = 0; _newTimestamp < block.timestamp ; k++) {
        _newTimestamp += allTokens[_tokenId].roundDuration * k; 
      }
      allTokens[_tokenId].timestamp=_newTimestamp;
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

/*  
*   Candidates
*
*/

  function addCandidate(uint _gid, address candAddr) public returns(bool) {
    require(!isAddressInGroup(_gid, candAddr), "member already present!");
    // todo: check that group exists
    // todo: check that msg.sender is allowed to add
    // check if candidate already present in current candidate list
    uint l = daoGroups[_gid].candidatesIds.length;
    uint[] memory candidatesIds = new uint[](l+1);
    for (uint i = 0; i < l; i++) {
      candidatesIds[i] = daoGroups[_gid].candidatesIds[i];
      require(allCandidates[candidatesIds[i]].candidateAddress != candAddr, "candidate already added!");
    }
    // generate a new candidate
    address[] memory vot = new address[](0);
    allCandidates.push(Candidate({
      candidateAddress: candAddr,
      votes: 0,
      voters: vot
    }));
    // update candidate list in the group
    candidatesIds[l] = allCandidates.length-1;
    daoGroups[_gid].candidatesIds = candidatesIds;

    return true;
  }
  
  function voteCandidate(uint gid, address candAddr, int vote) public returns(bool) {
    // todo: check if msg.sender eligible to cast vote
    // find candidate 
    uint l = daoGroups[gid].candidatesIds.length;
    Candidate memory candidate;
    uint candidateId;
    for (uint i = 0; i < l; i++) {
      uint c = daoGroups[gid].candidatesIds[i];
      if (allCandidates[c].candidateAddress == candAddr) {
        candidate = allCandidates[c];
        candidateId = c;
      }
      break;
    }
    // assign vote
    if (vote > 0) {
      candidate.votes += 1;
    }
    // add voter
    l = candidate.voters.length;
    address[] memory v = new address[](l+1);
    for (uint i = 0; i < l; i++) {
      v[i]=candidate.voters[i];
    }
    v[l]=msg.sender;
    candidate.voters=v;
    // todo: check if threshold is passed and add move candidate to member
    // **
    // write on chain
    allCandidates[candidateId] = candidate;    
    return true;
  }

  function getGroupCandidates(uint gid) public view returns(Candidate[] memory) {
    // todo: check that group exists and msg.sender is allowed to get this info
    uint l = daoGroups[gid].candidatesIds.length;
    Candidate[] memory candidates = new Candidate[](l);
    for (uint i = 0; i < l; i++) {
      uint c = daoGroups[gid].candidatesIds[i];
      candidates[i] = allCandidates[c];
    }
    return candidates;
  }

/*
*
*   Group Members
*/

  function addAddresstoMembers(uint _id, address _addr) public returns(bool) {
    require(!isAddressInGroup(_id, _addr), "member already present!" );
    uint l = daoGroups[_id].members.length;
    address[] memory members = new address[](l+1);
    for (uint i = 0; i < l; i++) {
      members[i] = daoGroups[_id].members[i];
    }
    members[l] = _addr;
    daoGroups[_id].members = members;
    return true;
  }

  function isAddressInGroup(uint gid, address addr) private returns(bool) {
    bool exists = false;
    for (uint i = 0; i < daoGroups[gid].members.length; i++) {
      if( daoGroups[gid].members[i] == addr ) {
        exists=true;
        break;
      }
    }
    return exists;
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

/*
*   Round functions that probably should be removed
*    
*/

  function tellmeNow() public view returns (uint) {
    return block.timestamp;
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
