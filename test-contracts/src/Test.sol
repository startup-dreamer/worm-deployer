// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Test {
    string public name;
    uint256 public age;

    // State variables initialized directly
    constructor() {
        name = "Default Name";
        age = 0;
    }

    // A function to set the name
    function setName(string memory _name) public {
        name = _name;
    }

    // A function to set the age
    function setAge(uint256 _age) public {
        age = _age;
    }
}
