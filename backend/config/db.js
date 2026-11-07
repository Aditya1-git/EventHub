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

    // If database has no events yet, run the seed script once
    const Event = require('../models/Event');
    const count = await Event.countDocuments();
    if (count === 0 || process.env.AUTO_SEED === 'true') {
      console.log('Seeding initial events into database...');
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
