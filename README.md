# Accounting Web App

A comprehensive web-based accounting application built with HTML, CSS, JavaScript, Java, and Firebase.

## Features

- **Dashboard**: View financial summary with total income, expenses, net balance, and transaction count
- **Transaction Management**: Add, view, filter, and delete transactions
- **Categories**: Organize transactions by categories (Salary, Food, Transport, Utilities, Entertainment, Other)
- **Reports**: Generate category-wise and monthly financial reports
- **Firebase Integration**: Real-time data synchronization and authentication
- **Responsive Design**: Works on desktop and mobile devices
- **User Authentication**: Secure login with Firebase Authentication

## Technologies Used

- **Frontend**:
  - HTML5
  - CSS3 (with responsive design)
  - JavaScript (ES6+)
  
- **Backend**:
  - Java (for business logic and data management)
  - Firebase Realtime Database
  - Firebase Authentication

- **Development Tools**:
  - Visual Studio Code
  - Live Server Extension

## Project Structure

```
Accounting-Web-app/
├── index.html              # Main HTML file
├── css/
│   └── styles.css          # Styling and responsive design
├── js/
│   ├── firebase-config.js  # Firebase configuration
│   └── app.js              # Main application logic
├── java/
│   └── src/main/java/com/accounting/
│       ├── Transaction.java        # Transaction entity
│       ├── TransactionService.java # Business logic
│       └── FirebaseManager.java    # Firebase integration
├── .vscode/
│   ├── settings.json       # VS Code settings
│   └── extensions.json     # Recommended extensions
└── README.md
```

## Setup Instructions

### Prerequisites

- Visual Studio Code
- Java Development Kit (JDK 11 or higher)
- A Firebase account and project
- Modern web browser (Chrome, Firefox, Safari, Edge)

### Firebase Setup

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or select an existing one
3. Enable Authentication:
   - Go to Authentication > Sign-in method
   - Enable Email/Password authentication
4. Enable Realtime Database:
   - Go to Realtime Database
   - Create database in test mode (or configure security rules)
5. Get your Firebase configuration:
   - Go to Project Settings > Your Apps
   - Copy the Firebase configuration object
6. Update `js/firebase-config.js` with your Firebase credentials:
   ```javascript
   const firebaseConfig = {
       apiKey: "YOUR_API_KEY",
       authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
       databaseURL: "https://YOUR_PROJECT_ID-default-rtdb.firebaseio.com",
       projectId: "YOUR_PROJECT_ID",
       storageBucket: "YOUR_PROJECT_ID.appspot.com",
       messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
       appId: "YOUR_APP_ID"
   };
   ```

### Running the Application

#### Frontend (HTML/CSS/JavaScript)

1. Open the project folder in Visual Studio Code
2. Install the "Live Server" extension (if not already installed)
3. Right-click on `index.html` and select "Open with Live Server"
4. The application will open in your default browser at `http://localhost:5500`

#### Using the Application

1. **Without Login**: The app works with local storage for demo purposes
2. **With Login**: 
   - Click the "Login" button
   - Enter your email and password
   - If the account doesn't exist, it will be created automatically
   - Your data will sync with Firebase in real-time

### Java Backend (Optional)

The Java classes provide server-side business logic and can be integrated with a servlet container like Tomcat.

#### Maven Configuration (pom.xml)

```xml
<dependencies>
    <dependency>
        <groupId>com.google.firebase</groupId>
        <artifactId>firebase-admin</artifactId>
        <version>9.2.0</version>
    </dependency>
</dependencies>
```

#### Using Java Classes

```java
// Initialize Firebase
FirebaseManager.initialize("path/to/serviceAccount.json", "https://your-project.firebaseio.com");

// Create a transaction
Transaction transaction = new Transaction("1", "Salary", 5000.0, "income", "salary", new Date());

// Save to Firebase
FirebaseManager.saveTransaction("userId", transaction);

// Load transactions
List<Transaction> transactions = FirebaseManager.loadTransactions("userId").get();
```

## Features Guide

### Dashboard
- View real-time financial summary
- See recent transactions
- Monitor net balance

### Transactions
- Add new transactions with description, amount, type, category, and date
- Filter transactions by type and category
- Delete unwanted transactions
- All changes sync in real-time with Firebase

### Reports
- Category-wise breakdown of income and expenses
- Monthly financial summary
- Net balance calculations

## Development

### VS Code Extensions

The project recommends the following VS Code extensions:
- Java Extension Pack
- Live Server
- Prettier - Code formatter
- ESLint
- Auto Close Tag
- Auto Rename Tag

These will be suggested automatically when you open the project in VS Code.

### Customization

- **Colors**: Edit `css/styles.css` to change the color scheme
- **Categories**: Add or modify categories in `index.html` and update the JavaScript logic
- **Features**: Extend functionality by modifying `js/app.js`

## Security Notes

⚠️ **Important Security Considerations:**

1. Never commit Firebase credentials to public repositories
2. Configure Firebase Security Rules for production:
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
3. Use environment variables for sensitive configuration
4. Enable Firebase App Check for additional security

## Browser Compatibility

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## License

This project is open source and available for educational purposes.

## Contributing

Feel free to fork this project and submit pull requests for any improvements.

## Support

For issues or questions, please open an issue on the GitHub repository.