# Email Verification System with Express.js & Nodemailer

A step-by-step guide to implement a complete email verification system in your Express.js application.

---

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Project Setup](#project-setup)
3. [Gmail Configuration](#gmail-configuration)
4. [Implementation Steps](#implementation-steps)
5. [Testing](#testing)
6. [Troubleshooting](#troubleshooting)

---

## Prerequisites

Before starting, ensure you have:

- Node.js (v14 or higher) installed
- A Gmail account (or any SMTP email service)
- Basic knowledge of JavaScript and Express.js
- A code editor (VS Code recommended)
- Postman or curl for API testing

---

## Project Setup

### Step 1: Create Project Directory

```bash
# Create and navigate to project folder
mkdir email-verification-app
cd email-verification-app
```

### Step 2: Initialize Node.js Project

```bash
# Initialize package.json
npm init -y
```

### Step 3: Install Dependencies

```bash
# Install required packages
npm install express nodemailer dotenv jsonwebtoken bcryptjs

# Install development dependencies
npm install --save-dev nodemon
```

**What each package does:**
- `express` - Web framework for Node.js
- `nodemailer` - Email sending library
- `dotenv` - Environment variable management
- `jsonwebtoken` - Create secure verification tokens
- `bcryptjs` - Password hashing (for production)
- `nodemon` - Auto-restart server during development

### Step 4: Update package.json Scripts

Open `package.json` and add these scripts:

```json
{
  "scripts": {
    "start": "node app.js",
    "dev": "nodemon app.js"
  }
}
```

---

## Gmail Configuration

### Step 1: Enable 2-Factor Authentication

1. Go to your Google Account: https://myaccount.google.com/
2. Click **Security** in the left sidebar
3. Under "Signing in to Google", click **2-Step Verification**
4. Follow the prompts to enable 2FA

### Step 2: Generate App Password

1. After enabling 2FA, go back to **Security**
2. Click **2-Step Verification** again
3. Scroll down and click **App passwords**
4. Select **Mail** and **Other (Custom name)**
5. Enter "Nodemailer" as the name
6. Click **Generate**
7. **Copy the 16-character password** (you'll need this)

---

## Implementation Steps

### Step 1: Create Environment Variables File

Create a `.env` file in your project root:

```bash
touch .env
```

Add the following content (replace with your actual values):

```env
# Server Configuration
PORT=3000
BASE_URL=http://localhost:3000

# Email Configuration
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-16-char-app-password

# JWT Secret (generate a random string)
JWT_SECRET=your-super-secret-key-here-change-this
```

**Important:** Replace:
- `your-email@gmail.com` with your Gmail address
- `your-16-char-app-password` with the app password from Gmail
- `your-super-secret-key-here-change-this` with a random secure string

### Step 2: Create .gitignore File

Create `.gitignore` to protect sensitive data:

```bash
touch .gitignore
```

Add this content:

```
node_modules/
.env
*.log
```

### Step 3: Create Email Service Module

Create `emailService.js`:

```bash
touch emailService.js
```

Add this code:

```javascript
const nodemailer = require('nodemailer');
require('dotenv').config();

// Create transporter object
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

// Verify connection configuration
transporter.verify((error, success) => {
  if (error) {
    console.error('❌ Email transporter error:', error);
  } else {
    console.log('✅ Email server is ready to send messages');
  }
});

// Function to send verification email
const sendVerificationEmail = async (email, verificationToken) => {
  const verificationUrl = `${process.env.BASE_URL}/verify-email?token=${verificationToken}`;
  
  const mailOptions = {
    from: `"Your App" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: '✉️ Verify Your Email Address',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #4CAF50; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background-color: #f9f9f9; }
          .button { 
            display: inline-block; 
            padding: 12px 24px; 
            background-color: #4CAF50; 
            color: white; 
            text-decoration: none; 
            border-radius: 5px; 
            margin: 20px 0;
          }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Welcome!</h1>
          </div>
          <div class="content">
            <h2>Verify Your Email Address</h2>
            <p>Thank you for registering. Please click the button below to verify your email address:</p>
            <center>
              <a href="${verificationUrl}" class="button">Verify Email</a>
            </center>
            <p>Or copy and paste this link into your browser:</p>
            <p style="word-break: break-all; color: #666;">${verificationUrl}</p>
            <p><strong>Note:</strong> This link will expire in 24 hours.</p>
          </div>
          <div class="footer">
            <p>If you didn't create an account, please ignore this email.</p>
          </div>
        </div>
      </body>
      </html>
    `
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Error sending email:', error);
    throw error;
  }
};

// Function to send password reset email
const sendPasswordResetEmail = async (email, resetToken) => {
  const resetUrl = `${process.env.BASE_URL}/reset-password?token=${resetToken}`;
  
  const mailOptions = {
    from: `"Your App" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: '🔒 Password Reset Request',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #2196F3; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background-color: #f9f9f9; }
          .button { 
            display: inline-block; 
            padding: 12px 24px; 
            background-color: #2196F3; 
            color: white; 
            text-decoration: none; 
            border-radius: 5px; 
            margin: 20px 0;
          }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Password Reset</h1>
          </div>
          <div class="content">
            <h2>Reset Your Password</h2>
            <p>You requested to reset your password. Click the button below to proceed:</p>
            <center>
              <a href="${resetUrl}" class="button">Reset Password</a>
            </center>
            <p>Or copy and paste this link into your browser:</p>
            <p style="word-break: break-all; color: #666;">${resetUrl}</p>
            <p><strong>Note:</strong> This link will expire in 1 hour.</p>
          </div>
          <div class="footer">
            <p>If you didn't request a password reset, please ignore this email.</p>
          </div>
        </div>
      </body>
      </html>
    `
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Password reset email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Error sending password reset email:', error);
    throw error;
  }
};

module.exports = {
  sendVerificationEmail,
  sendPasswordResetEmail
};
```

### Step 4: Create User Model

Create `userModel.js`:

```bash
touch userModel.js
```

Add this code:

```javascript
// Simple in-memory storage for demonstration
// In production, use MongoDB, PostgreSQL, or another database

const users = [];

// Create new user
const createUser = (email, password, verificationToken) => {
  const user = {
    id: Date.now().toString(),
    email,
    password, // TODO: Hash with bcrypt in production
    isVerified: false,
    verificationToken,
    tokenExpiry: Date.now() + 24 * 60 * 60 * 1000, // 24 hours from now
    createdAt: new Date()
  };
  
  users.push(user);
  console.log(`✅ User created: ${email}`);
  return user;
};

// Find user by email
const findUserByEmail = (email) => {
  return users.find(user => user.email.toLowerCase() === email.toLowerCase());
};

// Find user by verification token
const findUserByToken = (token) => {
  return users.find(user => user.verificationToken === token);
};

// Verify user
const verifyUser = (userId) => {
  const user = users.find(u => u.id === userId);
  if (user) {
    user.isVerified = true;
    user.verificationToken = null;
    user.verifiedAt = new Date();
    console.log(`✅ User verified: ${user.email}`);
    return user;
  }
  return null;
};

// Get all users (for debugging)
const getAllUsers = () => {
  return users.map(user => ({
    id: user.id,
    email: user.email,
    isVerified: user.isVerified,
    createdAt: user.createdAt
  }));
};

module.exports = {
  createUser,
  findUserByEmail,
  findUserByToken,
  verifyUser,
  getAllUsers
};
```

### Step 5: Create Main Application

Create `app.js`:

```bash
touch app.js
```

Add this code:

```javascript
const express = require('express');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const { sendVerificationEmail, sendPasswordResetEmail } = require('./emailService');
const { 
  createUser, 
  findUserByEmail, 
  findUserByToken, 
  verifyUser, 
  getAllUsers 
} = require('./userModel');

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

// Home route
app.get('/', (req, res) => {
  res.send(`
    <html>
      <head>
        <title>Email Verification API</title>
        <style>
          body { 
            font-family: Arial, sans-serif; 
            max-width: 800px; 
            margin: 50px auto; 
            padding: 20px; 
          }
          h1 { color: #4CAF50; }
          .endpoint { 
            background: #f4f4f4; 
            padding: 10px; 
            margin: 10px 0; 
            border-left: 4px solid #4CAF50; 
          }
          code { color: #d63384; }
        </style>
      </head>
      <body>
        <h1>📧 Email Verification API</h1>
        <p>Welcome to the Email Verification System API</p>
        
        <h2>Available Endpoints:</h2>
        
        <div class="endpoint">
          <strong>POST /register</strong><br>
          Register a new user and send verification email
        </div>
        
        <div class="endpoint">
          <strong>GET /verify-email?token=TOKEN</strong><br>
          Verify email address
        </div>
        
        <div class="endpoint">
          <strong>GET /user/:email/status</strong><br>
          Check verification status
        </div>
        
        <div class="endpoint">
          <strong>POST /resend-verification</strong><br>
          Resend verification email
        </div>
        
        <div class="endpoint">
          <strong>GET /users</strong><br>
          View all users (debug only)
        </div>
        
        <p>Server is running on port ${process.env.PORT || 3000}</p>
      </body>
    </html>
  `);
});

// Registration endpoint
app.post('/register', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({ 
        success: false,
        error: 'Email and password are required' 
      });
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ 
        success: false,
        error: 'Invalid email format' 
      });
    }

    // Check if user already exists
    const existingUser = findUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({ 
        success: false,
        error: 'User with this email already exists' 
      });
    }

    // Generate verification token
    const verificationToken = jwt.sign(
      { email, purpose: 'email-verification' },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Create user
    const user = createUser(email, password, verificationToken);

    // Send verification email
    await sendVerificationEmail(email, verificationToken);

    res.status(201).json({
      success: true,
      message: 'Registration successful! Please check your email to verify your account.',
      data: {
        userId: user.id,
        email: user.email
      }
    });

  } catch (error) {
    console.error('❌ Registration error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Registration failed. Please try again.' 
    });
  }
});

// Email verification endpoint
app.get('/verify-email', async (req, res) => {
  try {
    const { token } = req.query;

    if (!token) {
      return res.status(400).send(`
        <html>
          <body style="font-family: Arial; text-align: center; padding: 50px;">
            <h1 style="color: red;">❌ Invalid Verification Link</h1>
            <p>The verification link is invalid or missing.</p>
          </body>
        </html>
      `);
    }

    // Verify JWT token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (jwtError) {
      return res.status(400).send(`
        <html>
          <body style="font-family: Arial; text-align: center; padding: 50px;">
            <h1 style="color: red;">❌ Invalid or Expired Link</h1>
            <p>This verification link has expired or is invalid.</p>
            <p>Please request a new verification email.</p>
          </body>
        </html>
      `);
    }

    // Find user by token
    const user = findUserByToken(token);

    if (!user) {
      return res.status(404).send(`
        <html>
          <body style="font-family: Arial; text-align: center; padding: 50px;">
            <h1 style="color: orange;">⚠️ User Not Found</h1>
            <p>No user found with this verification token.</p>
          </body>
        </html>
      `);
    }

    // Check if already verified
    if (user.isVerified) {
      return res.send(`
        <html>
          <body style="font-family: Arial; text-align: center; padding: 50px;">
            <h1 style="color: blue;">ℹ️ Already Verified</h1>
            <p>This email address has already been verified.</p>
            <p>You can now log in to your account.</p>
          </body>
        </html>
      `);
    }

    // Check if token expired
    if (Date.now() > user.tokenExpiry) {
      return res.status(400).send(`
        <html>
          <body style="font-family: Arial; text-align: center; padding: 50px;">
            <h1 style="color: red;">❌ Link Expired</h1>
            <p>This verification link has expired.</p>
            <p>Please request a new verification email.</p>
          </body>
        </html>
      `);
    }

    // Verify the user
    verifyUser(user.id);

    res.send(`
      <html>
        <head>
          <title>Email Verified</title>
        </head>
        <body style="font-family: Arial; text-align: center; padding: 50px;">
          <h1 style="color: green;">✅ Email Verified Successfully!</h1>
          <p>Your email address <strong>${user.email}</strong> has been verified.</p>
          <p>You can now log in to your account.</p>
          <br>
          <a href="/" style="
            display: inline-block;
            padding: 10px 20px;
            background-color: #4CAF50;
            color: white;
            text-decoration: none;
            border-radius: 5px;
          ">Go to Home</a>
        </body>
      </html>
    `);

  } catch (error) {
    console.error('❌ Verification error:', error);
    res.status(500).send(`
      <html>
        <body style="font-family: Arial; text-align: center; padding: 50px;">
          <h1 style="color: red;">❌ Verification Failed</h1>
          <p>An error occurred during verification.</p>
        </body>
      </html>
    `);
  }
});

// Check verification status
app.get('/user/:email/status', (req, res) => {
  try {
    const { email } = req.params;
    const user = findUserByEmail(email);
    
    if (!user) {
      return res.status(404).json({ 
        success: false,
        error: 'User not found' 
      });
    }

    res.json({
      success: true,
      data: {
        email: user.email,
        isVerified: user.isVerified,
        createdAt: user.createdAt,
        verifiedAt: user.verifiedAt || null
      }
    });
  } catch (error) {
    console.error('❌ Status check error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to check status' 
    });
  }
});

// Resend verification email
app.post('/resend-verification', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ 
        success: false,
        error: 'Email is required' 
      });
    }

    const user = findUserByEmail(email);

    if (!user) {
      return res.status(404).json({ 
        success: false,
        error: 'User not found' 
      });
    }

    if (user.isVerified) {
      return res.status(400).json({ 
        success: false,
        error: 'Email already verified' 
      });
    }

    // Generate new verification token
    const verificationToken = jwt.sign(
      { email, purpose: 'email-verification' },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Update user's token
    user.verificationToken = verificationToken;
    user.tokenExpiry = Date.now() + 24 * 60 * 60 * 1000;

    // Send new verification email
    await sendVerificationEmail(email, verificationToken);

    res.json({ 
      success: true,
      message: 'Verification email sent successfully' 
    });

  } catch (error) {
    console.error('❌ Resend error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to resend verification email' 
    });
  }
});

// Get all users (debug endpoint)
app.get('/users', (req, res) => {
  res.json({
    success: true,
    data: getAllUsers()
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ 
    success: false,
    error: 'Endpoint not found' 
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('❌ Server error:', err);
  res.status(500).json({ 
    success: false,
    error: 'Internal server error' 
  });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════╗
║   📧 Email Verification API Server   ║
║                                       ║
║   Server: http://localhost:${PORT}      ║
║   Status: ✅ Running                   ║
╚═══════════════════════════════════════╝
  `);
});
```

---

## Testing

### Step 1: Start the Server

```bash
npm run dev
```

You should see:
```
✅ Email server is ready to send messages
╔═══════════════════════════════════════╗
║   📧 Email Verification API Server   ║
║                                       ║
║   Server: http://localhost:3000      ║
║   Status: ✅ Running                   ║
╚═══════════════════════════════════════╝
```

### Step 2: Test with Postman

#### Test 1: Register a User

**Request:**
```
POST http://localhost:3000/register
Content-Type: application/json

{
  "email": "test@example.com",
  "password": "securePassword123"
}
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Registration successful! Please check your email to verify your account.",
  "data": {
    "userId": "1701234567890",
    "email": "test@example.com"
  }
}
```

#### Test 2: Check Verification Status

**Request:**
```
GET http://localhost:3000/user/test@example.com/status
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "email": "test@example.com",
    "isVerified": false,
    "createdAt": "2024-01-15T10:30:00.000Z",
    "verifiedAt": null
  }
}
```

#### Test 3: Verify Email

1. Check your email inbox
2. Click the "Verify Email" button or copy the verification link
3. Open the link in your browser
4. You should see: "✅ Email Verified Successfully!"

#### Test 4: Check Status Again

**Request:**
```
GET http://localhost:3000/user/test@example.com/status
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "email": "test@example.com",
    "isVerified": true,
    "createdAt": "2024-01-15T10:30:00.000Z",
    "verifiedAt": "2024-01-15T10:35:00.000Z"
  }
}
```

#### Test 5: Resend Verification

**Request:**
```
POST http://localhost:3000/resend-verification
Content-Type: application/json

