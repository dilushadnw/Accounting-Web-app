// Firebase Configuration
// NOTE: Replace these values with your actual Firebase project credentials
// Get these from Firebase Console -> Project Settings -> Your Apps

const firebaseConfig = {
      apiKey: "AIzaSyDFEG1tTPNSRUH4Z_wcF29FwJMV9SORGaI",
  authDomain: "accounting-web-app-ff4bc.firebaseapp.com",
  projectId: "accounting-web-app-ff4bc",
  storageBucket: "accounting-web-app-ff4bc.appspot.com",
  messagingSenderId: "810376456564",
  appId: "1:810376456564:web:bb416cce7dfbbe818a2421",
  databaseURL: "https://accounting-web-app-ff4bc-default-rtdb.firebaseio.com"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Get references to Firebase services
const auth = firebase.auth();
const database = firebase.database();

// Authentication State Observer
auth.onAuthStateChanged((user) => {
    const userInfo = document.getElementById('userInfo');
    
    if (user) {
        console.log('User signed in:', user.email);
        document.getElementById('loginBtn').style.display = 'none';
        document.getElementById('logoutBtn').style.display = 'block';
        
        // Remove any existing user email span to prevent duplicates
        const existingSpan = userInfo.querySelector('.user-email');
        if (existingSpan) {
            existingSpan.remove();
        }
        
        // Safely add user email using textContent to prevent XSS
        const userSpan = document.createElement('span');
        userSpan.className = 'user-email';
        userSpan.style.marginRight = '10px';
        userSpan.style.color = 'white';
        userSpan.textContent = user.email;
        userInfo.appendChild(userSpan);
    } else {
        console.log('No user signed in');
        document.getElementById('loginBtn').style.display = 'block';
        document.getElementById('logoutBtn').style.display = 'none';
        
        // Remove user email span if it exists
        const existingSpan = userInfo.querySelector('.user-email');
        if (existingSpan) {
            existingSpan.remove();
        }
    }
});

// Simple Email/Password Login (for demo purposes)
document.addEventListener('DOMContentLoaded', () => {
    const loginBtn = document.getElementById('loginBtn');
    const logoutBtn = document.getElementById('logoutBtn');

    loginBtn.addEventListener('click', () => {
        // Note: Using prompt() for demo purposes only
        // In production, replace with a proper login form/modal
        const email = prompt('Enter email:');
        const password = prompt('Enter password:');
        
        if (email && password) {
            auth.signInWithEmailAndPassword(email, password)
                .then((userCredential) => {
                    alert('Login successful!');
                })
                .catch((error) => {
                    // If user doesn't exist, create a new account
                    if (error.code === 'auth/user-not-found') {
                        auth.createUserWithEmailAndPassword(email, password)
                            .then((userCredential) => {
                                alert('Account created and logged in!');
                            })
                            .catch((error) => {
                                alert('Error: ' + error.message);
                            });
                    } else {
                        alert('Error: ' + error.message);
                    }
                });
        }
    });

    logoutBtn.addEventListener('click', () => {
        auth.signOut().then(() => {
            alert('Logged out successfully!');
            location.reload();
        });
    });
});
