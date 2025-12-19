// Firebase Configuration
// NOTE: Replace these values with your actual Firebase project credentials
// Get these from Firebase Console -> Project Settings -> Your Apps

const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
    databaseURL: "https://YOUR_PROJECT_ID-default-rtdb.firebaseio.com",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_PROJECT_ID.appspot.com",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Get references to Firebase services
const auth = firebase.auth();
const database = firebase.database();

// Authentication State Observer
auth.onAuthStateChanged((user) => {
    if (user) {
        console.log('User signed in:', user.email);
        document.getElementById('loginBtn').style.display = 'none';
        document.getElementById('logoutBtn').style.display = 'block';
        document.getElementById('userInfo').innerHTML += `<span style="margin-right: 10px; color: white;">${user.email}</span>`;
    } else {
        console.log('No user signed in');
        document.getElementById('loginBtn').style.display = 'block';
        document.getElementById('logoutBtn').style.display = 'none';
    }
});

// Simple Email/Password Login (for demo purposes)
document.addEventListener('DOMContentLoaded', () => {
    const loginBtn = document.getElementById('loginBtn');
    const logoutBtn = document.getElementById('logoutBtn');

    loginBtn.addEventListener('click', () => {
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
