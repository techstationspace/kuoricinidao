
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

$("#myKuori").text(bal);

}

async function sendKuori() {
    to = $("#sendAddress").val();
    await instance.transfer(to, 1 , {from: accounts[0]});

}

init();
$(document).on("click", "#sendKuori", sendKuori);