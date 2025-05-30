const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

// Now you can use process.env.JWT_SECRET
console.log('JWT Secret loaded:', process.env.JWT_SECRET ? 'Yes' : 'No');
// Import routes
const authRoutes = require('./routes/auth');

const app = express();

// Middleware
app.use(cors({
  origin: 'https://europeangoldfishsignuppage.netlify.app',
  credentials: true,  // optional, based on your needs
}));

app.use(express.json());


// Routes
app.use('/api', authRoutes); // FIXED: This should be a proper API base path

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('✅ Connected to MongoDB'))
.catch(err => console.error('❌ MongoDB connection error:', err));

//Change one
// Get PORT from environment or use 3000 by default
//const PORT = process.env.PORT || 3000;

//New working port from render
const PORT = process.env.PORT || 10000; // fallback still okay
//Server Changed by render above to 10000
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

/*
// Start server
const PORT = process.env.PORT || 10000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`📡 Server URL: http://localhost:${PORT}`);
  console.log(`🔗 Frontend URL: https://europeangoldfishsignuppage.netlify.app`);
});
*/

// Export app for testing
module.exports = app;