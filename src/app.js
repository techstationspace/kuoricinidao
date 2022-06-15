
async function initWeb3 () {
  if (window.ethereum) {
    web3Provider = window.ethereum;
    try {
      await window.ethereum.request({ method: "eth_requestAccounts" });;
    } catch (error) {
      console.error("User denied account access")
    }
  } else {
    alert("Non trovo il provider Ethereum. Hai installato Metamask?");
  }
  web3 = new Web3(web3Provider);


  // temporary solution to wrong metamask gas suggestions
  // https://stackoverflow.com/questions/68926306/avoid-this-gas-fee-has-been-suggested-by-message-in-metamask-using-web3
  userGas = 300000;

  await $.getJSON('KuoriciniDao.json', function(data) {
    KuoriciniDao = TruffleContract(data);
    KuoriciniDao.setProvider(web3Provider);
  });
}

async function readAccount() {
  user = {};
  try {
    accounts = await web3.eth.getAccounts();
    user.address=accounts[0];      
    instance = await KuoriciniDao.deployed();

    user.name = await instance.nameOf(user.address, {from: user.address});
  } catch(err) {
    alert("Error reading account info!");
    console.log(err);
  };
/*
  await KuoriciniDao.methods
  .deposit(recepient, amount)
  .send({ 
    from: account, 
    value, 
    maxPriorityFeePerGas: null,
    maxFeePerGas: null, 
  });
*/
//  resp = await KuoriciniDao.methods.nameOf().send({ user.address, from: accounts[0], gas: 300000, gasPrice: null, }) 

  $('#myAddress').text(user.address);
  $('#myName').text(user.name);
}

async function bindEvents(){
  $(document).on('click', "#setNameButton", setName);
  $(document).on('click', "#createGroup", createGroup);
  $(document).on('click', "#homeButton", startAll);  
//  $(document).on('click', "#nowButton", checkNow);  
  $(document).on('click', "#groupSettingsButton", groupSettings);  
  $(document).on('click', "#personalSettingsButton", personalSettings);  
}

async function checkNow() {
  // to be removed
  $("#nowId").text("-");
  t = parseInt(await instance.tellmeNow({from: user.address}));
  console.log(t);
  $("#nowId").text(t);
  ts=parseInt(t);
  s0=parseInt(document.getElementById("stamp_0").innerHTML);
  $('#tok_0').text(ts-s0);
  s1=parseInt(document.getElementById("stamp_1").innerHTML);
  $('#tok_1').text(ts-s1);
//  s2=parseInt(document.getElementById("stamp_2").innerHTML);
//  $('#tok_2').text(ts-s2);
//  s3=parseInt(document.getElementById("stamp_3").innerHTML);
//  $('#tok_3').text(ts-s3);
  s4=parseInt(document.getElementById("stamp_4").innerHTML);
  $('#tok_4').text(ts-s4);
//  s5=parseInt(document.getElementById("stamp_5").innerHTML);
//  $('#tok_5').text(ts-s5);
//  s6=parseInt(document.getElementById("stamp_6").innerHTML);
//  $('#tok_6').text(ts-s6);
}


async function createGroup() {
  try {
    groupName=$("#setGroupName").val();
    await instance.createGroup(groupName, {from: user.address, gas: userGas, gasPrice: null});
    startAll();
  } catch(err) {
    alert("Error creating Group!");
    console.log(err);
  }
}


async function getMyGroups() {
  var table=document.getElementById("myGroupsTable");
  table.innerHTML="";
  let myg = await instance.myGroups({from: accounts[0]});
  myg.forEach(element => {
    KuoriciniDao.deployed().then(async function(instance) {    
      var groupName = await instance.getGroupNamefromId(element, {from: accounts[0]});
      var groupAddresses = await instance.getGroupAddressfromId(element, {from: accounts[0]});
      newRow = table.insertRow(-1);
      newRow.id="group_"+element;
      $("#group_"+element).addClass("cursor-pointer");
      newCell = newRow.insertCell(0); 
      newCell.innerHTML=groupName;
      newCell = newRow.insertCell(-1); 
      newCell.innerHTML=groupAddresses.length;
      $(newRow).click(function() {
        showGroup(element);
      });
    });
  });
}

