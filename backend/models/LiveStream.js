const mongoose = require("mongoose");

const LiveStreamSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  streamer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  platform: {
    type: String,
    enum: ['dreamio', 'youtube', 'facebook', 'twitch', 'custom'],
    default: 'dreamio'
  },
  streamKey: {
    type: String,
    required: function() {
      return this.platform !== 'dreamio';
    }
  },
  videoFile: {
    type: String,
    required: function() {
      return this.platform === 'dreamio';
    }
  },
  isLive: {
    type: Boolean,
    default: false
  },
  viewerCount: {
    type: Number,
    default: 0
  },
  likeCount: {
    type: Number,
    default: 0
  },
  startTime: {
    type: Date
  },
  endTime: {
    type: Date
  },
  duration: {
    type: Number,
    default: 0
  },
  thumbnail: {
    type: String
  },
  status: {
    type: String,
    enum: ['scheduled', 'live', 'ended', 'cancelled'],
    default: 'scheduled'
  },
  scheduledFor: {
    type: Date
  },
  tags: [{
    type: String,
    trim: true
  }],
  category: {
    type: String,
    trim: true
  },
  isPublic: {
    type: Boolean,
    default: true
  },
  streamUrl: {
    type: String
  },
  chatEnabled: {
    type: Boolean,
    default: true
  },
  recordingEnabled: {
    type: Boolean,
    default: false
  },
  recordingUrl: {
    type: String
  }
}, {
  timestamps: true
});

// Index for better query performance
LiveStreamSchema.index({ streamer: 1, status: 1 });
LiveStreamSchema.index({ isLive: 1, platform: 1 });
LiveStreamSchema.index({ scheduledFor: 1 });

module.exports = mongoose.model("LiveStream", LiveStreamSchema); 