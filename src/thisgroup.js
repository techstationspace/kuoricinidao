document.addEventListener("DOMContentLoaded", async function () {
    await initWeb3();
    await readAccount();
    await startComponents();
});

/*$(window).on("load", async function () {
    await initWeb3();
    await readAccount();
    await startComponents();
});*/

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

async function startComponents() {
    const groupSelected = sessionStorage.getItem("group");
    group = await dataGroup(groupSelected);
    document.getElementById("groupName").textContent = group.name;
    myBalance();

}

async function dataGroup(groupSelected) {
    listGroups = await instance.myGroups({ from: accounts[0] });
    for (let i = 0; i < listGroups.length; i++) {
        const groups = await instance.getGroup(parseInt(listGroups[i]), { from: accounts[0] });
        if (groups.name === groupSelected) {
            posListGroup = i;
            return groups;
        }
    }
    return console.log("fictional group");
}

async function myBalance() {
    const dayTime = 86400;
    const userTokens = await instance.getUserTokens(listGroups[posListGroup], { from: accounts[0] });
    for (let i = 0; i < userTokens.length; i++) {
        const token = await instance.getToken(userTokens[i][0], { from: accounts[0] });
        const row = document.createElement("tr");
        const col1 = document.createElement("td");
        const col2 = document.createElement("td");
        const col3 = document.createElement("td");
        const col4 = document.createElement("td");
        const col5 = document.createElement("td");
        const col6 = document.createElement("td");
        document.getElementById("userTableBalance").appendChild(row).setAttribute("id", "token" + (i + 1));
        document.getElementById("token" + (i + 1)).appendChild(col1).setAttribute("class", "name-token");
        document.getElementById("token" + (i + 1)).appendChild(col1).textContent = token.name;
        document.getElementById("token" + (i + 1)).appendChild(col2).setAttribute("class", "text-token");
        document.getElementById("token" + (i + 1)).appendChild(col2).textContent = userTokens[i].gTokenBalance;
        document.getElementById("token" + (i + 1)).appendChild(col3).setAttribute("class", "text-token");
        document.getElementById("token" + (i + 1)).appendChild(col3).textContent = userTokens[i].xBalance;
        document.getElementById("token" + (i + 1)).appendChild(col4).setAttribute("class", "text-token");
        document.getElementById("token" + (i + 1)).appendChild(col4).textContent = "next refill token";
        document.getElementById("token" + (i + 1)).appendChild(col5).setAttribute("class", "text-token");
        document.getElementById("token" + (i + 1)).appendChild(col5).textContent = (token.roundDuration / dayTime) + " days";
        document.getElementById("token" + (i + 1)).appendChild(col6).setAttribute("class", "text-token");
        document.getElementById("token" + (i + 1)).appendChild(col6).textContent = token.roundSupply;
    }
}

async function membersPage() {
    if (document.querySelector(".members-container")) {
        document.querySelector(".members-container").remove();
    }
    if (document.querySelector(".tokens-container")) {
        document.querySelector(".tokens-container").remove();
    }
    if (document.querySelector(".votes-container")) {
        document.querySelector(".votes-container").remove();
    }
    const membersContainer = document.createElement("div");
    const membersTitle = document.createElement("p");
    const membersTable = document.createElement("table");
    const membersTableThead = document.createElement("thead");
    const membersTableTheadRow = document.createElement("tr");
    const membersTableTheadCol1 = document.createElement("th");
    const membersTableTheadCol2 = document.createElement("th");
    const membersTableTbody = document.createElement("tbody");
    document.querySelector("main").appendChild(membersContainer).setAttribute("class", "members-container");
    document.querySelector(".members-container").appendChild(membersTitle).setAttribute("class", "members-title");
    document.querySelector(".members-title").textContent = "List of " + group.name + "'s members";
    document.querySelector(".members-container").appendChild(membersTable).setAttribute("class", "members-table");
    document.querySelector(".members-table").appendChild(membersTableThead).appendChild(membersTableTheadRow).setAttribute("class", "members-table-title");
    document.querySelector(".members-table-title").appendChild(membersTableTheadCol1).textContent = "N";
    document.querySelector(".members-table-title").appendChild(membersTableTheadCol2).textContent = "Name";
    document.querySelector(".members-table").appendChild(membersTableTbody).setAttribute("id", "listMembers");
    for (let i = 0; i < group.members.length; i++) {
        const membersTableTbodyRow = document.createElement("tr");
        const membersTableTbodyCol1 = document.createElement("td");
        const membersTableTbodyCol2 = document.createElement("td");
        const memberName = await instance.nameOf(group.members[i], { from: accounts[0] });
        document.getElementById("listMembers").appendChild(membersTableTbodyRow).setAttribute("id", ("member" + (i + 1)))
        document.getElementById("member" + (i + 1)).appendChild(membersTableTbodyCol1).setAttribute("class", "member-number");
        document.getElementById("member" + (i + 1)).appendChild(membersTableTbodyCol1).textContent = (i + 1);
        document.getElementById("member" + (i + 1)).appendChild(membersTableTbodyCol2).setAttribute("class", "member-name");
        document.getElementById("member" + (i + 1)).appendChild(membersTableTbodyCol2).textContent = memberName;
    }
}

