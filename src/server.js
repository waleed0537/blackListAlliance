// server.js - Production-ready version
const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const nodemailer = require('nodemailer');
const cron = require('node-cron');
const path = require('path');
const axios = require('axios');

// Import ONLY from the chrome-free solution
const { 
  getBlacklistData, 
  ensureDataReady, 
  startPeriodicUpdates, 
  initializeCache 
} = require('./chrome-free-data');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// CORS configuration - Update with your production domain
const corsOptions = {
  origin: [
    'http://localhost:3000',
    'http://localhost:5173',
    'http://localhost:4000',
    'https://thedncalliance.com',
    'https://www.thedncalliance.com',
    'https://dncalliance.onrender.com'
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type', 
    'Authorization', 
    'x-auth-token', 
    'Accept', 
    'Cache-Control', 
    'Pragma', 
    'Expires'
  ],
  exposedHeaders: ['Content-Length', 'Date'],
  credentials: true,
  maxAge: 86400, // 24 hours in seconds
  optionsSuccessStatus: 200
};

// Initialize cache and start periodic updates
initializeCache(755, "39,806,098");
startPeriodicUpdates(60); // Update every 60 minutes

// Middleware
app.use(express.json());
app.use(cors(corsOptions));
app.options('*', cors(corsOptions)); // Handle preflight requests

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://smartrichads:YSMlbHeg9bgEJBxL@cluster0.puiov.mongodb.net/';

mongoose
  .connect(MONGODB_URI)
  .then(() => console.log('MongoDB connected successfully'))
  .catch((err) => console.error('MongoDB connection error:', err));

// User Schema and Model
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);

// JWT Secret - Use a more secure secret in production
const JWT_SECRET = process.env.JWT_SECRET || 'blacklist-alliance-secret-key';

// Email Transporter Setup
const createTransporter = () => {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER || 'smartrichads@gmail.com',
      pass: process.env.EMAIL_PASS || 'rqtp zuyg xkvn nmym' // App password for Gmail
    }
  });
};

// Schedule periodic updates using cron - this triggers our chrome-free solution
cron.schedule('0 * * * *', async () => {
  console.log('Running scheduled update...');
  try {
    await getBlacklistData(true); // Force refresh
    console.log('Scheduled update completed successfully');
  } catch (error) {
    console.error('Scheduled update failed:', error);
  }
});

// Pre-warm endpoint - returns cached data immediately
app.get('/api/pre-warm', async (req, res) => {
  try {
    console.log('Pre-warming blacklist data cache');
    
    // This will just return cached data immediately
    const data = await ensureDataReady();
    
    res.json({
      status: 'success',
      message: 'Data retrieved from cache',
      data
    });
  } catch (error) {
    console.error('Error pre-warming cache:', error);
    res.status(500).json({ 
      status: 'error',
      message: 'Failed to get cached data',
      error: error.message
    });
  }
});

// API endpoint to get blacklist data
// Update this section in your server.js file

// API endpoint to get blacklist data
// Update this section in your server.js file

// API endpoint to get blacklist stats
// API endpoint to get blacklist stats
app.get('/api/blacklist-stats', async (req, res) => {
  try {
    console.log('Received request for blacklist stats');
    const forceRefresh = req.query.refresh === 'true';
    console.log('Force refresh parameter:', forceRefresh);
    
    // Set no-cache headers in the response
    res.set({
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0',
      'Surrogate-Control': 'no-store'
    });
    
    // Get the data (force refresh if requested)
    const data = await getBlacklistData(forceRefresh);
    
    // If forcing refresh, add a small delay to make loading state visible
    if (forceRefresh) {
      console.log('Forcing refresh, adding delay to show loading state');
      
      // Add a small delay (1.5 seconds) to ensure loading state is visible to user
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      console.log('Returning refreshed blacklist data:', data);
      return res.json({
        ...data,
        refreshed: true,
        timestamp: new Date().toISOString()
      });
    }
    
    console.log('Returning cached blacklist data');
    res.json(data);
  } catch (error) {
    console.error('Error fetching blacklist data:', error);
    res.status(500).json({ 
      message: 'Failed to fetch blacklist data',
      error: error.message
    });
  }
});
// Contact form endpoint with robust error handling
app.post('/api/contact', async (req, res) => {
  try {
    // Log received request
    console.log('Received contact form request');
    
    const { name, email, subject, message } = req.body;
    
    // Validate input
    if (!name || !email || !subject || !message) {
      console.log('Validation failed: Missing required fields');
      return res.status(400).json({ message: 'All fields are required' });
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      console.log('Validation failed: Invalid email format');
      return res.status(400).json({ message: 'Invalid email format' });
    }
    
    console.log('Sending contact form email from:', email);
    
    // Create the transporter
    const transporter = createTransporter();
    
    // Email options
    const mailOptions = {
      from: `"DNC Alliance" <${process.env.EMAIL_USER || 'smartrichads@gmail.com'}>`,
      to: process.env.CONTACT_EMAIL || 'smartrichads@gmail.com',
      replyTo: email,
      subject: `[DNC Alliance Contact] ${subject}`,
      html: `
        <h2>New Contact Form Submission</h2>
        <p><strong>From:</strong> ${name} (${email})</p>
        <p><strong>Subject:</strong> ${subject}</p>
        <h3>Message:</h3>
        <p>${message.replace(/\n/g, '<br>')}</p>
        <hr>
        <p><small>This email was sent from the DNC Alliance contact form on ${new Date().toLocaleString()}.</small></p>
      `
    };
    
    // Send email with error handling
    try {
      const info = await transporter.sendMail(mailOptions);
      console.log('Email sent successfully. Message ID:', info.messageId);
      return res.status(200).json({ 
        message: 'Email sent successfully', 
        messageId: info.messageId 
      });
    } catch (sendError) {
      console.error('Failed to send email:', sendError);
      return res.status(500).json({ 
        message: 'Failed to send email', 
        error: sendError.message 
      });
    }
  } catch (error) {
    console.error('Unexpected error in contact endpoint:', error);
    return res.status(500).json({ 
      message: 'Server error processing contact form', 
      error: error.message 
    });
  }
});

