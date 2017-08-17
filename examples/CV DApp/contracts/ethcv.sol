pragma solidity ^0.4.0;
import "./structures.sol";

contract EthCV {
    
    address owner;
    mapping (string => string) basic_data;
    Structures.Project[] public projects;
    Structures.Education[] public educations;
    Structures.Skill[] public skills;
    Structures.Publication[] public publications;
    
    modifier onlyOwner() {
        if (msg.sender != owner) {revert();}
        
        _;
    }
    
    function EthCV(){
        owner = msg.sender;
        basic_data['name'] = 'Author';
        basic_data['twitter'] = 'twitter_link';
        basic_data['github'] = 'github_link';
        basic_data['email'] = 'author@author.org';
        projects.push(Structures.Project('Project name 1', 'link', 'Project description'));
        projects.push(Structures.Project('Project name 2', 'link', 'Project description'));
        educations.push(Structures.Education('University name', 'Computer science', 2007, 2013));
        skills.push(Structures.Skill('Java', 9));
        skills.push(Structures.Skill('Php', 7));
        skills.push(Structures.Skill('JavaScript', 7));
        publications.push(Structures.Publication('Publication name', 'publication link', 'english'));
    }
    
    function kill(){
        if (msg.sender == owner) suicide(owner);
    }
    
    function getBasicData (string arg) constant returns (string) {
        return basic_data[arg];
    }
    
    function setBasicData (string key, string value) onlyOwner() {
        basic_data[key] = value;
    }
    
    function getSize (string arg) constant returns (uint){
        if (sha3(arg) == sha3("projects"))      { return projects.length; }
        if (sha3(arg) == sha3("educations"))    { return educations.length; }
        if (sha3(arg) == sha3("publications"))  { return publications.length; }
        if (sha3(arg) == sha3("skills"))        { return skills.length; }
        revert();
    }
    
    function editProject(bool operation, string name, string link, string description) onlyOwner(){
        if (operation){
            projects.push(Structures.Project(name, link, description));
        } else {
            delete projects[projects.length - 1];
        }
    }
    
    function editSkill(bool operation, string name, int32 level) onlyOwner(){
        if (operation){
            skills.push(Structures.Skill(name, level));
        } else {
            delete skills[skills.length - 1];
        }
    }
    
    function editEducation(bool operation, string name, string speciality, int32 start, int32 finish) onlyOwner(){
        if (operation){
            educations.push(Structures.Education(name, speciality, start, finish));
        } else {
            delete educations[educations.length - 1];
        }
    }
    
    function editPublication (bool operation, string name, string link, string language) onlyOwner() {
    if (operation) {
        publications.push(Structures.Publication(name, link, language));
    } else {
        delete publications[publications.length - 1];
    }
}
    
}