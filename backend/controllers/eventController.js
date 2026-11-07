const Event = require('../models/Event');
const Registration = require('../models/Registration');

// @desc    Get all events with search, filters & pagination
// @route   GET /api/events
// @access  Public
const getEvents = async (req, res, next) => {
  try {
    const {
      search,
      category,
      status,
      venue,
      startDate,
      endDate,
      sort = 'upcoming',
      page = 1,
      limit = 9
    } = req.query;

    const query = {};

    // Search by title or description or venue
    if (search && search.trim() !== '') {
      query.$or = [
        { title: { $regex: search.trim(), $options: 'i' } },
        { description: { $regex: search.trim(), $options: 'i' } },
        { venue: { $regex: search.trim(), $options: 'i' } }
      ];
    }

    // Category filter
    if (category && category !== 'All') {
      query.category = category;
    }

    // Status filter
    if (status && status !== 'All') {
      query.status = status;
    }

    // Venue filter
    if (venue && venue.trim() !== '') {
      query.venue = { $regex: venue.trim(), $options: 'i' };
    }

    // Date range filter
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        query.date.$lte = end;
      }
    }

    // Sorting
    let sortOptions = {};
    if (sort === 'upcoming' || sort === 'date-asc') {
      sortOptions = { date: 1 };
    } else if (sort === 'date-desc') {
      sortOptions = { date: -1 };
    } else if (sort === 'seats') {
      sortOptions = { availableSeats: -1 };
    } else if (sort === 'newest') {
      sortOptions = { createdAt: -1 };
    } else {
      sortOptions = { date: 1 };
    }

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 9;
    const skip = (pageNum - 1) * limitNum;

    const total = await Event.countDocuments(query);
    const events = await Event.find(query)
      .sort(sortOptions)
      .skip(skip)
      .limit(limitNum);

    res.status(200).json({
      success: true,
      count: events.length,
      total,
      totalPages: Math.ceil(total / limitNum) || 1,
      currentPage: pageNum,
      events
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get featured events
// @route   GET /api/events/featured
// @access  Public
const getFeaturedEvents = async (req, res, next) => {
  try {
    const featured = await Event.find({ isFeatured: true, status: { $ne: 'cancelled' } })
      .sort({ date: 1 })
      .limit(6);

    res.status(200).json({
      success: true,
      count: featured.length,
      events: featured
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single event by ID
// @route   GET /api/events/:id
// @access  Public
const getEventById = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    res.status(200).json({
      success: true,
      event
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get events by category
// @route   GET /api/events/category/:category
// @access  Public
const getEventsByCategory = async (req, res, next) => {
  try {
    const { category } = req.params;
    const events = await Event.find({
      category: new RegExp(`^${category}$`, 'i'),
      status: { $ne: 'cancelled' }
    }).sort({ date: 1 });

    res.status(200).json({
      success: true,
      count: events.length,
      events
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new event
// @route   POST /api/events
// @access  Private/Admin
const createEvent = async (req, res, next) => {
  try {
    const {
      title,
      shortDescription,
      description,
      category,
      image,
      date,
      startTime,
      endTime,
      venue,
      organizerName,
      organizerEmail,
      totalSeats,
      registrationDeadline,
      isFeatured,
      status
    } = req.body;

    if (
      !title ||
      !shortDescription ||
      !description ||
      !category ||
      !image ||
      !date ||
      !startTime ||
      !endTime ||
      !venue ||
      !organizerName ||
      !organizerEmail ||
      !totalSeats ||
      !registrationDeadline
    ) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required event details'
      });
    }

    const seats = parseInt(totalSeats, 10);
    if (isNaN(seats) || seats < 1) {
      return res.status(400).json({
        success: false,
        message: 'Total seats must be at least 1'
      });
    }

    const event = await Event.create({
      title,
      shortDescription,
      description,
      category,
      image,
      date: new Date(date),
      startTime,
      endTime,
      venue,
      organizerName,
      organizerEmail,
      totalSeats: seats,
      availableSeats: seats,
      registrationDeadline: new Date(registrationDeadline),
      isFeatured: isFeatured === true || isFeatured === 'true',
      status: status || 'upcoming'
    });

    res.status(201).json({
      success: true,
      message: 'Event created successfully',
      event
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update an event
// @route   PUT /api/events/:id
// @access  Private/Admin
const updateEvent = async (req, res, next) => {
  try {
    let event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    // Handle seat adjustments if totalSeats is changed
    if (req.body.totalSeats !== undefined) {
      const newTotal = parseInt(req.body.totalSeats, 10);
      const bookedSeats = event.totalSeats - event.availableSeats;
      if (newTotal < bookedSeats) {
        return res.status(400).json({
          success: false,
          message: `Cannot reduce total seats below already booked seats (${bookedSeats})`
        });
      }
      req.body.availableSeats = newTotal - bookedSeats;
    }

    event = await Event.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      message: 'Event updated successfully',
      event
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete an event
// @route   DELETE /api/events/:id
// @access  Private/Admin
const deleteEvent = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    // Also cancel or delete associated registrations or notify
    await Registration.updateMany(
      { event: event._id },
      { registrationStatus: 'cancelled' }
    );

    await Event.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Event and associated registrations deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getEvents,
  getFeaturedEvents,
  getEventById,
  getEventsByCategory,
  createEvent,
  updateEvent,
  deleteEvent
};