async function showGroup(_gid) {
  clearSections();
  $("#showGroupSection").show();
  $("#groupProperties").show();
  $("#userBalances").show();  
  $("#DAOSection").hide();
  $("#myGroupBalance").show();    

  group = {};
  group.id = _gid;
  group.name = await instance.getGroupNamefromId(_gid, {from: user.address});
  $('.currentGroupName').text(group.name);
  currentTokens = await groupProperties(_gid);
  userProperties(_gid);

  group.members = await instance.getGroupAddressfromId(_gid, {from: user.address});
  let table=document.getElementById("groupTableBody");
  table.innerHTML="";
  group.members.forEach(element => {
    KuoriciniDao.deployed().then(async function(instance) {
      _name = await instance.nameOf(element, {from: user.address});
      newRow = table.insertRow(-1);
      newCell = newRow.insertCell(0); 
      newCell.innerHTML=_name; 
      newCell = newRow.insertCell(-1);
      if (element != user.address) {
        tokenText="";
        currentTokens.forEach(tok => {
          tokenText+="<button class=\"btn btn-primary\"onclick='sendToken("+tok.id+",\""+element+"\")'>"+tok.name+"</button> ";
        });
        newCell.innerHTML=tokenText;
      } else {
        newCell.innerHTML="non puoi mandare token a te stesso";
      }
    });
  });
  // todo : fix mess btween getGroup and groupname as per videos branch is more clean
  let _group = await instance.getGroup(_gid, {from: user.address});  
/*
  candidates = await instance.getGroupCandidates(_gid, {from: user.address});
  let ctable=document.getElementById("candidatesTableBody");
  ctable.innerHTML="";
  for ( i = 0 ; i < candidates.length; i++ ) {
      element = candidates[i];
      _name = await instance.nameOf(element.candidateAddress, {from: user.address});
      newRow = ctable.insertRow(-1);
      newCell = newRow.insertCell(0); 
      newCell.innerHTML=_group.candidatesIds[i]; 
      newCell = newRow.insertCell(-1);
      newCell.innerHTML=_name; 
      newCell = newRow.insertCell(-1);
      newCell.innerHTML=element.candidateAddress; 
      newCell = newRow.insertCell(-1);
      newCell.innerHTML=element.votes;
      newCell = newRow.insertCell(-1);
      if (element.voters.includes(user.address)) {
        voteText="hai gia' votato";
      }
      else {
        voteText="<button class=\"btn btn-primary\" onclick='voteCandidateToken("+group.id+",\""+_group.candidatesIds[i]+"\",1)'>yay</button> ";
        voteText+="<button class=\"btn btn-primary\" onclick='voteCandidateToken("+group.id+",\""+_group.candidatesIds[i]+"\",0)'>ney</button> ";
      }
      newCell.innerHTML=voteText;
  }
*/  
  candidatetokens = await instance.getGroupCandidateTokens(_gid, {from: user.address});

  let ctable=document.getElementById("candidatesTableBody");
  ctable.innerHTML="";

  for ( i = 0 ; i < candidatetokens.length; i++ ) {
      element = candidatetokens[i];
      if (element.candType == 0) {
        _name = await instance.nameOf(element.candidateAddress, {from: user.address});
        newRow = ctable.insertRow(-1);
        newCell = newRow.insertCell(0); 
        newCell.innerHTML=_group.candidateTokenIds[i]; 
        newCell = newRow.insertCell(-1);
        newCell.innerHTML=_name; 
        newCell = newRow.insertCell(-1);
        newCell.innerHTML=element.candidateAddress; 
        newCell = newRow.insertCell(-1);
        newCell.innerHTML=element.votes;
        newCell = newRow.insertCell(-1);
        if (element.voters.includes(user.address)) {
          voteText="hai gia' votato";
        }
        else {
          voteText="<button class=\"btn btn-primary\" onclick='voteCandidateToken("+group.id+",\""+_group.candidateTokenIds[i]+"\",1)'>YES</button> ";
          voteText+="<button class=\"btn btn-primary\" onclick='voteCandidateToken("+group.id+",\""+_group.candidateTokenIds[i]+"\",0)'>NO</button> ";
        }
        newCell.innerHTML=voteText;
      }
  }


  ttable=document.getElementById("candidateTokensTableBody");
  ttable.innerHTML="";

  for ( i = 0 ; i < candidatetokens.length; i++ ) {
    element = candidatetokens[i];
    if (element.candType == 2 || element.candType == 1) {
      newRow = ttable.insertRow(-1);
      newCell = newRow.insertCell(0); 
      newCell.innerHTML=_group.candidateTokenIds[i] +" - "+element.id; 
      newCell = newRow.insertCell(-1); 
      newCell.innerHTML=(element.candType == 2); 
//      oldtok = await instance.getToken(element.id, {from: user.address});
//      if (element.present) {
//        tname = oldtok.name +" > "+  element.name;
//        tsupply = oldtok.roundSupply +" > "+  element.roundSupply;
//        tduration = oldtok.roundDuration/86400 +" > "+ element.roundDuration/86400;
//      } else {
        tname = element.name;
        tsupply = element.roundSupply;
        tduration = element.roundDuration/86400;
//      }
      newCell = newRow.insertCell(-1);
      newCell.innerHTML= tname; 
      newCell = newRow.insertCell(-1);
      newCell.innerHTML=tsupply; 
      newCell = newRow.insertCell(-1);
      newCell.innerHTML=tduration;

      newCell = newRow.insertCell(-1);
      newCell.innerHTML=element.votes;
      newCell = newRow.insertCell(-1);
      if (element.voters.includes(user.address)) {
        voteText="hai gia' votato";
      }
      else {
        voteText="<button class=\"btn btn-primary\" onclick='voteCandidateToken("+group.id+",\""+_group.candidateTokenIds[i]+"\",1)'>YES</button> ";
        voteText+="<button class=\"btn btn-primary\" onclick='voteCandidateToken("+group.id+",\""+_group.candidateTokenIds[i]+"\",0)'>NO</button> ";
      }
      newCell.innerHTML=voteText;
    }
  }

  ttable=document.getElementById("candidatesThresholdBody");
  ttable.innerHTML="";

  for ( i = 0 ; i < candidatetokens.length; i++ ) {
    element = candidatetokens[i];
    if (element.candType == 3) {
      newRow = ttable.insertRow(-1);
      newCell = newRow.insertCell(0); 
      newCell.innerHTML=element.id+"0%";
      newCell = newRow.insertCell(-1);
      newCell.innerHTML=element.votes;
      newCell = newRow.insertCell(-1);
      if (element.voters.includes(user.address)) {
        voteText="hai gia' votato";
      }
      else {
        voteText="<button class=\"btn btn-primary\" onclick='voteCandidateToken("+group.id+",\""+_group.candidateTokenIds[i]+"\",1)'>YES</button> ";
        voteText+="<button class=\"btn btn-primary\" onclick='voteCandidateToken("+group.id+",\""+_group.candidateTokenIds[i]+"\",0)'>NO</button> ";
      }
      newCell.innerHTML=voteText;
    }
  }




    let _tokenids = _group.tokenIds;
    table=document.getElementById("groupChangeTokensTable");
    table.innerHTML="";
    _tokenids.forEach(element => {
      KuoriciniDao.deployed().then(async function(instance) {
        let _tok = await instance.getToken(element, {from: user.address});
        newRow = table.insertRow(-1);
        newCell = newRow.insertCell(0); 
        newCell.innerHTML=element;
        newCell = newRow.insertCell(-1);
        newCell.innerHTML=_tok[0];
        newCell = newRow.insertCell(-1);
        newCell.innerHTML=_tok[1]; 
        newCell = newRow.insertCell(-1);
        newCell.innerHTML=_tok[2]/86400+" giorni";
        $(newRow).click(function() {
          $("#changeTokenButton").removeClass('disabled');
          $("#changeTokenName").val(_tok[0]);
          $("#changeTokenSupply").val(_tok[1]);
          $("#changeTokenDuration").val(_tok[2]/86400);
          $("#changeTokenId").text(element);
        });
      });
    });

  $("#thresholdVote").val(parseInt(_group.voteThreshold));
  document.getElementById('thresholdValue').innerHTML=_group.voteThreshold;
  $('#voteThreshold').text(parseInt(_group.voteThreshold)*10+"%");
  $('#invitationLink').text(window.location.origin+"/?invite="+_group.invitationLink);
  thresh = parseInt(group.members.length * _group.voteThreshold / 10) +1 ;
  $(".votersThreshold").text(thresh);
  $("#changeMyName").val(user.name);
};

