const Event = require('../models/Event');
const User = require('../models/User');
const Registration = require('../models/Registration');

// Dashboard summary stats and charts
const getDashboardStats = async (req, res, next) => {
  try {
    const [
      totalEvents,
      totalUsers,
      totalRegistrations,
      upcomingEvents,
      completedEvents,
      cancelledRegistrations
    ] = await Promise.all([
      Event.countDocuments(),
      User.countDocuments(),
      Registration.countDocuments(),
      Event.countDocuments({ status: 'upcoming' }),
      Event.countDocuments({ status: 'completed' }),
      Registration.countDocuments({ registrationStatus: 'cancelled' })
    ]);

    // Registrations in the last 30 days
    const past30Days = new Date();
    past30Days.setDate(past30Days.getDate() - 30);

    const registrationsOverTime = await Registration.aggregate([
      { $match: { registeredAt: { $gte: past30Days } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$registeredAt' } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } },
      {
        $project: {
          _id: 0,
          date: '$_id',
          registrations: '$count'
        }
      }
    ]);

    // Breakdown by category
    const categoryDistribution = await Event.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 }
        }
      },
      {
        $project: {
          _id: 0,
          name: '$_id',
          value: '$count'
        }
      },
      { $sort: { value: -1 } }
    ]);

    // Top 5 popular events
    const popularEvents = await Registration.aggregate([
      { $match: { registrationStatus: 'confirmed' } },
      {
        $group: {
          _id: '$event',
          totalRegistrations: { $sum: 1 }
        }
      },
      { $sort: { totalRegistrations: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: 'events',
          localField: '_id',
          foreignField: '_id',
          as: 'eventDetails'
        }
      },
      { $unwind: '$eventDetails' },
      {
        $project: {
          _id: 0,
          eventId: '$_id',
          name: '$eventDetails.title',
          category: '$eventDetails.category',
          registrations: '$totalRegistrations',
          totalSeats: '$eventDetails.totalSeats',
          availableSeats: '$eventDetails.availableSeats'
        }
      }
    ]);

    res.json({
      success: true,
      stats: {
        totalEvents,
        totalUsers,
        totalRegistrations,
        upcomingEvents,
        completedEvents,
        cancelledRegistrations
      },
      charts: {
        registrationsOverTime,
        categoryDistribution,
        popularEvents
      }
    });
  } catch (error) {
    next(error);
  }
};

const getAdminEvents = async (req, res, next) => {
  try {
    const { search, category, status, page = 1, limit = 10 } = req.query;
    const query = {};

    if (search && search.trim()) {
      query.$or = [
        { title: { $regex: search.trim(), $options: 'i' } },
        { venue: { $regex: search.trim(), $options: 'i' } },
        { organizerName: { $regex: search.trim(), $options: 'i' } }
      ];
    }

    if (category && category !== 'All') query.category = category;
    if (status && status !== 'All') query.status = status;

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 10;
    const skip = (pageNum - 1) * limitNum;

    const total = await Event.countDocuments(query);
    const events = await Event.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    res.json({
      success: true,
      total,
      totalPages: Math.ceil(total / limitNum) || 1,
      currentPage: pageNum,
      events
    });
  } catch (error) {
    next(error);
  }
};

const getAdminRegistrations = async (req, res, next) => {
  try {
    const { search, eventId, status, page = 1, limit = 10, export: exportType } = req.query;
    const query = {};

    if (search && search.trim()) {
      query.$or = [
        { participantName: { $regex: search.trim(), $options: 'i' } },
        { email: { $regex: search.trim(), $options: 'i' } },
        { phone: { $regex: search.trim(), $options: 'i' } }
      ];
    }

    if (eventId && eventId !== 'All') query.event = eventId;
    if (status && status !== 'All') query.registrationStatus = status;

    if (exportType === 'csv') {
      const records = await Registration.find(query)
        .populate('event', 'title category date venue')
        .populate('user', 'name email')
        .sort({ registeredAt: -1 });

      let csv = 'ID,Participant,Email,Phone,Event,Category,Date,Venue,Status,Registered At\n';

      records.forEach((r) => {
        const row = [
          r._id,
          `"${(r.participantName || '').replace(/"/g, '""')}"`,
          `"${(r.email || '').replace(/"/g, '""')}"`,
          `"${(r.phone || '').replace(/"/g, '""')}"`,
          `"${(r.event?.title || '').replace(/"/g, '""')}"`,
          `"${(r.event?.category || '').replace(/"/g, '""')}"`,
          r.event?.date ? new Date(r.event.date).toISOString().split('T')[0] : '',
          `"${(r.event?.venue || '').replace(/"/g, '""')}"`,
          r.registrationStatus,
          r.registeredAt ? new Date(r.registeredAt).toISOString().split('T')[0] : ''
        ].join(',');
        csv += row + '\n';
      });

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="registrations.csv"');
      return res.send(csv);
    }

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 10;
    const skip = (pageNum - 1) * limitNum;

    const total = await Registration.countDocuments(query);
    const registrations = await Registration.find(query)
      .populate('event', 'title category date venue')
      .populate('user', 'name email')
      .sort({ registeredAt: -1 })
      .skip(skip)
      .limit(limitNum);

    res.json({
      success: true,
      total,
      totalPages: Math.ceil(total / limitNum) || 1,
      currentPage: pageNum,
      registrations
    });
  } catch (error) {
    next(error);
  }
};

