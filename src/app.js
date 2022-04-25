async function init() {
    $("#singleGroupContainer").hide();

    web3 = new Web3(window.ethereum);

    $.getJSON("KuoriciniDao.json", function(data){
        KuoriciniDao = TruffleContract(data);
        KuoriciniDao.setProvider(window.ethereum);
    });

    accounts = await web3.eth.getAccounts();
    $("#myAddress").text(accounts[0]);

    instance = await KuoriciniDao.deployed();
    bal = await instance.balanceOf(accounts[0] , {from: accounts[0]});
    n = await instance.nameOf(accounts[0] , {from: accounts[0]});
    gids = await instance.myGroups({from: accounts[0]});

    $("#myKuori").text(bal);
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

    group = await instance.group(gid, {from: accounts[0]});
    $("#theGroup").text(group.name);
    currentGroupId = gid;

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
        if (member == accounts[0]) {
            cell.innerHTML="non mandi a te stesso";             
        } 
        else {
            cell.innerHTML="<button class=\"btn btn-primary\" onclick=\"sendKuori('"+member+"')\">manda</button>";
        }
    }
 
}


async function sendKuori(to) {
    await instance.transfer(to, 1 , {from: accounts[0]});
    init();

}

async function addAddressToGroup() {
    addr = $("#addAddress").val();
    await instance.addAddresstoGroup(addr, currentGroupId , {from: accounts[0]});
    init();
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
    init();
}

init();
$(document).on("click", "#sendKuori", sendKuori);
$(document).on("click", "#setNameButton", setName);
$(document).on("click", "#newGroupButton", newGroup);
$(document).on("click", "#addAddressButton", addAddressToGroup);
$(document).on("click", "#homeButton", init);

