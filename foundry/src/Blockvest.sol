// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

contract Blockvest {
    struct Project {
        uint256 id;
        address owner;
        string name;
        string details;
        uint256 target; // e.g. total investment ask in wei
        uint256 equity; // e.g. total equity% times 100 for easier math (10% => 10, 1% => 1)
        uint256 totalInvested;
        bool isClosed;
        mapping(address => uint256) investors; // maps investor => amount invested
    }

    // We'll keep projects in a mapping by ID, plus a counter for IDs
    mapping(uint256 => Project) public projects;
    uint256 public projectCount;

    // For easy iteration if needed
    uint256[] public projectIds;

    // Create a project
    function createProject(
        string memory _name,
        string memory _details,
        uint256 _target,
        uint256 _equity
    ) external {
        require(_equity <= 10000, "Equity cannot exceed 100%");
        require(_target > 0, "Target must be positive");
        projectCount++;
        uint256 newId = projectCount;

        // Initialize the project
        Project storage p = projects[newId];
        p.id = newId;
        p.owner = msg.sender;
        p.name = _name;
        p.details = _details;
        p.target = _target;
        p.equity = _equity;
        p.totalInvested = 0;
        p.isClosed = false;

        // Keep track of project IDs
        projectIds.push(newId);
    }

    // Invest in a project
    function investInProject(uint256 _projectId) external payable {
        Project storage p = projects[_projectId];

        require(!p.isClosed, "Project already closed");
        require(msg.value > 0, "Investment must be > 0");
        require(p.totalInvested + msg.value <= p.target, "Exceeds target");

        p.investors[msg.sender] += msg.value;
        p.totalInvested += msg.value;

        // If project is fully funded
        if (p.totalInvested == p.target) {
            p.isClosed = true;
        }
    }

    // Helper to fetch project data
    function getProject(
        uint256 _projectId
    )
        external
        view
        returns (
            uint256 id,
            address owner,
            string memory name,
            string memory details,
            uint256 target,
            uint256 equity,
            uint256 totalInvested,
            bool isClosed
        )
    {
        Project storage p = projects[_projectId];
        return (
            p.id,
            p.owner,
            p.name,
            p.details,
            p.target,
            p.equity,
            p.totalInvested,
            p.isClosed
        );
    }
    function getAllProjectIds() external view returns (uint256[] memory) {
        return projectIds;
    }

    // Get how much a particular user has invested
    function getInvestorAmount(
        uint256 _projectId,
        address _investor
    ) external view returns (uint256) {
        Project storage p = projects[_projectId];
        return p.investors[_investor];
    }

    // A simple withdraw function for the owner (once closed)
    function withdrawFunds(uint256 _projectId) external {
        Project storage p = projects[_projectId];
        require(p.isClosed, "Project not closed");
        require(p.owner == msg.sender, "Not project owner");
        uint256 amount = p.totalInvested;
        p.totalInvested = 0;
        (bool success, ) = payable(msg.sender).call{value: amount}("");
        require(success, "Withdraw failed");
    }
}
