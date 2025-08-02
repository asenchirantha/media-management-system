const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const Event = require('../models/eventModel');
const fs = require('fs');
const authMiddleware = require('../middleware/auth');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    if (file.fieldname === "coverImage") {
      cb(null, 'uploads/images/');
    } else if (file.fieldname === "videoFile") {
      cb(null, 'uploads/videos/');
    }
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

// Create event with file uploads
router.post('/create', upload.fields([
  { name: 'coverImage', maxCount: 1 },
  { name: 'videoFile', maxCount: 1 }
]), async (req, res) => {
  try {
    const eventData = {
      title: req.body.title,
      description: req.body.description,
      date: req.body.date,
      location: req.body.location,
      coverImage: req.files['coverImage'] ? `/uploads/images/${req.files['coverImage'][0].filename}` : null,
      videoFile: req.files['videoFile'] ? `/uploads/videos/${req.files['videoFile'][0].filename}` : null
    };

    const event = new Event(eventData);
    await event.save();
    res.status(201).json(event);
  } catch (error) {
    console.error('Error creating event:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get all events
router.get('/', async (req, res) => {
  try {
    const events = await Event.find();
    res.json(events);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update event
router.put('/:id', upload.fields([
  { name: 'coverImage', maxCount: 1 },
  { name: 'videoFile', maxCount: 1 }
]), async (req, res) => {
  try {
    const eventData = {
      title: req.body.title,
      description: req.body.description,
      date: req.body.date,
      location: req.body.location
    };

    if (req.files['coverImage']) {
      eventData.coverImage = `/uploads/images/${req.files['coverImage'][0].filename}`;
    }
    if (req.files['videoFile']) {
      eventData.videoFile = `/uploads/videos/${req.files['videoFile'][0].filename}`;
    }

    const updatedEvent = await Event.findByIdAndUpdate(
      req.params.id,
      eventData,
      { new: true }
    );

    if (!updatedEvent) {
      return res.status(404).json({ message: 'Event not found' });
    }

    res.json(updatedEvent);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Protected delete route
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    // Check if event exists
    const event = await Event.findById(req.params.id);
    
    if (!event) {
      return res.status(404).json({ 
        success: false,
        message: 'Event not found' 
      });
    }

    // Delete associated files if they exist
    if (event.coverImage) {
      const coverImagePath = path.join(__dirname, '..', event.coverImage);
      try {
        if (fs.existsSync(coverImagePath)) {
          fs.unlinkSync(coverImagePath);
        }
      } catch (error) {
        console.error('Error deleting cover image:', error);
      }
    }

    if (event.videoFile) {
      const videoFilePath = path.join(__dirname, '..', event.videoFile);
      try {
        if (fs.existsSync(videoFilePath)) {
          fs.unlinkSync(videoFilePath);
        }
      } catch (error) {
        console.error('Error deleting video file:', error);
      }
    }

    // Delete the event from database
    await Event.findByIdAndDelete(req.params.id);

    res.json({ 
      success: true,
      message: 'Event deleted successfully'
    });
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error deleting event',
      error: error.message 
    });
  }
});

module.exports = router;
