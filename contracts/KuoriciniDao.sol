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
    string invitationLink;
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
  mapping (string => uint) invitationLinks;
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
    string memory invLink = generateInvitationLink(_name);
    DaoGroup memory new_group = DaoGroup({ 
      name: _name, 
      members: addr, 
      tokenIds: defaultTokens, 
      candidatesIds: defaultCandidates, 
      voteThreshold: threshold,
      invitationLink: invLink
    });
    daoGroups.push(new_group);
    // check invitation link doesn't exist already
    if ( daoGroups.length-1 != 0 ) {
      require ( invitationLinks[invLink] == 0 );
    }
    invitationLinks[invLink]=daoGroups.length-1;
    return true;
  }

  function getGroup(uint _gid) public view returns(DaoGroup memory) {
    return daoGroups[_gid];
  }
  
  function checkInvitationLink(string calldata link) public view returns (uint) {    
    uint groupInv =  invitationLinks[link];
    require(!isAddressInGroup(groupInv, msg.sender), "member already present" );
    uint l = daoGroups[groupInv].candidatesIds.length;
    uint[] memory candidatesIds = new uint[](l+1);
    for (uint i = 0; i < l; i++) {
      candidatesIds[i] = daoGroups[groupInv].candidatesIds[i];
      require ( allCandidates[candidatesIds[i]].candidateAddress != msg.sender, "candidate already present" );
    }    
    return groupInv;
  }

  function generateInvitationLink(string memory name) private view returns (string memory) {
      uint invLength = 15;
      string memory newString = new string(invLength);
      bytes memory finalString = bytes(newString);
      bytes memory originString = "abcdefghijklmnopqrstuvxyz1234567890";
      for (uint i=0; i< invLength-1; i++) {
          uint r = uint(keccak256(abi.encodePacked(block.timestamp, block.difficulty, msg.sender, string(finalString), name))) % originString.length;
          finalString[i] = originString[r];
      }
      return string(finalString);
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

  function addCandidate(uint _gid, string calldata invitation) public returns(bool) {
    require(!isAddressInGroup(_gid, msg.sender), "member already present!");
    require( invitationLinks[invitation] == _gid, "not authorized" ); 
    require( _gid != 0, "not authorized" ); 
    
    // check if candidate already present in current candidate list
    uint l = daoGroups[_gid].candidatesIds.length;
    uint[] memory candidatesIds = new uint[](l+1);
    for (uint i = 0; i < l; i++) {
      candidatesIds[i] = daoGroups[_gid].candidatesIds[i];
      require(allCandidates[candidatesIds[i]].candidateAddress != msg.sender, "candidate already added!");
    }
    // generate a new candidate
    address[] memory vot = new address[](0);
    allCandidates.push(Candidate({
      candidateAddress: msg.sender,
      votes: 0,
      voters: vot
    }));
    // update candidate list in the group
    candidatesIds[l] = allCandidates.length-1;
    daoGroups[_gid].candidatesIds = candidatesIds;

    return true;
  }
  
  function voteCandidate(uint gid, address candAddr, int vote) public returns(bool) {
    require(isAddressInGroup(gid, msg.sender), "member cannot vote!" );

    // find candidate 
    uint l = daoGroups[gid].candidatesIds.length;
    Candidate memory candidate;
    uint candidateId;
    bool candidateFound = false;
    for (uint i = 0; i < l; i++) {
      uint c = daoGroups[gid].candidatesIds[i];
      if (allCandidates[c].candidateAddress == candAddr) {
        candidate = allCandidates[c];
        candidateId = c;
        candidateFound = true;
        break;
      }
    }
    require(candidateFound, "candidate address doesn't exists");

    // assign vote
    if (vote > 0) {
      candidate.votes += 1;
    }
    // add voter
    // todo:  check that voter didnt vote already
    l = candidate.voters.length;
    address[] memory v = new address[](l+1);
    for (uint i = 0; i < l; i++) {
      v[i]=candidate.voters[i];
    }
    v[l]=msg.sender;
    candidate.voters=v;

    // write on chain
    allCandidates[candidateId] = candidate;    

    // check if candidate win
    uint quorum = getQuorum(gid);
    if ( candidate.votes > quorum ) {
      addAddresstoGroup(gid, candidate.candidateAddress);
      uint[] memory newCandidatesIds;
      for (uint i = 0; i < l; i++) {
        if ( daoGroups[gid].candidatesIds[i] != candidateId ) {
          newCandidatesIds[i] = daoGroups[gid].candidatesIds[i];
        }
      }
      daoGroups[gid].candidatesIds = newCandidatesIds;
    }
    return true;
  }

  function getQuorum(uint gid) private view returns(uint) {
    require(isAddressInGroup(gid, msg.sender));
    return daoGroups[gid].members.length * daoGroups[gid].voteThreshold / 10 ;
  }

  function getGroupCandidates(uint gid) public view returns(Candidate[] memory) {
    require(isAddressInGroup(gid, msg.sender), "member cannot vote!" );
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

  function addAddresstoGroup(uint gid, address addr) private returns(bool) {
    require(!isAddressInGroup(gid, addr), "member already present!" );
    uint l = daoGroups[gid].members.length;
    address[] memory members = new address[](l+1);
    for (uint i = 0; i < l; i++) {
      members[i] = daoGroups[gid].members[i];
    }
    members[l] = addr;
    daoGroups[gid].members = members;
    return true;
  }

  function isAddressInGroup(uint gid, address addr) private view returns(bool) {
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

  function groupNameByInvitation(uint gid, string calldata invitation) public view returns(string memory){
    require( invitationLinks[invitation] == gid, "user not authorized" ); 
    return daoGroups[gid].name;
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
