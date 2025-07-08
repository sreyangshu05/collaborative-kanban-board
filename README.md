# 🚀 Collaborative Kanban Board

A real-time collaborative Kanban board application with intelligent task management, conflict resolution, and smart assignment features. Built for teams that need seamless collaboration with automatic conflict detection and resolution.

## 🧩 Project Overview

This project is a **full-stack collaborative Kanban board** that enables teams to manage tasks in real-time with advanced features like:

- **Real-time collaboration** with live updates across all connected users
- **Smart conflict detection** that prevents data loss when multiple users edit the same task
- **Intelligent task assignment** that automatically distributes work based on team member workload
- **Comprehensive activity tracking** with detailed logs of all team actions
- **Modern, responsive UI** built with React and TailwindCSS

### Real-World Use Cases

- **Development Teams**: Track sprint tasks, bug fixes, and feature development
- **Marketing Teams**: Manage campaign tasks, content creation, and project timelines
- **Project Management**: Coordinate complex projects with multiple stakeholders
- **Remote Teams**: Enable seamless collaboration across distributed teams

## 🛠️ Tech Stack

### Frontend
- **JavaScript** - Core programming language
- **React 18** - Modern UI framework with hooks
- **TypeScript** - Type-safe development
- **TailwindCSS** - Utility-first CSS framework
- **Vite** - Fast build tool and dev server
- **Socket.io-client** - Real-time communication
- **Lucide React** - Beautiful icons

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **Socket.io** - Real-time bidirectional communication
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB object modeling

### Authentication & Security
- **JWT (JSON Web Tokens)** - Stateless authentication
- **Bcryptjs** - Password hashing
- **CORS** - Cross-origin resource sharing

### Development Tools
- **ESLint** - Code linting
- **PostCSS** - CSS processing
- **Concurrently** - Run multiple commands

## 📦 Setup & Installation

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or cloud instance)
- Git

### Step 1: Clone the Repository
```bash
git clone https://github.com/sreyangshu05/collaborative-kanban-board.git
cd collaborative-kanban-board
```

### Step 2: Install Dependencies
```bash
npm install
```

### Step 3: Environment Configuration
Create a `.env` file in the root directory:

```env
# Authentication
JWT_SECRET=your-super-secret-jwt-key-change-this

# Server Configuration
PORT=3001
NODE_ENV=development
```

### Step 4: Start the Application
```bash
# Start both frontend and backend concurrently
npm run dev

# Or run them separately:
npm run server  # Backend only (port 3001)
npm run client  # Frontend only (port 5173)
```

### Step 5: Access the Application
- Frontend: http://localhost:5173
- Backend API: http://localhost:3001

## 🧪 Environment Variables

| Variable | Description | Default Value |
|----------|-------------|---------------|
| `JWT_SECRET` | Secret key for JWT tokens | `your-secret-key` |
| `PORT` | Backend server port | `3001` |
| `NODE_ENV` | Environment mode | `development` |

⚠️ **Security Note**: Never expose actual API keys or secrets in your code. Use environment variables for all sensitive data.

## 🚀 Deployment

### Frontend Deployment (Vercel)
1. Connect your GitHub repository to Vercel
2. Set build command: `npm run build`
3. Set output directory: `dist`
4. Add environment variables in Vercel dashboard

### Backend Deployment (Render/Railway)
1. Connect your repository to Render or Railway
2. Set build command: `npm install`
3. Set start command: `npm run server`
4. Add environment variables in deployment platform

### Demo Links
- **Live Demo**: [Coming Soon]
- **Backend API**: [Coming Soon]
- **Demo Video**: [Coming Soon]

## ✨ Features

### 🎯 Core Features
- ✅ **Real-time Collaboration** - Live updates across all connected users
- ✅ **Drag & Drop Interface** - Intuitive task movement between columns
- ✅ **User Authentication** - Secure login/register with JWT
- ✅ **Task Management** - Create, edit, delete tasks with priorities
- ✅ **Responsive Design** - Works on desktop, tablet, and mobile

### 🧠 Smart Features

#### **Smart Assign Algorithm**
- **Load Balancing**: Automatically assigns tasks to team members with the lowest workload
- **Real-time Calculation**: Considers only active tasks (Todo + In Progress)
- **Fair Distribution**: Ensures equal work distribution across the team

```javascript
// Smart assignment logic
const taskCounts = await Promise.all(
  users.map(async (user) => {
    const count = await Task.countDocuments({
      assignedUser: user._id,
      status: { $in: ['Todo', 'In Progress'] }
    });
    return { user, count };
  })
);

const leastLoadedUser = taskCounts.reduce((min, current) => 
  current.count < min.count ? current : min
);
```

#### **Conflict Resolution System**
- **Real-time Detection**: Detects when multiple users edit the same task
- **Visual Indicators**: Shows which user is currently editing
- **Manual Merge**: Allows users to merge conflicting changes
- **Overwrite Option**: Force overwrite with user's version

