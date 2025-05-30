const express = require('express');
const router = express.Router();
const User = require('../models/user');
const jwt = require('jsonwebtoken');

// Environment variables for JWT
const JWT_SECRET = process.env.JWT_SECRET || 'your_fallback_secret_key_here';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

// Input validation helper
const validateSignupInput = (email, username, password) => {
  const errors = [];
  
  if (!email || !username || !password) {
    errors.push('All fields are required');
  }
  
  if (email && !/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(email)) {
    errors.push('Please provide a valid email address');
  }
  
  if (username && (username.length < 3 || username.length > 20)) {
    errors.push('Username must be between 3 and 20 characters');
  }
  
  if (password && password.length < 6) {
    errors.push('Password must be at least 6 characters long');
  }
  
  return errors;
};

// SIGN UP
router.post('/api/signup', async (req, res) => {
  try {
    const { email, username, password } = req.body;
    
    // Input validation
    const validationErrors = validateSignupInput(email, username, password);
    if (validationErrors.length > 0) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: validationErrors 
      });
    }

    // Check if user already exists by email or username
    const existingUser = await User.findOne({
      $or: [
        { email: email.toLowerCase() },
        { username: username }
      ]
    });

    if (existingUser) {
      const field = existingUser.email === email.toLowerCase() ? 'email' : 'username';
      return res.status(409).json({ 
        error: `User with this ${field} already exists` 
      });
    }

    // Create new user
    const newUser = new User({ 
      email: email.toLowerCase().trim(), 
      username: username.trim(), 
      password 
    });
    
    await newUser.save();

    // Generate JWT token
    const token = jwt.sign(
      { 
        id: newUser._id, 
        email: newUser.email, 
        username: newUser.username 
      }, 
      JWT_SECRET, 
      { expiresIn: JWT_EXPIRES_IN }
    );

    res.status(201).json({ 
      message: 'User created successfully!',
      token,
      user: { 
        id: newUser._id,
        email: newUser.email, 
        username: newUser.username 
      }
    });

  } catch (err) {
    console.error('Signup error:', err);
    
    // Handle mongoose validation errors
    if (err.name === 'ValidationError') {
      const errors = Object.values(err.errors).map(e => e.message);
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: errors 
      });
    }
    
    // Handle duplicate key errors
    if (err.code === 11000) {
      const field = Object.keys(err.keyPattern)[0];
      return res.status(409).json({ 
        error: `User with this ${field} already exists` 
      });
    }
    
    res.status(500).json({ error: 'Internal server error during signup' });
  }
});

// SIGN IN
router.post('/api/login', async (req, res) => {
  try {
    const { identifier, password } = req.body;

    // Input validation
    if (!identifier || !password) {
      return res.status(400).json({ 
        error: 'Email/Username and password are required' 
      });
    }

    // Find user by email or username using the static method
    const user = await User.findByCredentials(identifier);
    
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Compare password
    const isMatch = await user.comparePassword(password);
    
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        id: user._id, 
        email: user.email, 
        username: user.username 
      }, 
      JWT_SECRET, 
      { expiresIn: JWT_EXPIRES_IN }
    );

    res.json({
      message: 'Login successful!',
      token,
      user: { 
        id: user._id,
        email: user.email, 
        username: user.username 
      }
    });

  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Internal server error during login' });
  }
});

// JWT Authentication Middleware (for protected routes)
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

// Protected route example - Get user profile
router.get('/api/profile', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json({
      user: {
        id: user._id,
        email: user.email,
        username: user.username,
        createdAt: user.createdAt
      }
    });
  } catch (err) {
    console.error('Profile error:', err);
    res.status(500).json({ error: 'Error fetching user profile' });
  }
});

// Logout route (client-side token removal, but useful for consistency)
router.post('/api/logout', authenticateToken, (req, res) => {
  res.json({ message: 'Logout successful' });
});

// Export the router and middleware
module.exports = router;
module.exports.authenticateToken = authenticateToken;