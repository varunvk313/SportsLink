// Admin Page Settings - Allow admins to edit any page content
class AdminPageSettings {
    constructor() {
        this.currentUser = JSON.parse(localStorage.getItem('sportsin_currentUser'));
        this.init();
    }

    init() {
        if (this.currentUser && this.currentUser.isAdmin) {
            this.addAdminControls();
            this.loadPageSettings();
        }
    }

    addAdminControls() {
        // Add floating admin panel
        const adminPanel = document.createElement('div');
        adminPanel.id = 'admin-floating-panel';
        adminPanel.innerHTML = `
            <div style="position: fixed; top: 80px; right: 20px; z-index: 1000; background: #dc2626; color: white; padding: 10px; rounded: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                <div style="font-weight: bold; margin-bottom: 8px;">Admin Controls</div>
                <button onclick="adminPageSettings.toggleEditMode()" style="background: white; color: #dc2626; border: none; padding: 4px 8px; border-radius: 4px; margin: 2px; cursor: pointer;">Edit Page</button>
                <button onclick="adminPageSettings.saveChanges()" style="background: #16a34a; color: white; border: none; padding: 4px 8px; border-radius: 4px; margin: 2px; cursor: pointer;">Save</button>
                <button onclick="adminPageSettings.resetPage()" style="background: #f59e0b; color: white; border: none; padding: 4px 8px; border-radius: 4px; margin: 2px; cursor: pointer;">Reset</button>
            </div>
        `;
        document.body.appendChild(adminPanel);
    }

    toggleEditMode() {
        const editableElements = document.querySelectorAll('h1, h2, h3, p, span, a');
        editableElements.forEach(el => {
            if (!el.closest('#admin-floating-panel') && !el.closest('nav')) {
                el.contentEditable = el.contentEditable === 'true' ? 'false' : 'true';
                el.style.border = el.contentEditable === 'true' ? '2px dashed #dc2626' : 'none';
                el.style.padding = el.contentEditable === 'true' ? '4px' : '';
            }
        });
        
        // Make images replaceable
        const images = document.querySelectorAll('img');
        images.forEach(img => {
            if (img.contentEditable !== 'true') {
                img.onclick = () => this.replaceImage(img);
                img.style.cursor = 'pointer';
                img.style.border = '2px dashed #dc2626';
            }
        });
    }

    replaceImage(img) {
        const newSrc = prompt('Enter new image URL:', img.src);
        if (newSrc) {
            img.src = newSrc;
        }
    }

    saveChanges() {
        const pageData = {
            url: window.location.pathname,
            content: {},
            timestamp: new Date().toISOString()
        };

        // Save text content
        const editableElements = document.querySelectorAll('[contenteditable="true"]');
        editableElements.forEach((el, index) => {
            pageData.content[`element_${index}`] = {
                tagName: el.tagName,
                innerHTML: el.innerHTML,
                className: el.className,
                id: el.id
            };
        });

        // Save images
        const images = document.querySelectorAll('img');
        images.forEach((img, index) => {
            pageData.content[`image_${index}`] = {
                src: img.src,
                alt: img.alt,
                className: img.className,
                id: img.id
            };
        });

        // Store in localStorage
        const pageSettings = JSON.parse(localStorage.getItem('sportsin_page_settings')) || {};
        pageSettings[window.location.pathname] = pageData;
        localStorage.setItem('sportsin_page_settings', JSON.stringify(pageSettings));

        alert('Page changes saved successfully!');
        this.toggleEditMode(); // Exit edit mode
    }

    loadPageSettings() {
        const pageSettings = JSON.parse(localStorage.getItem('sportsin_page_settings')) || {};
        const currentPageSettings = pageSettings[window.location.pathname];

        if (currentPageSettings) {
            // Restore text content
            Object.entries(currentPageSettings.content).forEach(([key, data]) => {
                if (key.startsWith('element_')) {
                    const elements = document.querySelectorAll(data.tagName.toLowerCase());
                    elements.forEach(el => {
                        if (el.className === data.className && el.id === data.id) {
                            el.innerHTML = data.innerHTML;
                        }
                    });
                } else if (key.startsWith('image_')) {
                    const images = document.querySelectorAll('img');
                    images.forEach(img => {
                        if (img.className === data.className && img.id === data.id) {
                            img.src = data.src;
                            img.alt = data.alt;
                        }
                    });
                }
            });
        }
    }

    resetPage() {
        if (confirm('Reset this page to default content? This cannot be undone.')) {
            const pageSettings = JSON.parse(localStorage.getItem('sportsin_page_settings')) || {};
            delete pageSettings[window.location.pathname];
            localStorage.setItem('sportsin_page_settings', JSON.stringify(pageSettings));
            location.reload();
        }
    }

