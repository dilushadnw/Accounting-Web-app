/**
 * Authentication Logic
 * Handles login, registration, password reset, and Google Sign-In
 */

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', () => {
    // Initialize authentication based on current page
    const currentPage = window.location.pathname;
    
    if (currentPage.includes('login.html')) {
        initLogin();
    } else if (currentPage.includes('register.html')) {
        initRegister();
    } else if (currentPage.includes('forgot-password.html')) {
        initForgotPassword();
    }
    
    // Check authentication state
    checkAuthState();
});

/**
 * Check if user is already authenticated
 */
function checkAuthState() {
    auth.onAuthStateChanged((user) => {
        if (user) {
            // User is signed in, redirect to dashboard if on auth pages
            const currentPage = window.location.pathname;
            if (currentPage.includes('login.html') || 
                currentPage.includes('register.html') || 
                currentPage.includes('forgot-password.html')) {
                window.location.href = 'dashboard.html';
            }
        }
    });
}

/**
 * Initialize Login Page
 */
function initLogin() {
    const loginForm = document.getElementById('loginForm');
    const googleSignInBtn = document.getElementById('googleSignInBtn');
    const rememberMeCheckbox = document.getElementById('rememberMe');
    
    // Handle login form submission
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        clearErrors();
        
        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value;
        const rememberMe = rememberMeCheckbox.checked;
        
        // Validate inputs
        if (!validateEmail(email)) {
            showError('emailError', 'Please enter a valid email address');
            return;
        }
        
        if (password.length < 6) {
            showError('passwordError', 'Password must be at least 6 characters');
            return;
        }
        
        // Show loading state
        setLoading('loginBtn', true);
        
        try {
            // Set persistence based on Remember Me checkbox
            const persistence = rememberMe ? 
                firebase.auth.Auth.Persistence.LOCAL : 
                firebase.auth.Auth.Persistence.SESSION;
            
            await auth.setPersistence(persistence);
            
            // Sign in with email and password
            await auth.signInWithEmailAndPassword(email, password);
            
            // Show success message
            showSuccess('formSuccess', 'Login successful! Redirecting...');
            
            // Redirect to dashboard
            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 1000);
            
        } catch (error) {
            console.error('Login error:', error);
            handleAuthError(error);
        } finally {
            setLoading('loginBtn', false);
        }
    });
    
    // Handle Google Sign-In
    googleSignInBtn.addEventListener('click', async () => {
        const provider = new firebase.auth.GoogleAuthProvider();
        
        try {
            await auth.signInWithPopup(provider);
            showSuccess('formSuccess', 'Login successful! Redirecting...');
            
            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 1000);
            
        } catch (error) {
            console.error('Google Sign-In error:', error);
            handleAuthError(error);
        }
    });
}

/**
 * Initialize Registration Page
 */
function initRegister() {
    const registerForm = document.getElementById('registerForm');
    const googleSignInBtn = document.getElementById('googleSignInBtn');
    
    // Handle registration form submission
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        clearErrors();
        
        const fullName = document.getElementById('fullName').value.trim();
        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        const agreeTerms = document.getElementById('agreeTerms').checked;
        
        // Validate inputs
        if (fullName.length < 2) {
            showError('fullNameError', 'Please enter your full name');
            return;
        }
        
        if (!validateEmail(email)) {
            showError('emailError', 'Please enter a valid email address');
            return;
        }
        
        if (password.length < 6) {
            showError('passwordError', 'Password must be at least 6 characters');
            return;
        }
        
        if (password !== confirmPassword) {
            showError('confirmPasswordError', 'Passwords do not match');
            return;
        }
        
        if (!agreeTerms) {
            showError('formError', 'Please agree to the Terms & Conditions');
            return;
        }
        
        // Show loading state
        setLoading('registerBtn', true);
        
        try {
            // Create user with email and password
            const userCredential = await auth.createUserWithEmailAndPassword(email, password);
            
            // Update user profile with display name
            await userCredential.user.updateProfile({
                displayName: fullName
            });
            
            // Create user document in Firestore (if available)
            if (typeof db !== 'undefined') {
                await db.collection('users').doc(userCredential.user.uid).set({
                    displayName: fullName,
                    email: email,
                    createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                    role: 'user'
                });
            }
            
            // Show success message
            showSuccess('formSuccess', 'Account created successfully! Redirecting...');
            
            // Redirect to dashboard
            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 1500);
            
        } catch (error) {
            console.error('Registration error:', error);
            handleAuthError(error);
        } finally {
            setLoading('registerBtn', false);
        }
    });
    
    // Handle Google Sign-In
    googleSignInBtn.addEventListener('click', async () => {
        const provider = new firebase.auth.GoogleAuthProvider();
        
        try {
            const result = await auth.signInWithPopup(provider);
            
            // Create user document in Firestore for new users
            if (typeof db !== 'undefined' && result.additionalUserInfo.isNewUser) {
                await db.collection('users').doc(result.user.uid).set({
                    displayName: result.user.displayName,
                    email: result.user.email,
                    createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                    role: 'user'
                });
            }
            
            showSuccess('formSuccess', 'Account created successfully! Redirecting...');
            
            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 1000);
            
        } catch (error) {
            console.error('Google Sign-In error:', error);
            handleAuthError(error);
        }
    });
}

