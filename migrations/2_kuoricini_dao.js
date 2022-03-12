const KuoriciniDao = artifacts.require("KuoriciniDao");
//const KuoriciniGroup = artifacts.require("KuoriciniGroup");

module.exports = function (deployer) {

  return deployer.deploy(KuoriciniDao)
   
//  deployer.deploy(KuoriciniGroup).then(function(){
//    return deployer.deploy(KuoriciniDao, KuoriciniGroup.address)
//  });  
  
};  
