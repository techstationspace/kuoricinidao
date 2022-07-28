document.addEventListener("DOMContentLoaded", async function () {
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
	document.querySelector(".change-name").addEventListener("click", async () => {
		const changeNameSection = document.createElement("div");
		const changeNameContainer = document.createElement("div");
		const h2 = document.createElement("h2");
		const label = document.createElement("label");
		const input = document.createElement("input");
		const confirmButton = document.createElement("button");
		const cancelButton = document.createElement("button");
		const containerButtons = document.createElement("span");
		document.querySelector("main").appendChild(changeNameSection).setAttribute("class", "change-name-section");
		document.querySelector(".change-name-section").appendChild(changeNameContainer).setAttribute("class", "change-name-container");
		document.querySelector(".change-name-container").appendChild(h2).textContent = "Change Name";
		document.querySelector(".change-name-container").appendChild(label).setAttribute("for", "newName");
		document.querySelector(".change-name-container").appendChild(label).textContent = "New name: ";
		document.querySelector(".change-name-container").appendChild(input).setAttribute("id", "newName");
		document.querySelector(".change-name-container").appendChild(containerButtons).setAttribute("class", "container-buttons");
		document.querySelector(".container-buttons").appendChild(cancelButton).setAttribute("class", "close-button");
		document.querySelector(".container-buttons").appendChild(cancelButton).textContent = "Cancel";
		document.querySelector(".close-button").addEventListener("click", () => {
			document.querySelector(".change-name-section").remove();
		});
		document.querySelector(".container-buttons").appendChild(confirmButton).setAttribute("class", "confirm-button");
		document.querySelector(".container-buttons").appendChild(confirmButton).textContent = "Confirm";
		document.querySelector(".confirm-button").addEventListener("click", async () => {
			const name = document.getElementById("newName").value;
			if (name === "") {
				alert("Insert name!");
				return;
			}
			document.querySelector(".confirm-button").setAttribute("disabled", "true");
			try {
				await instance.nameSet(name, { from: accounts[0], gas: userGas, gasPrice: null });
			} catch (err) {
				alert("Transition failed!");
				document.querySelector(".confirm-button").removeAttribute("disabled");
				return;
			}
		});
	});
}

