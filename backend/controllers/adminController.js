const Event = require('../models/Event');
const User = require('../models/User');
const Registration = require('../models/Registration');

// @desc    Get Admin Dashboard Overview Stats & Charts Data
// @route   GET /api/admin/dashboard
// @access  Private/Admin
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

    // 1. Registrations over time (Last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const registrationsOverTime = await Registration.aggregate([
      {
        $match: {
          registeredAt: { $gte: thirtyDaysAgo }
        }
      },
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

    // 2. Category distribution of events
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

    // 3. Most popular events by registrations
    const popularEvents = await Registration.aggregate([
      {
        $match: { registrationStatus: 'confirmed' }
      },
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

    res.status(200).json({
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

// @desc    Get all events for admin table
// @route   GET /api/admin/events
// @access  Private/Admin
const getAdminEvents = async (req, res, next) => {
  try {
    const { search, category, status, page = 1, limit = 10 } = req.query;

    const query = {};

    if (search && search.trim() !== '') {
      query.$or = [
        { title: { $regex: search.trim(), $options: 'i' } },
        { venue: { $regex: search.trim(), $options: 'i' } },
        { organizerName: { $regex: search.trim(), $options: 'i' } }
      ];
    }

    if (category && category !== 'All') {
      query.category = category;
    }

    if (status && status !== 'All') {
      query.status = status;
    }

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 10;
    const skip = (pageNum - 1) * limitNum;

    const total = await Event.countDocuments(query);
    const events = await Event.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    res.status(200).json({
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

// @desc    Get all registrations with search, filters & optional CSV export
// @route   GET /api/admin/registrations
// @access  Private/Admin
const getAdminRegistrations = async (req, res, next) => {
  try {
    const { search, eventId, status, page = 1, limit = 10, export: exportType } = req.query;

    const query = {};

    if (search && search.trim() !== '') {
      query.$or = [
        { participantName: { $regex: search.trim(), $options: 'i' } },
        { email: { $regex: search.trim(), $options: 'i' } },
        { phone: { $regex: search.trim(), $options: 'i' } }
      ];
    }

    if (eventId && eventId !== 'All') {
      query.event = eventId;
    }

    if (status && status !== 'All') {
      query.registrationStatus = status;
    }

    // CSV Export
    if (exportType === 'csv') {
      const allRegistrations = await Registration.find(query)
        .populate('event', 'title category date venue')
        .populate('user', 'name email')
        .sort({ registeredAt: -1 });

      let csv = 'Registration ID,Participant Name,Email,Phone,Event Title,Category,Event Date,Venue,Status,Registered At\n';

      allRegistrations.forEach((reg) => {
        const id = reg._id;
        const name = `"${(reg.participantName || '').replace(/"/g, '""')}"`;
        const email = `"${(reg.email || '').replace(/"/g, '""')}"`;
        const phone = `"${(reg.phone || '').replace(/"/g, '""')}"`;
        const eventTitle = `"${(reg.event?.title || 'N/A').replace(/"/g, '""')}"`;
        const category = `"${(reg.event?.category || 'N/A').replace(/"/g, '""')}"`;
        const eventDate = reg.event?.date ? new Date(reg.event.date).toISOString().split('T')[0] : 'N/A';
        const venue = `"${(reg.event?.venue || 'N/A').replace(/"/g, '""')}"`;
        const regStatus = reg.registrationStatus;
        const regDate = reg.registeredAt ? new Date(reg.registeredAt).toISOString().replace('T', ' ').slice(0, 19) : 'N/A';

        csv += `${id},${name},${email},${phone},${eventTitle},${category},${eventDate},${venue},${regStatus},${regDate}\n`;
      });

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="registrations.csv"');
      return res.status(200).send(csv);
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

    res.status(200).json({
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

// @desc    Get all users with registration count
// @route   GET /api/admin/users
// @access  Private/Admin
const getAdminUsers = async (req, res, next) => {
  try {
    const { search, role, page = 1, limit = 10 } = req.query;

    const query = {};

    if (search && search.trim() !== '') {
      query.$or = [
        { name: { $regex: search.trim(), $options: 'i' } },
        { email: { $regex: search.trim(), $options: 'i' } },
        { phone: { $regex: search.trim(), $options: 'i' } }
      ];
    }

    if (role && role !== 'All') {
      query.role = role;
    }

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 10;
    const skip = (pageNum - 1) * limitNum;

    const total = await User.countDocuments(query);
    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    // Compute registration count for each user
    const usersWithStats = await Promise.all(
      users.map(async (u) => {
        const regCount = await Registration.countDocuments({ user: u._id });
        return {
          ...u.toObject(),
          totalRegistrations: regCount
        };
      })
    );

    res.status(200).json({
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

// @desc    Update user role
// @route   PUT /api/admin/users/:id/role
// @access  Private/Admin
const updateUserRole = async (req, res, next) => {
  try {
    const { role } = req.body;
    const targetUserId = req.params.id;

    if (!role || !['user', 'admin'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role. Must be user or admin'
      });
    }

    const targetUser = await User.findById(targetUserId);
    if (!targetUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Safeguard: Cannot demote the last admin
    if (targetUser.role === 'admin' && role === 'user') {
      const adminCount = await User.countDocuments({ role: 'admin' });
      if (adminCount <= 1) {
        return res.status(400).json({
          success: false,
          message: 'Operation denied: Cannot remove the last administrator'
        });
      }
    }

    targetUser.role = role;
    await targetUser.save();

    res.status(200).json({
      success: true,
      message: `User role updated to ${role}`,
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

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
const deleteUser = async (req, res, next) => {
  try {
    const targetUserId = req.params.id;

    // Safeguard 1: Admin cannot delete themselves
    if (targetUserId === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'Operation denied: You cannot delete your own account'
      });
    }

    const targetUser = await User.findById(targetUserId);
    if (!targetUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Safeguard 2: Admin cannot delete the last admin
    if (targetUser.role === 'admin') {
      const adminCount = await User.countDocuments({ role: 'admin' });
      if (adminCount <= 1) {
        return res.status(400).json({
          success: false,
          message: 'Operation denied: Cannot delete the last administrator'
        });
      }
    }

    // Delete associated registrations or mark them
    await Registration.deleteMany({ user: targetUserId });
    await User.findByIdAndDelete(targetUserId);

    res.status(200).json({
      success: true,
      message: 'User and their registrations deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get detailed analytics
// @route   GET /api/admin/analytics
// @access  Private/Admin
const getAdminAnalytics = async (req, res, next) => {
  try {
    // 1. Monthly Registration Trends (Last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyTrends = await Registration.aggregate([
      {
        $match: {
          registeredAt: { $gte: sixMonthsAgo }
        }
      },
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

    // 2. Category Performance (Registrations by category)
    const categoryPerformance = await Registration.aggregate([
      {
        $match: { registrationStatus: 'confirmed' }
      },
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

    // 3. Seat occupancy rates of top events
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

    // 4. Overall status breakdown
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

    res.status(200).json({
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
