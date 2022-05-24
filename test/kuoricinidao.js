const KuoriciniDao = artifacts.require("KuoriciniDao");

contract("KuoriciniDao", async accounts => {

  it("set the name", async () => {
    const instance = await KuoriciniDao.deployed();
    const account_one = accounts[0];
  
    await instance.nameSet("pippo", { from: account_one });
    const n = await instance.nameOf(account_one , {from: account_one});
    assert.equal(n, "pippo"); 
  });

  it("create group and add address", async () => {
    const instance = await KuoriciniDao.deployed();
    const account_one = accounts[0];
    const account_two = accounts[1];

    await instance.createGroup("amici", { from: account_one });
    gids = await instance.myGroups({from: accounts[0]});
    // TODO: calling add address broken since invtation, now is private function
    await instance.addAddresstoGroup(gids[0], account_two, {from: accounts[0]});
    group = await instance.getGroup(gids[0], {from: accounts[0]});
    assert.equal(group.members[1], account_two); 
  });

  it("create token", async () => {
    const instance = await KuoriciniDao.deployed();
    const account_one = accounts[0];
    gid=0;

    await instance.createGToken("kuori", 10, 86400, 0, {from: accounts[0]});
    utokens = await instance.getUserTokens(gid, {from: accounts[0]});
    gtoken = await instance.getToken(utokens[0].tokenId, {from: accounts[0]});

    assert.equal(gtoken.name, "kuori"); 
  });

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

});
