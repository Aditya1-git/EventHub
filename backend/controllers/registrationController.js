const Registration = require('../models/Registration');
const Event = require('../models/Event');

// @desc    Register for an event
// @route   POST /api/registrations
// @access  Private
const registerForEvent = async (req, res, next) => {
  try {
    const { eventId, participantName, email, phone } = req.body;
    const userId = req.user._id;

    if (!eventId || !participantName || !email || !phone) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all registration details'
      });
    }

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    // Check if event is open for registration
    if (event.status === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: 'Registration is closed: This event has been cancelled'
      });
    }

    if (event.status === 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Registration is closed: This event has already concluded'
      });
    }

    // Check deadline
    if (new Date() > new Date(event.registrationDeadline)) {
      return res.status(400).json({
        success: false,
        message: 'Registration deadline has passed'
      });
    }

    // Check duplicate confirmed registration
    const existingRegistration = await Registration.findOne({
      user: userId,
      event: eventId,
      registrationStatus: 'confirmed'
    });

    if (existingRegistration) {
      return res.status(400).json({
        success: false,
        message: 'You are already registered for this event'
      });
    }

    // Atomically decrement available seats to eliminate race conditions
    const updatedEvent = await Event.findOneAndUpdate(
      {
        _id: eventId,
        availableSeats: { $gt: 0 }
      },
      {
        $inc: { availableSeats: -1 }
      },
      {
        new: true
      }
    );

    if (!updatedEvent) {
      return res.status(400).json({
        success: false,
        message: 'Registration full: No seats available for this event'
      });
    }

    // Create registration record
    const registration = await Registration.create({
      user: userId,
      event: eventId,
      participantName: participantName.trim(),
      email: email.toLowerCase().trim(),
      phone: phone.trim(),
      registrationStatus: 'confirmed',
      registeredAt: new Date()
    });

    const populatedRegistration = await Registration.findById(registration._id)
      .populate('event')
      .populate('user', 'name email phone');

    res.status(201).json({
      success: true,
      message: 'Successfully registered for the event!',
      registration: populatedRegistration,
      availableSeats: updatedEvent.availableSeats
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get logged in user's registrations
// @route   GET /api/registrations/my
// @access  Private
const getMyRegistrations = async (req, res, next) => {
  try {
    const { status } = req.query;
    const query = { user: req.user._id };

    if (status && status !== 'all') {
      query.registrationStatus = status;
    }

    const registrations = await Registration.find(query)
      .populate('event')
      .sort({ registeredAt: -1 });

    res.status(200).json({
      success: true,
      count: registrations.length,
      registrations
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single registration
// @route   GET /api/registrations/:id
// @access  Private
const getRegistrationById = async (req, res, next) => {
  try {
    const registration = await Registration.findById(req.params.id)
      .populate('event')
      .populate('user', 'name email phone');

    if (!registration) {
      return res.status(404).json({
        success: false,
        message: 'Registration record not found'
      });
    }

    // Must be owner or admin
    if (
      registration.user._id.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this registration'
      });
    }

    res.status(200).json({
      success: true,
      registration
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Cancel a registration
// @route   PUT /api/registrations/:id/cancel
// @access  Private
const cancelRegistration = async (req, res, next) => {
  try {
    const registration = await Registration.findById(req.params.id).populate('event');

    if (!registration) {
      return res.status(404).json({
        success: false,
        message: 'Registration not found'
      });
    }

    // Ensure user owns this registration or is admin
    if (
      registration.user.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to cancel this registration'
      });
    }

    if (registration.registrationStatus === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: 'This registration is already cancelled'
      });
    }

    // Set registration status to cancelled
    registration.registrationStatus = 'cancelled';
    await registration.save();

    // Increment available seats on event
    const updatedEvent = await Event.findByIdAndUpdate(
      registration.event._id,
      { $inc: { availableSeats: 1 } },
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: 'Registration successfully cancelled',
      registration,
      availableSeats: updatedEvent ? updatedEvent.availableSeats : undefined
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  registerForEvent,
  getMyRegistrations,
  getRegistrationById,
  cancelRegistration
};
