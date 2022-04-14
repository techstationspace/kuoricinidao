
async function init() {
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
allgroups = await instance.allGroups({from: accounts[0]});


$("#myKuori").text(bal);
$("#myName").text(n);
$("#theGroups").text(allgroups);


}

async function sendKuori() {
    to = $("#sendAddress").val();
    await instance.transfer(to, 1 , {from: accounts[0]});
}

async function setName() {
    n = $("#setName").val();
    await instance.setName(n , {from: accounts[0]});
}

async function newGroup() {
    g = $("#newGroupName").val();
    await instance.createGroup(g , {from: accounts[0]});
}

init();
$(document).on("click", "#sendKuori", sendKuori);
$(document).on("click", "#setNameButton", setName);
$(document).on("click", "#newGroupButton", newGroup);

