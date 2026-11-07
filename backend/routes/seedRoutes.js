const express = require('express');
const router = express.Router();
const seedData = require('../seed');

// @desc    Preload / re-seed sample events, users, and registrations
// @route   GET /api/seed or POST /api/seed
// @access  Public (or with ?secret=key if SEED_SECRET is set)
router.all('/', async (req, res) => {
  try {
    const secret = req.query.secret || req.body?.secret;
    if (process.env.SEED_SECRET && secret !== process.env.SEED_SECRET) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized: Invalid seed secret'
      });
    }

    const result = await seedData(false);
    res.status(200).json({
      success: true,
      message: 'EventHub database successfully seeded with realistic sample events, demo users, and bookings!',
      summary: result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Seeding failed: ${error.message}`
    });
  }
});

module.exports = router;
