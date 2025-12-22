# Accounting Web App

A comprehensive web-based accounting application built with HTML, CSS, JavaScript, and Firebase - fully compatible with GitHub Pages.

## 🌟 Features

### Authentication System
- **Email/Password Login** - Secure authentication with Firebase Auth
- **Registration** - New user signup with form validation
- **Google Sign-In** - One-click authentication with Google
- **Password Reset** - Email-based password recovery
- **Remember Me** - Persistent login sessions
- Modern, responsive auth UI with blue theme (#2563eb)

### Dashboard
- **Professional Layout** - Clean QuickBooks-style interface
- **Financial Metrics** - Real-time display of:
  - Total Revenue: $125,450
  - Total Expenses: $78,230
  - Net Profit: $47,220
  - Accounts Receivable: $15,600
  - Accounts Payable: $8,900
  - Bank Balance: $52,340
- **Recent Activity** - Latest invoices and transactions
- **Responsive Design** - Works seamlessly on mobile, tablet, and desktop

### Invoice Management
- **Create Invoices** - Professional invoice creation with:
  - Auto-generated invoice numbers
  - Customer selection
  - Multiple line items with automatic calculations
  - Tax calculation (percentage-based)
  - Discount support (percentage or fixed amount)
  - Custom notes and payment terms
- **Invoice List** - Filterable and searchable invoice table
- **Invoice Preview** - Professional invoice view with print functionality
- **Real-time Calculations** - Automatic subtotal, tax, and total calculations
- **Firebase Integration** - Cloud storage with offline fallback

### Navigation
- **Collapsible Sidebar** - Touch-friendly mobile menu
- **Top Navbar** - Search bar and user menu
- **User Menu** - Profile access and logout
- **Breadcrumb Navigation** - Easy page tracking

## 🛠 Technologies Used

### Frontend
- **HTML5** - Semantic markup
- **CSS3** - Modern styling with flexbox and grid
- **JavaScript (ES6+)** - Modular, clean code

### Backend
- **Firebase Authentication** - User management
- **Firebase Firestore** - Real-time database
- **Firebase Realtime Database** - Legacy transaction support
- **Firebase Storage** - File uploads (for receipts)

### Development Tools
- **Visual Studio Code** - Recommended IDE
- **Live Server Extension** - Local development
- **Git** - Version control

## 📁 Project Structure

```
Accounting-Web-app/
├── index.html                      # Landing/redirect page
├── login.html                      # Login page
├── register.html                   # Registration page
├── forgot-password.html           # Password reset page
├── dashboard.html                  # Main dashboard
├── create-invoice.html             # Invoice creation
├── invoices.html                   # Invoice list
├── view-invoice.html               # Invoice preview
├── expenses.html                   # Expense management (placeholder)
├── customers.html                  # Customer management (placeholder)
├── reports.html                    # Financial reports (placeholder)
│
├── css/
│   ├── auth.css                   # Authentication pages styling
│   ├── main.css                   # Core layout and navigation
│   ├── dashboard.css              # Dashboard-specific styles
│   ├── invoice.css                # Invoice pages styling
│   └── styles.css                 # Legacy styles (kept for compatibility)
│
├── js/
│   ├── firebase-config.js         # Firebase initialization
│   ├── auth.js                    # Authentication logic
│   ├── dashboard.js               # Dashboard functionality
│   ├── invoice.js                 # Invoice creation logic
│   ├── invoices.js                # Invoice list logic
│   ├── app.js                     # Legacy app logic (kept for compatibility)
│   │
│   ├── models/
│   │   └── invoice-model.js       # Invoice data model and validation
│   │
│   ├── services/
│   │   └── firestore-service.js   # Database operations
│   │
│   └── utils/
│       ├── currency-utils.js      # Currency formatting
│       └── date-utils.js          # Date manipulation
│
├── java/                           # Java backend components
│   └── src/main/java/com/accounting/
│       ├── Transaction.java
│       ├── TransactionService.java
│       └── FirebaseManager.java
│
└── README.md
```

## 🚀 Setup Instructions

### Prerequisites
- Modern web browser (Chrome, Firefox, Safari, Edge)
- Firebase account (free tier works)
- Git (for deployment)

### Firebase Setup

1. **Create Firebase Project**
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Click "Add Project"
   - Follow the setup wizard

2. **Enable Authentication**
   - In Firebase Console, go to **Authentication** → **Sign-in method**
   - Enable **Email/Password**
   - Enable **Google** (optional but recommended)

3. **Create Firestore Database**
   - Go to **Firestore Database**
   - Click "Create database"
   - Start in **Test mode** (for development)
   - Choose a location

4. **Get Firebase Configuration**
   - Go to **Project Settings** → **Your Apps**
   - Click **Web** icon (</>) to add a web app
   - Copy the Firebase configuration object

5. **Update Configuration**
   - Open `js/firebase-config.js`
   - Replace the configuration with your Firebase credentials:
   ```javascript
   const firebaseConfig = {
       apiKey: "YOUR_API_KEY",
       authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
       projectId: "YOUR_PROJECT_ID",
       storageBucket: "YOUR_PROJECT_ID.appspot.com",
       messagingSenderId: "YOUR_SENDER_ID",
       appId: "YOUR_APP_ID",
       databaseURL: "https://YOUR_PROJECT_ID-default-rtdb.firebaseio.com"
   };
   ```

### Local Development

1. **Clone the Repository**
   ```bash
   git clone https://github.com/dilushadnw/Accounting-Web-app.git
   cd Accounting-Web-app
   ```

2. **Open with Live Server**
   - Install VS Code extension: "Live Server"
   - Right-click `index.html`
   - Select "Open with Live Server"
   - App opens at `http://localhost:5500`

3. **Create an Account**
   - Click "Sign up" on the login page
   - Enter your details
   - Start using the app!

### GitHub Pages Deployment

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Deploy accounting app"
   git push origin main
   ```

2. **Enable GitHub Pages**
   - Go to repository **Settings** → **Pages**
   - Source: Deploy from branch
   - Branch: `main` / `(root)`
   - Click "Save"

3. **Access Your App**
   - Your app will be live at: `https://yourusername.github.io/Accounting-Web-app/`

## 📱 Usage Guide

### Getting Started
1. **Register** - Create your account on the registration page
2. **Login** - Sign in with your credentials
3. **Dashboard** - View your financial overview
4. **Create Invoice** - Click "Invoices" → "Create Invoice"
5. **Manage** - Track, edit, and send invoices to customers

### Creating an Invoice
1. Navigate to **Invoices** → **Create Invoice**
2. Select or enter customer name
3. Add line items (description, quantity, rate)
4. Set tax rate and discount (optional)
5. Add notes and payment terms
6. Click **Save as Draft** or **Save and Send**

### Managing Invoices
- **View All** - See all invoices in the Invoices page
- **Filter** - Search by invoice number or customer
- **Status** - Filter by Draft, Sent, Paid, or Overdue
- **Actions** - View, edit, or delete invoices

## 🔒 Security

### Firebase Security Rules

**Firestore Rules** (deploy via Firebase Console):
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    match /invoices/{invoiceId} {
      allow read, write: if request.auth != null && 
                           resource.data.userId == request.auth.uid;
    }
    match /customers/{customerId} {
      allow read, write: if request.auth != null && 
                           resource.data.userId == request.auth.uid;
    }
    match /expenses/{expenseId} {
      allow read, write: if request.auth != null && 
                           resource.data.userId == request.auth.uid;
    }
  }
}
```

**Realtime Database Rules**:
```json
{
  "rules": {
    "users": {
      "$uid": {
        ".read": "$uid === auth.uid",
        ".write": "$uid === auth.uid"
      }
    }
  }
}
```

### Best Practices
- ✅ Never commit Firebase credentials to public repositories
- ✅ Use environment variables for sensitive data in production
- ✅ Enable Firebase App Check for additional security
- ✅ Regularly rotate API keys
- ✅ Monitor Firebase usage and set budget alerts

## 🎨 Customization

### Colors
Edit `css/main.css` and `css/auth.css` to change the color scheme:
- Primary Blue: `#2563eb`
- Success Green: `#059669`
- Danger Red: `#dc2626`
- Warning Orange: `#d97706`

### Logo
Replace the text logo in navbar with your company logo:
```html
<div class="logo">
    <img src="your-logo.png" alt="Your Company">
</div>
```

### Categories
Add or modify categories in the invoice and expense forms by editing the HTML select options.

## 🐛 Troubleshooting

### Firebase Not Working
- Verify your Firebase configuration in `js/firebase-config.js`
- Check Firebase console for enabled services
- Ensure Firebase rules allow your operations
- Check browser console for error messages

### Authentication Issues
- Clear browser cache and cookies
- Check that Email/Password is enabled in Firebase Auth
- Verify redirect URLs in Firebase Auth settings

### Invoice Not Saving
- Check browser console for errors
- Verify Firestore is enabled and has correct rules
- Ensure user is authenticated
- Check network tab for failed requests

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is open source and available for educational purposes.

## 🙏 Support

For issues or questions:
- Open an issue on GitHub
- Check existing issues for solutions
- Review Firebase documentation for backend questions

## 📞 Contact

Project Link: [https://github.com/dilushadnw/Accounting-Web-app](https://github.com/dilushadnw/Accounting-Web-app)

---

**Made with ❤️ for small businesses and freelancers**