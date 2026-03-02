const express = require('express');
const router = express.Router();
const { db } = require('../db/database');

router.get('/', (req, res) => {
    try {
        const totalTasks = db.prepare('SELECT COUNT(*) as count FROM tasks').get().count;
        const overdueTasks = db.prepare(`SELECT COUNT(*) as count FROM tasks WHERE due_date < date('now') AND status != 'Done'`).get().count;

        const tasksByStatus = db.prepare('SELECT status, COUNT(*) as count FROM tasks GROUP BY status').all();
        const tasksByCategory = db.prepare('SELECT category, COUNT(*) as count FROM tasks GROUP BY category').all();
        const tasksByPriority = db.prepare('SELECT priority, COUNT(*) as count FROM tasks GROUP BY priority').all();

        res.json({
            summary: {
                total: totalTasks,
                overdue: overdueTasks
            },
            byStatus: tasksByStatus,
            byCategory: tasksByCategory,
            byPriority: tasksByPriority
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
