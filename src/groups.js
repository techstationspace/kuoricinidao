document.addEventListener("DOMContentLoaded", async function () {
  await initWeb3();
  await readAccount();
  await startComponents();
});

async function initWeb3() {
  if (window.ethereum) {
    web3Provider = window.ethereum;
    try {
      await window.ethereum.request({ method: "eth_requestAccounts" });
    } catch (err) {
      alert("User denied account access");
    }
  } else {
    alert(
      "I cannot connect to your wallet. Make sure you have a Polygon MATIC wallet connected."
    );
    return;
  }
  web3 = new Web3(web3Provider);

  userGas =
    sessionStorage.getItem("userGas") == "null"
      ? null
      : parseInt(sessionStorage.getItem("userGas"));

  await $.getJSON("KuoriciniDao.json", function (data) {
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
    alert("Error reading account info!", err);
  }
//   document.getElementById("userName").textContent = user.name;
//   if (user.name === "goldmark") {
//     tutorial();
//     return;
//   }
  document.body.style = "overflow-y: scroll;";
}

async function startComponents() {
//   if (user.name == "") {
//     await tutorial();
//   }
  const l = document.querySelector("#listGroups").children.length;
  if (l > 0) {
    for (let i = 0; i < l; i++) {
      document
        .querySelector("#listGroups")
        .removeChild(document.querySelector("#listGroups").children[0]);
    }
  }
  await myGroups();
  document.querySelector("#newGroup").addEventListener("click", () => {
    newGroupPage();
  });
  checkInvitation();
}

async function newGroupPage() {
  const newGroupSection = document.createElement("div");
  const newGroupContainer = document.createElement("div");
  const h2 = document.createElement("h2");
  const p = document.createElement("p");
  const input = document.createElement("input");
  const confirmButton = document.createElement("button");
  const cancelButton = document.createElement("button");
  const containerButtons = document.createElement("span");
  document
    .querySelector("main")
    .appendChild(newGroupSection)
    .setAttribute("class", "new-group-section");
  document
    .querySelector(".new-group-section")
    .appendChild(newGroupContainer)
    .setAttribute("class", "new-group-container");
  document.querySelector(".new-group-container").appendChild(h2).textContent =
    "New group";
  document.querySelector(".new-group-container").appendChild(p).textContent =
    "What name do you want give to the new group?";
  document
    .querySelector(".new-group-container")
    .appendChild(input)
    .setAttribute("id", "newGroupName");
  document
    .querySelector(".new-group-container")
    .appendChild(containerButtons)
    .setAttribute("class", "container-buttons");
  document
    .querySelector(".container-buttons")
    .appendChild(cancelButton)
    .setAttribute("class", "close-button");
  document
    .querySelector(".container-buttons")
    .appendChild(cancelButton).textContent = "Cancel";
  document.querySelector(".close-button").addEventListener("click", () => {
    document.querySelector(".new-group-section").remove();
  });
  document
    .querySelector(".container-buttons")
    .appendChild(confirmButton)
    .setAttribute("class", "confirm-button");
  document
    .querySelector(".container-buttons")
    .appendChild(confirmButton).textContent = "Confirm";
  document
    .querySelector(".confirm-button")
    .addEventListener("click", async () => {
      const name = document.getElementById("newGroupName").value;
      if (name === "") {
        alert("Insert name!");
        return;
      }
      document
        .querySelector(".confirm-button")
        .setAttribute("disabled", "true");
      try {
        await instance.createGroup(name, {
          from: accounts[0],
          gas: userGas,
          gasPrice: null,
        });
      } catch (err) {
        alert("Transition failed!");
        document.querySelector(".confirm-button").removeAttribute("disabled");
      }
      startComponents();
    });
}

async function myGroups() {
  let myGroup = await instance.myGroups({ from: accounts[0] });
  for (let i = 0; i < myGroup.length; i++) {
    const col1 = document.createElement("td");
    const col2 = document.createElement("td");
    const row = document.createElement("tr");
    const group = await instance.getGroup(parseInt(myGroup[i]), {
      from: accounts[0],
    });
    document
      .getElementById("listGroups")
      .appendChild(row)
      .setAttribute("id", "group" + (i + 1));
    document
      .getElementById("group" + (i + 1))
      .setAttribute("data-id", myGroup[i]);
    document.getElementById("group" + (i + 1)).appendChild(col1).textContent =
      group.name;
    document.getElementById("group" + (i + 1)).appendChild(col2).textContent =
      group.members.length;
  }
  for (let i = 0; i < myGroup.length; i++) {
    document.getElementById("group" + (i + 1)).addEventListener("click", () => {
      idGroup(i);
    });
  }
}

function idGroup(nGroup) {
  const dataGroup = document
    .getElementById("group" + (nGroup + 1))
    .getAttribute("data-id");
  sessionStorage.setItem("group", dataGroup);
  window.location = "thisgroup.html";
}

async function checkInvitation() {
  invite = new RegExp("[?&]invite=([^&#]*)").exec(window.location.search);
  if (invite !== null) {
    invitation = invite[1] + "\x00";
    a = await instance.checkInvitationLink(invitation, { from: user.address });
    invGroup = a.words[0];
    if (invGroup != 0) {
      const groupName = await instance.groupNameByInvitation(
        invGroup,
        invitation,
        { from: user.address }
      );
      box = windowBox();
      box.title.textContent = "You have reached an invitation link!";
      box.label.textContent =
        "Do you want to candidate to become a member of group " +
        groupName +
        "?";
      box.confirmButton.textContent = "YES";
      box.cancelButton.textContent = "NO";
      document
        .querySelector(".confirm-button")
        .addEventListener("click", async () => {
          await instance.changeToken(
            0,
            invite[1] + "\x00",
            0,
            0,
            parseInt(invGroup),
            0,
            { from: user.address, gas: userGas, gasPrice: null }
          );
          document.querySelector(".box-section").remove();
          startComponents();
        });
    }
  }
}

function windowBox() {
  const boxSection = document.createElement("div");
  windowBox.container = document.createElement("div");
  windowBox.title = document.createElement("h2");
  windowBox.label = document.createElement("label");
  windowBox.confirmButton = document.createElement("button");
  windowBox.cancelButton = document.createElement("button");
  const containerButtons = document.createElement("span");
  document
    .querySelector("main")
    .appendChild(boxSection)
    .setAttribute("class", "box-section");
  document
    .querySelector(".box-section")
    .appendChild(windowBox.container)
    .setAttribute("class", "box-container");
  document
    .querySelector(".box-container")
    .appendChild(windowBox.title)
    .setAttribute("class", "box-title");
  document
    .querySelector(".box-container")
    .appendChild(windowBox.label)
    .setAttribute("class", "box-label");
  document
    .querySelector(".box-container")
    .appendChild(containerButtons)
    .setAttribute("class", "container-buttons");
  document
    .querySelector(".container-buttons")
    .appendChild(windowBox.cancelButton)
    .setAttribute("class", "close-button");
  document
    .querySelector(".container-buttons")
    .appendChild(windowBox.cancelButton).textContent = "Cancel";
  document.querySelector(".close-button").addEventListener("click", () => {
    document.querySelector(".box-section").remove();
  });
  document
    .querySelector(".container-buttons")
    .appendChild(windowBox.confirmButton)
    .setAttribute("class", "confirm-button");
  document
    .querySelector(".container-buttons")
    .appendChild(windowBox.confirmButton).textContent = "Confirm";
  return windowBox;
}

// async function tutorial() {
//   document.querySelector(".tutorial-components").style =
//     "position: fixed; inset: 0; height: 100%; width: 100%; z-index: 50;";
//   setTimeout(() => {
//     document.querySelector(".tutorial-container").style = "right: 2em";
//     setTimeout(() => {
//       document.querySelector(".cloud-tutorial").style = "opacity: 1";
//       setTimeout(() => {
//         document.querySelector(".text-cloud").textContent =
//           "Hi! I see you are new, together we will learn how to use this web app!";
//       }, 2000);
//     }, 2000);
//   }, 1000);
// }

// setTimeout(() => {
//   document.querySelector(".tutorial-space").style = "opacity: 1";
// }, 2000);