{
  "email": "test@example.com"
}
```

### Step 3: Test with cURL (Alternative)

```bash
# Register user
curl -X POST http://localhost:3000/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# Check status
curl http://localhost:3000/user/test@example.com/status

# View all users
curl http://localhost:3000/users

# Resend verification
curl -X POST http://localhost:3000/resend-verification \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'
```

---

## Troubleshooting

### Issue 1: "Email transporter error"

**Problem:** Cannot connect to Gmail

**Solutions:**
1. Verify your `.env` file has correct credentials
2. Make sure you're using an App Password, not your regular Gmail password
3. Check that 2FA is enabled on your Google account
4. Try regenerating the App Password

### Issue 2: Emails not arriving

**Problem:** No email received after registration

**Solutions:**
1. Check your spam/junk folder
2. Verify the email address is correct
3. Check server console for error messages
4. Test with a different email address
5. Verify Gmail account isn't locked or limited

### Issue 3: "Invalid verification link"

**Problem:** Verification link doesn't work

**Solutions:**
1. Make sure the link wasn't modified when copied
2. Check if the token has expired (24 hours)
3. Try requesting a new verification email
4. Verify `JWT_SECRET` in `.env` hasn't changed

### Issue 4: Port already in use

**Problem:** `Error: listen EADDRINUSE: address already in use :::3000`

**Solutions:**
```bash
# Find process using port 3000
lsof -i :3000

