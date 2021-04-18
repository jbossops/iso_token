
var xhr = new XMLHttpRequest();
        
function processRequest(e) {
	if (xhr.readyState == 4 && xhr.status == 200) {
	var response = JSON.parse(xhr.responseText);
	console.log(response.ETH.PLN);
	document.getElementById("ether-Price").innerHTML = (response.ETH.PLN * 0.001).toFixed(4);
	}
}

function mainApp() {
	if (Notification.permission !== "denied") {
	Notification.requestPermission(function (permission) {});
	}
	xhr.open('GET', 'https://min-api.cryptocompare.com/data/pricemulti?fsyms=ETH&tsyms=PLN', true)
	xhr.send();
	xhr.onreadystatechange = processRequest;
};
		  
mainApp();

	

