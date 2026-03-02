const express = require('express');
const router = express.Router();
const { db } = require('../db/database');

// GET /api/tasks
router.get('/', (req, res) => {
    let query = 'SELECT * FROM tasks WHERE 1=1';
    const params = [];

    if (req.query.category) {
        query += ' AND category = ?';
        params.push(req.query.category);
    }
    if (req.query.status) {
        query += ' AND status = ?';
        params.push(req.query.status);
    }
    if (req.query.priority) {
        query += ' AND priority = ?';
        params.push(req.query.priority);
    }
    if (req.query.search) {
        query += ' AND (title LIKE ? OR description LIKE ?)';
        params.push(`%${req.query.search}%`, `%${req.query.search}%`);
    }
    if (req.query.overdue === 'true') {
        query += ` AND due_date < date('now') AND status != 'Done'`;
    }

    query += ' ORDER BY due_date ASC';

    try {
        const tasks = db.prepare(query).all(params);
        res.json(tasks);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET /api/tasks/:id
router.get('/:id', (req, res) => {
    try {
        const task = db.prepare('SELECT * FROM tasks WHERE id = ?').get(req.params.id);
        if (!task) return res.status(404).json({ error: 'Task not found' });
        res.json(task);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST /api/tasks
router.post('/', (req, res) => {
    const { title, description, category, project_name, assigned_to, priority, status, due_date } = req.body;
    try {
        const stmt = db.prepare(`
            INSERT INTO tasks (title, description, category, project_name, assigned_to, priority, status, due_date)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `);
        const info = stmt.run(title, description, category, project_name, assigned_to, priority || 'Medium', status || 'Pending', due_date);
        res.status(201).json({ id: info.lastInsertRowid });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// PUT /api/tasks/:id
router.put('/:id', (req, res) => {
    const { title, description, category, project_name, assigned_to, priority, status, due_date } = req.body;
    try {
        const stmt = db.prepare(`
            UPDATE tasks
            SET title = ?, description = ?, category = ?, project_name = ?, assigned_to = ?, priority = ?, status = ?, due_date = ?, updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        `);
        const info = stmt.run(title, description, category, project_name, assigned_to, priority, status, due_date, req.params.id);
        if (info.changes === 0) return res.status(404).json({ error: 'Task not found' });
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// DELETE /api/tasks/:id
router.delete('/:id', (req, res) => {
    try {
        const info = db.prepare('DELETE FROM tasks WHERE id = ?').run(req.params.id);
        if (info.changes === 0) return res.status(404).json({ error: 'Task not found' });
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
