// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title SupplyChainContract
 * @dev Handles component registration, ownership tracking, and history recording
 */
contract SupplyChainContract {
    // Structs
    struct Component {
        uint256 id;
        string ipfsHash;    // IPFS hash for component details
        address creator;    // Original creator
        address owner;      // Current owner
        uint256 creationDate;
        bool isActive;
    }
    
    struct TrackingEvent {
        uint256 id;
        uint256 componentId;
        string eventType;   // e.g., "Created", "Transferred", "Modified"
        string ipfsHash;    // IPFS hash for event details
        address actor;      // Who performed the action
        uint256 timestamp;
    }
    
    // State Variables
    mapping(uint256 => Component) public components;
    mapping(uint256 => TrackingEvent[]) public componentEvents;
    
    uint256 private componentCounter = 0;
    uint256 private eventCounter = 0;
    
    // Events
    event ComponentRegistered(uint256 componentId, address creator, address owner);
    event ComponentTransferred(uint256 componentId, address from, address to);
    event TrackingEventAdded(uint256 eventId, uint256 componentId, string eventType, address actor);
    
    // Component Management Functions
    function registerComponent(string memory _ipfsHash) public returns (uint256) {
        componentCounter++;
        components[componentCounter] = Component(
            componentCounter,
            _ipfsHash,
            msg.sender,
            msg.sender,  // Initially, creator is also the owner
            block.timestamp,
            true
        );
        
        // Add initial creation event
        addTrackingEvent(componentCounter, "Created", _ipfsHash);
        
        emit ComponentRegistered(componentCounter, msg.sender, msg.sender);
        return componentCounter;
    }
    
    function transferOwnership(uint256 _componentId, address _newOwner) public {
        Component storage component = components[_componentId];
        
        require(component.id != 0, "Component does not exist");
        require(component.owner == msg.sender, "Only the owner can transfer ownership");
        require(component.isActive, "Component is not active");
        require(_newOwner != address(0), "New owner cannot be the zero address");
        require(_newOwner != msg.sender, "New owner cannot be the current owner");
        
        // Update ownership
        address oldOwner = component.owner;
        component.owner = _newOwner;
        
        // Add transfer event (use empty IPFS hash as default)
        addTrackingEvent(_componentId, "Transferred", "");
        
        emit ComponentTransferred(_componentId, oldOwner, _newOwner);
    }
    
    function deactivateComponent(uint256 _componentId) public {
        Component storage component = components[_componentId];
        
        require(component.id != 0, "Component does not exist");
        require(component.owner == msg.sender, "Only the owner can deactivate");
        require(component.isActive, "Component is already inactive");
        
        component.isActive = false;
        
        // Add deactivation event
        addTrackingEvent(_componentId, "Deactivated", "");
    }
    
    // Tracking Functions
    function addTrackingEvent(
        uint256 _componentId, 
        string memory _eventType, 
        string memory _ipfsHash
    ) public returns (uint256) {
        Component storage component = components[_componentId];
        require(component.id != 0, "Component does not exist");
        
        // For transfer and deactivation events, only the owner can add them
        if (
            keccak256(bytes(_eventType)) == keccak256(bytes("Transferred")) || 
            keccak256(bytes(_eventType)) == keccak256(bytes("Deactivated"))
        ) {
            require(component.owner == msg.sender, "Only the owner can add this event type");
        }
        
        eventCounter++;
        
        TrackingEvent memory newEvent = TrackingEvent(
            eventCounter,
            _componentId,
            _eventType,
            _ipfsHash,
            msg.sender,
            block.timestamp
        );
        
        componentEvents[_componentId].push(newEvent);
        
        emit TrackingEventAdded(eventCounter, _componentId, _eventType, msg.sender);
        return eventCounter;
    }
    
    // View Functions
    function getComponent(uint256 _componentId) public view returns (
        uint256 id,
        string memory ipfsHash,
        address creator,
        address owner,
        uint256 creationDate,
        bool isActive
    ) {
        Component memory component = components[_componentId];
        require(component.id != 0, "Component does not exist");
        
        return (
            component.id,
            component.ipfsHash,
            component.creator,
            component.owner,
            component.creationDate,
            component.isActive
        );
    }
    
    function getComponentEventCount(uint256 _componentId) public view returns (uint256) {
        require(components[_componentId].id != 0, "Component does not exist");
        return componentEvents[_componentId].length;
    }
    
    function getComponentEvent(uint256 _componentId, uint256 _eventIndex) public view returns (
        uint256 id,
        string memory eventType,
        string memory ipfsHash,
        address actor,
        uint256 timestamp
    ) {
        require(components[_componentId].id != 0, "Component does not exist");
        require(_eventIndex < componentEvents[_componentId].length, "Event index out of bounds");
        
        TrackingEvent memory event_ = componentEvents[_componentId][_eventIndex];
        
        return (
            event_.id,
            event_.eventType,
            event_.ipfsHash,
            event_.actor,
            event_.timestamp
        );
    }
    
    // Get full history of a component
    function getComponentHistory(uint256 _componentId) public view returns (
        uint256[] memory ids,
        string[] memory eventTypes,
        address[] memory actors,
        uint256[] memory timestamps
    ) {
        require(components[_componentId].id != 0, "Component does not exist");
        
        uint256 eventCount = componentEvents[_componentId].length;
        
        ids = new uint256[](eventCount);
        eventTypes = new string[](eventCount);
        actors = new address[](eventCount);
        timestamps = new uint256[](eventCount);
        
        for (uint256 i = 0; i < eventCount; i++) {
            TrackingEvent memory event_ = componentEvents[_componentId][i];
            ids[i] = event_.id;
            eventTypes[i] = event_.eventType;
            actors[i] = event_.actor;
            timestamps[i] = event_.timestamp;
        }
        
        return (ids, eventTypes, actors, timestamps);
    }
    
    // Check if address is the owner of a component
    function isComponentOwner(uint256 _componentId, address _address) public view returns (bool) {
        return components[_componentId].owner == _address;
    }
}