# Kill the process (replace PID with actual process ID)
kill -9 PID

# Or use a different port in .env
PORT=3001
```

### Issue 5: Module not found errors

**Problem:** `Cannot find module 'express'`

**Solution:**
```bash
# Reinstall all dependencies
rm -rf node_modules package-lock.json
npm install
```

---

## Next Steps

### Production Checklist

- [ ] Replace in-memory storage with a database (MongoDB/PostgreSQL)
- [ ] Hash passwords using bcryptjs
- [ ] Add rate limiting to prevent spam
- [ ] Use a professional email service (SendGrid, AWS SES)
- [ ] Implement HTTPS
- [ ] Add input validation library (Joi or express-validator)
- [ ] Set up proper logging (Winston or Morgan)
- [ ] Add email templates with a templating engine
- [ ] Implement password reset functionality
- [ ] Add unit and integration tests
- [ ] Set up CI/CD pipeline
- [ ] Configure environment-specific settings
- [ ] Add monitoring and error tracking (Sentry)

### Enhancement Ideas

- Add SMS verification as backup
- Implement social login (Google, Facebook)
- Add email change verification
- Create admin dashboard
- Add user profile management
- Implement 2FA with authenticator apps
- Add email preferences and notifications
- Create welcome email series

---

## Additional Resources

- [Nodemailer Documentation](https://nodemailer.com/)
- [Express.js Guide](https://expressjs.com/en/guide/routing.html)
- [JWT Introduction](https://jwt.io/introduction)
- [Gmail App Passwords](https://support.google.com/accounts/answer/185833)

---

## Support

If you encounter issues:

1. Check the console logs for error messages
2. Review the troubleshooting section
3. Verify all environment variables are correct
4. Test with a simple example first
5. Check your Gmail account status

---

**Happy Coding! 🚀**