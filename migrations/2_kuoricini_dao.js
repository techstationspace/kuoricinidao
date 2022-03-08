const KuoriciniDao = artifacts.require("KuoriciniDao");
const KuoriciniGroup = artifacts.require("KuoriciniGroup");

module.exports = function (deployer) {

  deployer.deploy(KuoriciniGroup).then(function(){
    return deployer.deploy(KuoriciniDao, KuoriciniGroup.address)
  });  
  
};  
