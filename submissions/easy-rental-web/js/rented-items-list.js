//Initialize Web3
var web3;
if (typeof web3 !== 'undefined') {
    web3 = new Web3(web3.currentProvider);
} else {
    // set the provider you want from Web3.providers
    web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
}

// create a reference to the notifications list in the bottom of the app; we will write database messages into this list by
//appending list items on to the inner HTML of this variable - this is all the lines that say note.innerHTML += '<li>foo</li>';
var note = document.getElementById('notifications');

// create an instance of a db object for us to store the IDB data in
var db;

// create a blank instance of the object that is used to transfer data into the IDB. This is mainly for reference
var newItem = [
    { itemName: "", amount: "" , advanceAmount: "" , advanceTimeout: "" , description: "" }
];

// all the variables we need for the app
var taskList = document.getElementById('task-list');

var taskForm = document.getElementById('task-form');
var itemName = getUrlParameter('itemName');
taskForm.style = "display: none;";


var rentedItemsTableName = "rentedItems";
var itemsForRentTableName = "itemsForRent";

var submit = document.getElementById('submit');

window.onload = function() {
    note.innerHTML += '<li>App initialised.</li>';
    // In the following line, you should include the prefixes of implementations you want to test.
    window.indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
    // DON'T use "var indexedDB = ..." if you're not in a function.
    // Moreover, you may need references to some window.IDB* objects:
    window.IDBTransaction = window.IDBTransaction || window.webkitIDBTransaction || window.msIDBTransaction;
    window.IDBKeyRange = window.IDBKeyRange || window.webkitIDBKeyRange || window.msIDBKeyRange;
    // (Mozilla has never prefixed these objects, so we don't need window.mozIDB*)


    // Let us open our database
    var DBOpenRequest = window.indexedDB.open(rentedItemsTableName, 100);

    // Gecko-only IndexedDB temp storage option:
    // var request = window.indexedDB.open("toDoList", {version: 4, storage: "temporary"});

    // these two event handlers act on the database being opened successfully, or not
    DBOpenRequest.onerror = function (event) {
        note.innerHTML += '<li>Error loading database.</li>';
    };

    DBOpenRequest.onsuccess = function (event) {
        note.innerHTML += '<li>Database initialised.</li>';

        // store the result of opening the database in the db variable. This is used a lot below
        db = DBOpenRequest.result;

        // Run the displayData() function to populate the task list with all the to-do list data already in the IDB
        displayData();
    };

    // This event handles the event whereby a new version of the database needs to be created
    // Either one has not been created before, or a new version number has been submitted via the
    // window.indexedDB.open line above
    //it is only implemented in recent browsers
    DBOpenRequest.onupgradeneeded = function (event) {
        var db = event.target.result;

        db.onerror = function (event) {
            note.innerHTML += '<li>Error loading database.</li>';
        };

        // Create an objectStore for this database

        var objectStore = db.createObjectStore(rentedItemsTableName, {keyPath: "id", autoIncrement:true});

        // define what data items the objectStore will contain
        objectStore.createIndex("itemName", "itemName", {unique: false});
        objectStore.createIndex("amount", "amount", {unique: false});
        objectStore.createIndex("advanceAmount", "advanceAmount", {unique: false});
        objectStore.createIndex("advanceTimeout", "advanceTimeout", {unique: false});
        objectStore.createIndex("description", "description", {unique: false});
        objectStore.createIndex("rentedTime", "rentedTime", {unique: false});
        objectStore.createIndex("itemHash", "itemHash", {unique: false});
        objectStore.createIndex("hash", "hash", {unique: false});
        objectStore.createIndex("returned", "returned", {unique: false});
        objectStore.createIndex("renter", "renter", {unique: false});
        objectStore.createIndex("id", "id", { unique: true });
        note.innerHTML += '<li>Object store created.</li>';
    };

    function displayData() {
        // first clear the content of the task list so that you don't get a huge long list of duplicate stuff each time
        //the display is updated.
        taskList.innerHTML = "";

        // Open our object store and then get a cursor list of all the different data items in the IDB to iterate through
        var objectStore = db.transaction(rentedItemsTableName).objectStore(rentedItemsTableName);
        objectStore.openCursor().onsuccess = function (event) {
            var cursor = event.target.result;
            // if there is still another cursor to go, keep runing this code
            if (cursor) {
                // create a list item to put each data item inside when displaying it
                var listItem = document.createElement('li');

                // build the rented item list entry and put it into the list item via innerHTML.
                var renterPhrase = cursor.value.renter ? " to someone for " : " for myself for ";
                listItem.innerHTML = "<div class='col-sm-7' style='display: inline-block'>" + cursor.value.rentedTime + " | Rented " + cursor.value.itemName + renterPhrase + cursor.value.amount + "(WEI) with " + cursor.value.advanceAmount + "(WEI) as advance that will expire after " + cursor.value.advanceTimeout + "h </div>";
                listItem.className = "list-group-item";
                if (!cursor.value.renter) {
                    //listItem.style.textDecoration = "line-through";
                    listItem.style.backgroundColor = "NavajoWhite";
                } else {
                    listItem.style.backgroundColor = "lightgreen";
                }

                // put the item item inside the task list
                taskList.appendChild(listItem);

                var checkStateButton = document.createElement('button');
                listItem.appendChild(checkStateButton);
                checkStateButton.innerHTML = 'Check Status';
                checkStateButton.className = 'btn btn-success col-sm-12 col-md-2';
                checkStateButton.style = 'float:right;margin-right: 5px;';
                // here we are setting a data attribute on our delete button to say what task we want deleted if it is clicked!
                checkStateButton.setAttribute('data-task', cursor.value.itemName);
                checkStateButton.setAttribute('data-item-hash', cursor.value.itemHash);
                checkStateButton.onclick = function (event) {
                    console.log("with callbacks");
                    var itemHash = event.target.getAttribute("data-item-hash");
                    var EasyRentalContract = web3.eth.contract(getEasyRentalAbiArray()).at(g_easyRentalAddress);
                    web3.eth.getAccounts(function(e,accounts){
                        var account_client = accounts[0];
                        EasyRentalContract.checkIfIsLive.call(itemHash, {from: account_client}, function(error, alive) {
                            if (!alive) {
                                alert("Item is not present on blockchain or has not been rented by client yet");
                                return;
                            }

                            EasyRentalContract.getShelvedItemInfo.call(itemHash, {from: account_client}, function(error, itemInfo) {
                                alert("Elapsed minutes: " + (itemInfo[0] / 60) + "\n" +
                                    "Advance amount: " + itemInfo[1] + "(WEI) \n" +
                                    "Confirmed by renter: " + itemInfo[2] + "\n" +
                                    "Confirmed by client: " + itemInfo[3] + "\n" +
                                    "Item is returned: " + itemInfo[4] + "\n" +
                                    "Item is refunded: " + itemInfo[5] + "\n" +
                                    "Item is live: " + itemInfo[6] + "\n");
                            });
                        });
                    });
                };
                if (!cursor.value.renter) {
                    var confirmItemReturnedButton = document.createElement('button');
                    listItem.appendChild(confirmItemReturnedButton);
                    confirmItemReturnedButton.innerHTML = 'Confirm Item Returned';
                    confirmItemReturnedButton.className = 'btn btn-primary col-sm-12 col-md-2';
                    confirmItemReturnedButton.style = 'float:right;margin-right: 5px;';
                    // here we are setting a data attribute on our delete button to say what task we want deleted if it is clicked!
                    confirmItemReturnedButton.setAttribute('data-task', cursor.value.itemName);
                    confirmItemReturnedButton.setAttribute('data-item-hash', cursor.value.itemHash);
                    confirmItemReturnedButton.onclick = function (event) {
                        var EasyRentalContract = web3.eth.contract(getEasyRentalAbiArray()).at(g_easyRentalAddress);
                        web3.eth.getAccounts(function(e,accounts){
                            var account_sender = accounts[0];
                            var itemHash = event.target.getAttribute("data-item-hash");
                            var itemInfo = EasyRentalContract.getShelvedItemInfo.call(itemHash, {from: account_sender});
                            if(!itemInfo[4] && !itemInfo[5] && itemInfo[6]){
                                if(itemInfo[2]) {
                                    alert("You (Renter) have already confirmed that item has been returned");
                                } else {
                                    EasyRentalContract.confirmItemReturn.sendTransaction(itemHash, {from: account_sender, gas: 100000},
                                        function(e,value) {
                                            alert("You have confirmed that item has been returned ! Thanks !")
                                        });
                                }
                            } else {
                                alert("Item has been already returned, refunded or item is not live yet");
                            }
                        });
                    };
                } else {
                    var qrCodeButton = document.createElement('button');
                    web3.eth.getAccounts(function(e,accounts){
                        var renterAdd = accounts[0];
                        listItem.appendChild(qrCodeButton);
                        qrCodeButton.innerHTML = 'QR Code';
                        qrCodeButton.className = 'btn btn-primary col-sm-12 col-md-2';
                        qrCodeButton.style = 'float:right;margin-right: 5px;';
                        // here we are setting a data attribute on our delete button to say what task we want deleted if it is clicked!
                        qrCodeButton.setAttribute('data-task', cursor.value.itemName);
                        //itemName=testName&amount=40000000&advanceAmount=80000000&advanceTimeout=24&itemHash=someGuid
                        // &rentTime=25.6.2017:14:48:45&hashSent=a7efbea6f74129be3044c6802940be8bba6c67ae75dd7e4398c39063fdf6edaa
                        // &description=testDescription&renterAdd=0x17e975bca05e88bbd2e944dcca04484bdef830cf224ffd8d48f10b48ac58ac73
                        var urlQR = "https://www.easyrental.com/index.html?first=pass&itemName="+ cursor.value.itemName + "&amount=" + cursor.value.amount
                            + "&advanceAmount=" + cursor.value.advanceAmount + "&advanceTimeout=" + cursor.value.advanceTimeout + "&rentTime=" + cursor.value.rentedTime
                            + "&hashSent=" + cursor.value.hash + "&itemHash=" + cursor.value.itemHash + "&description=none&renterAdd=" + renterAdd;
                        qrCodeButton.setAttribute('data-url-qr', urlQR);
                    });

                    qrCodeButton.onclick = function (event) {
                        var QRC = qrcodegen.QrCode;
                        var urlQr = event.target.getAttribute("data-url-qr");
                        var qr0 = QRC.encodeText(urlQr, QRC.Ecc.HIGH);
                        var svgData = qr0.toSvgString(4);
                        // SVG (blue rectangle) that we want to display
                        var svg = {
                            header: 'data:image/svg+xml',
                            data: svgData
                        };
                        // Setup canvas
                        var canvas = document.getElementById('qrCodeCanvas');
                        canvas.width = 640;
                        canvas.height = 480;
                        if (canvas.getContext) {
                            // Get canvas context
                            var context = canvas.getContext('2d');
                            // Setup new image object
                            var image = new Image();
                            // Make sure that there is an event listener
                            // BEFORE attaching an image source
                            image.onload = function() {
                                context.drawImage(image, 0, 0);
                            };
                            // Init the image with our SVG
                            image.src = svg.header + ',' + svg.data;
                        }
                        closeOpenQrPopup();
                    };

                    var claimAdvanceButton = document.createElement('button');
                    listItem.appendChild(claimAdvanceButton);
                    claimAdvanceButton.innerHTML = 'Claim Advance';
                    claimAdvanceButton.className = 'btn btn-primary col-sm-12 col-md-2';
                    claimAdvanceButton.style = 'float:right;margin-right: 5px;';
                    // here we are setting a data attribute on our delete button to say what task we want deleted if it is clicked!
                    claimAdvanceButton.setAttribute('data-task', cursor.value.itemName);
                    claimAdvanceButton.setAttribute('data-item-hash', cursor.value.itemHash);
                    claimAdvanceButton.onclick = function (event) {
                        var EasyRentalContract = web3.eth.contract(getEasyRentalAbiArray()).at(g_easyRentalAddress);
                        web3.eth.getAccounts(function(e,accounts){
                            var account_sender = accounts[0];
                            var itemHash = event.target.getAttribute("data-item-hash");
                            var itemInfo = EasyRentalContract.getShelvedItemInfo.call(itemHash, {from: account_sender});
                            if(!itemInfo[4] && !itemInfo[5] && itemInfo[6]){
                                if(itemInfo[3]) {
                                    alert("You (Client) have already claimed the advance");
                                } else {
                                    EasyRentalContract.confirmItemReturn.sendTransaction(itemHash, {from: account_sender, gas: 100000},
                                        function(e,value) {
                                            alert("You have confirmed that you returned the item and the deposit is on its way back to your wallet, thanks !");
                                        });
                                }
                            } else {
                                alert("Item has been already returned, refunded or item is not live yet");
                            }
                        });
                    };
                }

                // continue on to the next item in the cursor
                cursor.continue();

                // if there are no more cursor items to iterate through, say so, and exit the function

                note.innerHTML += '<li>Entries all displayed.</li>';
            }
        }
    };

    // give the form submit button an event listener so that when the form is submitted the addData() function is run
    taskForm.addEventListener('submit', addData, false);

    function addData(e) {
        // prevent default - we don't want the form to submit in the conventional way
        e.preventDefault();

        var itemName = document.getElementById('itemName').value;
        var renterAdd = document.getElementById('renterAdd').value;
        var advanceAmount = document.getElementById('advanceAmount').value;
        var amount = document.getElementById('amount').value;
        var itemHash = document.getElementById('itemHash').value;
        var advanceTimeout = document.getElementById('advanceTimeout').value;
        var rentTime = document.getElementById('rentedTime').value;
        var hashUser = sha256(itemName + amount + advanceAmount + advanceTimeout + itemHash + rentTime);
        var hashSent = document.getElementById('hashSent').value;
        var returned = false;
        var description = document.getElementById('description').value;
        var renter = false;

        var EasyRentalContract = web3.eth.contract(getEasyRentalAbiArray()).at(g_easyRentalAddress);

        web3.eth.getAccounts(function(e,accounts){
            var account_client = accounts[0];
            EasyRentalContract.checkIfIsLive.call(itemHash, {from: account_client}, function(error, isAlive) {
                if (isAlive) {
                    alert("You have already rented this item");
                    return;
                }

                console.log(renterAdd, account_client, advanceAmount, amount, itemHash, advanceTimeout);
                EasyRentalContract.createRentedItem.sendTransaction(renterAdd, account_client, advanceAmount, amount, itemHash, advanceTimeout, {
                    from: account_client,
                    gas: 250000,
                    value: amount + advanceAmount
                }, function(e, value) {

                });
            });

        });


        // grab the values entered into the form fields and store them in an object ready for being inserted into the IDB
        var newItem = [
            {
                itemName: itemName,
                amount: amount,
                advanceAmount: advanceAmount,
                advanceTimeout: advanceTimeout,
                description: description,
                rentedTime: rentTime,
                itemHash: itemHash,
                hash: hashUser,
                returned: false,
                renter: false
            }
        ];

        // open a read/write db transaction, ready for adding the data
        var transaction = db.transaction([rentedItemsTableName], "readwrite");

        // report on the success of the transaction completing, when everything is done
        transaction.oncomplete = function () {
            note.innerHTML += '<li>Transaction completed: database modification finished.</li>';

            // update the display of data to show the newly added item, by running displayData() again.
            displayData();
        };

        transaction.onerror = function () {
            note.innerHTML += '<li>Transaction not opened due to error: ' + transaction.error + '</li>';
        };
        // call an object store that's already been added to the database
        var objectStore = transaction.objectStore(rentedItemsTableName);
        console.log(objectStore.indexNames);
        console.log(objectStore.keyPath);
        console.log(objectStore.itemName);
        console.log(objectStore.transaction);
        console.log(objectStore.autoIncrement);

        console.log("itemName: ", newItem[0].itemName);
        // Make a request to add our newItem object to the object store
        var objectStoreRequest = objectStore.add(newItem[0]);
        objectStoreRequest.onsuccess = function (event) {

            // report the success of our request
            // (to detect whether it has been succesfully
            // added to the database, you'd look at transaction.oncomplete)
            note.innerHTML += '<li>Request successful.</li>';

            // clear the form, ready for adding the next entry
            itemName.value = '';
            amount.value = '';
            advanceTimeout.value = '';
            advanceAmount.value = '';
            description.value = '';

        };

    };

    function deleteItem(event) {
        // retrieve the name of the task we want to delete
        var dataTask = event.target.getAttribute('data-task');

        // open a database transaction and delete the task, finding it by the name we retrieved above
        var transaction = db.transaction([rentedItemsTableName], "readwrite");
        var request = transaction.objectStore(rentedItemsTableName).delete(dataTask);

        // report that the data item has been deleted
        transaction.oncomplete = function () {
            // delete the parent of the button, which is the list item, so it no longer is displayed
            event.target.parentNode.parentNode.removeChild(event.target.parentNode);
            note.innerHTML += '<li>Item \"' + dataTask + '\" deleted.</li>';
        };
    };

    function startRental(event) {
        alert("Not yet implemented");
    }
};