async function voteCandidate(gid,candidatePos,vote) {
  await instance.voteCandidateToken(gid, parseInt(candidatePos), vote, {from: user.address, gas: userGas, gasPrice: null});
  await readAccount();    
  showGroup(group.id);
  $("#DAOSection").show();
}

async function voteCandidateToken(gid,candidateTokenId,vote) {
  console.log(gid,candidateTokenId,vote);
  console.log(candidateTokenId);
  console.log(vote);
  await instance.voteCandidateToken(gid, parseInt(candidateTokenId), vote, {from: user.address, gas: userGas, gasPrice: null});
  await readAccount();    
  showGroup(group.id);
  $("#DAOSection").show();
}


async function groupProperties(_gid) {
  let _group = await instance.getGroup(_gid, {from: user.address});
  let _tokenids = _group.tokenIds;
  let table=document.getElementById("groupTokensTable");
  cTokens = [];
  table.innerHTML="";
  _tokenids.forEach(element => {
    KuoriciniDao.deployed().then(async function(instance) {
      let _tok = await instance.getToken(element, {from: user.address});
      newRow = table.insertRow(-1);
      newCell = newRow.insertCell(0); 
      newCell.innerHTML=_tok[0];
      newCell = newRow.insertCell(-1);
      newCell.innerHTML=_tok[1]; 
      newCell = newRow.insertCell(-1);
      newCell.innerHTML=_tok[2]/86400+" giorni";
      cTokens.push({id: element, name: _tok[0], roundSuppy: _tok[1], roundDuration: _tok[2]});
    });
  });


  return cTokens;
}

