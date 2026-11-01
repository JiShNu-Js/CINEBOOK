/**
 * CineBook - Shared Client Utility Script
 * Course: Internet Programming (B.Tech 2nd Year)
 *
 * Provides shared navbar rendering, authentication session check,
 * alert display helpers, and logout functionality across all pages.
 */

const CineBook = {
    // Current authenticated user state
    currentUser: null,

    /**
     * Check active session status via GET /api/me
     * and update top navigation bar accordingly
     */
    async initAuth() {
        try {
            const res = await fetch('/api/me');
            const data = await res.json();

            const navAuthContainer = document.getElementById('nav-auth-container');
            const adminNavLink = document.getElementById('nav-admin-link');

            if (data.loggedIn && data.user) {
                this.currentUser = data.user;

                // If user is admin, reveal Admin Panel navigation link
                if (adminNavLink) {
                    if (data.user.role === 'admin') {
                        adminNavLink.style.display = 'inline-block';
                    } else {
                        adminNavLink.style.display = 'none';
                    }
                }

                // Render logged-in user controls
                if (navAuthContainer) {
                    navAuthContainer.innerHTML = `
                        <span class="user-greeting">
                            👤 ${this.escapeHtml(data.user.name)}
                        </span>
                        <button id="btn-logout" class="btn btn-outline btn-sm">
                            Logout
                        </button>
                    `;

                    // Bind logout handler
                    const logoutBtn = document.getElementById('btn-logout');
                    if (logoutBtn) {
                        logoutBtn.addEventListener('click', () => this.handleLogout());
                    }
                }
            } else {
                this.currentUser = null;
                if (adminNavLink) adminNavLink.style.display = 'none';

                // Render guest navigation links
                if (navAuthContainer) {
                    navAuthContainer.innerHTML = `
                        <a href="/login.html" class="btn btn-outline btn-sm">Log In</a>
                        <a href="/signup.html" class="btn btn-primary btn-sm">Sign Up</a>
                    `;
                }
            }
        } catch (err) {
            console.error('[CineBook Auth Check Failed]:', err);
        }
    },

    /**
     * Terminate session via POST /api/logout
     */
    async handleLogout() {
        try {
            const res = await fetch('/api/logout', { method: 'POST' });
            const data = await res.json();
            if (data.success) {
                window.location.href = '/login.html';
            }
        } catch (err) {
            console.error('[Logout Failed]:', err);
        }
    },

    /**
     * Display styled alert feedback message in a target container
     */
    showAlert(containerId, message, type = 'danger') {
        const container = document.getElementById(containerId);
        if (!container) return;

        let icon = '⚠️';
        if (type === 'success') icon = '✅';
        if (type === 'warning') icon = '🔔';

        container.innerHTML = `
            <div class="alert alert-${type}">
                <span>${icon}</span>
                <div>${message}</div>
            </div>
        `;
    },

    /**
     * Clear alert message in container
     */
    clearAlert(containerId) {
        const container = document.getElementById(containerId);
        if (container) container.innerHTML = '';
    },

    /**
     * Sanitize string against XSS injection
     */
    escapeHtml(str) {
        if (!str) return '';
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    },

    /**
     * Format number as currency (₹ INR)
     */
    formatCurrency(val) {
        const num = parseFloat(val) || 0;
        return `₹${num.toFixed(2)}`;
    }
};

// Automatically check authentication on page DOM readiness
document.addEventListener('DOMContentLoaded', () => {
    CineBook.initAuth();
});
