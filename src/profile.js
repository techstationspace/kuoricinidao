$(window).on("load", async function () {
  await initWeb3();
  await readAccount();
  await userProfile();
});

async function initWeb3() {
  if (window.ethereum) {
    web3Provider = window.ethereum;
    try {
      await window.ethereum.request({ method: "eth_requestAccounts" });;
    } catch (err) {
      console.log("User denied account access");
    }
  } else {
    console.log("I cannot connect to your wallet. Make sure you have a Polygon MATIC wallet connected.");
    //return;
  }
  web3 = new Web3(web3Provider);

  // temporary solution to wrong metamask gas suggestions
  // https://stackoverflow.com/questions/68926306/avoid-this-gas-fee-has-been-suggested-by-message-in-metamask-using-web3
  userGas = 300000;

  await $.getJSON('KuoriciniDao.json', function (data) {
    KuoriciniDao = TruffleContract(data);
    KuoriciniDao.setProvider(web3Provider);
  });
}

async function readAccount() {
  user = {};
  try {
    accounts = await web3.eth.getAccounts();
    user.address = accounts[0];
    instance = await KuoriciniDao.deployed();
    user.name = await instance.nameOf(user.address, { from: user.address });
  } catch (err) {
    console.log("Error reading account info!", err);
  };
  document.getElementById("userName").textContent = user.name;
}

function userProfile() {
  document.getElementById("profileAddress").textContent = user.address;
  document.getElementById("profileName").textContent = user.name;
}