async function userProperties(_gid) {
  let _utokens = await instance.getUserTokens(_gid, {from: user.address});
  let table=document.getElementById("userTokensTable");
  table.innerHTML="";
  _utokens.forEach(element => {
    KuoriciniDao.deployed().then(async function(instance) {
      let _tok = await instance.getToken(element.tokenId, {from: user.address});
      newRow = table.insertRow(-1);
      newCell = newRow.insertCell(0); 
      newCell.innerHTML=_tok.name; 
      newCell = newRow.insertCell(-1);
      newCell.innerHTML=element.gTokenBalance; 
      newCell = newRow.insertCell(-1);
      newCell.innerHTML=element.xBalance; 
    });
  });
}

async function groupSettings() {  
  $("#DAOSection").toggle();

}

async function personalSettings() {  
  $("#settingsSection").toggle();
}


async function createToken() {
  tokName=$("#newTokenName").val();
  tokSupply=parseInt($("#newTokenSupply").val());
  tokDuration=parseInt($("#newTokenDuration").val())*86400;
  await instance.changeToken(0,tokName,tokSupply,tokDuration,parseInt(group.id),1,{from: user.address, gas: userGas, gasPrice: null});
  await readAccount();    
  showGroup(group.id);
  $("#DAOSection").show();
}

