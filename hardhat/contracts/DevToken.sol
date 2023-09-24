// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract DevToken is ERC20 {
    event IssueTokenComplete();

    constructor() ERC20("TokenSaga", "TKNSAGA") {}

    //function issueToken(address receiver, uint256 amount) public {
    function issueToken(address receiver) public {
        _mint(receiver, 5 * 10 ** 18);
        emit IssueTokenComplete();
    }
}
