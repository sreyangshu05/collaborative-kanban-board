const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(cors({
  origin: "http://localhost:5173",
  credentials: true
}));
app.use(express.json());

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/kanban-board', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Models
const User = mongoose.model('User', {
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

const Task = mongoose.model('Task', {
  title: { type: String, required: true },
  description: { type: String, default: '' },
  status: { type: String, enum: ['Todo', 'In Progress', 'Done'], default: 'Todo' },
  priority: { type: String, enum: ['Low', 'Medium', 'High'], default: 'Medium' },
  assignedUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  isBeingEdited: { type: Boolean, default: false },
  editedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
});

const Action = mongoose.model('Action', {
  actionType: { type: String, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  taskId: { type: mongoose.Schema.Types.ObjectId, ref: 'Task', required: true },
  timestamp: { type: Date, default: Date.now },
  details: { type: String, default: '' }
});

// Auth middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key', (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid token' });
    }
    req.user = user;
    next();
  });
};

// Helper function to log actions
const logAction = async (actionType, userId, taskId, details = '') => {
  const action = new Action({
    actionType,
    userId,
    taskId,
    details
  });
  await action.save();
  
  // Broadcast to all connected clients
  const populatedAction = await Action.findById(action._id)
    .populate('userId', 'username email')
    .populate('taskId', 'title');
  
  io.emit('actionLogged', populatedAction);
};

// Auth routes
app.post('/api/auth/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    
    // Check if user already exists
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);
    
    // Create user
    const user = new User({
      username,
      email,
      password: hashedPassword
    });
    
    await user.save();
    
    // Generate JWT
    const token = jwt.sign(
      { userId: user._id, username: user.username },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );
    
    res.status(201).json({
      message: 'User created successfully',
      token,
      user: { id: user._id, username: user.username, email: user.email }
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }
    
    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }
    
    // Generate JWT
    const token = jwt.sign(
      { userId: user._id, username: user.username },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );
    
    res.json({
      message: 'Login successful',
      token,
      user: { id: user._id, username: user.username, email: user.email }
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Task routes
app.get('/api/tasks', authenticateToken, async (req, res) => {
  try {
    const tasks = await Task.find()
      .populate('assignedUser', 'username email')
      .populate('createdBy', 'username email')
      .populate('editedBy', 'username email');
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/tasks', authenticateToken, async (req, res) => {
  try {
    const { title, description, priority, assignedUser } = req.body;
    
    // Validate title uniqueness and reserved words
    const existingTask = await Task.findOne({ title });
    if (existingTask) {
      return res.status(400).json({ error: 'Task title must be unique' });
    }
    
    const reservedWords = ['Todo', 'In Progress', 'Done'];
    if (reservedWords.includes(title)) {
      return res.status(400).json({ error: 'Task title cannot match column names' });
    }
    
    const task = new Task({
      title,
      description,
      priority,
      assignedUser: assignedUser || null,
      createdBy: req.user.userId
    });
    
    await task.save();
    
    const populatedTask = await Task.findById(task._id)
      .populate('assignedUser', 'username email')
      .populate('createdBy', 'username email');
    
    // Log action
    await logAction('create', req.user.userId, task._id, `Created task: ${title}`);
    
    // Broadcast to all connected clients
    io.emit('taskCreated', populatedTask);
    
    res.status(201).json(populatedTask);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.put('/api/tasks/:id', authenticateToken, async (req, res) => {
  try {
    const { title, description, status, priority, assignedUser } = req.body;
    const taskId = req.params.id;
    
    // Check if task is being edited by another user
    const existingTask = await Task.findById(taskId);
    if (!existingTask) {
      return res.status(404).json({ error: 'Task not found' });
    }
    
    if (existingTask.isBeingEdited && existingTask.editedBy.toString() !== req.user.userId) {
      // Conflict detected
      const editedBy = await User.findById(existingTask.editedBy);
      return res.status(409).json({
        error: 'Task is being edited by another user',
        conflict: {
          currentVersion: existingTask,
          editedBy: editedBy.username
        }
      });
    }
    
    // Validate title uniqueness if title is being changed
    if (title && title !== existingTask.title) {
      const duplicateTask = await Task.findOne({ title, _id: { $ne: taskId } });
      if (duplicateTask) {
        return res.status(400).json({ error: 'Task title must be unique' });
      }
      
      const reservedWords = ['Todo', 'In Progress', 'Done'];
      if (reservedWords.includes(title)) {
        return res.status(400).json({ error: 'Task title cannot match column names' });
      }
    }
    
    // Update task
    const updatedTask = await Task.findByIdAndUpdate(
      taskId,
      {
        title,
        description,
        status,
        priority,
        assignedUser: assignedUser || null,
        updatedAt: new Date(),
        isBeingEdited: false,
        editedBy: null
      },
      { new: true }
    ).populate('assignedUser', 'username email')
     .populate('createdBy', 'username email');
    
    // Log action
    await logAction('edit', req.user.userId, taskId, `Updated task: ${title}`);
    
    // Broadcast to all connected clients
    io.emit('taskUpdated', updatedTask);
    
    res.json(updatedTask);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.delete('/api/tasks/:id', authenticateToken, async (req, res) => {
  try {
    const taskId = req.params.id;
    const task = await Task.findById(taskId);
    
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }
    
    await Task.findByIdAndDelete(taskId);
    
    // Log action
    await logAction('delete', req.user.userId, taskId, `Deleted task: ${task.title}`);
    
    // Broadcast to all connected clients
    io.emit('taskDeleted', taskId);
    
    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Smart assign endpoint
app.post('/api/tasks/:id/smart-assign', authenticateToken, async (req, res) => {
  try {
    const taskId = req.params.id;
    
    // Get all users and their task counts
    const users = await User.find();
    const taskCounts = await Promise.all(
      users.map(async (user) => {
        const count = await Task.countDocuments({
          assignedUser: user._id,
          status: { $in: ['Todo', 'In Progress'] }
        });
        return { user, count };
      })
    );
    
    // Find user with fewest tasks
    const leastLoadedUser = taskCounts.reduce((min, current) => 
      current.count < min.count ? current : min
    );
    
    // Update task
    const updatedTask = await Task.findByIdAndUpdate(
      taskId,
      { assignedUser: leastLoadedUser.user._id },
      { new: true }
    ).populate('assignedUser', 'username email')
     .populate('createdBy', 'username email');
    
    // Log action
    await logAction('smart-assign', req.user.userId, taskId, 
      `Smart-assigned task to ${leastLoadedUser.user.username}`);
    
    // Broadcast to all connected clients
    io.emit('taskUpdated', updatedTask);
    
    res.json(updatedTask);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Actions route
app.get('/api/actions/recent', authenticateToken, async (req, res) => {
  try {
    const actions = await Action.find()
      .sort({ timestamp: -1 })
      .limit(20)
      .populate('userId', 'username email')
      .populate('taskId', 'title');
    
    res.json(actions);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);
  
  socket.on('editTask', async (taskId, userId) => {
    try {
      await Task.findByIdAndUpdate(taskId, {
        isBeingEdited: true,
        editedBy: userId
      });
      
      socket.broadcast.emit('taskBeingEdited', { taskId, userId });
    } catch (error) {
      console.error('Error handling editTask:', error);
    }
  });
  
  socket.on('cancelEdit', async (taskId) => {
    try {
      await Task.findByIdAndUpdate(taskId, {
        isBeingEdited: false,
        editedBy: null
      });
      
      socket.broadcast.emit('taskEditCancelled', taskId);
    } catch (error) {
      console.error('Error handling cancelEdit:', error);
    }
  });
  
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});