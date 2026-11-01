/**
 * CineBook - Page 1: Signup Script
 * Responsible: Group Member 1
 * Concepts: Form Handling, Event Listeners, Input Validation, Fetch API, DOM Manipulation
 */

document.addEventListener('DOMContentLoaded', () => {
    const signupForm = document.getElementById('signup-form');
    const submitBtn = document.getElementById('btn-submit-signup');
    const nameInput = document.getElementById('name');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const confirmPasswordInput = document.getElementById('confirm-password');

    // Handle registration form submission
    signupForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        CineBook.clearAlert('signup-alert');

        // Extract and trim form values
        const name = nameInput.value.trim();
        const email = emailInput.value.trim();
        const password = passwordInput.value;
        const confirmPassword = confirmPasswordInput.value;

        // 1. Client-Side Validation: Check empty inputs
        if (!name || !email || !password || !confirmPassword) {
            CineBook.showAlert('signup-alert', 'Please fill in all the required fields.', 'danger');
            return;
        }

        // 2. Client-Side Validation: Name length
        if (name.length < 2) {
            CineBook.showAlert('signup-alert', 'Name must contain at least 2 characters.', 'danger');
            nameInput.focus();
            return;
        }

        // 3. Client-Side Validation: Valid email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            CineBook.showAlert('signup-alert', 'Please enter a valid email address (e.g. user@example.com).', 'danger');
            emailInput.focus();
            return;
        }

        // 4. Client-Side Validation: Minimum password length
        if (password.length < 6) {
            CineBook.showAlert('signup-alert', 'Password must be at least 6 characters long.', 'danger');
            passwordInput.focus();
            return;
        }

        // 5. Client-Side Validation: Password matching
        if (password !== confirmPassword) {
            CineBook.showAlert('signup-alert', 'Passwords do not match. Please verify.', 'danger');
            confirmPasswordInput.focus();
            return;
        }

        // Indicate loading state
        submitBtn.disabled = true;
        submitBtn.textContent = 'Creating Account...';

        try {
            // 6. Send POST request to backend Express API
            const response = await fetch('/api/signup', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    name,
                    email,
                    password,
                    confirmPassword
                })
            });

            const data = await response.json();

            if (response.ok && data.success) {
                // Show success feedback
                CineBook.showAlert('signup-alert', data.message + ' Redirecting to login...', 'success');
                signupForm.reset();

                // Redirect user to login page after short delay
                setTimeout(() => {
                    window.location.href = '/login.html';
                }, 1500);
            } else {
                // Show error message returned from server (e.g. duplicate email)
                CineBook.showAlert('signup-alert', data.message || 'Signup failed. Please try again.', 'danger');
                submitBtn.disabled = false;
                submitBtn.textContent = 'Create Account';
            }
        } catch (err) {
            console.error('[Signup Fetch Error]:', err);
            CineBook.showAlert('signup-alert', 'Unable to reach the server. Please check your connection.', 'danger');
            submitBtn.disabled = false;
            submitBtn.textContent = 'Create Account';
        }
    });
});
