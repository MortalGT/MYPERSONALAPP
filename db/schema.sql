CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT,
    category TEXT CHECK( category IN ('project', 'team', 'client', 'issue', 'hiring') ) NOT NULL,
    project_name TEXT,
    assigned_to TEXT,
    priority TEXT CHECK( priority IN ('High', 'Medium', 'Low') ) DEFAULT 'Medium',
    status TEXT CHECK( status IN ('Pending', 'In Progress', 'Done') ) DEFAULT 'Pending',
    due_date TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS team_members (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    role TEXT,
    skills TEXT
);
