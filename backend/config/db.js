const mongoose = require('mongoose');

let cachedConnection = null;

const connectDB = async () => {
  // If already connected, return cached connection (essential for Vercel serverless)
  if (cachedConnection && mongoose.connection.readyState === 1) {
    return cachedConnection;
  }

  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/eventhub';
    const conn = await mongoose.connect(mongoUri, {
      bufferCommands: false,
    });
    cachedConnection = conn;
    console.log(`MongoDB Connected: ${conn.connection.host}`);

    // Check if auto-seeding is needed (if DB is empty or AUTO_SEED=true)
    try {
      const Event = require('../models/Event');
      const count = await Event.countDocuments();
      if (count === 0 || process.env.AUTO_SEED === 'true') {
        console.log('Empty event database detected. Preloading seed data...');
        const seedData = require('../seed');
        await seedData(false);
        console.log('Seed data successfully preloaded into MongoDB!');
      }
    } catch (seedErr) {
      console.warn('Auto-seed check notice:', seedErr.message);
    }

    return conn;
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
    // Don't crash serverless instance on momentary connection retry
    if (!process.env.VERCEL) {
      process.exit(1);
    }
  }
};

module.exports = connectDB;