function getUrlParameter(sParam, sPageURL) {
    //var sPageURL = decodeURIComponent(window.location.search.substring(1)),
    sPageURL = decodeURIComponent(sPageURL);
    var sURLVariables = sPageURL.split('&'),
        sParameterName,
        i;

    for (i = 0; i < sURLVariables.length; i++) {
        sParameterName = sURLVariables[i].split('=');

        if (sParameterName[0] === sParam) {
            return sParameterName[1] === undefined ? true : sParameterName[1];
        }
    }
}

function previewImage(file) {
    var galleryId = "gallery";

    var gallery = document.getElementById(galleryId);
    var imageType = /image.*/;

    if (!file.type.match(imageType)) {
        throw "File Type must be an image";
    }

    var thumb = document.createElement("div");
    thumb.classList.add('thumbnail'); // Add the class thumbnail to the created div

    var img = document.createElement("img");
    img.file = file;
    thumb.appendChild(img);
    gallery.innerHTML = "";
    gallery.appendChild(thumb);

    // Using FileReader to display the image content
    var reader = new FileReader();
    reader.onload = (function(aImg) { return function(e) {
        aImg.src = e.target.result;
        decodeImageFromBase64(e.target.result,function(decodedInformation){
            var itemName = getUrlParameter('itemName', decodedInformation);
            var amount = getUrlParameter('amount', decodedInformation);
            var advanceAmount = getUrlParameter('advanceAmount', decodedInformation);
            var advanceTimeout = getUrlParameter('advanceTimeout', decodedInformation);
            var itemHash = getUrlParameter('itemHash', decodedInformation);
            var rentTime = getUrlParameter('rentTime', decodedInformation);
            var hashSent = getUrlParameter('hashSent', decodedInformation);
            var description = getUrlParameter('description', decodedInformation);
            var renterAdd = getUrlParameter('renterAdd', decodedInformation);

            //Fill variables to view
            document.getElementById('itemName').value = itemName;
            document.getElementById('amount').value = amount;
            document.getElementById('advanceAmount').value = advanceAmount;
            document.getElementById('advanceTimeout').value = advanceTimeout;
            document.getElementById('rentedTime').value = rentTime;
            document.getElementById('itemHash').value = itemHash;
            document.getElementById('description').value = description;
            document.getElementById('renterAdd').value = renterAdd;
            document.getElementById('hashSent').value = hashSent;

            taskForm.style = "display: block;";
        });
    }; })(img);
    reader.readAsDataURL(file);
}

function decodeImageFromBase64(data, callback){
    // set callback
    qrcode.callback = callback;
    // Start decoding
    qrcode.decode(data)
}

function closeOpenQrPopup() {
    var popup = document.getElementById("qrpopup");
    popup.classList.toggle("show");
}