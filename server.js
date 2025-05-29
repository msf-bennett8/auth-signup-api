const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config(); // Load environment variables from .env

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

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
