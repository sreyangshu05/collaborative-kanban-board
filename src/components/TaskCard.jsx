import React, { useState } from 'react';
import { Edit, Trash2, Users, AlertCircle, Clock } from 'lucide-react';

const TaskCard = ({ task, onEdit, onDelete, onSmartAssign, onDragStart, currentUser }) => {
  const [isHovered, setIsHovered] = useState(false);

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'High':
        return 'var(--color-danger)';
      case 'Medium':
        return 'var(--color-warning)';
      case 'Low':
        return 'var(--color-success)';
      default:
        return 'var(--color-primary)';
    }
  };

  const canEdit = () => {
    return !task.isBeingEdited || task.editedBy?._id === currentUser.id;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div
      className={`task-card ${task.isBeingEdited ? 'being-edited' : ''}`}
      draggable
      onDragStart={(e) => onDragStart(e, task._id)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="task-header">
        <div className="task-priority" style={{ backgroundColor: getPriorityColor(task.priority) }}>
          {task.priority}
        </div>
        {task.isBeingEdited && task.editedBy?._id !== currentUser.id && (
          <div className="editing-indicator">
            <Clock size={16} />
            <span>Being edited</span>
          </div>
        )}
      </div>

      <h4 className="task-title">{task.title}</h4>
      
      {task.description && (
        <p className="task-description">{task.description}</p>
      )}

      <div className="task-meta">
        <div className="task-dates">
          <span className="task-date">Created: {formatDate(task.createdAt)}</span>
          {task.updatedAt !== task.createdAt && (
            <span className="task-date">Updated: {formatDate(task.updatedAt)}</span>
          )}
        </div>
        
        {task.assignedUser && (
          <div className="assigned-user">
            <Users size={16} />
            <span>{task.assignedUser.username}</span>
          </div>
        )}
      </div>

      <div className="task-actions">
        <button
          className={`task-action-btn ${!canEdit() ? 'disabled' : ''}`}
          onClick={() => canEdit() && onEdit(task)}
          disabled={!canEdit()}
          title={!canEdit() ? 'Task is being edited by another user' : 'Edit task'}
        >
          <Edit size={16} />
        </button>
        
        <button
          className="task-action-btn smart-assign"
          onClick={() => onSmartAssign(task._id)}
          title="Smart assign to least loaded user"
        >
          <Users size={16} />
        </button>
        
        <button
          className="task-action-btn delete"
          onClick={() => onDelete(task._id)}
          title="Delete task"
        >
          <Trash2 size={16} />
        </button>
      </div>

      {task.isBeingEdited && task.editedBy?._id !== currentUser.id && (
        <div className="conflict-overlay">
          <AlertCircle size={20} />
          <span>Being edited by {task.editedBy?.username}</span>
        </div>
      )}
    </div>
  );
};

export default TaskCard;