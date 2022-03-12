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
              alert("error Get Accounts");
              console.log(err.message);
          });
        });
      App.getMyGroups();
      return App.bindEvents();      
    },

    bindEvents: function(){
      $(document).on('click', "#sendKuoriButton", App.sendKuori);
      $(document).on('click', "#setNameButton", App.setName);
      $(document).on('click', "#gotoGroup", App.getTheGroup);
      $(document).on('click', "#createGroup", App.createGroup);
      $(document).on('click', "#addMember", App.addGroupMember);
      $(document).on('click', "#getMyGroups", App.getMyGroups);


      console.log( window.location.pathname);
/*
      web3.eth.getAccounts(function(error, accounts) {
        KuoriciniDao.deployed().then(function(instance) {
          var newGroupEvent = KuoriciniDao.newGroup();
          newGroupEvent.watch(function(error, result){
            if (!error)
                {
                    console.log("got event!");
                    console.log(result.args);
                } else {
                    console.log(error);
                }
          });
        });
      });
  */    
    }, 

    getTheGroup: function() {
       groupId=$("#showGroup").val();
       App.getGroup(groupId);
    },

    getGroup: function(_gid) {
      web3.eth.getAccounts(function(error, accounts) {
        KuoriciniDao.deployed().then(function(instance) {
            return instance.getGroupNamefromId(_gid, {from: accounts[0]});
        }).then(function(result) {
            console.log("group is:");
            console.log(result);
            $('#groupId').text(_gid);
            $('#groupName').text(result);            
        }).catch(function(err) {
            alert("error get Group");
            console.log(err.message);
        });
      });

      web3.eth.getAccounts(function(error, accounts) {
        KuoriciniDao.deployed().then(function(instance) {
            return instance.getGroupAddressfromId(_gid, {from: accounts[0]});
        }).then(function(result) {
            console.log("members is: "+result);
            console.log(result);
            co=web3.utils.isBigNumber(result);
            console.log("big: "+co);
            $('#groupMembers').text(result);            
        }).catch(function(err) {
            alert("error get Group members");
            console.log(err.message);
        });
      });
    },

    createGroup: function() {
      groupName=$("#setGroupName").val();
      web3.eth.getAccounts(function(error, accounts) {
        KuoriciniDao.deployed().then(function(instance) {
          console.log("prima");
            return instance.addGroup(groupName, {from: accounts[0]});
        }).then(function(result) {
            console.log("create group is:");
            console.log(result);
            console.log(result.logs[0].args[0]);
            co=web3.utils.isBigNumber(result);
            console.log("big: "+co);
        }).catch(function(err) {
            alert("error create Group");
            console.log(err.message);
        });
      });

    },

    addGroupMember: function() {
      groupId=$("#addMemberId").val();
      groupAddress=$("#addMemberAddress").val();
      web3.eth.getAccounts(function(error, accounts) {
        KuoriciniDao.deployed().then(function(instance) {
            return instance.addAddresstoMembers(groupId, groupAddress, {from: accounts[0]});
        }).then(function(result) {
            console.log("create group is:");
            console.log(result);
            alert(result);
        }).catch(function(err) {
            alert("error create Group");
            console.log(err.message);
        });
      });

    },

    getMyGroups: function() {
      var table=document.getElementById("groupTableBody");
      table.innerHTML="";
      web3.eth.getAccounts(function(error, accounts) {
        KuoriciniDao.deployed().then(async function(instance) {
          var myg = await instance.myGroups({from: accounts[0]});
          myg.forEach(element => {
            KuoriciniDao.deployed().then(async function(instance) {
              var groupName = await instance.getGroupNamefromId(element, {from: accounts[0]});
              var groupAddresses = await instance.getGroupAddressfromId(element, {from: accounts[0]});

              newRow = table.insertRow(-1);
              newCell = newRow.insertCell(0); 
              newCell.innerHTML=element;
              newCell = newRow.insertCell(-1); 
              newCell.innerHTML=groupName;
              newCell = newRow.insertCell(-1); 
              newCell.innerHTML=groupAddresses;

/*              
              groupAddresses.forEach(async function(addr) {
                gid = await instance.nameOf(addr, {from: accounts[0]});
                if(gid=="") {
                  newCell.innerHTML=addr;
                } else {
                  newCell.innerHTML=gid;
                }
              });
*/              
            });
          });
        }).catch(function(err) {
          alert("error my Groups");
          console.log(err.message);
        });
      });
    },

    sendKuori: function(){
        sendAddress=$("#sendKuoriAddress").val();
        web3.eth.getAccounts(function(error, accounts) {
            KuoriciniDao.deployed().then(function(instance) {
                return instance.transfer(sendAddress, 1, {from: accounts[0]});
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
          }).catch(function(err) {
              alert("error");
              console.log(err.message);
          });
      });
    },


};

$(window).on('load', function() {
  App.initWeb3();
});
