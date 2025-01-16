let allUsers = []; // Store all users globally

// Load users from the backend and display in admin panel
async function loadUsers() {
    console.log('Loading users...');
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
        allUsers = await fetchUsers();
        if (allUsers.length === 0) {
            userList.innerHTML = '<p>No users found.</p>';
        } else {
            filterAndDisplayUsers();
        }
    } catch (error) {
        console.error('Error loading users:', error);
        userList.innerHTML = '<p>Error loading users. Please try again later.</p>';
    }
}

// Fetch users from backend API
async function fetchUsers() {
    try {
        const response = await fetch('/api/users'); // Replace with actual API endpoint
        if (!response.ok) throw new Error(`Failed to fetch users: ${response.status}`);
        return await response.json();
    } catch (error) {
        console.error('Error fetching users:', error);
        throw error;
    }
}

// Filter and display users based on search and filter criteria
function filterAndDisplayUsers() {
    const userList = document.getElementById('adminUserList');
    if (!userList) return;

    const searchTerm = document.getElementById('adminUserSearch')?.value.toLowerCase() || '';
    const premiumFilter = document.getElementById('premiumFilter')?.value || 'all';
    const devFilter = document.getElementById('devFilter')?.value || 'all';

    const filteredUsers = allUsers.filter(user => {
        const matchesSearch = !searchTerm || user.username.toLowerCase().includes(searchTerm);
        const matchesPremium = premiumFilter === 'all' || 
            (premiumFilter === 'yes' && user.premium) || 
            (premiumFilter === 'no' && !user.premium);
        const matchesDev = devFilter === 'all' || 
            (devFilter === 'yes' && user.isDev) || 
            (devFilter === 'no' && !user.isDev);
        return matchesSearch && matchesPremium && matchesDev;
    });

    userList.innerHTML = filteredUsers.map(user => `
        <div class="user-item">
            <span>${user.username}</span>
            <span class="user-status">
                ${user.premium ? '<span class="premium-badge">Premium</span>' : ''}
                ${user.isDev ? '<span class="dev-badge">Dev</span>' : ''}
            </span>
            <button onclick="toggleUserOptions(${user.id})">Options</button>
            <div id="userOptions-${user.id}" class="user-options hidden">
                <button onclick="togglePremium(${user.id}, ${user.premium})">
                    ${user.premium ? 'Remove Premium' : 'Add Premium'}
                </button>
                <button onclick="toggleDev(${user.id}, ${user.isDev})">
                    ${user.isDev ? 'Remove Dev' : 'Make Dev'}
                </button>
                <button onclick="resetPassword(${user.id})">Reset Password</button>
                <button onclick="deleteUser(${user.id})">Delete User</button>
                <button onclick="revealPassword(${user.id})">Reveal Password</button>
            </div>
        </div>
    `).join('');
}

// Reset user password (with a temporary password)
async function resetPassword(id) {
    try {
        const temporaryPassword = 'Temp1234'; // Or generate a random password
        const response = await updateUser(id, { password: temporaryPassword });
        if (response.success) {
            alert(`Password reset. User can now log in with the temporary password: ${temporaryPassword}`);
            await loadUsers();
        }
    } catch (error) {
        console.error('Error resetting password:', error);
        alert('Error resetting password. Please try again.');
    }
}

// Update user (for toggle actions)
async function updateUser(id, updates) {
    try {
        const response = await fetch(`/api/users/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updates),
        });
        if (!response.ok) throw new Error(`Failed to update user: ${response.status}`);
        return await response.json();
    } catch (error) {
        console.error('Error updating user:', error);
        throw error;
    }
}

// Check if admin panel should be shown
function checkAdminPanel() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const devButton = document.getElementById('devButton');

    if (currentUser?.isDev) {
        devButton?.classList.remove('hidden');
        devButton.addEventListener('click', toggleAdminPanel);
    } else {
        devButton?.classList.add('hidden');
    }
}

// Toggle the admin panel visibility
function toggleAdminPanel() {
    const adminPanel = document.getElementById('adminPanel');
    adminPanel?.classList.toggle('hidden');
    if (!adminPanel.classList.contains('hidden')) loadUsers();
}
