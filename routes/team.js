const express = require('express');
const router = express.Router();
const { db } = require('../db/database');

// GET /api/team
router.get('/', (req, res) => {
    try {
        const members = db.prepare('SELECT * FROM team_members ORDER BY name ASC').all();
        res.json(members);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST /api/team
router.post('/', (req, res) => {
    const { name, role, skills } = req.body;
    try {
        const stmt = db.prepare('INSERT INTO team_members (name, role, skills) VALUES (?, ?, ?)');
        const info = stmt.run(name, role, skills);
        res.status(201).json({ id: info.lastInsertRowid });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
