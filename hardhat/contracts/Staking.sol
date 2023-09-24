// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/// @title Test Matic Staking App
/// @notice A staking app that allows you to choose between 2 pools:
///     Fixed: the users locks their funds for 5 days to get 100% interest. If they withdraw early they will not earn the interest
///     Variable: the users deposits their funds to get a maximum of 50% interest over 5 days. Here they have the possibility to
///         withdraw early and receive the accrued interest quota

contract Staking {
    address public owner;

    /// @dev amount of $MATIC stacked by a specific address, at a period of time for some length
    struct Position {
        uint256 positionId;
        address walletAddress;
        uint256 createdDate;
        uint256 unlockDate;
        uint256 percentInterest;
        uint256 plegWeiStaked;
        uint256 plegInterest;
        bool open;
        bool flexible;
        uint256 earnedInterest;
    }

    Position position;

    uint256 public currentPositionId;
    uint256 public fixedStakingUnlockPeriod = 1 days;
    uint256 public _percentInterest = 10000;
    mapping(uint256 => Position) public positions;
    mapping(address => uint256[]) public positionIdsByAddress;
    mapping(bool => uint256) public interest;
    mapping(address => bool) public claimedFixed;
    mapping(address => bool) public claimedFlex;
    event StakeComplete();
    event WithdrawComplete();

    /// @dev constructor sets the interest rate for the flexible and fixed staking
    constructor() payable {
        owner = msg.sender;
        currentPositionId = 0;

        interest[true] = 5000;
        interest[false] = 10000;
    }

    // Function to receive Ether. msg.data must be empty
    receive() external payable {}

    // Fallback function is called when msg.data is not empty
    fallback() external payable {}

    function canClaimFixed(address claimer) public view returns (bool) {
        return !claimedFixed[claimer];
    }

    function canClaimFlex(address claimer) public view returns (bool) {
        return !claimedFlex[claimer];
    }

    /// @param _flexible to determine the type of staking pool you want to stake in
    function stakePleg(bool _flexible) external payable {
        if (_flexible == true) {
            require(canClaimFlex(msg.sender), "User can only stake flex once");
        }
        if (_flexible == false) {
            require(
                canClaimFixed(msg.sender),
                "User can only stake fixed once"
            );
        }

        positions[currentPositionId] = Position(
            currentPositionId,
            msg.sender,
            block.timestamp,
            block.timestamp + fixedStakingUnlockPeriod,
            interest[_flexible],
            60000000000000000, //msg.value = 0.06
            calculateInterest(interest[_flexible], 60000000000000000),
            true,
            _flexible,
            0
        );

        positionIdsByAddress[msg.sender].push(currentPositionId);
        currentPositionId++;
        if (_flexible == true) {
            claimedFlex[msg.sender] = true;
        }
        if (_flexible == false) {
            claimedFixed[msg.sender] = true;
        }

        emit StakeComplete();
    }

    function calculateInterest(uint256 basisPoints, uint256 plegWeiAmount)
        private
        pure
        returns (uint256)
    {
        return (basisPoints * plegWeiAmount) / 10000;
    }

    function getLockPeriod() external view returns (uint256) {
        return fixedStakingUnlockPeriod;
    }

    function getInterestRate() external view returns (uint256) {
        return _percentInterest;
    }

    function getPositionById(uint256 positionId)
        external
        view
        returns (Position memory)
    {
        return positions[positionId];
    }

    function getPositionIdsForAddress(address walletAddress)
        public
        view
        returns (uint256[] memory)
    {
        return positionIdsByAddress[walletAddress];
    }

    function allowStaking(address walletAddress) external {
        require(owner == msg.sender, "Only owner may modify unlock dates");

        claimedFixed[walletAddress] = false;
        claimedFlex[walletAddress] = false;
    }

    function changeUnlockDate(uint256 positionId, uint256 newUnlockDate)
        external
    {
        require(owner == msg.sender, "Only owner may modify unlock dates");

        positions[positionId].unlockDate = newUnlockDate;
    }

    function getBalance() public view returns (uint256) {
        return address(this).balance;
    }

    function tenMinutesHavePassed(uint256 stakingDate)
        public
        view
        returns (bool)
    {
        return (block.timestamp >= (stakingDate + 10 minutes));
    }

    ///@dev withdraw function
    function closePosition(uint256 positionId) external {
        require(
            positions[positionId].walletAddress == msg.sender,
            "Only position creator may modify position"
        );
        require(
            positions[positionId].open == true,
            "Position is already closed"
        );

        positions[positionId].open = false;

        if (positions[positionId].flexible) {
            uint256 quota = 1;
            uint256 interest_flexible = positions[positionId].plegInterest *
                quota;
            if (
                tenMinutesHavePassed(positions[positionId].createdDate) == false
            ) {
                interest_flexible = interest_flexible / 2;
            }

            uint256 amount = positions[positionId].plegWeiStaked +
                interest_flexible;
            payable(msg.sender).call{value: amount}("");
            positions[positionId].earnedInterest = interest_flexible;
        } else {
            if (
                tenMinutesHavePassed(positions[positionId].createdDate) == true
            ) {
                uint256 amount = positions[positionId].plegWeiStaked +
                    positions[positionId].plegInterest; // get all the interest
                payable(msg.sender).call{value: amount}("");
                positions[positionId].earnedInterest = positions[positionId]
                    .plegInterest;
            } else {
                payable(msg.sender).call{
                    value: positions[positionId].plegWeiStaked
                }("");
                positions[positionId].earnedInterest = 0;
            }
        }

        emit WithdrawComplete();
    }
}
