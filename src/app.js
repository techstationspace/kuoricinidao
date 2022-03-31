
async function initWeb3() {
  web3 = new Web3(window.ethereum);

  await $.getJSON('KuoriciniDao.json', function(data) {
    KuoriciniDao = TruffleContract(data);
    KuoriciniDao.setProvider(window.ethereum);
  });

  accounts = await web3.eth.getAccounts();
  $("#myAddress").text(accounts[0]);

  instance = await KuoriciniDao.deployed();
  balance = await instance.balanceOf(accounts[0], {from: accounts[0]});
  $("#myKuori").text(balance);

}

async function sendKuori(){
  addr = $("#sendKuoriAddress").val();
  await instance.transfer(addr, 1, {from: accounts[0]});

}


initWeb3();
$(document).on("click", "#sendKuoriButton", sendKuori);

