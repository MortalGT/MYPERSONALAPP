const { db, initDb } = require('./database');

// Initialize schema first
initDb();

console.log('Clearing existing data...');
db.exec('DELETE FROM tasks');
db.exec('DELETE FROM team_members');

console.log('Seeding team members...');
const insertTeam = db.prepare('INSERT INTO team_members (name, role, skills) VALUES (?, ?, ?)');
const teamMembers = [
    ['Ganesh Tate', 'Lead', 'SAP, Fullstack'],
    ['John Doe', 'Developer', 'Frontend, UI'],
    ['Jane Smith', 'Developer', 'Backend, DB']
];
teamMembers.forEach(m => insertTeam.run(...m));

console.log('Seeding tasks...');
const insertTask = db.prepare(`
    INSERT INTO tasks (title, description, category, project_name, assigned_to, priority, status, due_date)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
`);

// Calculate relative dates for due_date
const getDueDate = (daysOffset) => {
    const date = new Date();
    date.setDate(date.getDate() + daysOffset);
    return date.toISOString().split('T')[0];
};

const tasks = [
    ['Dream11 SAP Integration', 'Setup RFC connections for new module', 'project', 'Dream11', 'Ganesh Tate', 'High', 'In Progress', getDueDate(2)],
    ['GM Fabrics GST Module Update', 'Fix calculation bug in tax report', 'issue', 'GM Fabrics', 'Jane Smith', 'High', 'Pending', getDueDate(-1)],
    ['Shree Durga BTP Deployment', 'Deploy the new UI5 app to BTP', 'project', 'Shree Durga', 'Ganesh Tate', 'Medium', 'Pending', getDueDate(5)],
    ['Team Weekly Sync', 'Review Sprint progress', 'team', null, null, 'Low', 'Pending', getDueDate(0)],
    ['Follow up on Commercial Proposal', 'Send revised quote for phase 2', 'client', 'Baramati Agro', 'Ganesh Tate', 'High', 'Pending', getDueDate(1)],
    ['Initial Screening for Node.js Dev', 'Interview candidate #104', 'hiring', null, 'Ganesh Tate', 'Medium', 'Pending', getDueDate(3)],
    ['Optimize Database Queries', 'Add indexes to tasks table', 'issue', 'Internal', 'Jane Smith', 'Medium', 'Done', getDueDate(-5)],
    ['Update README', 'Add setup instructions for new devs', 'project', 'Internal', 'John Doe', 'Low', 'In Progress', getDueDate(2)]
];

tasks.forEach(t => insertTask.run(...t));

console.log('Seeding completed successfully.');
