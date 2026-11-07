const User = require('../models/User');
const Registration = require('../models/Registration');
const bcrypt = require('bcryptjs');

// @desc    Get user profile with registration summary
// @route   GET /api/users/profile
// @access  Private
const getUserProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const totalRegistrations = await Registration.countDocuments({ user: user._id });
    const confirmedRegistrations = await Registration.countDocuments({
      user: user._id,
      registrationStatus: 'confirmed'
    });
    const cancelledRegistrations = await Registration.countDocuments({
      user: user._id,
      registrationStatus: 'cancelled'
    });

    res.status(200).json({
      success: true,
      user,
      stats: {
        totalRegistrations,
        confirmedRegistrations,
        cancelledRegistrations
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user profile & password
// @route   PUT /api/users/profile
// @access  Private
const updateUserProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select('+password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const { name, phone, currentPassword, newPassword } = req.body;

    if (name) user.name = name.trim();
    if (phone) user.phone = phone.trim();

    // Change password if provided
    if (newPassword) {
      if (!currentPassword) {
        return res.status(400).json({
          success: false,
          message: 'Current password is required to set a new password'
        });
      }

      const isMatch = await user.matchPassword(currentPassword);
      if (!isMatch) {
        return res.status(400).json({
          success: false,
          message: 'Incorrect current password'
        });
      }

      if (newPassword.length < 6) {
        return res.status(400).json({
          success: false,
          message: 'New password must be at least 6 characters'
        });
      }

      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(newPassword, salt);
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getUserProfile,
  updateUserProfile
};
