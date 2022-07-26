$(window).on("load", async function () {
  await initWeb3();
  await readAccount();
  await myGroups();
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

async function myGroups() {
  let myGroup = await instance.myGroups({ from: accounts[0] });
  for (let i = 0; i < myGroup.length; i++) {
    const col1 = document.createElement("td");
    const col2 = document.createElement("td");
    const row = document.createElement("tr");
    const group = await instance.getGroup(parseInt(myGroup[i]), { from: accounts[0] });
    document.getElementById("listGroups").appendChild(row).setAttribute("id", "group" + (i + 1));
    document.getElementById("group" + (i + 1)).setAttribute("data-id", group.name);
    document.getElementById("group" + (i + 1)).appendChild(col1).textContent = group.name;
    document.getElementById("group" + (i + 1)).appendChild(col2).textContent = group.members.length;
  }
  for (let i = 0; i < myGroup.length; i++) {
    document.getElementById("group" + (i + 1)).addEventListener("click", () => {
      idGroup(i);
    });
  }
}

function idGroup(nGroup){
  const dataGroup = document.getElementById("group" + (nGroup + 1)).getAttribute("data-id");
  sessionStorage.setItem("group", dataGroup);
  window.location = "thisgroup.html";
}