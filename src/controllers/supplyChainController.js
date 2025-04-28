const Component = require('../models/Component');
const { executeContract } = require('../utils/hederaClient');
const { uploadToIPFS } = require('../utils/ipfsClient');

// Register a new component
exports.registerComponent = async (req, res) => {
  try {
    const { name, description, type, image } = req.body;
    
    // Upload image to IPFS if provided
    let ipfsHash = '';
    if (image) {
      ipfsHash = await uploadToIPFS(image);
    }
    
    // Create component on blockchain
    const result = await executeContract(
      process.env.SUPPLY_CHAIN_CONTRACT_ADDRESS,
      'registerComponent',
      [ipfsHash]
    );
    
    // Get component ID from blockchain result
    const componentId = result.componentId;
    
    // Create component in database
    const component = new Component({
      componentId,
      name,
      description,
      type,
      creator: req.user.walletAddress,
      owner: req.user.walletAddress, // Initially, creator is also the owner
      ipfsHash,
      isActive: true,
      createdAt: new Date(),
      trackingEvents: [{
        eventType: 'Created',
        actor: req.user.walletAddress,
        timestamp: new Date(),
        notes: 'Component registered'
      }]
    });
    
    await component.save();
    
    res.status(201).json({
      message: 'Component registered successfully',
      component: {
        componentId,
        name,
        type,
        ipfsHash
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to register component' });
  }
};

// Transfer component ownership
exports.transferOwnership = async (req, res) => {
  try {
    const { componentId } = req.params;
    const { newOwner } = req.body;
    
    // Validate input
    if (!newOwner) {
      return res.status(400).json({ message: 'New owner address is required' });
    }
    
    // Find component in database
    const component = await Component.findOne({ componentId });
    
    if (!component) {
      return res.status(404).json({ message: 'Component not found' });
    }
    
    // Check if requester is the current owner
    if (component.owner !== req.user.walletAddress) {
      return res.status(403).json({ message: 'Only the owner can transfer ownership' });
    }
    
    // Transfer ownership on blockchain
    await executeContract(
      process.env.SUPPLY_CHAIN_CONTRACT_ADDRESS,
      'transferOwnership',
      [componentId, newOwner]
    );
    
    // Update component in database
    const oldOwner = component.owner;
    component.owner = newOwner;
    
    // Add transfer event
    component.trackingEvents.push({
      eventType: 'Transferred',
      actor: req.user.walletAddress,
      timestamp: new Date(),
      notes: `Ownership transferred from ${oldOwner} to ${newOwner}`
    });
    
    await component.save();
    
    res.json({
      message: 'Ownership transferred successfully',
      component: {
        componentId,
        newOwner
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to transfer ownership' });
  }
};

// Add tracking event
exports.addTrackingEvent = async (req, res) => {
  try {
    const { componentId } = req.params;
    const { eventType, notes } = req.body;
    
    // Validate input
    if (!eventType) {
      return res.status(400).json({ message: 'Event type is required' });
    }
    
    // Find component in database
    const component = await Component.findOne({ componentId });
    
    if (!component) {
      return res.status(404).json({ message: 'Component not found' });
    }
    
    // Check if this is a special event type that requires ownership
    const restrictedEvents = ['Transferred', 'Deactivated'];
    if (restrictedEvents.includes(eventType) && component.owner !== req.user.walletAddress) {
      return res.status(403).json({ message: `Only the owner can add ${eventType} events` });
    }
    
    // Add event on blockchain
    await executeContract(
      process.env.SUPPLY_CHAIN_CONTRACT_ADDRESS,
      'addTrackingEvent',
      [componentId, eventType, ''] // No IPFS hash for simplicity
    );
    
    // Add event to component history
    component.trackingEvents.push({
      eventType,
      actor: req.user.walletAddress,
      timestamp: new Date(),
      notes: notes || ''
    });
    
    await component.save();
    
    res.json({
      message: 'Tracking event added successfully',
      event: {
        componentId,
        eventType,
        timestamp: new Date()
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to add tracking event' });
  }
};

// Get component by ID
exports.getComponent = async (req, res) => {
  try {
    const { componentId } = req.params;
    
    // Find component in database
    const component = await Component.findOne({ componentId });
    
    if (!component) {
      return res.status(404).json({ message: 'Component not found' });
    }
    
    res.json({ component });
  } catch (error) {
    res.status(500).json({ message: 'Failed to get component' });
  }
};

// Get component history
exports.getComponentHistory = async (req, res) => {
  try {
    const { componentId } = req.params;
    
    // Find component in database
    const component = await Component.findOne({ componentId });
    
    if (!component) {
      return res.status(404).json({ message: 'Component not found' });
    }
    
    // Return tracking events
    res.json({ 
      componentId,
      name: component.name,
      history: component.trackingEvents 
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to get component history' });
  }
};

// Search components
exports.searchComponents = async (req, res) => {
  try {
    const { query, type } = req.query;
    
    // Build search filter
    const filter = {};
    
    if (query) {
      // Search in name or description
      filter.$or = [
        { name: { $regex: query, $options: 'i' } },
        { description: { $regex: query, $options: 'i' } }
      ];
    }
    
    if (type) {
      filter.type = type;
    }
    
    // Find components matching search criteria
    const components = await Component.find(filter);
    
    res.json({ components });
  } catch (error) {
    res.status(500).json({ message: 'Search failed' });
  }
};