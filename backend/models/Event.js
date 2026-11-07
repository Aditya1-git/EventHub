const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please provide an event title'],
      trim: true,
      maxlength: [120, 'Title cannot exceed 120 characters']
    },
    shortDescription: {
      type: String,
      required: [true, 'Please provide a short summary description'],
      trim: true,
      maxlength: [250, 'Short description cannot exceed 250 characters']
    },
    description: {
      type: String,
      required: [true, 'Please provide full event details']
    },
    category: {
      type: String,
      required: [true, 'Please select an event category'],
      enum: [
        'Technology',
        'Hackathons',
        'Workshops',
        'Cultural Events',
        'Business',
        'Sports',
        'Music',
        'Education'
      ],
      trim: true
    },
    image: {
      type: String,
      required: [true, 'Please provide an image URL or upload an image']
    },
    date: {
      type: Date,
      required: [true, 'Please provide event date']
    },
    startTime: {
      type: String,
      required: [true, 'Please provide start time (e.g. 10:00 AM)']
    },
    endTime: {
      type: String,
      required: [true, 'Please provide end time (e.g. 05:00 PM)']
    },
    venue: {
      type: String,
      required: [true, 'Please provide the venue or location'],
      trim: true
    },
    organizerName: {
      type: String,
      required: [true, 'Please provide organizer name'],
      trim: true
    },
    organizerEmail: {
      type: String,
      required: [true, 'Please provide organizer email'],
      lowercase: true,
      trim: true
    },
    totalSeats: {
      type: Number,
      required: [true, 'Please specify total seats capacity'],
      min: [1, 'Seats must be at least 1']
    },
    availableSeats: {
      type: Number,
      required: [true, 'Please specify available seats'],
      min: [0, 'Available seats cannot be negative']
    },
    registrationDeadline: {
      type: Date,
      required: [true, 'Please provide a registration deadline']
    },
    isFeatured: {
      type: Boolean,
      default: false
    },
    status: {
      type: String,
      enum: ['upcoming', 'ongoing', 'completed', 'cancelled'],
      default: 'upcoming'
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);

// Indexes for fast searching and filtering
eventSchema.index({ title: 'text', description: 'text', venue: 'text' });
eventSchema.index({ category: 1, status: 1, date: 1 });
eventSchema.index({ isFeatured: 1 });

module.exports = mongoose.model('Event', eventSchema);
