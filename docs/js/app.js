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
    $.getJSON("contracts/IsoTokenSale.json", function(isoTokenSale) {
      App.contracts.IsoTokenSale = TruffleContract(isoTokenSale);
      App.contracts.IsoTokenSale.setProvider(App.web3Provider);
      App.contracts.IsoTokenSale.deployed().then(function(isoTokenSale) {
        console.log("Iso Token Sale Address:", isoTokenSale.address);
      });
    }).done(function() {
      $.getJSON("contracts/IsoToken.json", function(isoToken) {
        App.contracts.IsoToken = TruffleContract(isoToken);
        App.contracts.IsoToken.setProvider(App.web3Provider);
        App.contracts.IsoToken.deployed().then(function(isoToken) {
          console.log("Iso Token Address:", isoToken.address);
      });
        return App.render();
     });
    })
   },

  // Listen for events emitted from the contract
  listenForEvents: function() {
    App.contracts.IsoTokenSale.deployed().then(function(instance) {
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
    App.contracts.IsoTokenSale.deployed().then(function(instance) {
      isoTokenSaleInstance = instance;
      return isoTokenSaleInstance.tokenPrice();
    }).then(function(tokenPrice) {
      App.tokenPrice = tokenPrice;
      $('.token-price').html(web3.utils.fromWei(App.tokenPrice, "ether"));
      return isoTokenSaleInstance.tokensSold();
    }).then(function(tokensSold) {
      App.tokensSold = tokensSold.toNumber();
      $('.tokens-sold').html(App.tokensSold);
      $('.tokens-available').html(App.tokensAvailable);

      var progressPercent = (Math.ceil(App.tokensSold) / App.tokensAvailable) * 100;
      $('#progress').css('width', progressPercent + '%');
      // console.log(progressPercent)

      // Load token contract
      App.contracts.IsoToken.deployed().then(function(instance) {
      	isoTokenInstance = instance;
      	return isoTokenInstance.balanceOf(App.account);
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
    App.contracts.IsoTokenSale.deployed().then(function(instance) {
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