async function tokenPage() {
    if (document.querySelector(".members-container")) {
        document.querySelector(".members-container").remove();
    }
    if (document.querySelector(".tokens-container")) {
        document.querySelector(".tokens-container").remove();
    }
    if (document.querySelector(".votes-container")) {
        document.querySelector(".votes-container").remove();
    }
    const tokensContainer = document.createElement("div");
    const tokensTitle = document.createElement("p");
    const tokensText = document.createElement("p");
    const usersTextInput = document.createElement("label");
    const usersInputList = document.createElement("select");
    const tokensTextInput = document.createElement("label");
    const tokensInputList = document.createElement("select");
    const tokenSendButton = document.createElement("button");
    const userTokens = await instance.getUserTokens(listGroups[posListGroup], { from: accounts[0] });
    document.querySelector("main").appendChild(tokensContainer).setAttribute("class", "tokens-container");
    document.querySelector(".tokens-container").appendChild(tokensTitle).setAttribute("class", "tokens-title");
    document.querySelector(".tokens-title").textContent = "Send Tokens!";
    document.querySelector(".tokens-container").appendChild(tokensText).setAttribute("class", "tokens-text");
    document.querySelector(".tokens-text").textContent = "Select the token and the user you want to send it";
    document.querySelector(".tokens-container").appendChild(usersTextInput).setAttribute("class", "tokens-text");
    document.querySelector(".tokens-container").appendChild(usersTextInput).setAttribute("for", "usersInputList");
    document.querySelector(".tokens-container").appendChild(usersTextInput).textContent = "User: ";
    document.querySelector(".tokens-container").appendChild(usersInputList).setAttribute("id", "usersInputList");
    for (let i = 0; i < group.members.length; i++) {
        const usersList = document.createElement("option");
        const memberName = await instance.nameOf(group.members[i], { from: accounts[0] });
        if (user.name !== memberName) {
            document.getElementById("usersInputList").appendChild(usersList).setAttribute("value", memberName);
            document.getElementById("usersInputList").appendChild(usersList).textContent = memberName;
        }
    }
    document.querySelector(".tokens-container").appendChild(tokensTextInput).setAttribute("class", "tokens-text");
    document.querySelector(".tokens-container").appendChild(tokensTextInput).setAttribute("for", "tokenInputList");
    document.querySelector(".tokens-container").appendChild(tokensTextInput).textContent = "Token: ";
    document.querySelector(".tokens-container").appendChild(tokensInputList).setAttribute("id", "tokenInputList");
    for (let i = 0; i < userTokens.length; i++) {
        const tokensList = document.createElement("option");
        const token = await instance.getToken(userTokens[i][0], { from: accounts[0] });
        if (userTokens[i].xBalance > 0) {
            document.getElementById("tokenInputList").appendChild(tokensList).setAttribute("value", userTokens[i].tokenId);
            document.getElementById("tokenInputList").appendChild(tokensList).textContent = token.name;
        }
    }
    document.querySelector(".tokens-container").appendChild(tokenSendButton).setAttribute("class", "token-send");
    document.querySelector(".token-send").textContent = "Send Token!";
    document.querySelector(".token-send").addEventListener("click", () => {
        sendTokens();
    });
}

async function votePage() {
    if (document.querySelector(".members-container")) {
        document.querySelector(".members-container").remove();
    }
    if (document.querySelector(".tokens-container")) {
        document.querySelector(".tokens-container").remove();
    }
    if (document.querySelector(".votes-container")) {
        document.querySelector(".votes-container").remove();
    }
    const candidateTokens = await instance.getGroupCandidateTokens(listGroups[posListGroup], { from: accounts[0] });
    const proposeContainer = document.createElement("div");
    document.querySelector("main").appendChild(proposeContainer).setAttribute("class", "propose-container");
    for (let i = 0; i < 3; i++) {
        const button = document.createElement("button");
        switch (i) {
            case 0:
                document.querySelector(".propose-container").appendChild(button).textContent = "New Token";
                document.querySelector(".propose-container").appendChild(button).setAttribute("id", "newTokenButton");
                break;
            case 1:
                document.querySelector(".propose-container").appendChild(button).textContent = "Change Token";
                document.querySelector(".propose-container").appendChild(button).setAttribute("id", "changeTokenButton");
                break;
            case 2:
                document.querySelector(".propose-container").appendChild(button).textContent = "New Quorum";
                document.querySelector(".propose-container").appendChild(button).setAttribute("id", "newQuorumButton");
                break;
        }
    }
    document.querySelector("#newTokenButton").addEventListener("click", () => {
        newTokenPage();
    });
    document.querySelector("#changeTokenButton").addEventListener("click", () => {
        changeTokenPage(candidateTokens);
    });
    document.querySelector("#newQuorumButton").addEventListener("click", () => {
        newQuorumPage();
    });
    const candType0 = [];
    const candType12 = [];
    const candType3 = [];
    for (let i = 0; i < candidateTokens.length; i++) {
        if (candidateTokens[i].candType === "0") {
            candType0[candType0.length] = candidateTokens[i];
        }
        if (candidateTokens[i].candType === "1") {
            candType12[candType12.length] = candidateTokens[i];
        }
        if (candidateTokens[i].candType === "2") {
            candType12[candType12.length] = candidateTokens[i];
        }
        if (candidateTokens[i].candType === "3") {
            candType3[candType3.length] = candidateTokens[i];
        }
    }
    const voteContainer = document.createElement("div");
    document.querySelector("main").appendChild(voteContainer).setAttribute("class", "votes-container")
    for (let i = 0; i < 3; i++) {
        const voteType = document.createElement("div");
        const table = document.createElement("table");
        const thead = document.createElement("thead");
        const tbody = document.createElement("tbody");
        const trHead = document.createElement("tr");
        if (i === 0) {
            document.querySelector(".votes-container").appendChild(voteType).setAttribute("class", "user-candidate-container");
            document.querySelector(".user-candidate-container").appendChild(table).setAttribute("class", "user-candidate-table");
            document.querySelector(".user-candidate-table").appendChild(thead).setAttribute("class", "user-candidate-table-thead");
            document.querySelector(".user-candidate-table-thead").appendChild(trHead).setAttribute("class", "user-candidate-table-thead-tr");
            for (let j = 0; j < 3; j++) {
                const th = document.createElement("th");
                switch (j) {
                    case 0:
                        document.querySelector(".user-candidate-table-thead-tr").appendChild(th).setAttribute("class", "user-candidate-table-title");
                        document.querySelector(".user-candidate-table-thead-tr").appendChild(th).textContent = "Name";
                        break;
                    case 1:
                        document.querySelector(".user-candidate-table-thead-tr").appendChild(th).setAttribute("class", "user-candidate-table-title");
                        document.querySelector(".user-candidate-table-thead-tr").appendChild(th).textContent = "Address";
                        break;
                    case 2:
                        document.querySelector(".user-candidate-table-thead-tr").appendChild(th).setAttribute("class", "user-candidate-table-title");
                        document.querySelector(".user-candidate-table-thead-tr").appendChild(th).setAttribute("colspan", "2");
                        document.querySelector(".user-candidate-table-thead-tr").appendChild(th).textContent = "In Agreement";
                        break;
                }
            }
            document.querySelector(".user-candidate-table").appendChild(tbody).setAttribute("class", "tbody-user-candidate");
            if (candType0.length === 0) {
                const tr0 = document.createElement("tr")
                const td0 = document.createElement("td")
                document.querySelector(".tbody-user-candidate").appendChild(tr0).setAttribute("class", "user-tr-no-candidate");
                document.querySelector(".user-tr-no-candidate").appendChild(td0).setAttribute("colspan", "4");
                document.querySelector(".user-tr-no-candidate").appendChild(td0).setAttribute("class", "name-token");
                document.querySelector(".user-tr-no-candidate").appendChild(td0).textContent = "No cadidates";
            } else {
                for (let j = 0; j < candType0.length; j++) {
                    const tr = document.createElement("tr");
                    document.querySelector(".tbody-user-candidate").appendChild(tr).setAttribute("class", "tbody-tr-user-candidate");
                    document.querySelector(".tbody-user-candidate").appendChild(td).setAttribute("class", "name-token");
                    for (let t = 0; t < 4; t++) {
                        const td = document.createElement("td");
                        switch (t) {
                            case 0:
                                document.querySelector(".tbody-tr-user-candidate" + j).appendChild(td).textContent = "nome";
                                document.querySelector(".tbody-tr-user-candidate" + j).appendChild(td).setAttribute("class", "text-token");
                                break;
                            case 1:
                                document.querySelector(".tbody-tr-user-candidate" + j).appendChild(td).textContent = candType0[j].address;
                                document.querySelector(".tbody-tr-user-candidate" + j).appendChild(td).setAttribute("class", "text-token");
                                break;
                            case 2:
                                document.querySelector(".tbody-tr-user-candidate" + j).appendChild(td).textContent = candType0[j].votes;
                                break;
                            case 3:
                                if (controlVoters(candType0, j) === true) {
                                    document.querySelector(".tbody-tr-user-candidate" + j).appendChild(td).textContent = "Already voted";
                                }
                                else {
                                    const button = document.createElement("button");
                                    document.querySelector(".tbody-tr-user-candidate" + j).appendChild(td).appendChild(button).setAttribute("class", "vote-button");
                                    document.querySelector(".tbody-tr-user-candidate" + j).appendChild(td).appendChild(button).textContent = "Vote";
                                    let posCandidateTokens = -1;
                                    let pos = 0;
                                    for (let x = 0; x < candidateTokens.length; x++) {
                                        if (candidateTokens[x].candType === "0") {
                                            pos++;
                                            if (pos === (j + 1)) {
                                                posCandidateTokens = x;
                                                break;
                                            }
                                        }
                                    }
                                    document.querySelector(".tbody-tr-user-candidate" + j).appendChild(td).appendChild(button).addEventListener("click", () => {
                                        voteCandidate(candType0[j], posCandidateTokens);
                                    });
                                }
                                document.querySelector(".tbody-tr-user-candidate" + j).appendChild(td).setAttribute("class", "text-token");
                                break;
                        }

                    }
                }
            }
        }
        if (i === 1) {
            document.querySelector(".votes-container").appendChild(voteType).setAttribute("class", "token-candidate-container");
            document.querySelector(".token-candidate-container").appendChild(table).setAttribute("class", "token-candidate-table");
            document.querySelector(".token-candidate-table").appendChild(thead).setAttribute("class", "token-candidate-table-thead");
            document.querySelector(".token-candidate-table-thead").appendChild(trHead).setAttribute("class", "token-candidate-table-thead-tr");
            for (let j = 0; j < 4; j++) {
                const th = document.createElement("th");
                switch (j) {
                    case 0:
                        document.querySelector(".token-candidate-table-thead-tr").appendChild(th).setAttribute("class", "token-candidate-table-title");
                        document.querySelector(".token-candidate-table-thead-tr").appendChild(th).textContent = "Name";
                        break;
                    case 1:
                        document.querySelector(".token-candidate-table-thead-tr").appendChild(th).setAttribute("class", "token-candidate-table-title");
                        document.querySelector(".token-candidate-table-thead-tr").appendChild(th).textContent = "N tokens";
                        break;
                    case 2:
                        document.querySelector(".token-candidate-table-thead-tr").appendChild(th).setAttribute("class", "token-candidate-table-title");
                        document.querySelector(".token-candidate-table-thead-tr").appendChild(th).textContent = "Time to refill";
                        break;
                    case 3:
                        document.querySelector(".token-candidate-table-thead-tr").appendChild(th).setAttribute("class", "token-candidate-table-title");
                        document.querySelector(".token-candidate-table-thead-tr").appendChild(th).setAttribute("colspan", "2");
                        document.querySelector(".token-candidate-table-thead-tr").appendChild(th).textContent = "In Agreement";
                        break;
                }
            }
            document.querySelector(".token-candidate-table").appendChild(tbody).setAttribute("class", "tbody-token-candidate");
            if (candType12.length === 0) {
                const tr0 = document.createElement("tr")
                const td0 = document.createElement("td")
                document.querySelector(".tbody-token-candidate").appendChild(tr0).setAttribute("class", "token-tr-no-candidate");
                document.querySelector(".token-tr-no-candidate").appendChild(td0).setAttribute("colspan", "5");
                document.querySelector(".token-tr-no-candidate").appendChild(td0).setAttribute("class", "name-token");
                document.querySelector(".token-tr-no-candidate").appendChild(td0).textContent = "No cadidates";
            } else {
                for (let j = 0; j < candType12.length; j++) {
                    const tr = document.createElement("tr");
                    document.querySelector(".tbody-token-candidate").appendChild(tr).setAttribute("class", "tbody-tr-token-candidate" + j);
                    for (let t = 0; t < 5; t++) {
                        const td = document.createElement("td");
                        switch (t) {
                            case 0:
                                document.querySelector(".tbody-tr-token-candidate" + j).appendChild(td).textContent = candType12[j].name;
                                document.querySelector(".tbody-tr-token-candidate" + j).appendChild(td).setAttribute("class", "name-token");
                                break;
                            case 1:
                                document.querySelector(".tbody-tr-token-candidate" + j).appendChild(td).textContent = candType12[j].roundSupply;
                                document.querySelector(".tbody-tr-token-candidate" + j).appendChild(td).setAttribute("class", "text-token");
                                break;
                            case 2:
                                document.querySelector(".tbody-tr-token-candidate" + j).appendChild(td).textContent = candType12[j].roundDuration / 86400 + " days";
                                document.querySelector(".tbody-tr-token-candidate" + j).appendChild(td).setAttribute("class", "text-token");
                                break;
                            case 3:
                                document.querySelector(".tbody-tr-token-candidate" + j).appendChild(td).textContent = candType12[j].votes;
                                document.querySelector(".tbody-tr-token-candidate" + j).appendChild(td).setAttribute("class", "text-token");
                                break;
                            case 4:
                                if (controlVoters(candType12, j) === true) {
                                    document.querySelector(".tbody-tr-token-candidate" + j).appendChild(td).textContent = "Already voted";
                                }
                                else {
                                    const button = document.createElement("button");
                                    document.querySelector(".tbody-tr-token-candidate" + j).appendChild(td).appendChild(button).setAttribute("class", "vote-button");
                                    document.querySelector(".tbody-tr-token-candidate" + j).appendChild(td).appendChild(button).textContent = "Vote";
                                    let posCandidateTokens = -1;
                                    let pos = 0;
                                    for (let x = 0; x < candidateTokens.length; x++) {
                                        if (candidateTokens[x].candType === "1" || candidateTokens[x].candType === "2") {
                                            pos++;
                                            if (pos === (j + 1)) {
                                                posCandidateTokens = x;
                                                break;
                                            }
                                        }
                                    }
                                    document.querySelector(".tbody-tr-token-candidate" + j).appendChild(td).appendChild(button).addEventListener("click", () => {
                                        voteCandidate(candType12[j], posCandidateTokens);
                                    });
                                }
                                document.querySelector(".tbody-tr-token-candidate" + j).appendChild(td).setAttribute("class", "text-token");
                                break;
                        }

                    }
                }
            }
        }
        if (i === 2) {
            document.querySelector(".votes-container").appendChild(voteType).setAttribute("class", "quorum-candidate-container");
            document.querySelector(".quorum-candidate-container").appendChild(table).setAttribute("class", "quorum-candidate-table");
            document.querySelector(".quorum-candidate-table").appendChild(thead).setAttribute("class", "quorum-candidate-table-thead");
            document.querySelector(".quorum-candidate-table-thead").appendChild(trHead).setAttribute("class", "quorum-candidate-table-thead-tr");
            for (let j = 0; j < 2; j++) {
                const th = document.createElement("th");
                switch (j) {
                    case 0:
                        document.querySelector(".quorum-candidate-table-thead-tr").appendChild(th).setAttribute("class", "quorum-candidate-table-title");
                        document.querySelector(".quorum-candidate-table-thead-tr").appendChild(th).textContent = "New quorum";
                        break;
                    case 1:
                        document.querySelector(".quorum-candidate-table-thead-tr").appendChild(th).setAttribute("class", "quorum-candidate-table-title");
                        document.querySelector(".quorum-candidate-table-thead-tr").appendChild(th).setAttribute("colspan", "2");
                        document.querySelector(".quorum-candidate-table-thead-tr").appendChild(th).textContent = "In Agreement";
                        break;
                }
            }
            document.querySelector(".quorum-candidate-table").appendChild(tbody).setAttribute("class", "tbody-quorum-candidate");
            if (candType3.length === 0) {
                const tr0 = document.createElement("tr")
                const td0 = document.createElement("td")
                document.querySelector(".tbody-quorum-candidate").appendChild(tr0).setAttribute("class", "quorum-tr-no-candidate");
                document.querySelector(".quorum-tr-no-candidate").appendChild(td0).setAttribute("colspan", "5");
                document.querySelector(".quorum-tr-no-candidate").appendChild(td0).setAttribute("class", "name-token");
                document.querySelector(".quorum-tr-no-candidate").appendChild(td0).textContent = "No cadidates";
            } else {
                for (let j = 0; j < candType3.length; j++) {
                    const tr = document.createElement("tr");
                    document.querySelector(".tbody-quorum-candidate").appendChild(tr).setAttribute("class", "tbody-tr-quorum-candidate" + j);
                    for (let t = 0; t < 3; t++) {
                        const td = document.createElement("td");
                        switch (t) {
                            case 0:
                                document.querySelector(".tbody-tr-quorum-candidate" + j).appendChild(td).textContent = candType3[j].id + "0%";
                                document.querySelector(".tbody-tr-quorum-candidate" + j).appendChild(td).setAttribute("class", "text-token");
                                break;
                            case 1:
                                document.querySelector(".tbody-tr-quorum-candidate" + j).appendChild(td).textContent = candType3[j].votes;
                                document.querySelector(".tbody-tr-quorum-candidate" + j).appendChild(td).setAttribute("class", "text-token");
                                break;
                            case 2:
                                if (controlVoters(candType3, j) === true) {
                                    document.querySelector(".tbody-tr-quorum-candidate" + j).appendChild(td).textContent = "Already voted";
                                }
                                else {
                                    const button = document.createElement("button");
                                    document.querySelector(".tbody-tr-quorum-candidate" + j).appendChild(td).appendChild(button).setAttribute("class", "vote-button");
                                    document.querySelector(".tbody-tr-quorum-candidate" + j).appendChild(td).appendChild(button).textContent = "Vote";
                                    let posCandidateTokens = -1;
                                    let pos = 0;
                                    for (let x = 0; x < candidateTokens.length; x++) {
                                        if (candidateTokens[x].candType === "3") {
                                            pos++;
                                            if (pos === (j + 1)) {
                                                posCandidateTokens = x;
                                                break;
                                            }
                                        }
                                    }
                                    document.querySelector(".tbody-tr-quorum-candidate" + j).appendChild(td).appendChild(button).addEventListener("click", () => {
                                        voteCandidate(candType3[j], posCandidateTokens);
                                    });
                                }
                                document.querySelector(".tbody-tr-quorum-candidate" + j).appendChild(td).setAttribute("class", "text-token");
                                break;
                        }

                    }
                }
            }
        }
    }

}