const getAdminUsers = async (req, res, next) => {
  try {
    const { search, role, page = 1, limit = 10 } = req.query;
    const query = {};

    if (search && search.trim()) {
      query.$or = [
        { name: { $regex: search.trim(), $options: 'i' } },
        { email: { $regex: search.trim(), $options: 'i' } },
        { phone: { $regex: search.trim(), $options: 'i' } }
      ];
    }

    if (role && role !== 'All') query.role = role;

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 10;
    const skip = (pageNum - 1) * limitNum;

    const total = await User.countDocuments(query);
    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    const usersWithStats = await Promise.all(
      users.map(async (u) => {
        const count = await Registration.countDocuments({ user: u._id });
        return {
          ...u.toObject(),
          totalRegistrations: count
        };
      })
    );

    res.json({
      success: true,
      total,
      totalPages: Math.ceil(total / limitNum) || 1,
      currentPage: pageNum,
      users: usersWithStats
    });
  } catch (error) {
    next(error);
  }
};

const updateUserRole = async (req, res, next) => {
  try {
    const { role } = req.body;
    const targetUserId = req.params.id;

    if (!role || !['user', 'admin'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role'
      });
    }

    const targetUser = await User.findById(targetUserId);
    if (!targetUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Don't demote the only admin
    if (targetUser.role === 'admin' && role === 'user') {
      const adminCount = await User.countDocuments({ role: 'admin' });
      if (adminCount <= 1) {
        return res.status(400).json({
          success: false,
          message: 'Cannot demote the last remaining admin'
        });
      }
    }

    targetUser.role = role;
    await targetUser.save();

    res.json({
      success: true,
      message: `User role changed to ${role}`,
      user: {
        _id: targetUser._id,
        name: targetUser.name,
        email: targetUser.email,
        phone: targetUser.phone,
        role: targetUser.role
      }
    });
  } catch (error) {
    next(error);
  }
};

const deleteUser = async (req, res, next) => {
  try {
    const targetUserId = req.params.id;

    if (targetUserId === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'You cannot delete your own account'
      });
    }

    const targetUser = await User.findById(targetUserId);
    if (!targetUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (targetUser.role === 'admin') {
      const adminCount = await User.countDocuments({ role: 'admin' });
      if (adminCount <= 1) {
        return res.status(400).json({
          success: false,
          message: 'Cannot delete the only admin'
        });
      }
    }

    await Registration.deleteMany({ user: targetUserId });
    await User.findByIdAndDelete(targetUserId);

    res.json({
      success: true,
      message: 'User removed'
    });
  } catch (error) {
    next(error);
  }
};

const getAdminAnalytics = async (req, res, next) => {
  try {
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyTrends = await Registration.aggregate([
      { $match: { registeredAt: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m', date: '$registeredAt' } },
          total: { $sum: 1 },
          confirmed: {
            $sum: { $cond: [{ $eq: ['$registrationStatus', 'confirmed'] }, 1, 0] }
          },
          cancelled: {
            $sum: { $cond: [{ $eq: ['$registrationStatus', 'cancelled'] }, 1, 0] }
          }
        }
      },
      { $sort: { _id: 1 } },
      {
        $project: {
          _id: 0,
          month: '$_id',
          total: 1,
          confirmed: 1,
          cancelled: 1
        }
      }
    ]);

    const categoryPerformance = await Registration.aggregate([
      { $match: { registrationStatus: 'confirmed' } },
      {
        $lookup: {
          from: 'events',
          localField: 'event',
          foreignField: '_id',
          as: 'eventInfo'
        }
      },
      { $unwind: '$eventInfo' },
      {
        $group: {
          _id: '$eventInfo.category',
          count: { $sum: 1 }
        }
      },
      {
        $project: {
          _id: 0,
          category: '$_id',
          registrations: '$count'
        }
      },
      { $sort: { registrations: -1 } }
    ]);

    const eventOccupancy = await Event.aggregate([
      {
        $project: {
          title: 1,
          category: 1,
          totalSeats: 1,
          availableSeats: 1,
          bookedSeats: { $subtract: ['$totalSeats', '$availableSeats'] },
          occupancyRate: {
            $round: [
              {
                $multiply: [
                  {
                    $divide: [
                      { $subtract: ['$totalSeats', '$availableSeats'] },
                      { $cond: [{ $gt: ['$totalSeats', 0] }, '$totalSeats', 1] }
                    ]
                  },
                  100
                ]
              },
              1
            ]
          }
        }
      },
      { $sort: { occupancyRate: -1 } },
      { $limit: 8 }
    ]);

    const statusBreakdown = await Event.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      },
      {
        $project: {
          _id: 0,
          status: '$_id',
          count: 1
        }
      }
    ]);

    res.json({
      success: true,
      analytics: {
        monthlyTrends,
        categoryPerformance,
        eventOccupancy,
        statusBreakdown
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboardStats,
  getAdminEvents,
  getAdminRegistrations,
  getAdminUsers,
  updateUserRole,
  deleteUser,
  getAdminAnalytics
};
