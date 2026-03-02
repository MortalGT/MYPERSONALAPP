# To-Do & Work Management Application

A personalized work management application designed for tracking tasks across multiple categories like projects, team syncs, client follow-ups, issue tracking, and hiring. Built with Node.js, Express, better-sqlite3, and a Vanilla JS/HTML/CSS frontend.

## Features
- **Dashboard Summary**: Real-time stats, including overdue counters and tasks broken down by category and priority.
- **Unified Task List**: Filter tasks by category, status, priority, or search term.
- **Full CRUD Application**: Create, read, update, and delete tasks instantly using a modal form.
- **Glassmorphism UI**: Beautiful dark theme with smooth gradients, animations, and responsive components.

## Prerequisites
- Node.js (v14 or higher is recommended)
- npm

## Setup Instructions

1. **Install Dependencies**
   Navigate to the project root (`c:\FioriApps\POC\Project2`) and run:
   ```bash
   npm install
   ```

2. **Initialize and Seed Database**
   The application uses a local SQLite database (`db/data.db`). To initialize the schema and populate it with sample data:
   ```bash
   node db/seed.js
   ```

3. **Start the Server**
   ```bash
   npm start
   ```

4. **Access the Application**
   Open your browser and navigate to:
   [http://localhost:3000](http://localhost:3000)

## Folder Structure
- `/db` - SQLite database file, schema definitions, and seeding script.
- `/public` - Static frontend assets (`index.html`, `css/style.css`, `js/app.js`).
- `/routes` - Express API routers for `/api/tasks`, `/api/dashboard`, and `/api/team`.
- `server.js` - Application entry point.

## Technologies Used
- **Backend:** Node.js, Express, better-sqlite3
- **Frontend:** HTML5, CSS3, Vanilla JavaScript (ES6+), Inter Font
