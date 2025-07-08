import React, { useState } from 'react';
import { AlertTriangle, X, RefreshCw, Merge } from 'lucide-react';

const ConflictModal = ({ conflict, onResolve, onCancel }) => {
  const [mergeData, setMergeData] = useState({
    title: conflict.newVersion.title,
    description: conflict.newVersion.description,
    priority: conflict.newVersion.priority,
    status: conflict.newVersion.status,
    assignedUser: conflict.newVersion.assignedUser
  });
  const [showMerge, setShowMerge] = useState(false);

  const handleMergeChange = (field, value) => {
    setMergeData(prev => ({ ...prev, [field]: value }));
  };

  const handleMergeSubmit = () => {
    onResolve('merge', mergeData);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content conflict-modal">
        <div className="modal-header">
          <div className="modal-title">
            <AlertTriangle size={24} className="conflict-icon" />
            <h3>Conflict Detected</h3>
          </div>
          <button className="close-button" onClick={onCancel}>
            <X size={24} />
          </button>
        </div>

        <div className="conflict-content">
          <div className="conflict-message">
            <p>
              This task is being edited by <strong>{conflict.editedBy}</strong>.
              Choose how to resolve this conflict:
            </p>
          </div>

          {!showMerge && (
            <div className="conflict-versions">
              <div className="version-card">
                <h4>Current Version (Server)</h4>
                <div className="version-details">
                  <p><strong>Title:</strong> {conflict.currentVersion.title}</p>
                  <p><strong>Description:</strong> {conflict.currentVersion.description}</p>
                  <p><strong>Priority:</strong> {conflict.currentVersion.priority}</p>
                  <p><strong>Status:</strong> {conflict.currentVersion.status}</p>
                </div>
              </div>

              <div className="version-card">
                <h4>Your Version</h4>
                <div className="version-details">
                  <p><strong>Title:</strong> {conflict.newVersion.title}</p>
                  <p><strong>Description:</strong> {conflict.newVersion.description}</p>
                  <p><strong>Priority:</strong> {conflict.newVersion.priority}</p>
                  <p><strong>Status:</strong> {conflict.newVersion.status}</p>
                </div>
              </div>
            </div>
          )}

          {showMerge && (
            <div className="merge-section">
              <h4>Merge Versions</h4>
              <div className="merge-form">
                <div className="merge-field">
                  <label>Title:</label>
                  <div className="merge-options">
                    <label>
                      <input
                        type="radio"
                        name="title"
                        checked={mergeData.title === conflict.currentVersion.title}
                        onChange={() => handleMergeChange('title', conflict.currentVersion.title)}
                      />
                      Server: {conflict.currentVersion.title}
                    </label>
                    <label>
                      <input
                        type="radio"
                        name="title"
                        checked={mergeData.title === conflict.newVersion.title}
                        onChange={() => handleMergeChange('title', conflict.newVersion.title)}
                      />
                      Yours: {conflict.newVersion.title}
                    </label>
                  </div>
                </div>

                <div className="merge-field">
                  <label>Description:</label>
                  <div className="merge-options">
                    <label>
                      <input
                        type="radio"
                        name="description"
                        checked={mergeData.description === conflict.currentVersion.description}
                        onChange={() => handleMergeChange('description', conflict.currentVersion.description)}
                      />
                      Server: {conflict.currentVersion.description || '(empty)'}
                    </label>
                    <label>
                      <input
                        type="radio"
                        name="description"
                        checked={mergeData.description === conflict.newVersion.description}
                        onChange={() => handleMergeChange('description', conflict.newVersion.description)}
                      />
                      Yours: {conflict.newVersion.description || '(empty)'}
                    </label>
                  </div>
                </div>

                <div className="merge-field">
                  <label>Priority:</label>
                  <div className="merge-options">
                    <label>
                      <input
                        type="radio"
                        name="priority"
                        checked={mergeData.priority === conflict.currentVersion.priority}
                        onChange={() => handleMergeChange('priority', conflict.currentVersion.priority)}
                      />
                      Server: {conflict.currentVersion.priority}
                    </label>
                    <label>
                      <input
                        type="radio"
                        name="priority"
                        checked={mergeData.priority === conflict.newVersion.priority}
                        onChange={() => handleMergeChange('priority', conflict.newVersion.priority)}
                      />
                      Yours: {conflict.newVersion.priority}
                    </label>
                  </div>
                </div>

                <div className="merge-field">
                  <label>Status:</label>
                  <div className="merge-options">
                    <label>
                      <input
                        type="radio"
                        name="status"
                        checked={mergeData.status === conflict.currentVersion.status}
                        onChange={() => handleMergeChange('status', conflict.currentVersion.status)}
                      />
                      Server: {conflict.currentVersion.status}
                    </label>
                    <label>
                      <input
                        type="radio"
                        name="status"
                        checked={mergeData.status === conflict.newVersion.status}
                        onChange={() => handleMergeChange('status', conflict.newVersion.status)}
                      />
                      Yours: {conflict.newVersion.status}
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="conflict-actions">
            <button
              className="cancel-button"
              onClick={onCancel}
            >
              Cancel
            </button>
            {!showMerge && (
              <>
                <button
                  className="merge-button"
                  onClick={() => setShowMerge(true)}
                >
                  <Merge size={16} />
                  Merge Manually
                </button>
                <button
                  className="overwrite-button"
                  onClick={() => onResolve('overwrite')}
                >
                  <RefreshCw size={16} />
                  Overwrite
                </button>
              </>
            )}
            {showMerge && (
              <button
                className="save-button"
                onClick={handleMergeSubmit}
              >
                Save Merged Version
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConflictModal;