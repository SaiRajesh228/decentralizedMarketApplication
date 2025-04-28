import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import apiService from '../services/apiService';
import { useAuth } from '../hooks/useAuth';

const ComponentDetailPage = () => {
  const { componentId } = useParams();
  const { currentUser, isAuthenticated } = useAuth();
  const [component, setComponent] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showTransferForm, setShowTransferForm] = useState(false);
  const [showEventForm, setShowEventForm] = useState(false);
  const [newOwner, setNewOwner] = useState('');
  const [eventData, setEventData] = useState({
    eventType: '',
    notes: ''
  });
  
  // Fetch component details and history
  useEffect(() => {
    const fetchComponentData = async () => {
      setLoading(true);
      try {
        // Get component details
        const componentResponse = await apiService.getComponent(componentId);
        setComponent(componentResponse.data.component);
        
        // Get component history
        const historyResponse = await apiService.getComponentHistory(componentId);
        setHistory(historyResponse.data.history);
      } catch (error) {
        console.error('Error fetching component data:', error);
        toast.error('Failed to load component details');
      } finally {
        setLoading(false);
      }
    };
    
    fetchComponentData();
  }, [componentId]);
  
  // Handle transfer ownership
  const handleTransferOwnership = async (e) => {
    e.preventDefault();
    
    if (!newOwner) {
      toast.error('New owner address is required');
      return;
    }
    
    try {
      await apiService.transferOwnership(componentId, { newOwner });
      
      // Update component in state
      setComponent({
        ...component,
        owner: newOwner
      });
      
      // Add transfer event to history
      const newEvent = {
        eventType: 'Transferred',
        actor: currentUser.walletAddress,
        timestamp: new Date(),
        notes: `Ownership transferred to ${newOwner}`
      };
      
      setHistory([newEvent, ...history]);
      setShowTransferForm(false);
      setNewOwner('');
      toast.success('Ownership transferred successfully');
    } catch (error) {
      console.error('Error transferring ownership:', error);
      toast.error(error.response?.data?.message || 'Failed to transfer ownership');
    }
  };
  
  // Handle adding tracking event
  const handleAddEvent = async (e) => {
    e.preventDefault();
    
    if (!eventData.eventType) {
      toast.error('Event type is required');
      return;
    }
    
    try {
      await apiService.addTrackingEvent(componentId, eventData);
      
      // Add new event to history
      const newEvent = {
        eventType: eventData.eventType,
        actor: currentUser.walletAddress,
        timestamp: new Date(),
        notes: eventData.notes
      };
      
      setHistory([newEvent, ...history]);
      setShowEventForm(false);
      setEventData({
        eventType: '',
        notes: ''
      });
      toast.success('Event added successfully');
    } catch (error) {
      console.error('Error adding event:', error);
      toast.error(error.response?.data?.message || 'Failed to add event');
    }
  };
  
  // Sample event types
  const eventTypes = [
    'Inspected',
    'Modified',
    'Packaged',
    'Shipped',
    'Received',
    'Installed',
    'Serviced',
    'Returned'
  ];
  
  if (loading) {
    return <div className="flex justify-center py-12">Loading component details...</div>;
  }
  
  if (!component) {
    return <div className="text-center py-12 text-gray-500">Component not found</div>;
  }
  
  const isOwner = isAuthenticated && currentUser.walletAddress === component.owner;
  
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h1 className="text-2xl font-bold mb-6">{component.name}</h1>
      
      {/* Component Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div>
          <h2 className="text-lg font-semibold mb-3">Component Details</h2>
          <div className="bg-gray-50 p-4 rounded">
            <p className="mb-2">
              <span className="font-medium">ID:</span> {component.componentId}
            </p>
            <p className="mb-2">
              <span className="font-medium">Type:</span> {component.type}
            </p>
            <p className="mb-2">
              <span className="font-medium">Created:</span> {new Date(component.createdAt).toLocaleString()}
            </p>
            <p className="mb-2">
              <span className="font-medium">Status:</span> {component.isActive ? 'Active' : 'Inactive'}
            </p>
            <div className="mb-2">
              <p className="font-medium">Description:</p>
              <p className="text-gray-700 mt-1">{component.description}</p>
            </div>
          </div>
        </div>
        
        <div>
          <h2 className="text-lg font-semibold mb-3">Ownership Information</h2>
          <div className="bg-gray-50 p-4 rounded">
            <p className="mb-2">
              <span className="font-medium">Current Owner:</span>
              <br />
              <span className="font-mono text-sm break-all">
                {component.owner}
                {isOwner && ' (You)'}
              </span>
            </p>
            <p className="mb-2">
              <span className="font-medium">Creator:</span>
              <br />
              <span className="font-mono text-sm break-all">
                {component.creator}
                {currentUser?.walletAddress === component.creator && ' (You)'}
              </span>
            </p>
            
            {/* Transfer Ownership Button (only visible to current owner) */}
            {isOwner && (
              <div className="mt-4">
                <button
                  onClick={() => setShowTransferForm(prev => !prev)}
                  className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                >
                  {showTransferForm ? 'Cancel Transfer' : 'Transfer Ownership'}
                </button>
              </div>
            )}
            
            {/* Transfer Ownership Form */}
            {showTransferForm && (
              <div className="mt-4 border-t pt-4">
                <h3 className="text-md font-medium mb-2">Transfer Ownership</h3>
                <form onSubmit={handleTransferOwnership}>
                  <div className="mb-3">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      New Owner Address*
                    </label>
                    <input
                      type="text"
                      value={newOwner}
                      onChange={(e) => setNewOwner(e.target.value)}
                      required
                      placeholder="0x..."
                      className="w-full p-2 border rounded focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full px-3 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                  >
                    Confirm Transfer
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Add Event Button (visible to authenticated users) */}
      {isAuthenticated && (
        <div className="mb-6">
          <button
            onClick={() => setShowEventForm(prev => !prev)}
            className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
          >
            {showEventForm ? 'Cancel' : 'Add Tracking Event'}
          </button>
        </div>
      )}
      
      {/* Add Event Form */}
      {showEventForm && (
        <div className="mb-8 p-4 bg-gray-50 rounded-lg">
          <h2 className="text-lg font-semibold mb-3">Add Tracking Event</h2>
          <form onSubmit={handleAddEvent}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Event Type*
                </label>
                <select
                  value={eventData.eventType}
                  onChange={(e) => setEventData({...eventData, eventType: e.target.value})}
                  required
                  className="w-full p-2 border rounded focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select an event type</option>
                  {eventTypes.map(type => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes
                </label>
                <input
                  type="text"
                  value={eventData.notes}
                  onChange={(e) => setEventData({...eventData, notes: e.target.value})}
                  placeholder="Optional details about this event"
                  className="w-full p-2 border rounded focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            
            <div className="mt-4">
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Add Event
              </button>
            </div>
          </form>
        </div>
      )}
      
      {/* Component History */}
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Component History</h2>
        
        {history.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No history records found.
          </div>
        ) : (
          <div className="border-l-2 border-gray-200 ml-4">
            {history.map((event, index) => (
              <div key={index} className="relative mb-8">
                <div className="absolute -left-3 mt-2 w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center">
                  <span className="text-white text-xs">
                    {event.eventType === 'Created' ? '🔨' : 
                     event.eventType === 'Transferred' ? '🔄' : 
                     event.eventType === 'Deactivated' ? '🚫' : '📝'}
                  </span>
                </div>
                <div className="ml-8">
                  <div className="text-sm">
                    <span className="font-semibold">{event.eventType}</span>
                    <span className="text-gray-500 ml-2">
                      {new Date(event.timestamp).toLocaleString()}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600 mt-1">
                    By: {event.actor === currentUser?.walletAddress ? 'You' : event.actor}
                  </div>
                  {event.notes && (
                    <div className="mt-2 text-sm bg-gray-50 p-2 rounded">
                      {event.notes}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ComponentDetailPage;