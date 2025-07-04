// Data Storage
let users = [];
let mods = [];
let currentUser = null;

// DOM Elements
const modsContainer = document.getElementById('mods-container');
const uploadBtn = document.getElementById('upload-btn');
const communityBtn = document.getElementById('community-btn');
const featuredBtn = document.getElementById('featured-btn');
const loginBtn = document.getElementById('login-btn');
const signupBtn = document.getElementById('signup-btn');
const authButtons = document.getElementById('auth-buttons');
const userProfile = document.getElementById('user-profile');
const usernameDisplay = document.getElementById('username-display');

// Modals
const uploadModal = document.getElementById('upload-modal');
const authModal = document.getElementById('auth-modal');
const modDetailsModal = document.getElementById('mod-details-modal');

// Forms
const modUploadForm = document.getElementById('mod-upload-form');
const loginForm = document.getElementById('login-form');
const signupForm = document.getElementById('signup-form');
const switchToSignup = document.getElementById('switch-to-signup');
const switchToLogin = document.getElementById('switch-to-login');

// Load data from JSON files
async function loadData() {
    try {
        const usersResponse = await fetch('data/users.json');
        users = await usersResponse.json();
        
        const modsResponse = await fetch('data/mods.json');
        mods = await modsResponse.json();
        
        renderMods(mods);
    } catch (error) {
        console.error('Error loading data:', error);
        // Initialize empty arrays if files don't exist
        users = [];
        mods = [];
    }
}

// Save data to JSON files
async function saveData() {
    try {
        await fetch('save_data.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                users: users,
                mods: mods
            })
        });
    } catch (error) {
        console.error('Error saving data:', error);
    }
}

// Render mods to the page
function renderMods(modsToRender) {
    modsContainer.innerHTML = '';
    
    modsToRender.forEach(mod => {
        const modCard = document.createElement('div');
        modCard.className = 'mod-card';
        modCard.innerHTML = `
            <img src="${mod.thumbnail || 'assets/default-thumbnail.jpg'}" alt="${mod.name}" class="mod-thumbnail">
            <div class="mod-info">
                <h3 class="mod-title">${mod.name}</h3>
                <p class="mod-author">By ${mod.author}</p>
                <div class="mod-actions">
                    <button class="view-btn" data-id="${mod.id}">View Details</button>
                </div>
            </div>
            ${mod.featured ? '<span class="featured-badge">Featured</span>' : ''}
        `;
        modsContainer.appendChild(modCard);
    });
    
    // Add event listeners to view buttons
    document.querySelectorAll('.view-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const modId = e.target.getAttribute('data-id');
            showModDetails(modId);
        });
    });
}

// Show mod details modal
function showModDetails(modId) {
    const mod = mods.find(m => m.id === modId);
    if (!mod) return;
    
    const modDetailsContent = document.getElementById('mod-details-content');
    modDetailsContent.innerHTML = `
        <img src="${mod.thumbnail || 'assets/default-thumbnail.jpg'}" alt="${mod.name}" style="width:100%; max-height:300px; object-fit:cover;">
        <h2>${mod.name}</h2>
        <p>By ${mod.author}</p>
        <p>${mod.description || 'No description provided.'}</p>
        <a href="${mod.downloadLink}" class="download-btn" target="_blank">Download Mod</a>
        
        ${currentUser && currentUser.username === 'SemiDen' ? `
            <div class="staff-controls">
                <button class="staff-btn feature-btn" data-id="${mod.id}">
                    ${mod.featured ? 'Remove from Featured' : 'Feature Mod'}
                </button>
                <button class="staff-btn delete-btn" data-id="${mod.id}">Delete Mod</button>
            </div>
        ` : ''}
    `;
    
    // Add event listeners for staff buttons
    if (currentUser && currentUser.username === 'SemiDen') {
        document.querySelector('.feature-btn')?.addEventListener('click', (e) => {
            toggleFeaturedMod(modId);
        });
        
        document.querySelector('.delete-btn')?.addEventListener('click', (e) => {
            deleteMod(modId);
        });
    }
    
    modDetailsModal.classList.remove('hidden');
}

// Toggle featured status of a mod
function toggleFeaturedMod(modId) {
    const modIndex = mods.findIndex(m => m.id === modId);
    if (modIndex === -1) return;
    
    mods[modIndex].featured = !mods[modIndex].featured;
    saveData();
    renderMods(mods);
    modDetailsModal.classList.add('hidden');
}

// Delete a mod
function deleteMod(modId) {
    if (!confirm('Are you sure you want to delete this mod?')) return;
    
    mods = mods.filter(m => m.id !== modId);
    saveData();
    renderMods(mods);
    modDetailsModal.classList.add('hidden');
}

