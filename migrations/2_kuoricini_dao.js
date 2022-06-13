const KuoriciniDao = artifacts.require("KuoriciniDao");
const Voting = artifacts.require("Voting");

module.exports = function (deployer) {
//  deployer.deploy(KuoriciniDao).then(function() {
//    return deployer.deploy(Voting, KuoriciniDao.address)
//  });
  deployer.deploy(KuoriciniDao);
     
};  
