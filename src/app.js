
async function initWeb3 () {
  if (window.ethereum) {
    web3Provider = window.ethereum;
    try {
      await window.ethereum.request({ method: "eth_requestAccounts" });;
    } catch (error) {
      console.error("User denied account access")
    }
  } else {
    alert("Ethereum provider not found!");
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
    await instance.addAddresstoMembers(group.id, groupAddress, {from: user.address});
    showGroup(group.id);
  } catch(err) {
    alert("Error adding member to group!");
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
      if (element != user.address) {
        currentTokens.forEach(tok => {
          newCell = newRow.insertCell(-1);
          newCell.innerHTML="<button onclick='sendToken("+tok.id+",\""+element+"\")'>"+tok.name+"</button>";
        });
      }
      
    });
  });
};

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
      text = "<button onclick='resetToken("+element+","+_gid+")'>reset</button>";
      newCell.innerHTML=_tok[2]+text; 
      cTokens.push({id: element, name: _tok[0], roundSuppy: _tok[1], roundDuration: _tok[2]});
    });
  });
  $("#groupRound").text(_group.roundDuration);
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
}

async function startAll() {
  clearSections();

  await initWeb3();
  await readAccount();

  if(user.name.length==0){
   $("#setNameSection").show();
  } else {
   $("#myGroupsSection").show();
   getMyGroups();
  }

}

$(window).on('load', async function() {
  await startAll();
  bindEvents();      
});
