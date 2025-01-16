// Admin Panel Management Script
let allUsers = []; // Store all users

// Load users and initialize admin panel
async function loadUsers() {
    console.log('loadUsers called');
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser || !currentUser.isDev) {
        console.error('Unauthorized access to admin panel');
        return;
    }

    const adminPanel = document.getElementById('adminPanel');
    if (!adminPanel || adminPanel.classList.contains('hidden')) return;

    const userList = document.getElementById('adminUserList');
    if (!userList) {
        console.error('Admin user list element not found');
        return;
    }

    try {
        console.log('Fetching users...');
        allUsers = await fetchAndHandle('/api/users', 'GET');
        console.log('Fetched users:', allUsers);
        if (!allUsers || !Array.isArray(allUsers) || allUsers.length === 0) {
            console.log('No users found or invalid user data');
            userList.innerHTML = '<p>No users found.</p>';
            return;
        }
        filterAndDisplayUsers();
    } catch (error) {
        console.error('Error loading users:', error);
        userList.innerHTML = '<p>Error loading users. Please try again later.</p>';
    }
}

// Filter and display users in the admin panel
function filterAndDisplayUsers() {
    const userList = document.getElementById('adminUserList');
    if (!userList) {
        console.error('Admin user list element not found');
        return;
    }

    const searchTerm = document.getElementById('adminUserSearch')?.value.toLowerCase() || '';
    const premiumFilter = document.getElementById('premiumFilter')?.value || 'all';
    const devFilter = document.getElementById('devFilter')?.value || 'all';
    const dateFilter = document.getElementById('dateFilter')?.value || 'all';

    const filteredUsers = allUsers.filter(user => {
        const matchesSearch = searchTerm === '' || user.username.toLowerCase().includes(searchTerm);
        const matchesPremium = premiumFilter === 'all' || 
            (premiumFilter === 'yes' && user.premium) || 
            (premiumFilter === 'no' && !user.premium);
        const matchesDev = devFilter === 'all' || 
            (devFilter === 'yes' && user.isDev) || 
            (devFilter === 'no' && !user.isDev);
        const userDate = new Date(user.createdAt);
        const matchesDate = dateFilter === 'all' || 
            (dateFilter === 'lastWeek' && isWithinLastWeek(userDate)) ||
            (dateFilter === 'lastMonth' && isWithinLastMonth(userDate)) ||
            (dateFilter === 'lastYear' && isWithinLastYear(userDate));

        return matchesSearch && matchesPremium && matchesDev && matchesDate;
    });

    userList.innerHTML = filteredUsers.map(user => \`
        <div class="user-item">
            <span>\${user.username}</span>
            <span class="user-status">
                \${user.premium ? '<span class="premium-badge">Premium</span>' : ''}
                \${user.isDev ? '<span class="dev-badge">Dev</span>' : ''}
            </span>
            <span class="user-date">Registered: \${new Date(user.createdAt).toLocaleDateString()}</span>
            <button onclick="toggleUserOptions(\${user.id})">Options</button>
            <div id="userOptions-\${user.id}" class="user-options hidden">
                <button onclick="togglePremium(\${user.id}, \${user.premium})">
                    \${user.premium ? 'Remove Premium' : 'Add Premium'}
                </button>
                <button onclick="toggleDev(\${user.id}, \${user.isDev})">
                    \${user.isDev ? 'Remove Dev' : 'Make Dev'}
                </button>
                <button onclick="changePassword(\${user.id})">Change Password</button>
                <button onclick="deleteUser(\${user.id})">Delete User</button>
                <button onclick="revealPassword(\${user.id})">Reveal Password</button>
                <button onclick="downloadLogs()">Download Logs</button>
            </div>
        </div>
    \`).join('');
}

// Helper function to fetch and handle API requests
async function fetchAndHandle(url, method = 'GET', body = null) {
    try {
        const options = { method, headers: { 'Content-Type': 'application/json' } };
        if (body) options.body = JSON.stringify(body);
        const response = await fetch(url, options);
        if (!response.ok) throw new Error(\`HTTP error! status: \${response.status}\`);
        return await response.json();
    } catch (error) {
        console.error('API request failed:', error);
        throw error;
    }
}

// Toggle admin panel visibility
function toggleAdminPanel() {
    const adminPanel = document.getElementById('adminPanel');
    if (!adminPanel) {
        console.error('Admin panel element not found');
        return;
    }
    adminPanel.classList.toggle('hidden');
    if (!adminPanel.classList.contains('hidden')) {
        loadUsers();
    }
}

// Additional utility functions here...
// (togglePremium, toggleDev, isWithinLastWeek, etc.)