/**
 * Initialize Forgot Password Page
 */
function initForgotPassword() {
    const forgotPasswordForm = document.getElementById('forgotPasswordForm');
    
    forgotPasswordForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        clearErrors();
        
        const email = document.getElementById('email').value.trim();
        
        // Validate email
        if (!validateEmail(email)) {
            showError('emailError', 'Please enter a valid email address');
            return;
        }
        
        // Show loading state
        setLoading('resetBtn', true);
        
        try {
            // Send password reset email
            await auth.sendPasswordResetEmail(email);
            
            // Show success message
            showSuccess('formSuccess', 'Password reset email sent! Please check your inbox.');
            
            // Clear form
            document.getElementById('email').value = '';
            
        } catch (error) {
            console.error('Password reset error:', error);
            handleAuthError(error);
        } finally {
            setLoading('resetBtn', false);
        }
    });
}

/**
 * Validate email format
 */
function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

/**
 * Show error message
 */
function showError(elementId, message) {
    const errorElement = document.getElementById(elementId);
    if (errorElement) {
        errorElement.textContent = message;
        
        // Add error class to input if it's a field error
        if (elementId.includes('Error') && elementId !== 'formError') {
            const inputId = elementId.replace('Error', '');
            const inputElement = document.getElementById(inputId);
            if (inputElement) {
                inputElement.classList.add('error');
            }
        }
    }
}

/**
 * Show success message
 */
function showSuccess(elementId, message) {
    const successElement = document.getElementById(elementId);
    if (successElement) {
        successElement.textContent = message;
    }
}

/**
 * Clear all error messages
 */
function clearErrors() {
    const errorElements = document.querySelectorAll('.error-message');
    errorElements.forEach(element => {
        element.textContent = '';
    });
    
    const inputElements = document.querySelectorAll('input.error');
    inputElements.forEach(element => {
        element.classList.remove('error');
    });
}

/**
 * Set loading state for a button
 */
function setLoading(buttonId, isLoading) {
    const button = document.getElementById(buttonId);
    if (!button) return;
    
    const btnText = button.querySelector('.btn-text');
    const btnLoader = button.querySelector('.btn-loader');
    
    if (isLoading) {
        button.disabled = true;
        if (btnText) btnText.style.display = 'none';
        if (btnLoader) btnLoader.style.display = 'inline-block';
    } else {
        button.disabled = false;
        if (btnText) btnText.style.display = 'inline';
        if (btnLoader) btnLoader.style.display = 'none';
    }
}

/**
 * Handle authentication errors
 */
function handleAuthError(error) {
    let errorMessage = 'An error occurred. Please try again.';
    
    switch (error.code) {
        case 'auth/email-already-in-use':
            errorMessage = 'This email is already registered. Please login instead.';
            break;
        case 'auth/invalid-email':
            errorMessage = 'Invalid email address.';
            break;
        case 'auth/user-not-found':
            errorMessage = 'No account found with this email.';
            break;
        case 'auth/wrong-password':
            errorMessage = 'Incorrect password. Please try again.';
            break;
        case 'auth/weak-password':
            errorMessage = 'Password is too weak. Please use at least 6 characters.';
            break;
        case 'auth/too-many-requests':
            errorMessage = 'Too many failed attempts. Please try again later.';
            break;
        case 'auth/network-request-failed':
            errorMessage = 'Network error. Please check your connection.';
            break;
        case 'auth/popup-closed-by-user':
            errorMessage = 'Sign-in popup was closed. Please try again.';
            break;
        default:
            errorMessage = error.message || errorMessage;
    }
    
    showError('formError', errorMessage);
}
