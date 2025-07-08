import React, { useState, useEffect } from 'react';
import { X, Save, AlertCircle } from 'lucide-react';

const TaskForm = ({ task, onSubmit, onCancel, tasks }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'Medium',
    assignedUser: '',
    status: 'Todo'
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title || '',
        description: task.description || '',
        priority: task.priority || 'Medium',
        assignedUser: task.assignedUser?._id || '',
        status: task.status || 'Todo'
      });
    }
  }, [task]);

  const validateTitle = (title) => {
    if (!title.trim()) {
      return 'Title is required';
    }

    // Check for uniqueness
    const existingTask = tasks.find(t => 
      t.title.toLowerCase() === title.toLowerCase().trim() && 
      t._id !== task?._id
    );
    if (existingTask) {
      return 'Task title must be unique';
    }

    // Check for reserved words
    const reservedWords = ['todo', 'in progress', 'done'];
    if (reservedWords.includes(title.toLowerCase().trim())) {
      return 'Task title cannot match column names';
    }

    return null;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (name === 'title') {
      setError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const titleError = validateTitle(formData.title);
    if (titleError) {
      setError(titleError);
      setLoading(false);
      return;
    }

    try {
      await onSubmit(formData);
    } catch (error) {
      setError('Error saving task');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content task-form-modal">
        <div className="modal-header">
          <h3>{task ? 'Edit Task' : 'Create New Task'}</h3>
          <button className="close-button" onClick={onCancel}>
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="task-form">
          <div className="form-group">
            <label htmlFor="title">Title *</label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              placeholder="Enter task title"
              className={error ? 'error' : ''}
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="4"
              placeholder="Enter task description"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="priority">Priority</label>
              <select
                id="priority"
                name="priority"
                value={formData.priority}
                onChange={handleChange}
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="status">Status</label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleChange}
              >
                <option value="Todo">Todo</option>
                <option value="In Progress">In Progress</option>
                <option value="Done">Done</option>
              </select>
            </div>
          </div>

          {error && (
            <div className="error-message">
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          <div className="form-actions">
            <button
              type="button"
              className="cancel-button"
              onClick={onCancel}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="save-button"
              disabled={loading}
            >
              <Save size={16} />
              {loading ? 'Saving...' : 'Save Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskForm;