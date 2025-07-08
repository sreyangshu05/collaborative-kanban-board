import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import io from 'socket.io-client';
import TaskCard from './TaskCard';
import TaskForm from './TaskForm';
import ActivityLog from './ActivityLog';
import ConflictModal from './ConflictModal';
import { Plus, Activity, LogOut, Users } from 'lucide-react';

const KanbanBoard = () => {
  const [tasks, setTasks] = useState([]);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [showActivityLog, setShowActivityLog] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [conflict, setConflict] = useState(null);
  const [socket, setSocket] = useState(null);
  const [loading, setLoading] = useState(true);

  const { user, token, logout } = useAuth();

  const columns = ['Todo', 'In Progress', 'Done'];

  useEffect(() => {
    // Initialize socket connection
    const newSocket = io('http://localhost:3001');
    setSocket(newSocket);

    // Socket event listeners
    newSocket.on('taskCreated', (task) => {
      setTasks(prev => [...prev, task]);
    });

    newSocket.on('taskUpdated', (updatedTask) => {
      setTasks(prev => prev.map(task => 
        task._id === updatedTask._id ? updatedTask : task
      ));
    });

    newSocket.on('taskDeleted', (taskId) => {
      setTasks(prev => prev.filter(task => task._id !== taskId));
    });

    newSocket.on('taskBeingEdited', ({ taskId, userId }) => {
      setTasks(prev => prev.map(task =>
        task._id === taskId 
          ? { ...task, isBeingEdited: true, editedBy: { _id: userId } }
          : task
      ));
    });

    newSocket.on('taskEditCancelled', (taskId) => {
      setTasks(prev => prev.map(task =>
        task._id === taskId 
          ? { ...task, isBeingEdited: false, editedBy: null }
          : task
      ));
    });

    return () => {
      newSocket.disconnect();
    };
  }, []);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/tasks', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setTasks(data);
      }
    } catch (error) {
      console.error('Error fetching tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTask = async (taskData) => {
    try {
      const response = await fetch('http://localhost:3001/api/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(taskData),
      });

      const data = await response.json();

      if (response.ok) {
        setShowTaskForm(false);
        // Task will be added via socket event
      } else {
        alert(data.error || 'Error creating task');
      }
    } catch (error) {
      console.error('Error creating task:', error);
      alert('Error creating task');
    }
  };

  const handleUpdateTask = async (taskId, taskData) => {
    try {
      const response = await fetch(`http://localhost:3001/api/tasks/${taskId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(taskData),
      });

      const data = await response.json();

      if (response.status === 409) {
        // Conflict detected
        setConflict({
          taskId,
          currentVersion: data.conflict.currentVersion,
          editedBy: data.conflict.editedBy,
          newVersion: taskData
        });
      } else if (response.ok) {
        setEditingTask(null);
        // Task will be updated via socket event
      } else {
        alert(data.error || 'Error updating task');
      }
    } catch (error) {
      console.error('Error updating task:', error);
      alert('Error updating task');
    }
  };

  const handleDeleteTask = async (taskId) => {
    try {
      const response = await fetch(`http://localhost:3001/api/tasks/${taskId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        // Task will be removed via socket event
      } else {
        alert('Error deleting task');
      }
    } catch (error) {
      console.error('Error deleting task:', error);
      alert('Error deleting task');
    }
  };

  const handleSmartAssign = async (taskId) => {
    try {
      const response = await fetch(`http://localhost:3001/api/tasks/${taskId}/smart-assign`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        // Task will be updated via socket event
      } else {
        alert('Error smart-assigning task');
      }
    } catch (error) {
      console.error('Error smart-assigning task:', error);
      alert('Error smart-assigning task');
    }
  };

  const handleDragStart = (e, taskId) => {
    e.dataTransfer.setData('text/plain', taskId);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e, status) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('text/plain');
    const task = tasks.find(t => t._id === taskId);
    
    if (task && task.status !== status) {
      handleUpdateTask(taskId, { ...task, status });
    }
  };

  const handleEditTask = (task) => {
    if (socket) {
      socket.emit('editTask', task._id, user.id);
    }
    setEditingTask(task);
  };

  const handleCancelEdit = () => {
    if (editingTask && socket) {
      socket.emit('cancelEdit', editingTask._id);
    }
    setEditingTask(null);
  };

  const resolveConflict = (resolution, mergedData = null) => {
    if (resolution === 'overwrite') {
      handleUpdateTask(conflict.taskId, conflict.newVersion);
    } else if (resolution === 'merge' && mergedData) {
      handleUpdateTask(conflict.taskId, mergedData);
    }
    setConflict(null);
  };

  const getTasksByStatus = (status) => {
    return tasks.filter(task => task.status === status);
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading board...</p>
      </div>
    );
  }

  return (
    <div className="kanban-container">
      <header className="kanban-header">
        <div className="header-left">
          <h1>Kanban Board</h1>
          <span className="user-info">Welcome, {user.username}!</span>
        </div>
        <div className="header-right">
          <button
            className="header-button"
            onClick={() => setShowTaskForm(true)}
          >
            <Plus size={20} />
            Add Task
          </button>
          <button
            className="header-button"
            onClick={() => setShowActivityLog(true)}
          >
            <Activity size={20} />
            Activity
          </button>
          <button
            className="header-button logout-button"
            onClick={logout}
          >
            <LogOut size={20} />
            Logout
          </button>
        </div>
      </header>

      <div className="kanban-board">
        {columns.map((column) => (
          <div
            key={column}
            className="kanban-column"
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, column)}
          >
            <div className="column-header">
              <h3>{column}</h3>
              <span className="task-count">
                {getTasksByStatus(column).length}
              </span>
            </div>
            <div className="column-content">
              {getTasksByStatus(column).map((task) => (
                <TaskCard
                  key={task._id}
                  task={task}
                  onEdit={handleEditTask}
                  onDelete={handleDeleteTask}
                  onSmartAssign={handleSmartAssign}
                  onDragStart={handleDragStart}
                  currentUser={user}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      {showTaskForm && (
        <TaskForm
          onSubmit={handleCreateTask}
          onCancel={() => setShowTaskForm(false)}
          tasks={tasks}
        />
      )}

      {editingTask && (
        <TaskForm
          task={editingTask}
          onSubmit={(data) => handleUpdateTask(editingTask._id, data)}
          onCancel={handleCancelEdit}
          tasks={tasks}
        />
      )}

      {showActivityLog && (
        <ActivityLog
          onClose={() => setShowActivityLog(false)}
          token={token}
        />
      )}

      {conflict && (
        <ConflictModal
          conflict={conflict}
          onResolve={resolveConflict}
          onCancel={() => setConflict(null)}
        />
      )}
    </div>
  );
};

export default KanbanBoard;