function newTokenPage() {
    const newTokenSection = document.createElement("div");
    const newTokenContainer = document.createElement("div");
    const newTokenh2 = document.createElement("h2");
    const br1 = document.createElement("br");
    const br2 = document.createElement("br");
    const newTokenLabel1 = document.createElement("label");
    const newTokenLabel2 = document.createElement("label");
    const newTokenLabel3 = document.createElement("label");
    const newTokenInput1 = document.createElement("input");
    const newTokenInput2 = document.createElement("input");
    const newTokenInput3 = document.createElement("input");
    const newTokenButtonSpace = document.createElement("div");
    const newTokenButton = document.createElement("button");
    const newTokenButtonClose = document.createElement("button");
    document.querySelector("body").appendChild(newTokenSection).setAttribute("class", "new-token-section");
    document.querySelector(".new-token-section").appendChild(newTokenContainer).setAttribute("class", "new-token-container");
    document.querySelector(".new-token-container").appendChild(newTokenh2).textContent = "New Token:"
    document.querySelector(".new-token-container").appendChild(newTokenLabel1).setAttribute("for", "nameToken");
    document.querySelector(".new-token-container").appendChild(newTokenLabel1).textContent = "Name: ";
    document.querySelector(".new-token-container").appendChild(newTokenInput1).setAttribute("id", "nameToken");
    document.querySelector(".new-token-container").appendChild(newTokenInput1).setAttribute("type", "text");
    document.querySelector(".new-token-container").appendChild(br1);
    document.querySelector(".new-token-container").appendChild(newTokenLabel2).setAttribute("for", "timeToken");
    document.querySelector(".new-token-container").appendChild(newTokenLabel2).textContent = "N Tokens every refill: ";
    document.querySelector(".new-token-container").appendChild(newTokenInput2).setAttribute("id", "timeToken");
    document.querySelector(".new-token-container").appendChild(newTokenInput2).setAttribute("type", "number");
    document.querySelector(".new-token-container").appendChild(br2);
    document.querySelector(".new-token-container").appendChild(newTokenLabel3).setAttribute("for", "nToken");
    document.querySelector(".new-token-container").appendChild(newTokenLabel3).textContent = "Time to refill: ";
    document.querySelector(".new-token-container").appendChild(newTokenInput3).setAttribute("id", "nToken");
    document.querySelector(".new-token-container").appendChild(newTokenInput3).setAttribute("type", "number");
    document.querySelector(".new-token-container").appendChild(newTokenButtonSpace).setAttribute("class", "container-buttons");
    document.querySelector(".container-buttons").appendChild(newTokenButtonClose).setAttribute("class", "close-button");
    document.querySelector(".close-button").textContent = "Cancel";
    document.querySelector(".close-button").addEventListener("click", () => {
        document.querySelector(".new-token-section").remove();
    });
    document.querySelector(".container-buttons").appendChild(newTokenButton).setAttribute("class", "confirm-button");
    document.querySelector(".confirm-button").textContent = "Confirm";
    document.querySelector(".confirm-button").addEventListener("click", async () => {
        document.querySelector(".confirm-button").setAttribute("disabled", "true");
        let nameToken = document.getElementById("nameToken").value;
        let timeToken = parseInt(document.getElementById("timeToken").value);
        let nToken = parseInt(document.getElementById("nToken").value);
        if (nameToken === "" || timeToken === NaN || nToken === NaN || timeToken === 0 || nToken === 0) {
            alert("Data not included!");
            document.querySelector(".confirm-button").removeAttribute("disabled");
            return;
        }
        if (timeToken < 0) {
            timeToken = absoluteNumber(timeToken);
        }
        if (nToken < 0) {
            nToken = absoluteNumber(nToken);
        }
        try {
            await instance.changeToken(0, nameToken, nToken, timeToken, listGroups[posListGroup], 1, { from: accounts[0], gas: userGas, gasPrice: null });
        } catch (err) {
            alert("Transition not successfull!");
            document.querySelector(".confirm-button").removeAttribute("disabled");
        }
    });

}

