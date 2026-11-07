const mongoose = require('mongoose');

let isConnected = false;

const connectDB = async () => {
  if (isConnected && mongoose.connection.readyState === 1) {
    return;
  }

  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/eventhub';
    const conn = await mongoose.connect(mongoUri);
    isConnected = conn.connections[0].readyState === 1;
    console.log(`MongoDB connected: ${conn.connection.host}`);

    // Populate initial sample events only if database is completely empty (0 events)
    const Event = require('../models/Event');
    const count = await Event.countDocuments();
    if (count === 0) {
      console.log('Database has no events, seeding initial sample data...');
      const seedData = require('../seed');
      await seedData(false);
    }
  } catch (error) {
    console.error('MongoDB connection error:', error.message);
    if (!process.env.VERCEL) {
      process.exit(1);
    }
  }
};

module.exports = connectDB;
