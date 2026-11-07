const mongoose = require('mongoose');

const registrationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User reference is required']
    },
    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event',
      required: [true, 'Event reference is required']
    },
    participantName: {
      type: String,
      required: [true, 'Participant name is required'],
      trim: true
    },
    email: {
      type: String,
      required: [true, 'Participant email is required'],
      lowercase: true,
      trim: true
    },
    phone: {
      type: String,
      required: [true, 'Participant phone is required'],
      trim: true
    },
    registrationStatus: {
      type: String,
      enum: ['confirmed', 'cancelled'],
      default: 'confirmed'
    },
    registeredAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);

// Indexes
registrationSchema.index({ user: 1, event: 1 });
registrationSchema.index({ event: 1, registrationStatus: 1 });
registrationSchema.index({ registeredAt: -1 });

module.exports = mongoose.model('Registration', registrationSchema);
