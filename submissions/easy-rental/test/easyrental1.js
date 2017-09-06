var EasyRental1 = artifacts.require("./EasyRental1.sol");

contract('EasyRental1', function(accounts) {
    it("should should check if contract is deployed correctly", function() {
        return EasyRental1.deployed().then(function(instance) {
            return instance.countRentedItems.call();
        }).then(function(rentedItemsCount) {
            assert.equal(rentedItemsCount, 0, "There are already some rented items in the contract");
        });
    });
    it("should check if all steps of renting workflow work correctly", function() {
        var easyRental;

        // Get initial balances of first and second account.
        var account_renter = accounts[0];
        var account_client = accounts[1];

        var account_renter_starting_balance;
        var account_client_starting_balance;
        var account_renter_ending_balance;
        var account_client_ending_balance;

        account_renter_starting_balance = web3.eth.getBalance(account_renter).toNumber();
        account_client_starting_balance = web3.eth.getBalance(account_client).toNumber();

        // Initiate rental
        var initRent = getInitialRentData(account_renter, account_client);
        return EasyRental1.deployed().then(function(instance) {
            easyRental = instance;
            //web3.eth.sendTransaction({from: initRent.clientAdd, to: easyRental.address, gas: 250000, value: initRent.rentAmount + initRent.advanceAmount,
            //gasPrice: 1, data: initRent});
            return easyRental.createRentedItem.sendTransaction(initRent.renterAdd, initRent.clientAdd, initRent.advanceAmount, initRent.rentAmount, initRent.itemHash, initRent.advanceTimeoutHours, {from: account_client, gas: 250000, value: initRent.rentAmount + initRent.advanceAmount});
        }).then(function() {
            return easyRental.checkIfIsLive.call(initRent.itemHash);
        }).then(function(isLive) {
            assert.equal(isLive, true, "Rented item hasnt been initialized and shelved");
            // Confirm that item is returned by client, make sure he wont get advance since renter has not confirmed yet
            easyRental.confirmItemReturn(initRent.itemHash, {from: account_client, gas: 100000});
            return easyRental.checkIfIsOver.call(initRent.itemHash);
        }).then(function(isOver) {
            assert.equal(isOver, false, "Rented item has been returned or refunded before renter confirmed item as returned");
            // Confirm that item is returned by renter
            return easyRental.confirmItemReturn(initRent.itemHash, {from: account_renter, gas: 100000});
        }).then(function() {
            return easyRental.checkIfIsOver.call(initRent.itemHash);
        }).then(function(isOver) {
            assert.equal(isOver, false, "Rented item has been returned or refunded after confirmation from renter account");
            // Confirm that item is returned by client again - this time the advance should move to its account automatically
            return easyRental.confirmItemReturn(initRent.itemHash, {from: account_client, gas: 100000});
        }).then(function() {
            return easyRental.checkIfIsOver.call(initRent.itemHash);
        }).then(function(isOver) {
            account_renter_ending_balance = web3.eth.getBalance(account_renter).toNumber();
            account_client_ending_balance = web3.eth.getBalance(account_client).toNumber();
            assert.equal(isOver, true, "Rented item has not been returned or refunded even after both parties confirmed return in right order");
            assert.equal(account_renter_ending_balance > account_renter_starting_balance, true, "Rent amount has not been added to renter account");
            assert.equal(account_client_ending_balance < account_client_starting_balance, true, "Rent amount has not been subtracted from clients account");
        });
    });
});

function getInitialRentData(account_renter, account_client) {
    var data = {};
    data.renterAdd = account_renter;
    data.clientAdd = account_client;
    data.advanceAmount = 200000000000000000; // Amount in wei - 0.2 ETH
    data.rentAmount = 400000000000000000; // Amount in wei - 0.1 ETH
    data.itemHash = guid(); // "2977b491-fb51-4220-9aa0-8043ab0513b3";
    data.advanceTimeoutHours = 24;
    return data;
}

function guid() {
    function s4() {
        return Math.floor((1 + Math.random()) * 0x10000)
            .toString(16)
            .substring(1);
    }
    return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
        s4() + '-' + s4() + s4() + s4();
}