async function changeTokenPage(candidateTokens) {
    console.log(candidateTokens)
    console.log(group)
    const changeTokenSection = document.createElement("div");
    const changeTokenContainer = document.createElement("div");
    const changeTokenh2 = document.createElement("h2");
    const br1 = document.createElement("br");
    const br2 = document.createElement("br");
    const br3 = document.createElement("br");
    const changeTokenLabel1 = document.createElement("label");
    const changeTokenLabel2 = document.createElement("label");
    const changeTokenLabel3 = document.createElement("label");
    const changeTokenInput1 = document.createElement("input");
    const changeTokenInput2 = document.createElement("input");
    const changeTokenInput3 = document.createElement("input");
    const changeTokenButtonSpace = document.createElement("div");
    const changeTokenButton = document.createElement("button");
    const changeTokenButtonClose = document.createElement("button");
    const changeTokenSelect = document.createElement("select");
    document.querySelector("body").appendChild(changeTokenSection).setAttribute("class", "change-token-section");
    document.querySelector(".change-token-section").appendChild(changeTokenContainer).setAttribute("class", "change-token-container");
    document.querySelector(".change-token-container").appendChild(changeTokenh2).textContent = "Change Token:"
    document.querySelector(".change-token-container").appendChild(changeTokenSelect).setAttribute("id", "changeTokenListId");
    document.querySelector(".change-token-container").appendChild(br3);
    for (let i = -1; i < parseInt(group.tokenIds.length); i++) {
        const changeTokenOption = document.createElement("option");
        if (i >= 0) {
            const token = await instance.getToken(group.tokenIds[i]);
            document.querySelector("#changeTokenListId").appendChild(changeTokenOption).textContent = token.name;
            document.querySelector("#changeTokenListId").appendChild(changeTokenOption).setAttribute("value", group.tokenIds[i]);
        }
        else {
            document.querySelector("#changeTokenListId").appendChild(changeTokenOption).textContent = "----------";
            document.querySelector("#changeTokenListId").appendChild(changeTokenOption).setAttribute("value", "-1");
        }
    }
    document.querySelector(".change-token-container").appendChild(changeTokenLabel1).setAttribute("for", "nameToken");
    document.querySelector(".change-token-container").appendChild(changeTokenLabel1).textContent = "Name: ";
    document.querySelector(".change-token-container").appendChild(changeTokenInput1).setAttribute("id", "nameToken");
    document.querySelector(".change-token-container").appendChild(changeTokenInput1).setAttribute("type", "text");
    document.querySelector(".change-token-container").appendChild(br1);
    document.querySelector(".change-token-container").appendChild(changeTokenLabel2).setAttribute("for", "timeToken");
    document.querySelector(".change-token-container").appendChild(changeTokenLabel2).textContent = "N Tokens every refill: ";
    document.querySelector(".change-token-container").appendChild(changeTokenInput2).setAttribute("id", "timeToken");
    document.querySelector(".change-token-container").appendChild(changeTokenInput2).setAttribute("type", "number");
    document.querySelector(".change-token-container").appendChild(br2);
    document.querySelector(".change-token-container").appendChild(changeTokenLabel3).setAttribute("for", "nToken");
    document.querySelector(".change-token-container").appendChild(changeTokenLabel3).textContent = "Time to refill: ";
    document.querySelector(".change-token-container").appendChild(changeTokenInput3).setAttribute("id", "nToken");
    document.querySelector(".change-token-container").appendChild(changeTokenInput3).setAttribute("type", "number");
    document.querySelector(".change-token-container").appendChild(changeTokenButtonSpace).setAttribute("class", "container-buttons");
    document.querySelector(".container-buttons").appendChild(changeTokenButtonClose).setAttribute("class", "close-button");
    document.querySelector(".close-button").textContent = "Cancel";
    document.querySelector(".close-button").addEventListener("click", () => {
        document.querySelector(".change-token-section").remove();
    });
    document.querySelector(".container-buttons").appendChild(changeTokenButton).setAttribute("class", "confirm-button");
    document.querySelector(".confirm-button").textContent = "Confirm";
    document.querySelector(".confirm-button").addEventListener("click", async () => {
        document.querySelector(".confirm-button").setAttribute("disabled", "true");
        let nameToken = document.getElementById("nameToken").value;
        let timeToken = parseInt(document.getElementById("timeToken").value);
        let nToken = parseInt(document.getElementById("nToken").value);
        if (nameToken === "" || timeToken === NaN || nToken === NaN) {
            alert("Data not included!");
        }
        if (timeToken < 1) {
            timeToken = absoluteNumber(timeToken);
        }
        if (nToken < 1) {
            nToken = absoluteNumber(nToken);
        }
        try {
            // await instance.changeToken(0, nameToken, nToken, timeToken, listGroups[posListGroup], 1, { from: accounts[0], gas: userGas, gasPrice: null });
        } catch (err) {
            alert("Transition not successfull!");
            document.querySelector(".confirm-button").removeAttribute("disabled");
        }
    });

}

