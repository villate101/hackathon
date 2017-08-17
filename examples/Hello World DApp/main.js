window.addEventListener('load', function() {
    // Checking if Web3 has been injected by the browser (Mist/MetaMask)
    if (typeof web3 !== 'undefined') {
        // Use Mist/MetaMask's provider
        console.log("Web3 detected!");
        window.web3 = new Web3(web3.currentProvider);
        // Now you can start your app & access web3 freely:
        var address = '0xf1d7d8123be29d2080af5f670ef7f263f0c27e31';
        var contract = web3.eth.contract([{"constant":true,"inputs":[],"name":"SayHello","outputs":[{"name":"","type":"string"}],"payable":false,"type":"function"},{"constant":false,"inputs":[],"name":"kill","outputs":[],"payable":false,"type":"function"},{"inputs":[],"payable":false,"type":"constructor"}]).at(address);
        contract.SayHello(function (error, data) {
        	console.log(data);
        	console.log(error);
            $('#text').html(data);
            $('#address').text(address);
        });
    } else {
		$("#errorModal").modal("show");
    }
});