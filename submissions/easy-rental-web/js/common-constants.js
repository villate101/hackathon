var g_easyRentalAddress = "0xf4a791de3bf8c7082c89e80199bce45f05c9b596";

function getEasyRentalAbiArray() {
    return [
        {
            "constant": false,
            "inputs": [
                {
                    "name": "renterAdd",
                    "type": "address"
                },
                {
                    "name": "clientAdd",
                    "type": "address"
                },
                {
                    "name": "advanceAmount",
                    "type": "uint256"
                },
                {
                    "name": "rentAmount",
                    "type": "uint256"
                },
                {
                    "name": "itemHash",
                    "type": "bytes"
                },
                {
                    "name": "advanceTimeoutHours",
                    "type": "int256"
                }
            ],
            "name": "createRentedItem",
            "outputs": [],
            "payable": true,
            "type": "function"
        },
        {
            "constant": true,
            "inputs": [
                {
                    "name": "itemHash",
                    "type": "bytes"
                }
            ],
            "name": "checkIfIsOver",
            "outputs": [
                {
                    "name": "",
                    "type": "bool"
                }
            ],
            "payable": false,
            "type": "function"
        },
        {
            "constant": true,
            "inputs": [
                {
                    "name": "itemHash",
                    "type": "bytes"
                }
            ],
            "name": "checkIfIsLive",
            "outputs": [
                {
                    "name": "",
                    "type": "bool"
                }
            ],
            "payable": false,
            "type": "function"
        },
        {
            "constant": true,
            "inputs": [
                {
                    "name": "itemHash",
                    "type": "bytes"
                }
            ],
            "name": "getShelvedItemInfo",
            "outputs": [
                {
                    "name": "",
                    "type": "int256"
                },
                {
                    "name": "",
                    "type": "int256"
                },
                {
                    "name": "",
                    "type": "bool"
                },
                {
                    "name": "",
                    "type": "bool"
                },
                {
                    "name": "",
                    "type": "bool"
                },
                {
                    "name": "",
                    "type": "bool"
                },
                {
                    "name": "",
                    "type": "bool"
                }
            ],
            "payable": false,
            "type": "function"
        },
        {
            "constant": false,
            "inputs": [
                {
                    "name": "itemHash",
                    "type": "bytes"
                }
            ],
            "name": "confirmItemReturn",
            "outputs": [],
            "payable": true,
            "type": "function"
        },
        {
            "constant": true,
            "inputs": [],
            "name": "countRentedItems",
            "outputs": [
                {
                    "name": "count",
                    "type": "uint256"
                }
            ],
            "payable": false,
            "type": "function"
        },
        {
            "constant": true,
            "inputs": [
                {
                    "name": "itemHash",
                    "type": "bytes"
                }
            ],
            "name": "itemExists",
            "outputs": [
                {
                    "name": "",
                    "type": "bool"
                }
            ],
            "payable": false,
            "type": "function"
        },
        {
            "anonymous": false,
            "inputs": [
                {
                    "indexed": false,
                    "name": "renterAdd",
                    "type": "address"
                },
                {
                    "indexed": false,
                    "name": "clientAdd",
                    "type": "address"
                },
                {
                    "indexed": false,
                    "name": "advanceAmount",
                    "type": "uint256"
                },
                {
                    "indexed": false,
                    "name": "rentAmount",
                    "type": "uint256"
                },
                {
                    "indexed": false,
                    "name": "itemHash",
                    "type": "bytes"
                },
                {
                    "indexed": false,
                    "name": "advanceTimeoutHours",
                    "type": "int256"
                }
            ],
            "name": "LogInit",
            "type": "event"
        },
        {
            "anonymous": false,
            "inputs": [
                {
                    "indexed": false,
                    "name": "itemHash",
                    "type": "bytes"
                }
            ],
            "name": "LogEventCreatedWithItemHash",
            "type": "event"
        },
        {
            "anonymous": false,
            "inputs": [],
            "name": "LogSenderDoesParticipate",
            "type": "event"
        },
        {
            "anonymous": false,
            "inputs": [
                {
                    "indexed": false,
                    "name": "party",
                    "type": "string"
                }
            ],
            "name": "LogSenderConfirmedReturn",
            "type": "event"
        },
        {
            "anonymous": false,
            "inputs": [
                {
                    "indexed": false,
                    "name": "leftside",
                    "type": "uint256"
                },
                {
                    "indexed": false,
                    "name": "rightside",
                    "type": "uint256"
                }
            ],
            "name": "LogAdvanceTimeoutElapsedAdvanceRefunded",
            "type": "event"
        },
        {
            "anonymous": false,
            "inputs": [
                {
                    "indexed": false,
                    "name": "itemHash",
                    "type": "bytes"
                }
            ],
            "name": "LogItemAlreadyExistsAborting",
            "type": "event"
        },
        {
            "anonymous": false,
            "inputs": [
                {
                    "indexed": false,
                    "name": "count",
                    "type": "uint256"
                }
            ],
            "name": "LogItemCount",
            "type": "event"
        },
        {
            "anonymous": false,
            "inputs": [
                {
                    "indexed": false,
                    "name": "amount",
                    "type": "uint256"
                },
                {
                    "indexed": false,
                    "name": "renterAddress",
                    "type": "address"
                }
            ],
            "name": "LogRentAmountTransferred",
            "type": "event"
        },
        {
            "anonymous": false,
            "inputs": [
                {
                    "indexed": false,
                    "name": "balance",
                    "type": "uint256"
                }
            ],
            "name": "LogContractBalance",
            "type": "event"
        }
    ]
}