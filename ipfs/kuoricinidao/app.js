
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
    let _kuori = await instance.balanceOf(user.address, {from: user.address});
    user.kuori=_kuori["words"][0];
    user.name = await instance.nameOf(user.address, {from: user.address});
  } catch(err) {
    alert("Error reading account info!");
    console.log(err);
  };

  $('#myAddress').text(user.address);
  $('#myName').text(user.name);
  $('#myKuori').text(user.kuori);
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
    await instance.addGroup(groupName, {from: user.address});
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
       newCell.innerHTML="<button onclick='sendKuori(\""+element+"\")'>manda</button>"; 
      }
    });
  });

};

async function sendKuori(sendAddress){
  try {
    await instance.transfer(sendAddress, 1, {from: accounts[0]});
    await readAccount();    
    showGroup(group.id);
  } catch(err) {
    alert("Error sending Kuori!");
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
