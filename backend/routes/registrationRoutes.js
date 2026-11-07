const express = require('express');
const router = express.Router();
const {
  registerForEvent,
  getMyRegistrations,
  getRegistrationById,
  cancelRegistration
} = require('../controllers/registrationController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.post('/', registerForEvent);
router.get('/my', getMyRegistrations);
router.get('/:id', getRegistrationById);
router.put('/:id/cancel', cancelRegistration);

module.exports = router;
