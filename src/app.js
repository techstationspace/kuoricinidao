
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

  $('#myAddress').text(user.address);
  $('#myName').text(user.name);
}

async function bindEvents(){
  $(document).on('click', "#setNameButton", setName);
  $(document).on('click', "#createGroup", createGroup);
  $(document).on('click', "#addMember", addGroupMember);
  $(document).on('click', "#homeButton", startAll);  
  $(document).on('click', "#nowButton", checkNow);  
  $(document).on('click', "#groupSettingsButton", groupSettings);  
  $(document).on('click', "#addCandidate", addGroupCandidate);  
}

async function checkNow() {
  // this function is only debuigging
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
    await instance.createGroup(groupName, {from: user.address});
    startAll();
  } catch(err) {
    alert("Error creating Group!");
    console.log(err);
  }
}

async function addGroupMember() {
  try {
    groupAddress=$("#addMemberAddress").val();
    await instance.addCandidate(group.id, groupAddress, {from: user.address});
    showGroup(group.id);
  } catch(err) {
    alert("Error adding member to group!");
    console.log(err);
  }
}

async function addGroupCandidate() {
  try {
    groupAddress=$("#addMemberAddress").val();
    console.log(group.id);
    console.log(groupAddress);
    await instance.addCandidate(group.id, groupAddress, {from: user.address});
    showGroup(group.id);
  } catch(err) {
    alert("Error adding candidate to group!");
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
  $("#groupSettingsSection").hide();

  group = {};
  group.id = _gid;
  group.name = await instance.getGroupNamefromId(_gid, {from: user.address});
  $('#groupName').text(group.name);
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

  candidates = await instance.getGroupCandidates(_gid, {from: user.address});
  let ctable=document.getElementById("candidatesTableBody");
  ctable.innerHTML="";
  candidates.forEach(element => {
    KuoriciniDao.deployed().then(async function(instance) {
      _name = await instance.nameOf(element.candidateAddress, {from: user.address});
      newRow = ctable.insertRow(-1);
      newCell = newRow.insertCell(0); 
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
        voteText="<button class=\"btn btn-primary\" onclick='voteCandidate("+group.id+",\""+element.candidateAddress+"\",1)'>yay</button> ";
        voteText+="<button class=\"btn btn-primary\" onclick='voteCandidate("+group.id+",\""+element.candidateAddress+"\",-1)'>ney</button> ";
      }
      newCell.innerHTML=voteText;
    });
  });
};

async function voteCandidate(gid,candidateAddress,vote) {
  await instance.voteCandidate(gid, candidateAddress, vote, {from: user.address});
  await readAccount();    
  showGroup(group.id);
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
      //text = "<button onclick='resetToken("+element+","+_gid+")'>reset</button>";
      newCell.innerHTML=_tok[2];
      newCell = newRow.insertCell(-1);
      newCell.id="stamp_"+element;      
      newCell.innerHTML=_tok[3]; 
      newCell = newRow.insertCell(-1);
      newCell.id="tok_"+element;      
      cTokens.push({id: element, name: _tok[0], roundSuppy: _tok[1], roundDuration: _tok[2]});
    });
  });
  $('#voteThreshold').text(parseInt(_group.voteThreshold)*10+"%");

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
  $("#groupSettingsSection").toggle();
}

async function createToken() {
  tokName=$("#newTokenName").val();
  tokSupply=parseInt($("#newTokenSupply").val());
  tokDuration=parseInt($("#newTokenDuration").val());
  console.log(tokName);
  console.log(tokSupply);
  console.log(tokDuration);
  console.log(group.id);
  await instance.createGToken(tokName,tokSupply,tokDuration,parseInt(group.id), {from: accounts[0]});
  $("#groupSettingsSection").hide();
  await readAccount();    
  showGroup(group.id);
}


async function sendToken(tokenId, sendAddress){
  try {
    await instance.transferToken(tokenId, sendAddress, 1, {from: accounts[0]});
    await readAccount();    
    showGroup(group.id);
  } catch(err) {
    alert("Error sending Token!");
    console.log(err);
  };
}

async function resetToken(tokenId, groupId){
  try {
    await instance.resetRound(tokenId, groupId, {from: accounts[0]});
    await readAccount();    
    showGroup(group.id);
  } catch(err) {
    alert("Error resetting Token!");
    console.log(err);
  };
}

async function setName() {
  try {
    _name=$("#setName").val();
    await instance.nameSet(_name, {from: user.address});
    startAll();
  } catch(err) {
    alert("Error setting name!");
    console.log(err);
  }  
}

function clearSections() {
  $("#setNameSection").hide();
  $("#myGroupsSection").hide();
  $("#showGroupSection").hide();
  $("#groupProperties").hide();
  $("#groupSettingsSection").hide();
  $("#userBalances").hide();  
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
}

$(window).on('load', async function() {
  await startAll();
  bindEvents();      
});
