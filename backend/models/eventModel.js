const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  location: {
    type: String,
    required: true,
  },
  createdBy: {
    type: String,
    required: true,
  },
  coverImage: {
    type: String, // This will store the path/URL to the image
    required: true,
  },
  videoFile: {
    type: String, // This will store the path/URL to the video
    required: false, // Optional as per your requirement
  }
});

const Event = mongoose.model('Event', eventSchema);
module.exports = Event;
