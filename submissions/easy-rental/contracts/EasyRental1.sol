pragma solidity ^0.4.4;

contract EasyRental1 {

    event LogInit(address renterAdd, address clientAdd, uint advanceAmount, uint rentAmount, bytes itemHash, int advanceTimeoutHours);
    event LogEventCreatedWithItemHash(bytes itemHash);
    event LogSenderDoesParticipate();
    event LogSenderConfirmedReturn(string party);
    event LogAdvanceTimeoutElapsedAdvanceRefunded(uint leftside, uint rightside);
    event LogItemAlreadyExistsAborting(bytes itemHash);
    event LogItemCount(uint count);
    event LogRentAmountTransferred(uint amount, address renterAddress);
    event LogContractBalance(uint balance);

    struct RentedItemShelved {
    uint initDate;
    int advanceTimeoutHours;
    bytes32 renterAdd;
    bytes32 clientAdd;
    uint advanceAmount;
    bool returnConfirmedRenter;
    bool returnConfirmedClient;
    bool isReturned;
    bool isRefunded;
    bool isLive;
    }

    struct RentedItem {
    address  renterAdd;
    address  clientAdd;
    uint advanceAmount;
    uint rentAmount;
    bytes itemHash;
    }

    mapping (bytes => RentedItemShelved) private rentedItems;
    uint itemCount;

    function createRentedItem(address renterAdd, address clientAdd, uint advanceAmount, uint rentAmount, bytes itemHash, int advanceTimeoutHours)
    payable {

        LogInit(renterAdd, clientAdd, advanceAmount, rentAmount, itemHash, advanceTimeoutHours);
        // If item already exists, abort
        if(itemExists(itemHash))  {
            LogItemAlreadyExistsAborting(itemHash);
            return;
        }

        itemCount++;
        //Save rented item
        rentedItems[itemHash] = RentedItemShelved ({
        initDate: now,
        renterAdd: sha256(renterAdd),
        clientAdd: sha256(clientAdd),
        advanceAmount: advanceAmount,
        returnConfirmedRenter: false,
        returnConfirmedClient: false,
        isLive: true,
        advanceTimeoutHours: advanceTimeoutHours,
        isReturned: false,
        isRefunded: false
        });

        itemCount++;
        LogEventCreatedWithItemHash(itemHash);
        LogContractBalance(this.balance);
        // Send money for renting to renter
        renterAdd.transfer(rentAmount);
        LogRentAmountTransferred(rentAmount, renterAdd);
        LogContractBalance(this.balance);
    }

    function confirmItemReturn(bytes itemHash) payable {
        // If item already has been refunded or returned, abort
        if(rentedItems[itemHash].isReturned || rentedItems[itemHash].isRefunded) return;
        // Hash sender address so we can compare it to addresses in shelved item
        bytes32 senderHash = sha256(msg.sender);
        // Get rented item from shelf by its itemHash
        RentedItemShelved item = rentedItems[itemHash];
        // Check if item exists and if sender does participate in rental of the item
        if(item.isLive && (item.renterAdd == senderHash || item.clientAdd == senderHash)) {
            LogSenderDoesParticipate();
            // If timeout on advance elapsed, renter alone is able to collect the advance amount for himself
            if(uint(now - item.initDate) > uint(item.advanceTimeoutHours * 3600)) {
                if((item.renterAdd == senderHash)) {
                    LogAdvanceTimeoutElapsedAdvanceRefunded(uint(now - item.initDate),uint(item.advanceTimeoutHours * 3600));
                    msg.sender.transfer(item.advanceAmount);
                    item.isRefunded = true;
                    return;
                }
            }
            // If timeout is not yet elapsed, check if both parties confirmed that item is returned and
            // refund the client with advance amount if so
            else {
                // If renter is confirming
                if(senderHash == item.renterAdd) {
                    LogSenderConfirmedReturn("renter");
                    item.returnConfirmedRenter = true;
                }
                // If client is confirming, should confirm as second
                if(senderHash == item.clientAdd) {
                    LogSenderConfirmedReturn("sender");
                    item.returnConfirmedClient = true;
                    if(item.returnConfirmedRenter) {
                        msg.sender.transfer(item.advanceAmount);
                        LogSenderConfirmedReturn("sender - transfer complete");
                        item.isReturned = true;
                        LogContractBalance(this.balance);
                    }
                }
            }
        }
    }

    function checkIfIsLive(bytes itemHash) constant returns (bool) {
        return rentedItems[itemHash].isLive;
    }

    function checkIfIsOver(bytes itemHash) constant returns (bool) {
        return (rentedItems[itemHash].isReturned || rentedItems[itemHash].isRefunded);
    }

    function countRentedItems() constant returns (uint count) {
        return itemCount;
    }

    function itemExists(bytes itemHash) constant returns (bool) {
        return rentedItems[itemHash].isLive;
    }

    /* Returns
    Elapsed timeout in seconds
    AdvanceAmount
    ConfirmedByClient
    ConfirmedByRenter
    IsReturned
    IsRefunded
    IsLive
    */
    function getShelvedItemInfo(bytes itemHash) constant returns (int, int, bool, bool, bool, bool, bool) {
        return (int(now - rentedItems[itemHash].initDate),
        int(rentedItems[itemHash].advanceAmount),
        rentedItems[itemHash].returnConfirmedRenter,
        rentedItems[itemHash].returnConfirmedClient,
        rentedItems[itemHash].isReturned,
        rentedItems[itemHash].isRefunded,
        rentedItems[itemHash].isLive);
    }
}
