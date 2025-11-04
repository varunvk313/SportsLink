// Live API Integration for SportsIn
class LiveAPI {
    constructor() {
        this.baseURL = 'https://api.sportsin.com'; // Mock endpoint
        this.wsURL = 'wss://ws.sportsin.com'; // Mock WebSocket
        this.connected = false;
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 5;
    }

    // Initialize real-time connection
    async connect() {
        try {
            // Mock WebSocket connection
            this.ws = new WebSocket(this.wsURL);
            
            this.ws.onopen = () => {
                this.connected = true;
                this.reconnectAttempts = 0;
                console.log('🔗 Connected to SportsIn Live API');
                this.authenticate();
            };

            this.ws.onmessage = (event) => {
                const data = JSON.parse(event.data);
                this.handleLiveUpdate(data);
            };

            this.ws.onclose = () => {
                this.connected = false;
                this.reconnect();
            };

            this.ws.onerror = (error) => {
                console.error('WebSocket error:', error);
                this.fallbackToPolling();
            };

        } catch (error) {
            console.log('WebSocket not available, using polling fallback');
            this.fallbackToPolling();
        }
    }

    // Fallback to HTTP polling for live updates
    fallbackToPolling() {
        setInterval(() => {
            this.fetchUpdates();
        }, 5000); // Poll every 5 seconds
    }

    async fetchUpdates() {
        try {
            // Simulate API calls with mock data
            const updates = await this.mockAPICall('/api/updates');
            updates.forEach(update => this.handleLiveUpdate(update));
        } catch (error) {
            console.error('Failed to fetch updates:', error);
        }
    }

    // Mock API call that simulates real data
    async mockAPICall(endpoint) {
        return new Promise((resolve) => {
            setTimeout(() => {
                const mockData = {
                    '/api/updates': [
                        { type: 'post', id: Date.now(), content: 'Live: Match result just in!', author: 'Sports News' },
                        { type: 'opportunity', id: Date.now(), title: 'New coaching position', company: 'FC Barcelona' }
                    ],
                    '/api/news': [
                        { id: Date.now(), title: 'Breaking: Transfer completed', source: 'ESPN', timestamp: new Date().toISOString() }
                    ],
                    '/api/opportunities': [
                        { id: Date.now(), title: 'Youth Coach Needed', company: 'Manchester United', location: 'Manchester', timestamp: new Date().toISOString() }
                    ]
                };
                resolve(mockData[endpoint] || []);
            }, Math.random() * 1000); // Random delay 0-1s
        });
    }

    // Handle incoming live updates
    handleLiveUpdate(data) {
        switch (data.type) {
            case 'post':
                this.showNotification('📝 New post available!', 'info');
                if (window.app) window.app.loadPosts();
                break;
            case 'opportunity':
                this.showNotification('💼 New job opportunity!', 'success');
                break;
            case 'news':
                this.showNotification('📰 Breaking news!', 'info');
                break;
            case 'user_online':
                this.updateUserStatus(data.userId, 'online');
                break;
        }
    }

    // Show live notification
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        const colors = {
            info: 'bg-blue-500',
            success: 'bg-green-500',
            warning: 'bg-yellow-500',
            error: 'bg-red-500'
        };
        
        notification.className = `fixed top-4 right-4 ${colors[type]} text-white p-4 rounded-lg shadow-lg z-50 transform transition-all duration-300`;
        notification.innerHTML = `
            ${message}
            <button onclick="this.parentElement.remove()" class="ml-3 text-white hover:text-gray-200">×</button>
        `;
        
        document.body.appendChild(notification);
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (notification.parentElement) {
                notification.style.transform = 'translateX(100%)';
                setTimeout(() => notification.remove(), 300);
            }
        }, 5000);
    }

    // Send data to API
    async sendData(endpoint, data) {
        try {
            if (this.connected && this.ws) {
                this.ws.send(JSON.stringify({ endpoint, data }));
            } else {
                // Fallback to HTTP POST
                await this.httpPost(endpoint, data);
            }
        } catch (error) {
            console.error('Failed to send data:', error);
        }
    }

    async httpPost(endpoint, data) {
        // Mock HTTP POST
        console.log(`POST ${this.baseURL}${endpoint}:`, data);
        return { success: true, id: Date.now() };
    }

    // Authenticate with API
    authenticate() {
        const user = JSON.parse(localStorage.getItem('sportsin_currentUser'));
        if (user && this.ws) {
            this.ws.send(JSON.stringify({
                type: 'auth',
                userId: user.id,
                token: localStorage.getItem('sportsin_token') || 'demo-token'
            }));
        }
    }

    // Reconnect logic
    reconnect() {
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
            this.reconnectAttempts++;
            const delay = Math.pow(2, this.reconnectAttempts) * 1000; // Exponential backoff
            
            setTimeout(() => {
                console.log(`Reconnecting... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
                this.connect();
            }, delay);
        } else {
            console.log('Max reconnection attempts reached, falling back to polling');
            this.fallbackToPolling();
        }
    }

    // Update user online status
    updateUserStatus(userId, status) {
        const statusIndicators = document.querySelectorAll(`[data-user-id="${userId}"] .status-indicator`);
        statusIndicators.forEach(indicator => {
            indicator.className = `status-indicator w-3 h-3 rounded-full ${status === 'online' ? 'bg-green-500' : 'bg-gray-400'}`;
        });
    }

    // Sync data across tabs
    syncAcrossTabs() {
        // Broadcast channel for cross-tab communication
        if ('BroadcastChannel' in window) {
            this.channel = new BroadcastChannel('sportsin-sync');
            
            this.channel.onmessage = (event) => {
                const { type, data } = event.data;
                
                switch (type) {
                    case 'user_login':
                        if (window.app) {
                            window.app.currentUser = data;
                            window.app.updateNavigation();
                        }
                        break;
                    case 'user_logout':
                        localStorage.removeItem('sportsin_currentUser');
                        window.location.href = 'index.html';
                        break;
                    case 'new_post':
                        if (window.app) window.app.loadPosts();
                        break;
                }
            };
        }
    }

    // Broadcast message to other tabs
    broadcast(type, data) {
        if (this.channel) {
            this.channel.postMessage({ type, data });
        }
    }
}

// Initialize Live API
const liveAPI = new LiveAPI();

// Auto-connect when page loads
document.addEventListener('DOMContentLoaded', () => {
    liveAPI.connect();
    liveAPI.syncAcrossTabs();
    
    // Start periodic sync for cross-tab session management
    setInterval(() => {
        const user = JSON.parse(localStorage.getItem('sportsin_currentUser'));
        if (user) {
            liveAPI.broadcast('heartbeat', { userId: user.id, timestamp: Date.now() });
        }
    }, 10000); // Every 10 seconds
});

// Export for global use
window.liveAPI = liveAPI;