// function changeTokenPage(candidateTokens) {
//     const changeTokenSection = document.createElement("div");
//     const changeTokenContainer = document.createElement("div");
//     const changeTokenh2 = document.createElement("h2");
//     const br1 = document.createElement("br");
//     const br2 = document.createElement("br");
//     const changeTokenLabel1 = document.createElement("label");
//     const changeTokenLabel2 = document.createElement("label");
//     const changeTokenLabel3 = document.createElement("label");
//     const changeTokenInput1 = document.createElement("input");
//     const changeTokenInput2 = document.createElement("input");
//     const changeTokenInput3 = document.createElement("input");
//     const changeTokenButtonSpace = document.createElement("div");
//     const changeTokenButton = document.createElement("button");
//     const changeTokenButtonClose = document.createElement("button");
//     document.querySelector("body").appendChild(changeTokenSection).setAttribute("class", "change-token-section");
//     document.querySelector(".change-token-section").appendChild(changeTokenContainer).setAttribute("class", "change-token-container");
//     document.querySelector(".change-token-container").appendChild(changeTokenh2).textContent = "Change Token:"
//     document.querySelector(".change-token-container").appendChild(changeTokenLabel1).setAttribute("for", "nameToken");
//     document.querySelector(".change-token-container").appendChild(changeTokenLabel1).textContent = "Name: ";
//     document.querySelector(".change-token-container").appendChild(changeTokenInput1).setAttribute("id", "nameToken");
//     document.querySelector(".change-token-container").appendChild(changeTokenInput1).setAttribute("type", "text");
//     document.querySelector(".change-token-container").appendChild(br1);
//     document.querySelector(".change-token-container").appendChild(changeTokenLabel2).setAttribute("for", "timeToken");
//     document.querySelector(".change-token-container").appendChild(changeTokenLabel2).textContent = "N Tokens every refill: ";
//     document.querySelector(".change-token-container").appendChild(changeTokenInput2).setAttribute("id", "timeToken");
//     document.querySelector(".change-token-container").appendChild(changeTokenInput2).setAttribute("type", "number");
//     document.querySelector(".change-token-container").appendChild(br2);
//     document.querySelector(".change-token-container").appendChild(changeTokenLabel3).setAttribute("for", "nToken");
//     document.querySelector(".change-token-container").appendChild(changeTokenLabel3).textContent = "Time to refill: ";
//     document.querySelector(".change-token-container").appendChild(changeTokenInput3).setAttribute("id", "nToken");
//     document.querySelector(".change-token-container").appendChild(changeTokenInput3).setAttribute("type", "number");
//     document.querySelector(".change-token-container").appendChild(changeTokenButtonSpace).setAttribute("class", "container-buttons");
//     document.querySelector(".container-buttons").appendChild(changeTokenButtonClose).setAttribute("class", "close-button");
//     document.querySelector(".close-button").textContent = "Cancel";
//     document.querySelector(".close-button").addEventListener("click", () => {
//         document.querySelector(".change-token-section").remove();
//     });
//     document.querySelector(".container-buttons").appendChild(changeTokenButton).setAttribute("class", "confirm-button");
//     document.querySelector(".confirm-button").textContent = "Confirm";
//     document.querySelector(".confirm-button").addEventListener("click", async () => {
//         document.querySelector(".confirm-button").setAttribute("disabled", "true");
//         let nameToken = document.getElementById("nameToken").value;
//         let timeToken = parseInt(document.getElementById("timeToken").value);
//         let nToken = parseInt(document.getElementById("nToken").value);
//         if (nameToken === "" || timeToken === NaN || nToken === NaN) {
//             alert("Data not included!");
//         }
//         if (timeToken < 1) {
//             timeToken = absoluteNumber(timeToken);
//         }
//         if (nToken < 1) {
//             nToken = absoluteNumber(nToken);
//         }
//         try {
//             await instance.changeToken(0, nameToken, nToken, timeToken, listGroups[posListGroup], 1, { from: accounts[0], gas: userGas, gasPrice: null });
//         } catch (err) {
//             alert("Transition not successfull!");
//             document.querySelector(".confirm-button").removeAttribute("disabled");
//         }
//     });

