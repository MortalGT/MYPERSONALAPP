document.addEventListener('DOMContentLoaded', () => {
    // State
    let currentView = 'dashboard';
    let tasks = [];
    let teamMembers = [];

    // DOM Elements
    const views = {
        dashboard: document.getElementById('view-dashboard'),
        tasks: document.getElementById('view-tasks')
    };
    const navItems = document.querySelectorAll('.nav-item');
    const pageTitle = document.getElementById('page-title');
    const tbodies = { tasks: document.getElementById('tasks-tbody') };

    // Filters
    const searchInput = document.getElementById('search-input');
    const filterCategory = document.getElementById('filter-category');
    const filterStatus = document.getElementById('filter-status');
    const filterPriority = document.getElementById('filter-priority');

    // Modal
    const modal = document.getElementById('task-modal');
    const taskForm = document.getElementById('task-form');
    const btnAddTask = document.getElementById('btn-add-task');
    const btnCloseModal = document.getElementById('btn-close-modal');
    const btnCancel = document.getElementById('btn-cancel');

    // Initialize
    init();

    async function init() {
        setupEventListeners();
        await fetchTeamMembers();
        await loadDashboard();
        await loadTasks();
    }

    function setupEventListeners() {
        // Navigation
        navItems.forEach(item => {
            item.addEventListener('click', () => {
                const view = item.dataset.view;
                switchView(view);
            });
        });

        // Filters
        searchInput.addEventListener('input', debounce(loadTasks, 300));
        filterCategory.addEventListener('change', loadTasks);
        filterStatus.addEventListener('change', loadTasks);
        filterPriority.addEventListener('change', loadTasks);

        // Modal triggers
        btnAddTask.addEventListener('click', () => openModal());
        btnCloseModal.addEventListener('click', closeModal);
        btnCancel.addEventListener('click', closeModal);

        // Form submit
        taskForm.addEventListener('submit', handleTaskSubmit);
    }

    function switchView(viewName) {
        currentView = viewName;

        // Update Nav
        navItems.forEach(item => {
            item.classList.toggle('active', item.dataset.view === viewName);
        });

        // Update Views
        Object.keys(views).forEach(key => {
            if (views[key]) {
                views[key].classList.toggle('active', key === viewName);
                views[key].classList.toggle('hidden', key !== viewName);
            }
        });

        // Update Title
        const titles = { dashboard: 'Dashboard', tasks: 'All Tasks' };
        pageTitle.textContent = titles[viewName];

        if (viewName === 'dashboard') loadDashboard();
        if (viewName === 'tasks') loadTasks();
    }

    // --- API Calls ---

    async function fetchTeamMembers() {
        try {
            const res = await fetch('/api/team');
            teamMembers = await res.json();

            const assignedSelect = document.getElementById('form-assigned');
            assignedSelect.innerHTML = '<option value="">Unassigned</option>' +
                teamMembers.map(m => `<option value="${m.name}">${m.name} (${m.role})</option>`).join('');
        } catch (error) {
            console.error('Failed to fetch team members:', error);
        }
    }

    async function loadDashboard() {
        if (currentView !== 'dashboard') return;
        try {
            const res = await fetch('/api/dashboard');
            const data = await res.json();

            // Update Summary Cards
            document.getElementById('stat-total').textContent = data.summary.total;
            document.getElementById('stat-overdue').textContent = data.summary.overdue;

            const inProg = data.byStatus.find(s => s.status === 'In Progress');
            document.getElementById('stat-in-progress').textContent = inProg ? inProg.count : 0;

            const done = data.byStatus.find(s => s.status === 'Done');
            document.getElementById('stat-done').textContent = done ? done.count : 0;

            // Render simple bar charts
            renderChart('chart-category', data.byCategory, data.summary.total);
            renderChart('chart-priority', data.byPriority, data.summary.total);

        } catch (error) {
            console.error('Failed to load dashboard:', error);
        }
    }

    async function loadTasks() {
        if (currentView !== 'tasks') return;

        const params = new URLSearchParams();
        if (filterCategory.value) params.append('category', filterCategory.value);
        if (filterStatus.value) params.append('status', filterStatus.value);
        if (filterPriority.value) params.append('priority', filterPriority.value);
        if (searchInput.value) params.append('search', searchInput.value);

        try {
            const res = await fetch(`/api/tasks?${params.toString()}`);
            tasks = await res.json();
            renderTasksTable();
        } catch (error) {
            console.error('Failed to load tasks:', error);
        }
    }

    async function handleTaskSubmit(e) {
        e.preventDefault();

        const taskId = document.getElementById('form-id').value;
        const taskData = {
            title: document.getElementById('form-title').value,
            description: document.getElementById('form-description').value,
            category: document.getElementById('form-category').value,
            project_name: document.getElementById('form-project').value,
            assigned_to: document.getElementById('form-assigned').value,
            priority: document.getElementById('form-priority').value,
            status: document.getElementById('form-status').value,
            due_date: document.getElementById('form-due-date').value
        };

        try {
            const url = taskId ? `/api/tasks/${taskId}` : '/api/tasks';
            const method = taskId ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(taskData)
            });

            if (res.ok) {
                closeModal();
                if (currentView === 'tasks') loadTasks();
                if (currentView === 'dashboard') loadDashboard();
            }
        } catch (error) {
            console.error('Failed to save task:', error);
        }
    }

    async function deleteTask(id) {
        if (!confirm('Are you sure you want to delete this task?')) return;
        try {
            const res = await fetch(`/api/tasks/${id}`, { method: 'DELETE' });
            if (res.ok) loadTasks();
        } catch (error) {
            console.error('Failed to delete task:', error);
        }
    }

    // --- DOM Rendering ---

    function renderTasksTable() {
        const today = new Date().toISOString().split('T')[0];

        tbodies.tasks.innerHTML = tasks.map(t => {
            const isOverdue = t.due_date && t.due_date < today && t.status !== 'Done';
            const trClass = isOverdue ? 'overdue-row' : '';

            return `
                <tr class="${trClass}">
                    <td>
                        <div style="font-weight: 500">${escapeHtml(t.title)}</div>
                        <div style="font-size: 0.8rem; color: var(--text-muted)">${escapeHtml(t.description || '')}</div>
                    </td>
                    <td style="text-transform: capitalize">${t.category}</td>
                    <td>${escapeHtml(t.project_name || '-')}</td>
                    <td>${escapeHtml(t.assigned_to || '-')}</td>
                    <td><span class="badge badge-priority-${t.priority.replace(' ', '')}">${t.priority}</span></td>
                    <td><span class="badge badge-status-${t.status.replace(' ', '')}">${t.status}</span></td>
                    <td style="${isOverdue ? 'color: var(--danger); font-weight: 600;' : ''}">${t.due_date || '-'}</td>
                    <td>
                        <button class="action-btn edit" onclick="window.editTask(${t.id})" title="Edit">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                        </button>
                        <button class="action-btn delete" onclick="window.deleteTask(${t.id})" title="Delete">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                        </button>
                    </td>
                </tr>
            `;
        }).join('');
    }

    function renderChart(containerId, dataArray, total) {
        const container = document.getElementById(containerId);
        if (!total) {
            container.innerHTML = '<p class="text-muted">No data available</p>';
            return;
        }

        container.innerHTML = dataArray.sort((a, b) => b.count - a.count).map(item => {
            const percent = Math.round((item.count / total) * 100);
            const labelKey = Object.keys(item).find(k => k !== 'count');
            return `
                <div class="bar-row">
                    <div class="bar-label">${item[labelKey] || 'Unassigned'}</div>
                    <div class="bar-track">
                        <div class="bar-fill" style="width: ${percent}%"></div>
                    </div>
                    <div class="bar-val">${item.count}</div>
                </div>
            `;
        }).join('');
    }

    // --- Modal Logic ---

    window.editTask = async function (id) {
        try {
            const res = await fetch(`/api/tasks/${id}`);
            const task = await res.json();
            openModal(task);
        } catch (error) {
            console.error('Failed to load task details:', error);
        }
    };

    window.deleteTask = deleteTask;

    function openModal(task = null) {
        document.getElementById('modal-title').textContent = task ? 'Edit Task' : 'New Task';

        document.getElementById('form-id').value = task ? task.id : '';
        document.getElementById('form-title').value = task ? task.title : '';
        document.getElementById('form-description').value = task ? task.description : '';
        document.getElementById('form-category').value = task ? task.category : 'project';
        document.getElementById('form-project').value = task ? task.project_name : '';
        document.getElementById('form-assigned').value = task ? task.assigned_to : '';
        document.getElementById('form-priority').value = task ? task.priority : 'Medium';
        document.getElementById('form-status').value = task ? task.status : 'Pending';
        document.getElementById('form-due-date').value = task ? task.due_date : '';

        modal.classList.remove('hidden');
    }

    function closeModal() {
        modal.classList.add('hidden');
        taskForm.reset();
    }

    // --- Utils ---
    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    function escapeHtml(unsafe) {
        return (unsafe || '').toString()
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }
});
