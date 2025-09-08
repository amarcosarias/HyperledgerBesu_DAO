// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract DAO {
    struct Proposal {
        string description;
        string[] options;
        mapping(address => bool) voters;
        mapping(uint => uint) votesPerOption;
        bool executed;
        string winningOption;
        uint winningVotes;
    }

    address public chairperson;
    Proposal[] public proposals;
    mapping(address => bool) public members;
    address[] public memberList;

    modifier onlyChairperson() {
        require(msg.sender == chairperson, "Solo el chairperson");
        _;
    }

    modifier onlyMembers() {
        require(members[msg.sender], "Solo miembros pueden participar");
        _;
    }

    constructor(address[] memory initialMembers) {
        chairperson = msg.sender;

        for (uint i = 0; i < initialMembers.length; i++) {
            address member = initialMembers[i];
            if (!members[member]) {
                members[member] = true;
                memberList.push(member);
            }
        }

        if (!members[chairperson]) {
            members[chairperson] = true;
            memberList.push(chairperson);
        }
    }

    function addMember(address newMember) public onlyChairperson {
        if (!members[newMember]) {
            members[newMember] = true;
            memberList.push(newMember);
        }
    }

    function removeMember(address memberToRemove) public onlyChairperson {
        require(members[memberToRemove], "La direccion no es un miembro");
        require(memberToRemove != chairperson, "No se puede eliminar al chairperson");

        members[memberToRemove] = false;

        for (uint i = 0; i < memberList.length; i++) {
            if (memberList[i] == memberToRemove) {
                memberList[i] = memberList[memberList.length - 1];
                memberList.pop();
                break;
            }
        }
    }

    function createProposal(string memory description, string[] memory options) public onlyMembers {
        require(options.length >= 2, "Debe haber al menos dos opciones");

        Proposal storage newProp = proposals.push();
        newProp.description = description;
        newProp.executed = false;

        for (uint i = 0; i < options.length; i++) {
            newProp.options.push(options[i]);
        }
    }

    function vote(uint proposalIndex, uint optionIndex) public onlyMembers {
        Proposal storage proposal = proposals[proposalIndex];

        require(!proposal.voters[msg.sender], "Ya votaste");
        require(!proposal.executed, "Propuesta ya ejecutada");
        require(optionIndex < proposal.options.length, "Opcion invalida");

        proposal.voters[msg.sender] = true;
        proposal.votesPerOption[optionIndex]++;
    }

    function executeProposal(uint proposalIndex) public onlyChairperson {
        Proposal storage proposal = proposals[proposalIndex];
        require(!proposal.executed, "Propuesta ya ejecutada");

        uint totalVotes = 0;
        for (uint i = 0; i < proposal.options.length; i++) {
            totalVotes += proposal.votesPerOption[i];
        }

        require(totalVotes > (countMembers() / 2), "No hay mayoria");

        uint winningVotes = 0;
        uint winningIndex = 0;

        for (uint i = 0; i < proposal.options.length; i++) {
            if (proposal.votesPerOption[i] > winningVotes) {
                winningVotes = proposal.votesPerOption[i];
                winningIndex = i;
            }
        }

        proposal.winningOption = proposal.options[winningIndex];
        proposal.winningVotes = winningVotes;
        proposal.executed = true;
    }

    function getProposal(uint index) public view returns (
        string memory description,
        string[] memory options,
        uint[] memory voteCounts,
        bool executed,
        bool hasVoted,
        string memory winningOption,
        uint winningVotes
    ) {
        Proposal storage p = proposals[index];
        uint[] memory counts = new uint[](p.options.length);

        for (uint i = 0; i < p.options.length; i++) {
            counts[i] = p.votesPerOption[i];
        }

        return (
            p.description,
            p.options,
            counts,
            p.executed,
            p.voters[msg.sender],
            p.winningOption,
            p.winningVotes
        );
    }

    function countMembers() public view returns (uint) {
        return memberList.length;
    }

    function getProposalsCount() public view returns (uint) {
        return proposals.length;
    }

    function isMember(address user) public view returns (bool) {
        return members[user];
    }
}