async function changeToken() {
  tokId=parseInt($("#changeTokenId").text());
  tokName=$("#changeTokenName").val();
  tokSupply=parseInt($("#changeTokenSupply").val());
  tokDuration=parseInt($("#changeTokenDuration").val())*86400;
  await instance.changeToken(tokId,tokName,tokSupply,tokDuration,parseInt(group.id),2,{from: user.address, gas: userGas, gasPrice: null});
  await readAccount();    
  showGroup(group.id);
  $("#DAOSection").show();
}

async function changeThreshold() {
  th = parseInt($("#thresholdVote").val());
  console.log(th);
  await instance.changeToken(th,"",0,0,parseInt(group.id),3,{from: user.address, gas: userGas, gasPrice: null});
  await readAccount();    
  showGroup(group.id);
  $("#DAOSection").show();
}


async function sendToken(tokenId, sendAddress){
  try {
    await instance.transferToken(tokenId, sendAddress, 1, {from: user.address, gas: userGas, gasPrice: null});
    await readAccount();    
    showGroup(group.id);
  } catch(err) {
    alert("Error sending Token!");
    console.log(err);
  };
}

async function leaveGroup(){
    await instance.removeMeFromGroup(group.id, {from: user.address, gas: userGas, gasPrice: null});
    startAll();
}

/*
async function resetToken(tokenId, groupId){
  try {
    await instance.resetRound(tokenId, groupId, {from: user.address, gas: userGas, gasPrice: null});
    await readAccount();    
    showGroup(group.id);
  } catch(err) {
    alert("Error resetting Token!");
    console.log(err);
  };
}
*/
async function setName() {
  try {
    _name=$("#setName").val();
    await instance.nameSet(_name, {from: user.address, gas: userGas, gasPrice: null});
    startAll();
  } catch(err) {
    alert("Error setting name!");
    console.log(err);
  }  
}

async function changeName() {
  try {
    _name=$("#changeMyName").val();
    await instance.nameSet(_name, {from: user.address, gas: userGas, gasPrice: null});
    startAll();
  } catch(err) {
    alert("Error setting name!");
    console.log(err);
  }  
}


function clearSections() {
  $(".start-hidden").hide();
/*  $("#myGroupsSection").hide();
  $("#showGroupSection").hide();
  $("#groupProperties").hide();
  $("#userBalances").hide();
  */
}

async function checkInvitation() {
  invite = new RegExp("[?&]invite=([^&#]*)").exec(window.location.search);
  if ( invite !== null ){
    invitation=invite[1]+"\x00";
    a = await instance.checkInvitationLink(invitation, {from: user.address});
    invGroup=a.words[0];
    console.log(invGroup);
    if ( invGroup != 0 ) {
      console.log("invited to group:"+invGroup);
      $("#invitationSection").show();
      $('#invGroupName').text(await instance.groupNameByInvitation(invGroup, invitation, {from: user.address}));
      if ( user.name.length == 0 ){
        txt = "prima devi assegnarti un nickname!";
      }
      else {
        txt = "<button class=\"btn btn-primary\" onclick=\"iCandidate("+invGroup+",'"+invite[1]+"')\">Mi candido</button>";
      }
      IcandidateSection.innerHTML=txt;
    }
  }
}

async function iCandidate(gid, inv) {
  try {
//    await instance.addCandidate(gid, inv+"\x00", {from: user.address});
//    await instance.changeToken(gid, inv+"\x00", {from: user.address});
    await instance.changeToken(0,inv+"\x00",0,0,parseInt(gid),0,{from: user.address, gas: userGas, gasPrice: null});

    startAll();
  } catch(err) {
    alert("Error adding candidate to group!");
  }  
}


async function startAll() {
  clearSections();

  await initWeb3();
  await readAccount();
  if(user.name.length==0){
   $("#userPropertiesSection").hide();
   $("#setNameSection").show();
  } else {
   $("#userPropertiesSection").show();
   $("#myGroupsSection").show();
   getMyGroups();
  }

  checkInvitation();
}

$(window).on('load', async function() {
  await startAll();
  bindEvents();      
});
