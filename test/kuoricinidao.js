const KuoriciniDao = artifacts.require("KuoriciniDao");

contract("KuoriciniDao", async accounts => {

  it("set the name", async () => {
    const instance = await KuoriciniDao.deployed();
    const account_one = accounts[0];
  
    await instance.setName("pippo", { from: account_one });
    const n = await instance.nameOf(account_one , {from: account_one});
    assert.equal(n, "pippo"); 
  });

  it("create group and add address", async () => {
    const instance = await KuoriciniDao.deployed();
    const account_one = accounts[0];
    const account_two = accounts[1];

    await instance.createGroup("amici", { from: account_one });
    gids = await instance.myGroups({from: accounts[0]});
    await instance.addAddresstoGroup(account_two, gids[0] , {from: accounts[0]});
    group = await instance.group(gids[0], {from: accounts[0]});
    assert.equal(group.members[1], account_two); 
  });

  it("create token", async () => {
    const instance = await KuoriciniDao.deployed();
    const account_one = accounts[0];
    gid=0;

    await instance.createGToken("kuori", 10, 86400, 0, {from: accounts[0]});
    utokens = await instance.getUserTokens(gid, {from: accounts[0]});
    gtoken = await instance.getToken(utokens[0].tokenId, gid, {from: accounts[0]});

    assert.equal(gtoken.name, "kuori"); 
  });

  it("transfer token", async () => {
    const instance = await KuoriciniDao.deployed();
    const account_one = accounts[0];
    const account_two = accounts[1];
    gid=0;

    await instance.transferToken(0, account_two, 1, gid, {from: accounts[0]});

    utokensS = await instance.getUserTokens(gid, {from: accounts[0]});
    console.log("utokensS");
    console.log(utokensS);

    utokensR = await instance.getUserTokens(gid, {from: accounts[1]});
    console.log("utokensR");
    console.log(utokensR);

    assert.equal(utokensS[0].xbalance, 9); 
    assert.equal(utokensR[0].balance, 1); 
  });

  it("create another token and transfer more", async () => {
    const instance = await KuoriciniDao.deployed();
    const account_one = accounts[0];
    const account_two = accounts[1];
    gid=0;

    await instance.createGToken("matite", 2, 86400, 0, {from: accounts[0]});
    utokens = await instance.getUserTokens(gid, {from: accounts[0]});
    console.log(utokens);
    gtoken = await instance.getToken(utokens[1].tokenId, gid, {from: accounts[0]});
    console.log(gtoken);

    console.log("first transfer");
    await instance.transferToken(1, account_two, 1, gid, {from: accounts[0]});    
    utokensS = await instance.getUserTokens(gid, {from: accounts[0]});
    console.log("utokensS");
    console.log(utokensS);
    utokensR = await instance.getUserTokens(gid, {from: accounts[1]});
    console.log("utokensR");
    console.log(utokensR);

    console.log("second transfer");
    await instance.transferToken(1, account_two, 1, gid, {from: accounts[0]});    
    utokensS = await instance.getUserTokens(gid, {from: accounts[0]});
    console.log("utokensS");
    console.log(utokensS);
    utokensR = await instance.getUserTokens(gid, {from: accounts[1]});
    console.log("utokensR");
    console.log(utokensR);

    assert.equal(utokensS[1].xbalance, 0); 
    assert.equal(utokensR[1].balance, 2);

   
  });

});
