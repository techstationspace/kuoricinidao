const KuoriciniDao = artifacts.require("KuoriciniDao");

contract("KuoriciniDao", async accounts => {

  it("set the name", async () => {
    instance = await KuoriciniDao.deployed();
    account_one = accounts[0];
    account_two = accounts[1];
  
    await instance.nameSet("pippo", { from: account_one });
    const n = await instance.nameOf(account_one , {from: account_one});
    assert.equal(n, "pippo"); 
  });

  it("create group 0", async () => {
    await instance.createGroup("empty", { from: account_one });
    gids = await instance.myGroups({from: accounts[0]});
    group = await instance.getGroup(gids[0], {from: accounts[0]});
    assert.equal(group.members[0], account_one); 
  });



  it("create group 1 and add candidate", async () => {
    await instance.createGroup("amici", { from: account_one });
    gids = await instance.myGroups({from: accounts[0]});
    gid=gids[1];
    group = await instance.getGroup(gids[1], {from: accounts[0]});
//    await instance.addCandidate(gids[1], group.invitationLink , {from: account_two});
    await instance.changeToken(0,group.invitationLink,0,0,parseInt(gid),0,{from: account_two});

    assert.equal(group.members[0], account_one); 
  });

  it("vote candidate to enter group 1", async () => {
    await instance.voteCandidate(1, 0, 1, { from: account_one });
  });

  it("propose new token", async () => {
    await instance.changeToken(0, "coccodrilli", 5, 6400, gid, 1, {from: accounts[0]});
    group = await instance.getGroup(gid, {from: accounts[0]});
    console.log(group);
  });

  it("vote to accept new token", async () => {
    await instance.voteCandidate(1, group.candidateIds[0], gid, { from: account_one });
  });

  it("propose new Quorum", async () => {
    await instance.proposeQuorum(3, gid, { from: account_one });
    a = await instance.getQuorumProposals(1, { from: account_one });
    console.log(a);
  });


  it("remove me from group", async () => {
    await instance.removeMeFromGroup(1, { from: account_one });
  });



/*
  it("create token", async () => {
    const instance = await KuoriciniDao.deployed();
    const account_one = accounts[0];
    gid=0;

    await instance.createGToken("kuori", 10, 86400, 0, {from: accounts[0]});
    utokens = await instance.getUserTokens(gid, {from: accounts[0]});
    gtoken = await instance.getToken(utokens[0].tokenId, {from: accounts[0]});

    assert.equal(gtoken.name, "kuori"); 
  });

*/

/*
  it("transfer token", async () => {
    const instance = await KuoriciniDao.deployed();
    const account_one = accounts[0];
    const account_two = accounts[1];
    gid=0;

    await instance.transferToken(0, account_two, 1, {from: accounts[0]});
    utokensS = await instance.getUserTokens(gid, {from: accounts[0]});
    utokensR = await instance.getUserTokens(gid, {from: accounts[1]});
    console.log(utokensS);
    console.log(utokensR);
    assert.equal(utokensS[0].xBalance, 9); 
    assert.equal(utokensR[0].gTokenBalance, 1); 
  });
*/




});
