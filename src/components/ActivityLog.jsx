import React, { useState, useEffect } from 'react';
import { X, Activity, Clock, User } from 'lucide-react';
import io from 'socket.io-client';

const ActivityLog = ({ onClose, token }) => {
  const [actions, setActions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    // Initialize socket connection for real-time updates
    const newSocket = io('http://localhost:3001');
    setSocket(newSocket);

    newSocket.on('actionLogged', (action) => {
      setActions(prev => [action, ...prev.slice(0, 19)]);
    });

    return () => {
      newSocket.disconnect();
    };
  }, []);

  useEffect(() => {
    fetchRecentActions();
  }, []);

  const fetchRecentActions = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/actions/recent', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setActions(data);
      }
    } catch (error) {
      console.error('Error fetching actions:', error);
    } finally {
      setLoading(false);
    }
  };

  const getActionIcon = (actionType) => {
    switch (actionType) {
      case 'create':
        return '🆕';
      case 'edit':
        return '✏️';
      case 'delete':
        return '🗑️';
      case 'smart-assign':
        return '🧠';
      default:
        return '📝';
    }
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;

    if (diff < 60000) { // Less than 1 minute
      return 'Just now';
    } else if (diff < 3600000) { // Less than 1 hour
      const minutes = Math.floor(diff / 60000);
      return `${minutes}m ago`;
    } else if (diff < 86400000) { // Less than 1 day
      const hours = Math.floor(diff / 3600000);
      return `${hours}h ago`;
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content activity-log-modal">
        <div className="modal-header">
          <div className="modal-title">
            <Activity size={24} />
            <h3>Activity Log</h3>
          </div>
          <button className="close-button" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        <div className="activity-log-content">
          {loading ? (
            <div className="loading-center">
              <div className="loading-spinner"></div>
              <p>Loading activity...</p>
            </div>
          ) : actions.length === 0 ? (
            <div className="empty-state">
              <Activity size={48} />
              <p>No recent activity</p>
            </div>
          ) : (
            <div className="activity-list">
              {actions.map((action) => (
                <div key={action._id} className="activity-item">
                  <div className="activity-icon">
                    {getActionIcon(action.actionType)}
                  </div>
                  <div className="activity-details">
                    <div className="activity-main">
                      <span className="activity-user">
                        <User size={16} />
                        {action.userId?.username || 'Unknown User'}
                      </span>
                      <span className="activity-action">
                        {action.actionType}
                      </span>
                      <span className="activity-task">
                        {action.taskId?.title || 'Unknown Task'}
                      </span>
                    </div>
                    {action.details && (
                      <div className="activity-description">
                        {action.details}
                      </div>
                    )}
                    <div className="activity-time">
                      <Clock size={14} />
                      {formatTimestamp(action.timestamp)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ActivityLog;