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
var itemName = document.getElementById('itemName');
var amount = document.getElementById('amount');
var advanceAmount = document.getElementById('advanceAmount');
var advanceTimeout = document.getElementById('advanceTimeout');
var description = document.getElementById('description');

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
    var DBOpenRequest = window.indexedDB.open(itemsForRentTableName, 100);

    // Gecko-only IndexedDB temp storage option:
    // var request = window.indexedDB.open("toDoList", {version: 4, storage: "temporary"});

    // these two event handlers act on the database being opened successfully, or not
    DBOpenRequest.onerror = function(event) {
        note.innerHTML += '<li>Error loading database.</li>';
    };

    DBOpenRequest.onsuccess = function(event) {
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
    DBOpenRequest.onupgradeneeded = function(event) {
        var db = event.target.result;

        db.onerror = function(event) {
            note.innerHTML += '<li>Error loading database.</li>';
        };

        // Create an objectStore for this database

        var objectStore = db.createObjectStore(itemsForRentTableName, { keyPath: "id", autoIncrement:true });

        // define what data items the objectStore will contain
        objectStore.createIndex("itemName", "itemName", { unique: false });
        objectStore.createIndex("amount", "amount", { unique: false });
        objectStore.createIndex("advanceAmount", "advanceAmount", { unique: false });
        objectStore.createIndex("advanceTimeout", "advanceTimeout", { unique: false });
        objectStore.createIndex("description", "description", { unique: false });
        objectStore.createIndex("id", "id", { unique: true });

        note.innerHTML += '<li>Object store created.</li>';
    };

    function displayData() {
        // first clear the content of the task list so that you don't get a huge long list of duplicate stuff each time
        //the display is updated.
        taskList.innerHTML = "";

        // Open our object store and then get a cursor list of all the different data items in the IDB to iterate through
        var objectStore = db.transaction(itemsForRentTableName).objectStore(itemsForRentTableName);
        objectStore.openCursor().onsuccess = function(event) {
            var cursor = event.target.result;
            // if there is still another cursor to go, keep runing this code
            if(cursor) {
                // create a list item to put each data item inside when displaying it
                var listItem = document.createElement('li');

                // build the rented item list entry and put it into the list item via innerHTML.
                listItem.innerHTML = cursor.value.itemName + " - for " + cursor.value.amount + "(WEI) with " + cursor.value.advanceAmount + "(WEI) as advance that will expire after " + cursor.value.advanceTimeout + "h";
                listItem.className = "list-group-item";
                // if(cursor.value.notified == "yes") {
                //     listItem.style.textDecoration = "line-through";
                //     listItem.style.color = "rgba(255,0,0,0.5)";
                // }

                // put the item item inside the task list
                taskList.appendChild(listItem);

                // create a delete button inside each list item, giving it an event handler so that it runs the deleteButton()
                // function when clicked
                var deleteButton = document.createElement('button');
                listItem.appendChild(deleteButton);
                deleteButton.innerHTML = 'Remove';
                deleteButton.className = 'btn btn-danger';
                deleteButton.style = 'float:right;';
                // here we are setting a data attribute on our delete button to say what task we want deleted if it is clicked!
                deleteButton.setAttribute('data-task', cursor.value.itemName);
                deleteButton.onclick = function(event) {
                    deleteItem(event);
                };

                var startRentalButton = document.createElement('button');
                listItem.appendChild(startRentalButton);
                startRentalButton.innerHTML = 'Start Rental';
                startRentalButton.className = 'btn btn-success';
                startRentalButton.style = 'float:right;margin-right: 5px;';
                // here we are setting a data attribute on our delete button to say what task we want deleted if it is clicked!
                startRentalButton.setAttribute('data-task', cursor.value.itemName);
                startRentalButton.setAttribute('data-amount', cursor.value.amount);
                startRentalButton.setAttribute('data-advanceAmount', cursor.value.advanceAmount);
                startRentalButton.setAttribute('data-advanceTimeout', cursor.value.advanceTimeout);
                startRentalButton.setAttribute('data-description', cursor.value.description);
                startRentalButton.onclick = function(event) {
                    startRental(event);
                };

                // continue on to the next item in the cursor
                cursor.continue();

                // if there are no more cursor items to iterate through, say so, and exit the function
            } else {
                note.innerHTML += '<li>Entries all displayed.</li>';
            }
        }
    }

    // give the form submit button an event listener so that when the form is submitted the addData() function is run
    taskForm.addEventListener('submit',addData,false);

    function addData(e) {
        // prevent default - we don't want the form to submit in the conventional way
        e.preventDefault();

        // Stop the form submitting if any values are left empty. This is just for browsers that don't support the HTML5 form
        // required attributes
        if(itemName.value == '' || advanceAmount.value == '' || amount.value == '' || advanceTimeout.value == '' || description.value == '') {
            note.innerHTML += '<li>Data not submitted — form incomplete.</li>';
            return;
        } else {

            // grab the values entered into the form fields and store them in an object ready for being inserted into the IDB
            var newItem = [
                { itemName: itemName.value, amount: amount.value, advanceAmount: advanceAmount.value, advanceTimeout: advanceTimeout.value, description: description.value }
            ];

            // open a read/write db transaction, ready for adding the data
            var transaction = db.transaction([itemsForRentTableName], "readwrite");

            // report on the success of the transaction completing, when everything is done
            transaction.oncomplete = function() {
                note.innerHTML += '<li>Transaction completed: database modification finished.</li>';

                // update the display of data to show the newly added item, by running displayData() again.
                displayData();
            };

            transaction.onerror = function() {
                note.innerHTML += '<li>Transaction not opened due to error: ' + transaction.error + '</li>';
            };

            // call an object store that's already been added to the database
            var objectStore = transaction.objectStore(itemsForRentTableName);
            console.log(objectStore.indexNames);
            console.log(objectStore.keyPath);
            console.log(objectStore.itemName);
            console.log(objectStore.transaction);
            console.log(objectStore.autoIncrement);

            console.log("itemName: ", newItem[0].itemName);
            // Make a request to add our newItem object to the object store
            var objectStoreRequest = objectStore.add(newItem[0]);
            objectStoreRequest.onsuccess = function(event) {

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

    };

    function deleteItem(event) {
        // retrieve the name of the task we want to delete
        var dataTask = event.target.getAttribute('data-task');

        // open a database transaction and delete the task, finding it by the name we retrieved above
        var transaction = db.transaction([itemsForRentTableName], "readwrite");
        var request = transaction.objectStore(itemsForRentTableName).delete(dataTask);

        // report that the data item has been deleted
        transaction.oncomplete = function() {
            // delete the parent of the button, which is the list item, so it no longer is displayed
            event.target.parentNode.parentNode.removeChild(event.target.parentNode);
            note.innerHTML += '<li>Item \"' + dataTask + '\" deleted.</li>';
        };
    };

    function startRental(event) {
        var itemName =  event.target.getAttribute("data-task");
        var amount =  event.target.getAttribute("data-amount");
        var advanceAmount =  event.target.getAttribute("data-advanceAmount");
        var advanceTimeout =  event.target.getAttribute("data-advanceTimeout");
        var description =  event.target.getAttribute("data-description");
        var itemHash = guid();
        var rentTime = new Date().toLocaleTimeString();
        var hashUser = sha256(itemName + amount + advanceAmount + advanceTimeout + itemHash + rentTime);

        // grab the values entered into the form fields and store them in an object ready for being inserted into the IDB
        var newItem = [
            { itemName: itemName, amount: amount, advanceAmount: advanceAmount, advanceTimeout: advanceTimeout, description: description,
                rentedTime: rentTime, itemHash: itemHash, hash: hashUser, returned: false, renter: true}
        ];
        db.close();
        // Let us open our database
        var DBOpenRequest = window.indexedDB.open(rentedItemsTableName, 100);

        // Gecko-only IndexedDB temp storage option:
        // var request = window.indexedDB.open("toDoList", {version: 4, storage: "temporary"});

        // these two event handlers act on the database being opened successfully, or not
        DBOpenRequest.onerror = function(event) {
            note.innerHTML += '<li>Error loading database.</li>';
        };

        DBOpenRequest.onsuccess = function(event) {
            note.innerHTML += '<li>Database initialised.</li>';

            // store the result of opening the database in the db variable. This is used a lot below
            var rentDb = DBOpenRequest.result;

            // open a read/write db transaction, ready for adding the data
            var transaction = rentDb.transaction([rentedItemsTableName], "readwrite");

            // report on the success of the transaction completing, when everything is done
            transaction.oncomplete = function() {
                note.innerHTML += '<li>Transaction completed: database modification finished.</li>';

                // update the display of data to show the newly added item, by running displayData() again.
                displayData();
            };

            transaction.onerror = function() {
                note.innerHTML += '<li>Transaction not opened due to error: ' + transaction.error + '</li>';
            };

            // call an object store that's already been added to the database
            var objectStore = transaction.objectStore(rentedItemsTableName);
            console.log(objectStore.indexNames);
            console.log(objectStore.keyPath);
            console.log(objectStore.itemName);
            console.log(objectStore.transaction);
            console.log(objectStore.autoIncrement);

            console.log("itemName: ", newItem[0].itemName, itemName);
            // Make a request to add our newItem object to the object store
            var objectStoreRequest = objectStore.add(newItem[0]);
            objectStoreRequest.onsuccess = function(event) {

                // report the success of our request
                // (to detect whether it has been succesfully
                // added to the database, you'd look at transaction.oncomplete)
                note.innerHTML += '<li>Request successful.</li>';

            };

            window.location.href = '/rented-items-list.html';
        };
    }
};

function guid() {
    function s4() {
        return Math.floor((1 + Math.random()) * 0x10000)
            .toString(16)
            .substring(1);
    }
    return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
        s4() + '-' + s4() + s4() + s4();
}