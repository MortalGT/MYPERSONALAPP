const express = require('express');
const cors = require('cors');
const path = require('path');
const { initDb } = require('./db/database');

const tasksRouter = require('./routes/tasks');
const dashboardRouter = require('./routes/dashboard');
const teamRouter = require('./routes/team');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Initialize Database
initDb();

// Routes
// We define empty routers for now to avoid crashes if files are loaded before they are populated
app.use('/api/tasks', tasksRouter);
app.use('/api/dashboard', dashboardRouter);
app.use('/api/team', teamRouter);

// Start server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