    // Page-specific settings
    addPageSpecificControls() {
        const pageName = window.location.pathname.split('/').pop().replace('.html', '');
        
        switch(pageName) {
            case 'index':
            case 'home':
                this.addHomePageControls();
                break;
            case 'dashboard':
                this.addDashboardControls();
                break;
            case 'news':
                this.addNewsControls();
                break;
            case 'opportunities':
                this.addOpportunitiesControls();
                break;
        }
    }

    addHomePageControls() {
        const controls = document.createElement('div');
        controls.innerHTML = `
            <button onclick="adminPageSettings.editHeroSection()" style="background: #3b82f6; color: white; border: none; padding: 4px 8px; border-radius: 4px; margin: 2px; cursor: pointer;">Edit Hero</button>
            <button onclick="adminPageSettings.editStats()" style="background: #8b5cf6; color: white; border: none; padding: 4px 8px; border-radius: 4px; margin: 2px; cursor: pointer;">Edit Stats</button>
        `;
        document.getElementById('admin-floating-panel').appendChild(controls);
    }

    editHeroSection() {
        const heroTitle = document.querySelector('h1');
        const heroSubtitle = document.querySelector('.text-xl');
        
        if (heroTitle) {
            const newTitle = prompt('Edit hero title:', heroTitle.textContent);
            if (newTitle) heroTitle.textContent = newTitle;
        }
        
        if (heroSubtitle) {
            const newSubtitle = prompt('Edit hero subtitle:', heroSubtitle.textContent);
            if (newSubtitle) heroSubtitle.textContent = newSubtitle;
        }
    }

    editStats() {
        const statElements = document.querySelectorAll('[data-target]');
        statElements.forEach(stat => {
            const currentValue = stat.getAttribute('data-target');
            const newValue = prompt(`Edit stat value (current: ${currentValue}):`, currentValue);
            if (newValue) {
                stat.setAttribute('data-target', newValue);
                stat.textContent = newValue;
            }
        });
    }

    addDashboardControls() {
        const controls = document.createElement('div');
        controls.innerHTML = `
            <button onclick="adminPageSettings.moderateAllPosts()" style="background: #f59e0b; color: white; border: none; padding: 4px 8px; border-radius: 4px; margin: 2px; cursor: pointer;">Moderate Posts</button>
        `;
        document.getElementById('admin-floating-panel').appendChild(controls);
    }

    moderateAllPosts() {
        const posts = document.querySelectorAll('.card');
        posts.forEach(post => {
            const deleteBtn = document.createElement('button');
            deleteBtn.textContent = 'Delete';
            deleteBtn.style.cssText = 'background: #dc2626; color: white; border: none; padding: 2px 6px; border-radius: 4px; margin: 4px; cursor: pointer;';
            deleteBtn.onclick = () => post.remove();
            post.appendChild(deleteBtn);
        });
    }

    addNewsControls() {
        const controls = document.createElement('div');
        controls.innerHTML = `
            <button onclick="adminPageSettings.addNewsArticle()" style="background: #10b981; color: white; border: none; padding: 4px 8px; border-radius: 4px; margin: 2px; cursor: pointer;">Add Article</button>
        `;
        document.getElementById('admin-floating-panel').appendChild(controls);
    }

    addNewsArticle() {
        const title = prompt('Article title:');
        const content = prompt('Article content:');
        if (title && content) {
            const newsContainer = document.querySelector('.space-y-6') || document.querySelector('main');
            const article = document.createElement('div');
            article.className = 'card';
            article.innerHTML = `
                <h3 class="text-xl font-bold mb-2">${title}</h3>
                <p class="text-gray-600 mb-4">${content}</p>
                <p class="text-sm text-gray-500">Admin • Just now</p>
            `;
            newsContainer.prepend(article);
        }
    }

    addOpportunitiesControls() {
        const controls = document.createElement('div');
        controls.innerHTML = `
            <button onclick="adminPageSettings.addJobListing()" style="background: #6366f1; color: white; border: none; padding: 4px 8px; border-radius: 4px; margin: 2px; cursor: pointer;">Add Job</button>
        `;
        document.getElementById('admin-floating-panel').appendChild(controls);
    }

    addJobListing() {
        const title = prompt('Job title:');
        const company = prompt('Company:');
        const location = prompt('Location:');
        if (title && company && location) {
            const jobsContainer = document.querySelector('.space-y-4') || document.querySelector('main');
            const job = document.createElement('div');
            job.className = 'card';
            job.innerHTML = `
                <h3 class="text-xl font-bold mb-2">${title}</h3>
                <p class="text-gray-600 mb-2">${company} • ${location}</p>
                <button class="btn-primary px-4 py-2 rounded">Apply Now</button>
            `;
            jobsContainer.prepend(job);
        }
    }
}

// Initialize admin page settings
let adminPageSettings;
document.addEventListener('DOMContentLoaded', () => {
    adminPageSettings = new AdminPageSettings();
    setTimeout(() => {
        if (adminPageSettings.currentUser && adminPageSettings.currentUser.isAdmin) {
            adminPageSettings.addPageSpecificControls();
        }
    }, 1000);
});