/**
 * CineBook - Page 2: Login Script
 * Responsible: Group Member 2
 * Concepts: Authentication Integration, Form Events, Error Feedback, Sessions, Redirects
 */

document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const submitBtn = document.getElementById('btn-submit-login');

    // Parse URL query parameter for redirect destination (e.g. booking page)
    const urlParams = new URLSearchParams(window.location.search);
    const redirectUrl = urlParams.get('redirect') || '/movies.html';

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        CineBook.clearAlert('login-alert');

        const email = emailInput.value.trim();
        const password = passwordInput.value;

        // 1. Client-Side Input Validation
        if (!email || !password) {
            CineBook.showAlert('login-alert', 'Please enter both your email and password.', 'danger');
            return;
        }

        // Indicate loading state
        submitBtn.disabled = true;
        submitBtn.textContent = 'Logging In...';

        try {
            // 2. Send authentication request to Express backend
            const response = await fetch('/api/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();

            if (response.ok && data.success) {
                // Successful login
                CineBook.showAlert('login-alert', 'Login successful! Redirecting...', 'success');

                // Redirect to intended page or movie catalog
                setTimeout(() => {
                    window.location.href = redirectUrl;
                }, 800);
            } else {
                // Invalid credentials or error
                CineBook.showAlert('login-alert', data.message || 'Invalid email or password.', 'danger');
                submitBtn.disabled = false;
                submitBtn.textContent = 'Log In';
            }
        } catch (err) {
            console.error('[Login Fetch Error]:', err);
            CineBook.showAlert('login-alert', 'Server connection error. Please try again later.', 'danger');
            submitBtn.disabled = false;
            submitBtn.textContent = 'Log In';
        }
    });
});
