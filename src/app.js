App = {

    initWeb3: async function() {
      if (window.ethereum) {
        web3Provider = window.ethereum;
        try {
          await window.ethereum.request({ method: "eth_requestAccounts" });;
        } catch (error) {
          console.error("User denied account access")
        }
      }
      web3 = new Web3(web3Provider);

      $.getJSON('KuoriciniDao.json', function(data) {
        KuoriciniDao = TruffleContract(data);
        KuoriciniDao.setProvider(web3Provider);
      });
      return App.readAccount();
    },

    readAccount: function() {
        web3.eth.getAccounts(function(error, accounts) {
            $('#myAddress').text(accounts[0]);            
            KuoriciniDao.deployed().then(function(instance) {
                return instance.balanceOf(accounts[0], {from: accounts[0]});
            }).then(function(result) {
              console.log(result);              
                $('#myKuori').text(result);
            }).catch(function(err) {
                alert("error");
                console.log(err.message);
            });
        });
        
        web3.eth.getAccounts(function(error, accounts) {
          KuoriciniDao.deployed().then(function(instance) {
              return instance.nameOf(accounts[0], {from: accounts[0]});
          }).then(function(result) {
              console.log("name is:");
              console.log(result);
              $('#myName').text(result);
          }).catch(function(err) {
              alert("error");
              console.log(err.message);
          });
        });

      return App.bindEvents();      
    },

    bindEvents: function(){
      $(document).on('click', "#sendKuoriButton", App.sendKuori);
      $(document).on('click', "#setNameButton", App.setName);
    }, 

    sendKuori: function(){
        sendAddress=$("#sendKuoriAddress").val();
        web3.eth.getAccounts(function(error, accounts) {
            KuoriciniDao.deployed().then(function(instance) {
                return instance.transfer(sendAddress, 1, {from: accounts[0]});
            }).then(function(result) {
                App.readContract();
            }).catch(function(err) {
                alert("Error!");
                console.log(err.message);
            });
        });
    },

    setName: function(){
      setName=$("#setName").val();
      web3.eth.getAccounts(function(error, accounts) {
          KuoriciniDao.deployed().then(function(instance) {
              console.log("setting name "+setName);
              return instance.nameSet(setName, {from: accounts[0]});
          }).then(function(result) {
              App.readContract();
          }).catch(function(err) {
              alert("error");
              console.log(err.message);
          });
      });
  }

};

$(window).on('load', function() {
  App.initWeb3();
});