// }

function leaveGroup() {
    const leaveSection = document.createElement("div");
    const leaveContainer = document.createElement("span");
    const leaveParagraph = document.createElement("p");
    const leaveButtonSpace = document.createElement("div");
    const leaveButton = document.createElement("button");
    const leaveButtonClose = document.createElement("button");
    document.querySelector("body").appendChild(leaveSection).setAttribute("class", "leave-group");
    document.querySelector(".leave-group").appendChild(leaveContainer).setAttribute("class", "leave-container");
    document.querySelector(".leave-container").appendChild(leaveParagraph).textContent = "Do you want leave this group?"
    document.querySelector(".leave-container").appendChild(leaveButtonSpace).setAttribute("class", "container-buttons");
    document.querySelector(".container-buttons").appendChild(leaveButtonClose).setAttribute("class", "close-button");
    document.querySelector(".close-button").textContent = "Cancel";
    document.querySelector(".close-button").addEventListener("click", () => {
        document.querySelector(".leave-group").remove();
    });
    document.querySelector(".container-buttons").appendChild(leaveButton).setAttribute("class", "exit-button");
    document.querySelector(".exit-button").textContent = "Exit";
    document.querySelector(".exit-button").addEventListener("click", async () => {
        document.querySelector(".exit-button").setAttribute("disabled", "true");
        await instance.removeMeFromGroup(listGroups[posListGroup], { from: accounts[0], gas: userGas, gasPrice: null });
    });
}

