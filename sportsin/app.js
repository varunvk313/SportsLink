// SportsIn App State Management with Live API
class SportsInApp {
    constructor() {
        this.currentUser = this.getCurrentUser();
        this.posts = this.getAllPosts();
        this.users = this.getAllUsers();
        this.ws = null;
        this.init();
    }

    init() {
        this.seedData();
        this.updateNavigation();
        this.attachEventListeners();
        this.connectWebSocket();
        this.startHeartbeat();
    }

    // User Management
    getCurrentUser() {
        return JSON.parse(localStorage.getItem('sportsin_currentUser')) || null;
    }

    getAllUsers() {
        return JSON.parse(localStorage.getItem('sportsin_users')) || [];
    }

    getAllPosts() {
        return JSON.parse(localStorage.getItem('sportsin_posts')) || [];
    }

    // Initialize empty data structures
    seedData() {
        if (!localStorage.getItem('sportsin_users')) {
            localStorage.setItem('sportsin_users', JSON.stringify([]));
        }
        if (!localStorage.getItem('sportsin_posts')) {
            localStorage.setItem('sportsin_posts', JSON.stringify([]));
        }
    }

    // Post Management
    createPost(content, attachments = []) {
        if (!this.currentUser) return false;
        
        const newPost = {
            id: Date.now(),
            authorId: this.currentUser.id,
            content: content,
            attachments: attachments,
            timestamp: new Date().toISOString(),
            likes: [],
            comments: [],
            status: 'pending'
        };

        this.posts.unshift(newPost);
        localStorage.setItem('sportsin_posts', JSON.stringify(this.posts));
        
        // Send to API for live updates
        this.sendToAPI('new_post', newPost);
        return true;
    }

    // Navigation Management
    updateNavigation() {
        const navElement = document.querySelector('nav .flex.items-center.space-x-6');
        if (!navElement) return;

        if (this.currentUser) {
            navElement.innerHTML = `
                <a href="dashboard.html" class="navbar-link py-5 text-sm font-medium text-gray-500 hover:text-gray-900">Feed</a>
                <a href="explore.html" class="navbar-link py-5 text-sm font-medium text-gray-500 hover:text-gray-900">Explore</a>
                <a href="messages.html" class="navbar-link py-5 text-sm font-medium text-gray-500 hover:text-gray-900">Messages</a>
                <a href="opportunities.html" class="navbar-link py-5 text-sm font-medium text-gray-500 hover:text-gray-900">Opportunities</a>
                <a href="news.html" class="navbar-link py-5 text-sm font-medium text-gray-500 hover:text-gray-900">News</a>
                ${this.currentUser.isAdmin ? '<a href="admin.html" class="navbar-link py-5 text-sm font-medium text-red-500 hover:text-red-700">Admin Panel</a>' : ''}

                <div class="relative">
                    <button class="flex items-center space-x-2" onclick="app.toggleProfileMenu()">
                       <div class="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center font-bold text-white overflow-hidden">${this.currentUser.profilePhoto ? `<img src="${this.currentUser.profilePhoto}" alt="Profile" class="w-full h-full object-cover">` : this.currentUser.fullName.charAt(0)}</div>
                       <span class="text-sm font-medium text-gray-600">${this.currentUser.fullName}</span>
                    </button>
                    <div id="profile-dropdown" class="hidden absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-20">
                        <a href="profile.html" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">View Profile</a>
                        <a href="settings.html" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Settings & Privacy</a>
                        <a href="help.html" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Help</a>
                        <hr class="my-1">
                        <a href="#" onclick="app.logout()" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Sign Out</a>
                    </div>
                </div>
            `;
        }
    }

    toggleProfileMenu() {
        const dropdown = document.getElementById('profile-dropdown');
        if (dropdown) {
            dropdown.classList.toggle('hidden');
        }
    }

    logout() {
        localStorage.removeItem('sportsin_currentUser');
        window.location.href = 'index.html';
    }

    // WebSocket connection for live updates
    connectWebSocket() {
        // Mock WebSocket for demo - replace with real endpoint
        this.ws = {
            send: (data) => console.log('Sending to API:', data),
            onmessage: null,
            close: () => {}
        };
        
        // Removed conflicting live update simulation
    }

    sendToAPI(type, data) {
        if (this.ws) {
            this.ws.send(JSON.stringify({ type, data, userId: this.currentUser?.id }));
        }
    }

    simulateLiveUpdate() {
        // Disabled random notifications
    }

    handleLiveUpdate(update) {
        // Removed glitch notifications
    }

    // Keep session alive across tabs
    startHeartbeat() {
        setInterval(() => {
            if (this.currentUser) {
                localStorage.setItem('sportsin_lastSeen', Date.now().toString());
                this.sendToAPI('heartbeat', { userId: this.currentUser.id });
            }
        }, 30000); // Every 30 seconds
        
        // Listen for storage changes from other tabs
        window.addEventListener('storage', (e) => {
            if (e.key === 'sportsin_currentUser') {
                this.currentUser = this.getCurrentUser();
                this.updateNavigation();
            }
        });
    }

