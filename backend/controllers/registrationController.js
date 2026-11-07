const Registration = require('../models/Registration');
const Event = require('../models/Event');

const registerForEvent = async (req, res, next) => {
  try {
    const { eventId, participantName, email, phone } = req.body;
    const userId = req.user._id;

    if (!eventId || !participantName || !email || !phone) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required'
      });
    }

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    if (event.status === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: 'This event has been cancelled'
      });
    }

    if (event.status === 'completed') {
      return res.status(400).json({
        success: false,
        message: 'This event has already ended'
      });
    }

    if (new Date() > new Date(event.registrationDeadline)) {
      return res.status(400).json({
        success: false,
        message: 'Registration deadline has passed'
      });
    }

    // Check if user already booked
    const alreadyRegistered = await Registration.findOne({
      user: userId,
      event: eventId,
      registrationStatus: 'confirmed'
    });

    if (alreadyRegistered) {
      return res.status(400).json({
        success: false,
        message: 'You have already registered for this event'
      });
    }

    // Atomically decrement seats
    const updatedEvent = await Event.findOneAndUpdate(
      { _id: eventId, availableSeats: { $gt: 0 } },
      { $inc: { availableSeats: -1 } },
      { new: true }
    );

    if (!updatedEvent) {
      return res.status(400).json({
        success: false,
        message: 'Sorry, this event is fully booked'
      });
    }

    const registration = await Registration.create({
      user: userId,
      event: eventId,
      participantName: participantName.trim(),
      email: email.toLowerCase().trim(),
      phone: phone.trim(),
      registrationStatus: 'confirmed'
    });

    const populated = await Registration.findById(registration._id)
      .populate('event')
      .populate('user', 'name email phone');

    res.status(201).json({
      success: true,
      message: 'Registration confirmed!',
      registration: populated,
      availableSeats: updatedEvent.availableSeats
    });
  } catch (error) {
    next(error);
  }
};

const getMyRegistrations = async (req, res, next) => {
  try {
    const { status } = req.query;
    const filter = { user: req.user._id };

    if (status && status !== 'all') {
      filter.registrationStatus = status;
    }

    const registrations = await Registration.find(filter)
      .populate('event')
      .sort({ registeredAt: -1 });

    res.json({
      success: true,
      count: registrations.length,
      registrations
    });
  } catch (error) {
    next(error);
  }
};

const getRegistrationById = async (req, res, next) => {
  try {
    const registration = await Registration.findById(req.params.id)
      .populate('event')
      .populate('user', 'name email phone');

    if (!registration) {
      return res.status(404).json({
        success: false,
        message: 'Registration not found'
      });
    }

    // Only owner or admin can view
    const isOwner = registration.user._id.toString() === req.user._id.toString();
    if (!isOwner && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this registration'
      });
    }

    res.json({
      success: true,
      registration
    });
  } catch (error) {
    next(error);
  }
};

const cancelRegistration = async (req, res, next) => {
  try {
    const registration = await Registration.findById(req.params.id).populate('event');

    if (!registration) {
      return res.status(404).json({
        success: false,
        message: 'Registration not found'
      });
    }

    const isOwner = registration.user.toString() === req.user._id.toString();
    if (!isOwner && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to cancel this registration'
      });
    }

    if (registration.registrationStatus === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: 'Registration is already cancelled'
      });
    }

    registration.registrationStatus = 'cancelled';
    await registration.save();

    // Give seat back
    const event = await Event.findByIdAndUpdate(
      registration.event._id,
      { $inc: { availableSeats: 1 } },
      { new: true }
    );

    res.json({
      success: true,
      message: 'Registration cancelled',
      registration,
      availableSeats: event ? event.availableSeats : undefined
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
