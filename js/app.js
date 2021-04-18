App = {
  web3Provider: null,
  contracts: {},
  loading: false,
  tokenPrice: 1000000000000000,
  tokensAvailable: 750000,

  init: function() {
    console.log("App initialized...")
    return App.initWeb3();
  },

  initWeb3: function() {
    if (typeof web3 !== 'undefined') {
      // If a web3 instance is already provided by Meta Mask.
      App.web3Provider = web3.currentProvider;
      web3 = new Web3(web3.currentProvider);
      window.ethereum.enable();
    } else {
      // Specify default instance if no web3 instance provided
      App.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
      web3 = new Web3(App.web3Provider);
    }
    return App.initContracts();
  },

  initContracts: function() {
    $.getJSON("contracts/SabaTokenSale.json", function(sabaTokenSale) {
      App.contracts.SabaTokenSale = TruffleContract(sabaTokenSale);
      App.contracts.SabaTokenSale.setProvider(App.web3Provider);
      App.contracts.SabaTokenSale.deployed().then(function(sabaTokenSale) {
        console.log("Saba Token Sale Address:", sabaTokenSale.address);
      });
    }).done(function() {
      $.getJSON("contracts/SabaToken.json", function(sabaToken) {
        App.contracts.SabaToken = TruffleContract(sabaToken);
        App.contracts.SabaToken.setProvider(App.web3Provider);
        App.contracts.SabaToken.deployed().then(function(sabaToken) {
          console.log("Saba Token Address:", sabaToken.address);
      });
        return App.render();
     });
    })
   },

  // Listen for events emitted from the contract
  listenForEvents: function() {
    App.contracts.SabaTokenSale.deployed().then(function(instance) {
      instance.Sell({}, {
        fromBlock: 0,
        toBlock: 'latest',
      }).then(function(error, event) {
        console.log("event triggered", event);
        App.render();
      })
    })
  },


  render: function() {
    if (App.loading) {
      return;
    }

    App.loading = true;

    var loader  = $('#loader');
    var content = $('#content');

    loader.show();
    content.hide();

    // Load account data
    web3.eth.getCoinbase(function(err, account) {
      if(err === null) {
        App.account = account;
        $('#accountAddress').html("Your Account: " + account);
      }
    })

    // Load token sale contract
    App.contracts.SabaTokenSale.deployed().then(function(instance) {
      SabaTokenSaleInstance = instance;
      return SabaTokenSaleInstance.tokenPrice();
    }).then(function(tokenPrice) {
      App.tokenPrice = tokenPrice;
      $('.token-price').html(web3.utils.fromWei(App.tokenPrice, "ether"));
      return SabaTokenSaleInstance.tokensSold();
    }).then(function(tokensSold) {
      App.tokensSold = tokensSold.toNumber();
      $('.tokens-sold').html(App.tokensSold);
      $('.tokens-available').html(App.tokensAvailable);

      var progressPercent = (Math.ceil(App.tokensSold) / App.tokensAvailable) * 100;
      $('#progress').css('width', progressPercent + '%');
      // console.log(progressPercent)

      // Load token contract
      App.contracts.SabaToken.deployed().then(function(instance) {
      	SabaTokenInstance = instance;
      	return SabaTokenInstance.balanceOf(App.account);
	    }).then(function(balance) {
	      $('.dapp-balance').html(balance.toNumber());  
		   	App.loading = false;
			loader.hide();
			content.show();
    	})
   	});
   },


  buyTokens: function() {
    $('#content').hide();
    $('#loader').show();
    var numberOfTokens = $('#numberOfTokens').val();
    App.contracts.SabaTokenSale.deployed().then(function(instance) {
      return instance.buyTokens(numberOfTokens, {
        from: App.account,
        value: numberOfTokens * App.tokenPrice,
        gas: 500000 // Gas limit
      });
    }).then(function(result) {
      console.log("Tokens bought...")
      $('form').trigger('reset') // reset number of tokens in form
      return App.listenForEvents();
    });
  }
}

$(function() {
  $(window).load(function() {
    App.init();
  })
});
