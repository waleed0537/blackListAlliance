// server.js - Corrected and Complete Version
const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const nodemailer = require('nodemailer');
const { getBlacklistData } = require('./scrapper'); // Make sure path is correct
const cron = require('node-cron');

// Load environment variables
dotenv.config();

const app = express();

// Improved CORS configuration
const corsOptions = {
  origin: ['http://localhost:3000', 'http://localhost:5173', 'http://localhost:4000'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-auth-token', 'Accept'],
  credentials: true,
  optionsSuccessStatus: 200
};

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

// JWT Secret
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

// Schedule scraping every hour
cron.schedule('0 * * * *', async () => {
  console.log('Running scheduled scrape...');
  try {
    await getBlacklistData(false); // Force fresh data
    console.log('Scheduled scrape completed successfully');
  } catch (error) {
    console.error('Scheduled scrape failed:', error);
  }
});

// API endpoint to get blacklist data
app.get('/api/blacklist-stats', async (req, res) => {
  try {
    console.log('Received request for blacklist stats');
    const forceRefresh = req.query.refresh === 'true';
    console.log('Force refresh:', forceRefresh);
    
    const data = await getBlacklistData(!forceRefresh);
    console.log('Returning blacklist data:', data);
    
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
    
    // Verify transporter configuration
    try {
      await transporter.verify();
      console.log('Transporter verified successfully');
    } catch (verifyError) {
      console.error('Transporter verification failed:', verifyError);
      return res.status(500).json({ 
        message: 'Email configuration error', 
        error: verifyError.message
      });
    }
    
    // Email options with more secure configuration
    const mailOptions = {
      from: `"Blacklist Alliance" <${process.env.EMAIL_USER || 'smartrichads@gmail.com'}>`,
      to: process.env.CONTACT_EMAIL || 'smartrichads@gmail.com',
      replyTo: email,
      subject: `[Blacklist Alliance Contact] ${subject}`,
      html: `
        <h2>New Contact Form Submission</h2>
        <p><strong>From:</strong> ${name} (${email})</p>
        <p><strong>Subject:</strong> ${subject}</p>
        <h3>Message:</h3>
        <p>${message.replace(/\n/g, '<br>')}</p>
        <hr>
        <p><small>This email was sent from the Blacklist Alliance contact form on ${new Date().toLocaleString()}.</small></p>
      `
    };
    
    // Send email with explicit error handling
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

// Register new user
app.post('/api/api//signup', async (req, res) => {
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
app.post('/api/api/login', async (req, res) => {
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
app.get('/api/api/user', async (req, res) => {
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

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));