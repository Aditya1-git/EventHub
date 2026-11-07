const Event = require('../models/Event');
const Registration = require('../models/Registration');

// Get events list with search, filter, and pagination
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

    if (search && search.trim()) {
      query.$or = [
        { title: { $regex: search.trim(), $options: 'i' } },
        { description: { $regex: search.trim(), $options: 'i' } },
        { venue: { $regex: search.trim(), $options: 'i' } }
      ];
    }

    if (category && category !== 'All') {
      query.category = category;
    }

    if (status && status !== 'All') {
      query.status = status;
    }

    if (venue && venue.trim()) {
      query.venue = { $regex: venue.trim(), $options: 'i' };
    }

    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        query.date.$lte = end;
      }
    }

    let sortOptions = { date: 1 };
    if (sort === 'date-desc') {
      sortOptions = { date: -1 };
    } else if (sort === 'seats') {
      sortOptions = { availableSeats: -1 };
    } else if (sort === 'newest') {
      sortOptions = { createdAt: -1 };
    }

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = parseInt(limit, 10) || 9;
    const skip = (pageNum - 1) * limitNum;

    const total = await Event.countDocuments(query);
    const events = await Event.find(query)
      .sort(sortOptions)
      .skip(skip)
      .limit(limitNum);

    res.json({
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

const getFeaturedEvents = async (req, res, next) => {
  try {
    const events = await Event.find({ isFeatured: true, status: { $ne: 'cancelled' } })
      .sort({ date: 1 })
      .limit(6);

    res.json({
      success: true,
      count: events.length,
      events
    });
  } catch (error) {
    next(error);
  }
};

const getEventById = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    res.json({
      success: true,
      event
    });
  } catch (error) {
    next(error);
  }
};

const getEventsByCategory = async (req, res, next) => {
  try {
    const events = await Event.find({
      category: new RegExp(`^${req.params.category}$`, 'i'),
      status: { $ne: 'cancelled' }
    }).sort({ date: 1 });

    res.json({
      success: true,
      count: events.length,
      events
    });
  } catch (error) {
    next(error);
  }
};

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
      !venue ||
      !organizerName ||
      !organizerEmail ||
      !totalSeats ||
      !registrationDeadline
    ) {
      return res.status(400).json({
        success: false,
        message: 'Please fill in all required fields'
      });
    }

    const seats = parseInt(totalSeats, 10);
    const event = await Event.create({
      title,
      shortDescription,
      description,
      category,
      image,
      date: new Date(date),
      startTime: startTime || '10:00 AM',
      endTime: endTime || '05:00 PM',
      venue,
      organizerName,
      organizerEmail,
      totalSeats: seats,
      availableSeats: seats,
      registrationDeadline: new Date(registrationDeadline),
      isFeatured: Boolean(isFeatured),
      status: status || 'upcoming'
    });

    res.status(201).json({
      success: true,
      message: 'Event created',
      event
    });
  } catch (error) {
    next(error);
  }
};

const updateEvent = async (req, res, next) => {
  try {
    let event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    if (req.body.totalSeats !== undefined) {
      const newTotal = parseInt(req.body.totalSeats, 10);
      const booked = event.totalSeats - event.availableSeats;
      if (newTotal < booked) {
        return res.status(400).json({
          success: false,
          message: `Total seats cannot be less than already booked seats (${booked})`
        });
      }
      req.body.availableSeats = newTotal - booked;
    }

    event = await Event.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.json({
      success: true,
      message: 'Event updated',
      event
    });
  } catch (error) {
    next(error);
  }
};

const deleteEvent = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    // Cancel related registrations
    await Registration.updateMany(
      { event: event._id },
      { registrationStatus: 'cancelled' }
    );

    await Event.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Event deleted'
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