// Handle mod upload
modUploadForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    if (!currentUser) {
        alert('You must be logged in to upload a mod.');
        return;
    }
    
    const modName = document.getElementById('mod-name').value;
    const modDesc = document.getElementById('mod-desc').value;
    const modLink = document.getElementById('mod-link').value;
    const thumbnailFile = document.getElementById('mod-thumbnail').files[0];
    
    // Simple validation
    if (!modName || !modLink) {
        alert('Mod name and download link are required.');
        return;
    }
    
    // Create new mod object
    const newMod = {
        id: generateId(),
        name: modName,
        description: modDesc,
        downloadLink: modLink,
        author: currentUser.username,
        featured: false,
        thumbnail: thumbnailFile ? await readFileAsDataURL(thumbnailFile) : null,
        date: new Date().toISOString()
    };
    
    mods.push(newMod);
    await saveData();
    renderMods(mods);
    uploadModal.classList.add('hidden');
    modUploadForm.reset();
});

// Helper function to read file as data URL
function readFileAsDataURL(file) {
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target.result);
        reader.readAsDataURL(file);
    });
}

// Handle user login
document.getElementById('submit-login').addEventListener('click', (e) => {
    e.preventDefault();
    
    const username = document.getElementById('login-username').value;
    const password = document.getElementById('login-password').value;
    
    const user = users.find(u => u.username === username && u.password === password);
    if (user) {
        currentUser = user;
        updateAuthUI();
        authModal.classList.add('hidden');
    } else {
        alert('Invalid username or password.');
    }
});

// Handle user signup
document.getElementById('submit-signup').addEventListener('click', (e) => {
    e.preventDefault();
    
    const username = document.getElementById('signup-username').value;
    const password = document.getElementById('signup-password').value;
    
    // Validate username
    if (users.some(u => u.username === username)) {
        alert('Username already taken.');
        return;
    }
    
    if (username.length < 3) {
        alert('Username must be at least 3 characters.');
        return;
    }
    
    if (password.length < 6) {
        alert('Password must be at least 6 characters.');
        return;
    }
    
    // Create new user
    const newUser = {
        username,
        password,
        isStaff: username === 'SemiDen' // Make SemiDen staff by default
    };
    
    users.push(newUser);
    currentUser = newUser;
    saveData();
    updateAuthUI();
    authModal.classList.add('hidden');
});

// Update auth UI based on login state
function updateAuthUI() {
    if (currentUser) {
        authButtons.classList.add('hidden');
        userProfile.classList.remove('hidden');
        usernameDisplay.textContent = currentUser.username;
        uploadBtn.classList.remove('hidden');
    } else {
        authButtons.classList.remove('hidden');
        userProfile.classList.add('hidden');
        uploadBtn.classList.add('hidden');
    }
}

// Generate unique ID
function generateId() {
    return Math.random().toString(36).substr(2, 9);
}

// Search functionality
function searchMods(query) {
    if (!query) return mods;
    return mods.filter(mod => 
        mod.name.toLowerCase().includes(query.toLowerCase()) || 
        mod.author.toLowerCase().includes(query.toLowerCase())
    );
}

// Initialize the app
function init() {
    loadData();
    
    // Event listeners for buttons
    uploadBtn.addEventListener('click', () => {
        if (!currentUser) {
            authModal.classList.remove('hidden');
            return;
        }
        uploadModal.classList.remove('hidden');
    });
    
    communityBtn.addEventListener('click', () => {
        renderMods(mods);
    });
    
    featuredBtn.addEventListener('click', () => {
        renderMods(mods.filter(mod => mod.featured));
    });
    
    loginBtn.addEventListener('click', () => {
        authModal.classList.remove('hidden');
        loginForm.classList.remove('hidden');
        signupForm.classList.add('hidden');
    });
    
    signupBtn.addEventListener('click', () => {
        authModal.classList.remove('hidden');
        signupForm.classList.remove('hidden');
        loginForm.classList.add('hidden');
    });
    
    switchToSignup.addEventListener('click', (e) => {
        e.preventDefault();
        loginForm.classList.add('hidden');
        signupForm.classList.remove('hidden');
    });
    
    switchToLogin.addEventListener('click', (e) => {
        e.preventDefault();
        signupForm.classList.add('hidden');
        loginForm.classList.remove('hidden');
    });
    
    // Close modals when clicking X
    document.querySelectorAll('.close-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            btn.closest('.modal').classList.add('hidden');
        });
    });
    
    // Close modals when clicking outside
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.add('hidden');
            }
        });
    });
    
    // Add search functionality
    const searchBar = document.createElement('div');
    searchBar.className = 'search-container';
    searchBar.innerHTML = `
        <input type="text" class="search-bar" placeholder="Search mods...">
    `;
    document.querySelector('main').prepend(searchBar);
    
    document.querySelector('.search-bar').addEventListener('input', (e) => {
        const results = searchMods(e.target.value);
        renderMods(results);
    });
}

// Start the app
init();
