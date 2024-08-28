// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract TestConstructor {
    string public name;
    uint256 public age;

    // Constructor that takes two arguments
    constructor(string memory _name, uint256 _age) {
        name = _name;
        age = _age;
    }

    // A function to update the age
    function updateAge(uint256 _newAge) public {
        age = _newAge;
    }
}