async function sendTokens() {
    const sendUser = document.getElementById("usersInputList").value;
    const sendToken = document.getElementById("tokenInputList").value;
    let sendAddress;
    for (let i = 0; i < group.members.length; i++) {
        const memberName = await instance.nameOf(group.members[i], { from: accounts[0] });
        if (sendUser === memberName) {
            sendAddress = group.members[i];
        }
    }
    await instance.transferToken(parseInt(sendToken), sendAddress, 1, { from: accounts[0], gas: userGas, gasPrice: null });
}

function voteCandidate(cand, id) {
    const voteSection = document.createElement("div");
    const voteContainer = document.createElement("span");
    const voteButtonSpace = document.createElement("div");
    const voteButtonYes = document.createElement("button");
    const voteButtonNo = document.createElement("button");
    const voteButtonClose = document.createElement("button");
    const voteList = document.createElement("ul");
    document.querySelector("body").appendChild(voteSection).setAttribute("class", "vote-candidate");
    document.querySelector(".vote-candidate").appendChild(voteContainer).setAttribute("class", "vote-candidate-container");
    document.querySelector(".vote-candidate-container").appendChild(voteList).setAttribute("id", "voteTokenInfo");
    document.getElementById("voteTokenInfo").setAttribute("type", "none");
    for (let i = 0; i < 4; i++) {
        const li = document.createElement("li");
        switch (i) {
            case 0:
                document.getElementById("voteTokenInfo").appendChild(li).textContent = "Name: " + cand.name;
                break;
            case 1:
                document.getElementById("voteTokenInfo").appendChild(li).textContent = "N tokens: " + cand.roundSupply;
                break;
            case 2:
                document.getElementById("voteTokenInfo").appendChild(li).textContent = "Time to refill: " + cand.roundDuration / 86400 + " Days";
                break;
            case 3:
                document.getElementById("voteTokenInfo").appendChild(li).textContent = "In Agreement: " + cand.votes;
                break;
        }
    }
    document.querySelector(".vote-candidate-container").appendChild(voteButtonSpace).setAttribute("class", "container-buttons");
    document.querySelector(".container-buttons").appendChild(voteButtonClose).setAttribute("class", "close-button");
    document.querySelector(".close-button").textContent = "Cancel";
    document.querySelector(".close-button").addEventListener("click", () => {
        document.querySelector(".vote-candidate").remove();
    });
    document.querySelector(".container-buttons").appendChild(voteButtonNo).setAttribute("class", "vote-no-button");
    document.querySelector(".vote-no-button").textContent = "No";
    document.querySelector(".vote-no-button").addEventListener("click", async () => {
        document.querySelector(".vote-no-button").setAttribute("disabled", "true");
        document.querySelector(".vote-yes-button").setAttribute("disabled", "true");
        await instance.voteCandidateToken(listGroups[posListGroup], group.candidateTokenIds[id], 0, { from: accounts[0], gas: userGas, gasPrice: null });
    });
    document.querySelector(".container-buttons").appendChild(voteButtonYes).setAttribute("class", "vote-yes-button");
    document.querySelector(".vote-yes-button").textContent = "Yes";
    document.querySelector(".vote-yes-button").addEventListener("click", async () => {
        document.querySelector(".vote-yes-button").setAttribute("disabled", "true");
        document.querySelector(".vote-no-button").setAttribute("disabled", "true");
        await instance.voteCandidateToken(listGroups[posListGroup], group.candidateTokenIds[id], 1, { from: accounts[0], gas: userGas, gasPrice: null });
    });
}

function controlVoters(cand, j) {
    for (let y = 0; y < cand[j].voters.length; y++) {
        if (user.address == cand[j].voters[y]) {
            return true;
        }
    }
    return false;
}

function absoluteNumber(number) {
    if (number < 0) {
        number = -number;
    }
    return number;
}