#### **Activity Logging**
- **Comprehensive Tracking**: Logs all create, edit, delete, and smart-assign actions
- **Real-time Updates**: Live activity feed with timestamps
- **User Attribution**: Shows which user performed each action
- **Detailed Context**: Includes task titles and action descriptions

### 🎨 User Experience Features
- **Priority Color Coding** - Visual priority indicators (High: Red, Medium: Orange, Low: Green)
- **Edit Locking** - Prevents simultaneous editing conflicts
- **Loading States** - Smooth loading animations
- **Error Handling** - User-friendly error messages
- **Mobile Responsive** - Optimized for all screen sizes

## 📖 Usage Guide

### Getting Started
1. **Register/Login**: Create an account or sign in
2. **Create Tasks**: Click "Add Task" to create new tasks
3. **Assign Tasks**: Use the smart assign button (🧠) for automatic assignment
4. **Move Tasks**: Drag and drop tasks between columns
5. **Track Activity**: Click the activity button to view team actions

### Task Management Workflow
```
Todo → In Progress → Done
```

### Conflict Resolution
When a conflict is detected:
1. **Review Changes**: Compare your version with the server version
2. **Choose Resolution**:
   - **Merge**: Manually combine both versions
   - **Overwrite**: Use your version
   - **Cancel**: Keep the server version

### Smart Assignment
- Click the 🧠 button on any task
- System automatically assigns to the least loaded team member
- Assignment is logged in the activity feed

## 📚 Architecture

### Project Structure
```
project/
├── src/
│   ├── components/
│   │   ├── KanbanBoard.jsx      # Main board component
│   │   ├── TaskCard.jsx         # Individual task display
│   │   ├── TaskForm.jsx         # Task creation/editing
│   │   ├── ConflictModal.jsx    # Conflict resolution UI
│   │   ├── ActivityLog.jsx      # Activity tracking
│   │   ├── Login.jsx            # Authentication
│   │   └── Register.jsx         # User registration
│   ├── context/
│   │   └── AuthContext.jsx      # Authentication state
│   ├── styles/
│   │   └── globals.css          # Global styles
│   └── App.tsx                  # Root component
├── server.cjs                   # Express backend
├── package.json                 # Dependencies
└── README.md                    # This file
```

### Data Flow
```
Frontend (React) ↔ Socket.io ↔ Backend (Express) ↔ MongoDB
```

### Key Components
- **KanbanBoard**: Main container with drag-drop functionality
- **TaskCard**: Individual task display with actions
- **ConflictModal**: Handles concurrent edit conflicts
- **ActivityLog**: Real-time activity tracking
- **AuthContext**: Manages user authentication state

## 🧠 Smart Logic Explanation

### Conflict Detection Algorithm
```javascript
// When user starts editing
if (existingTask.isBeingEdited && existingTask.editedBy !== currentUser) {
  // Conflict detected - show resolution modal
  return conflictResponse;
}
```

**How it works:**
1. When a user starts editing, the task is marked as "being edited"
2. Other users see a visual indicator and cannot edit
3. If someone tries to edit, a conflict modal appears
4. Users can merge changes or overwrite

### Smart Assignment Algorithm
```javascript
// Calculate workload for each user
const taskCounts = users.map(user => ({
  user,
  count: await Task.countDocuments({
    assignedUser: user._id,
    status: { $in: ['Todo', 'In Progress'] }
  })
}));

// Find user with minimum workload
const leastLoadedUser = taskCounts.reduce((min, current) => 
  current.count < min.count ? current : min
);
```

**Benefits:**
- **Fair Distribution**: Ensures equal workload across team
- **Real-time**: Considers current active tasks only
- **Automatic**: No manual intervention required
- **Transparent**: All assignments are logged

### Real-time Synchronization
```javascript
// Socket.io events for real-time updates
socket.on('taskCreated', (task) => {
  setTasks(prev => [...prev, task]);
});

socket.on('taskUpdated', (updatedTask) => {
  setTasks(prev => prev.map(task => 
    task._id === updatedTask._id ? updatedTask : task
  ));
});
```

**Features:**
- **Instant Updates**: Changes appear immediately across all clients
- **Conflict Prevention**: Prevents data loss from concurrent edits
- **Activity Logging**: All actions are tracked and broadcast
- **User Feedback**: Visual indicators for ongoing actions

## 🙋‍♂️ Contributing

We welcome contributions! Here's how you can help:

### Getting Started
1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

### Development Guidelines
- Follow the existing code style
- Add tests for new features
- Update documentation as needed
- Ensure all tests pass before submitting

### Contact
- **GitHub**: https://github.com/sreyangshu05
- **Email**: sreyangshusarkar@gmail.com
- **Issues**: [GitHub Issues](https://github.com/sreyangshu05/collaborative-kanban-board/issues)

---

<div align="center">
  <p>Made with ❤️ for collaborative teams</p>
  <p>⭐ Star this repository if you found it helpful!</p>
</div> 

## 📄 Technical Logic Document

For a detailed explanation of the Smart Assign algorithm and conflict handling logic, see the [Logic_Document.pdf](./Logic_Document.pdf) included in this repository.

``` 