    attachEventListeners() {
        // Post form submission
        const postForm = document.getElementById('post-form');
        if (postForm) {
            postForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const content = e.target.querySelector('textarea').value;
                const fileInput = document.getElementById('file-input');
                const attachments = [];
                
                if (fileInput && fileInput.files.length > 0) {
                    Array.from(fileInput.files).forEach(file => {
                        const reader = new FileReader();
                        reader.onload = (event) => {
                            attachments.push({
                                name: file.name,
                                type: file.type,
                                size: file.size,
                                data: event.target.result
                            });
                            
                            if (attachments.length === fileInput.files.length) {
                                if (this.createPost(content, attachments)) {
                                    e.target.reset();
                                    document.getElementById('file-preview').innerHTML = '';
                                    alert('Post with attachments submitted for review!');
                                    this.loadPosts();
                                }
                            }
                        };
                        reader.readAsDataURL(file);
                    });
                } else {
                    if (this.createPost(content)) {
                        e.target.reset();
                        alert('Post submitted for review!');
                        this.loadPosts();
                    }
                }
            });
        }

        // Login form
        const loginForm = document.querySelector('form');
        if (loginForm && (window.location.pathname.includes('login.html') || document.title.includes('Login'))) {
            loginForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const email = e.target.querySelector('input[type="email"]').value;
                const password = e.target.querySelector('input[type="password"]').value;
                
                // Get fresh user data from localStorage
                const users = JSON.parse(localStorage.getItem('sportsin_users')) || [];
                const user = users.find(u => u.email === email && u.password === password);
                if (user) {
                    localStorage.setItem('sportsin_currentUser', JSON.stringify(user));
                    localStorage.setItem('sportsin_loginTime', Date.now().toString());
                    window.location.href = 'dashboard.html';
                } else {
                    alert('Invalid email or password. Please try again.');
                }
            });
        }
    }

    loadPosts() {
        const postsContainer = document.getElementById('posts-container');
        if (!postsContainer) return;

        const approvedPosts = this.posts.filter(p => p.status === 'approved');
        
        if (approvedPosts.length === 0) {
            postsContainer.innerHTML = `
                <div class="card mb-4 text-center py-8">
                    <h3 class="text-xl font-semibold text-gray-600 mb-2">No posts yet</h3>
                    <p class="text-gray-500">Be the first to share something with the community!</p>
                </div>
            `;
            return;
        }

        postsContainer.innerHTML = approvedPosts.map(post => {
            const author = this.users.find(u => u.id === post.authorId);
            const attachmentsHtml = post.attachments && post.attachments.length > 0 ? `
                <div class="mt-3 space-y-2">
                    ${post.attachments.map(attachment => {
                        if (attachment.type.startsWith('image/')) {
                            return `<img src="${attachment.data}" alt="${attachment.name}" class="max-w-full h-auto rounded-lg border">`;
                        } else if (attachment.type.startsWith('video/')) {
                            return `<video controls class="max-w-full h-auto rounded-lg border"><source src="${attachment.data}" type="${attachment.type}"></video>`;
                        } else {
                            return `<div class="flex items-center space-x-2 p-2 bg-gray-50 rounded border"><span>📎</span><span class="text-sm">${attachment.name}</span><span class="text-xs text-gray-500">(${(attachment.size/1024).toFixed(1)}KB)</span></div>`;
                        }
                    }).join('')}
                </div>
            ` : '';
            
            return `
                <div class="card mb-4">
                    <div class="flex items-center mb-2">
                        <div class="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center font-bold text-white cursor-pointer hover:bg-blue-700 overflow-hidden" onclick="window.location.href='profile.html?id=${author?.id}'">${author?.profilePhoto ? `<img src="${author.profilePhoto}" alt="Profile" class="w-full h-full object-cover">` : (author?.fullName.charAt(0) || 'U')}</div>
                        <div class="ml-3">
                            <span class="font-semibold text-gray-900 text-lg cursor-pointer hover:text-blue-600 hover:underline" onclick="window.location.href='profile.html?id=${author?.id}'">${author?.fullName || 'Unknown'}</span>
                            <p class="text-sm text-gray-500">${author?.userType || 'User'}</p>
                        </div>
                    </div>
                    <p class="text-gray-800 my-4">${post.content}</p>
                    ${attachmentsHtml}
                    <div class="mt-2 pt-2 border-t flex items-center space-x-4">
                        <button class="text-gray-500 hover:bg-gray-100 p-2 rounded">👍 Like (${post.likes.length})</button>
                        <button class="text-gray-500 hover:bg-gray-100 p-2 rounded">💬 Comment</button>
                    </div>
                </div>
            `;
        }).join('');
    }
}

// Initialize app
let app;
document.addEventListener('DOMContentLoaded', () => {
    app = new SportsInApp();
    if (document.getElementById('posts-container')) {
        app.loadPosts();
    }
});