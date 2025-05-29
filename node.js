const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('./models/user'); // Adjust as needed

const app = express();
app.use(express.json());

app.post('/api/signup', async (req, res) => {
  const { email, password } = req.body;

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already in use' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({ email, password: hashedPassword });
    await user.save();

    res.json({ message: 'Signup successful!' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Something went wrong during signup.' });
  }
});


/* Old  code

// server.js or routes/auth.js
app.post('signup.html', async (req, res) => {
  const { email, password } = req.body;

  // (You should hash the password before saving it)
  const user = new User({ email, password });
  await user.save();

  res.json({ message: 'Signup successful!' });
});

*/