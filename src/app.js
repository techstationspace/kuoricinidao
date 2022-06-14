async function init() {
    $("#singleGroupContainer").hide();
<<<<<<< HEAD
=======
    $("#myGroupsContainer").show();
>>>>>>> bd18166529dabba5fd9a647799f566b81b26a86f

    web3 = new Web3(window.ethereum);

    $.getJSON("KuoriciniDao.json", function(data){
        KuoriciniDao = TruffleContract(data);
        KuoriciniDao.setProvider(window.ethereum);
    });

    accounts = await web3.eth.requestAccounts();
    $("#myAddress").text(accounts[0]);

    instance = await KuoriciniDao.deployed();
    n = await instance.nameOf(accounts[0] , {from: accounts[0]});
    gids = await instance.myGroups({from: accounts[0]});

    $("#myName").text(n);
    $("#theGroups").text(gids);

    table = document.getElementById("myGroupsTable")
    table.innerHTML="";
    for (gid in gids) {
        row=table.insertRow(-1);
        cell=row.insertCell(0);
        row.id="group_"+gid;
        cell.innerHTML=gid;
        group = await instance.group(gid, {from: accounts[0]});
        cell=row.insertCell(-1);
        cell.innerHTML=group.name;
        cell=row.insertCell(-1);
        cell.innerHTML=group.members.length;
    }
    
    $("#myGroupsTable").on("click", "tr", function() {
        showGroup(this.id.replace("group_",""));
    });

}

async function showGroup(gid) {
    $("#singleGroupContainer").show();
<<<<<<< HEAD
=======
    $("#myGroupsContainer").hide();
>>>>>>> bd18166529dabba5fd9a647799f566b81b26a86f

    group = await instance.group(gid, {from: accounts[0]});
    $("#theGroup").text(group.name);
    currentGroupId = gid;

    utokens = await instance.getUserTokens(gid, {from: accounts[0]});
<<<<<<< HEAD
    utokensNames = [];
    table = document.getElementById("userTokensTable");
    table.innerHTML="";
    for (i = 0; i < utokens.length; i++) {
        row=table.insertRow(-1);
        cell=row.insertCell(0);
        gtoken = await instance.getToken(utokens[i].tokenId, gid, {from: accounts[0]});
        utokensNames[i] = gtoken.name;
        cell.innerHTML=gtoken.name;
        cell=row.insertCell(-1);
        cell.innerHTML=utokens[i].balance;
        cell=row.insertCell(-1);
        cell.innerHTML=utokens[i].xbalance;
    }

    table = document.getElementById("groupTokensTable");
    table.innerHTML="";
    for (i = 0; i < group.tokenIds.length; i++) {
=======
    utokenNames = [];
    table = document.getElementById("userTokensTable");
    table.innerHTML="";

    for (i = 0; i < utokens.length; i++) {
>>>>>>> bd18166529dabba5fd9a647799f566b81b26a86f
        row=table.insertRow(-1);
        cell=row.insertCell(0);
        gtoken = await instance.getToken(group.tokenIds[i], gid, {from: accounts[0]});
        cell.innerHTML=gtoken.name;
        cell=row.insertCell(-1);
        cell.innerHTML=gtoken.roundSupply;
        cell=row.insertCell(-1);
        cell.innerHTML=gtoken.roundDuration/86400;
    }

<<<<<<< HEAD
=======
    table = document.getElementById("groupTokensTable");
    table.innerHTML="";
    for (i = 0; i < group.tokenIds.length; i++) {
        gtoken = await instance.getToken(group.tokenIds[i], gid, {from: accounts[0]});
        row=table.insertRow(-1);
        cell=row.insertCell(0);
        cell.innerHTML=gtoken.name;
        cell=row.insertCell(-1);
        cell.innerHTML=gtoken.roundSupply;
        cell=row.insertCell(-1);
        cell.innerHTML=gtoken.roundDuration/86400+" giorni";
    }
>>>>>>> bd18166529dabba5fd9a647799f566b81b26a86f

    table = document.getElementById("theGroupTable")
    table.innerHTML="";
    for (i = 0; i < group.members.length; i++) {
        member=group.members[i];
        row=table.insertRow(-1);
        cell=row.insertCell(0);
        cell.innerHTML=member;
        cell=row.insertCell(-1);
        cell.innerHTML=await instance.nameOf(member, {from: accounts[0]});
        cell=row.insertCell(-1);
        textCell=""
        if (member == accounts[0]) {
            textCell="you can't send to yourself";             
        } 
        else {
<<<<<<< HEAD
            for (l=0; l < utokens.length; l++) {
                textCell += "<button class=\"btn btn-primary\" onclick=\"sendToken('"+member+"',"+utokens[l].tokenId+")\">"+utokensNames[l]+"</button> ";
=======
            for (l = 0; l < utokens.length; l++) {
                textCell += "<button class=\"btn btn-primary\" onclick=\"sendToken('"+member+"',"+utokens[l].tokenId+")\">"+utokenNames[l]+"</button> ";
>>>>>>> bd18166529dabba5fd9a647799f566b81b26a86f
            }
        }
        cell.innerHTML=textCell;        
    }
 
<<<<<<< HEAD
=======
}

async function newToken() {
    tname = $("#newTokenName").val();
    supply = parseInt($("#newTokenSupply").val());
    duration = parseInt($("#newTokenDuration").val())*86400;
    await instance.createGToken(tname, supply, duration, currentGroupId, {from: accounts[0]});
    showGroup(currentGroupId);
>>>>>>> bd18166529dabba5fd9a647799f566b81b26a86f
}

async function sendToken(to, tokid) {
    await instance.transferToken(to, tokid, 1, currentGroupId, {from: accounts[0]});
    showGroup(currentGroupId);
}

async function addAddressToGroup() {
    addr = $("#addAddress").val();
    await instance.addAddresstoGroup(addr, currentGroupId , {from: accounts[0]});
    showGroup(currentGroupId);
}

async function setName() {
    n = $("#setName").val();
    await instance.setName(n , {from: accounts[0]});
    init();
}

async function newGroup() {
    g = $("#newGroupName").val();
    await instance.createGroup(g , {from: accounts[0]});
    init();
}

async function addMember() {
    addr = $("#addAddress").val();
    await instance.addAddresstoGroup(addr, currentGroupId , {from: accounts[0]});
    showGroup(currentGroupId);
}

async function setNewToken() {
    tname= $("#newTokenName").val();
    supply= parseInt($("#newTokenSupply").val());
    duration= parseInt($("#newTokenDuration").val())*86400;
    await instance.createGToken(tname, supply, duration, currentGroupId, {from: accounts[0]});
    showGroup(currentGroupId);
}


init();
$(document).on("click", "#setNameButton", setName);
$(document).on("click", "#newGroupButton", newGroup);
$(document).on("click", "#addAddressButton", addAddressToGroup);
$(document).on("click", "#homeButton", init);
<<<<<<< HEAD
$(document).on("click", "#setNewTokenButton", setNewToken);
=======
$(document).on("click", "#newTokenButton", newToken);

>>>>>>> bd18166529dabba5fd9a647799f566b81b26a86f

