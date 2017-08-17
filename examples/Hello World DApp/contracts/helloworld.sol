pragma solidity ^0.4.0;

contract helloworld {
    
    address owner;
    
    function helloworld(){
        owner = msg.sender;
    }
    
    function kill(){
        if (msg.sender != owner){revert();}
        suicide(owner);
    }
    
    function SayHello() constant returns (string)
    {
        return "Hello World";
    }
}
