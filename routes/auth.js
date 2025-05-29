const express = require('express');
const router = express.Router();
const User = require('../models/user');
const bcrypt = require('bcrypt');
// Optional: use JWT
// const jwt = require('jsonwebtoken');
// const JWT_SECRET = 'your_secret_key_here';

// SIGN UP
router.post('/api/signup', async (req, res) => {
  const { email, username, password } = req.body;

  if (!email || !username || !password) {
    return res.status(400).json({ error: 'All fields are required.' });
  }

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(409).json({ error: 'User already exists.' });

    const newUser = new User({ email, username, password });
    await newUser.save();

    res.status(201).json({ message: 'User created successfully!' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error signing up.' });
  }
});

// SIGN IN
router.post('/api/login', async (req, res) => {
  const { identifier, password } = req.body;

  if (!identifier || !password) {
    return res.status(400).json({ error: 'Email/Username and password are required.' });
  }

  // Allow login with either email or username
  const user = await User.findOne({
    $or: [{ email: identifier }, { username: identifier }]
  });

  if (!user) {
    return res.status(401).json({ error: 'User not found.' });
  }

  const isMatch = await user.comparePassword(password);

  if (!isMatch) {
    return res.status(401).json({ error: 'Invalid credentials.' });
  }

  // Optional: Generate JWT
  // const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '1h' });

  res.json({
    message: 'Login successful!',
    // token, // include this if using JWT
    user: { email: user.email, username: user.username }
  });
});

module.exports = router;

/* Earlier Code
const express = require('express');
const router = express.Router();
const User = require('../models/user');

// Sign Up
router.post('/api/signup', async (req, res) => {
  const { email, password } = req.body;

  try {
    const newUser = new User({ email, password });
    await newUser.save();
    res.json({ message: 'User created successfully!' });
  } catch (err) {
    res.status(500).json({ error: 'Error signing up.' });
  }
});

// Sign In
router.post('/api/signin', async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  if (user && user.password === password) {
    res.json({ message: 'Login successful' });
  } else {
    res.status(401).json({ error: 'Invalid credentials' });
  }
});

module.exports = router;

*/