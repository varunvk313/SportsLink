// Real-time Notifications System
class NotificationSystem {
    constructor() {
        this.notifications = JSON.parse(localStorage.getItem('sportsin_notifications')) || [];
        this.pollingInterval = null;
        this.init();
    }

    init() {
        this.createNotificationBell();
        this.startNotificationPolling();
    }

    createNotificationBell() {
        const user = JSON.parse(localStorage.getItem('sportsin_currentUser'));
        if (!user) return;

        const navContainer = document.querySelector('nav .flex.items-center.space-x-6');
        if (!navContainer || document.getElementById('notification-bell')) return;

        const bellHTML = `
            <div class="relative">
                <button id="notification-bell" class="relative p-2 text-gray-500 hover:text-gray-700">
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path>
                    </svg>
                    <span id="notification-count" class="hidden absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">0</span>
                </button>
                <div id="notification-dropdown" class="hidden absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border z-50">
                    <div class="p-4 border-b">
                        <h3 class="font-bold text-lg">Notifications</h3>
                    </div>
                    <div id="notification-list" class="max-h-96 overflow-y-auto">
                        <!-- Notifications will be loaded here -->
                    </div>
                </div>
            </div>
        `;

        navContainer.insertAdjacentHTML('beforeend', bellHTML);
        
        document.getElementById('notification-bell').addEventListener('click', () => {
            this.toggleNotificationDropdown();
        });

        this.updateNotificationCount();
    }

    toggleNotificationDropdown() {
        const dropdown = document.getElementById('notification-dropdown');
        dropdown.classList.toggle('hidden');
        if (!dropdown.classList.contains('hidden')) {
            this.loadNotifications();
            this.markAllAsRead();
        }
    }

    addNotification(type, message, data = {}) {
        const notification = {
            id: Date.now(),
            type: type,
            message: message,
            data: data,
            timestamp: new Date().toISOString(),
            read: false
        };

        this.notifications.unshift(notification);
        localStorage.setItem('sportsin_notifications', JSON.stringify(this.notifications));
        this.updateNotificationCount();
        this.showToast(message);
    }

    loadNotifications() {
        const container = document.getElementById('notification-list');
        if (this.notifications.length === 0) {
            container.innerHTML = '<p class="p-4 text-gray-500 text-center">No notifications yet</p>';
            return;
        }

        container.innerHTML = this.notifications.map(notif => `
            <div class="p-4 border-b hover:bg-gray-50 ${!notif.read ? 'bg-blue-50' : ''}">
                <div class="flex items-start">
                    <div class="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm mr-3">
                        ${this.getNotificationIcon(notif.type)}
                    </div>
                    <div class="flex-1">
                        <p class="text-sm text-gray-800">${notif.message}</p>
                        <p class="text-xs text-gray-500 mt-1">${this.formatTime(notif.timestamp)}</p>
                    </div>
                </div>
            </div>
        `).join('');
    }

    getNotificationIcon(type) {
        const icons = {
            'connection': '👥',
            'application': '📄',
            'opportunity': '💼',
            'post': '📝',
            'system': '⚙️'
        };
        return icons[type] || '📢';
    }

    formatTime(timestamp) {
        const now = new Date();
        const time = new Date(timestamp);
        const diff = now - time;
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);

        if (days > 0) return `${days}d ago`;
        if (hours > 0) return `${hours}h ago`;
        if (minutes > 0) return `${minutes}m ago`;
        return 'Just now';
    }

    updateNotificationCount() {
        const unreadCount = this.notifications.filter(n => !n.read).length;
        const countElement = document.getElementById('notification-count');
        if (countElement) {
            if (unreadCount > 0) {
                countElement.textContent = unreadCount > 99 ? '99+' : unreadCount;
                countElement.classList.remove('hidden');
            } else {
                countElement.classList.add('hidden');
            }
        }
    }

    markAllAsRead() {
        this.notifications.forEach(n => n.read = true);
        localStorage.setItem('sportsin_notifications', JSON.stringify(this.notifications));
        this.updateNotificationCount();
    }

    showToast(message) {
        const toast = document.createElement('div');
        toast.className = 'fixed top-20 right-4 bg-blue-500 text-white p-4 rounded-lg shadow-lg z-50 transform transition-all duration-300';
        toast.innerHTML = `
            <div class="flex items-center">
                <span class="mr-2">🔔</span>
                <span>${message}</span>
                <button onclick="this.parentElement.parentElement.remove()" class="ml-3 text-white hover:text-gray-200">×</button>
            </div>
        `;
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 5000);
    }

    startNotificationPolling() {
        // Disabled automatic notifications to prevent spam
        // Only manual notifications will be shown
    }
}

// Initialize notifications (singleton pattern)
let notificationSystem = null;

function initNotifications() {
    if (notificationSystem) return notificationSystem;
    
    const user = JSON.parse(localStorage.getItem('sportsin_currentUser'));
    if (!user) return null;
    
    notificationSystem = new NotificationSystem();
    window.notificationSystem = notificationSystem;
    return notificationSystem;
}

document.addEventListener('DOMContentLoaded', () => {
    setTimeout(initNotifications, 1000);
});