// Authentication routes
app.post('/api/signup', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user
    const user = new User({
      name,
      email,
      password: hashedPassword
    });

    await user.save();

    // Create JWT token
    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '1d' });

    res.status(201).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Login user
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Validate password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Create JWT token
    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '1d' });

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Protected route example
app.get('/api/user', async (req, res) => {
  try {
    const token = req.header('x-auth-token');
    
    if (!token) {
      return res.status(401).json({ message: 'No token, authorization denied' });
    }

    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Get user
    const user = await User.findById(decoded.id).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(401).json({ message: 'Token is not valid' });
  }
});

// Email lookup proxy endpoint
app.post('/api/email-lookup', async (req, res) => {
  try {
    const { email, apiKey } = req.body;
    
    console.log(`Proxying email lookup request for: ${email}`);
    
    // Forward the request to the BlackList Alliance API with the correct format
    const response = await axios.post(
      `https://api.blacklistalliance.net/emailbulk?key=${apiKey}`,
      { emails: [email] },
      {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      }
    );
    
    console.log('Email lookup successful');
    res.json(response.data);
  } catch (error) {
    console.error('Error with email lookup:', error);
    
    if (error.response) {
      // Forward the API error response
      res.status(error.response.status).json(error.response.data);
    } else {
      res.status(500).json({ 
        message: 'Email lookup failed', 
        error: error.message 
      });
    }
  }
});
// Protected route example
app.get('/api/user', async (req, res) => {
  try {
    const token = req.header('x-auth-token');
    
    if (!token) {
      return res.status(401).json({ message: 'No token, authorization denied' });
    }

    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Get user
    const user = await User.findById(decoded.id).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(401).json({ message: 'Token is not valid' });
  }
});

// Update user profile
app.put('/api/user/profile', async (req, res) => {
  try {
    const token = req.header('x-auth-token');
    
    if (!token) {
      return res.status(401).json({ message: 'No token, authorization denied' });
    }

    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Get user with password for verification
    const user = await User.findById(decoded.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    console.log('Processing profile update for user:', user.email);

    // Get update fields from request body
    const { name, email, currentPassword, newPassword } = req.body;

    // Check if email is already in use by another user
    if (email !== user.email) {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ message: 'Email is already in use' });
      }
    }

    // Update fields
    if (name) user.name = name;
    if (email) user.email = email;

    // If password change is requested
    if (currentPassword && newPassword) {
      // Verify current password
      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        return res.status(400).json({ message: 'Current password is incorrect' });
      }

      // Hash new password
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(newPassword, salt);
      console.log('Password updated successfully');
    }

    // Save updated user to database
    await user.save();
    
    // Create a user object without the password to send back
    const updatedUser = {
      id: user._id,
      name: user.name,
      email: user.email
    };

    console.log('Profile updated successfully:', updatedUser);
    
    // Return success response with updated user data
    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: updatedUser
    });

  } catch (error) {
    console.error('Error updating profile:', error);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Token is not valid' });
    }
    
    res.status(500).json({ message: 'Server error updating profile' });
  }
});

// Serve static files from the dist directory (for frontend)
app.use(express.static(path.join(__dirname, 'dist')));

// Handle any requests that don't match the above
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://0.0.0.0:${PORT}`);
});