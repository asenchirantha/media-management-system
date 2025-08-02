const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const LiveStream = require('../models/LiveStream');
const auth = require('../middleware/auth');

// Configure multer for video uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/videos/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  fileFilter: function (req, file, cb) {
    if (file.mimetype.startsWith('video/')) {
      cb(null, true);
    } else {
      cb(new Error('Only video files are allowed!'), false);
    }
  },
  limits: {
    fileSize: 500 * 1024 * 1024 // 500MB limit
  }
});

// Get all live streams
router.get('/', async (req, res) => {
  try {
    const liveStreams = await LiveStream.find({ isPublic: true })
      .populate('streamer', 'name email profileImage')
      .sort({ createdAt: -1 });
    res.json(liveStreams);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get live streams by user
router.get('/user/:userId', async (req, res) => {
  try {
    const liveStreams = await LiveStream.find({ streamer: req.params.userId })
      .populate('streamer', 'name email profileImage')
      .sort({ createdAt: -1 });
    res.json(liveStreams);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get a specific live stream
router.get('/:id', async (req, res) => {
  try {
    const liveStream = await LiveStream.findById(req.params.id)
      .populate('streamer', 'name email profileImage');
    
    if (!liveStream) {
      return res.status(404).json({ message: 'Live stream not found' });
    }
    
    res.json(liveStream);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create a new live stream
router.post('/', auth, upload.single('videoFile'), async (req, res) => {
  try {
    const {
      title,
      description,
      platform,
      streamKey,
      scheduledFor,
      tags,
      category,
      isPublic,
      chatEnabled,
      recordingEnabled
    } = req.body;

    const liveStreamData = {
      title,
      description,
      streamer: req.user.id,
      platform,
      streamKey: platform !== 'dreamio' ? streamKey : undefined,
      videoFile: platform === 'dreamio' && req.file ? `/uploads/videos/${req.file.filename}` : undefined,
      scheduledFor: scheduledFor ? new Date(scheduledFor) : undefined,
      tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
      category,
      isPublic: isPublic === 'true',
      chatEnabled: chatEnabled === 'true',
      recordingEnabled: recordingEnabled === 'true'
    };

    const liveStream = new LiveStream(liveStreamData);
    await liveStream.save();
    
    res.status(201).json(liveStream);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Start a live stream
router.patch('/:id/start', auth, async (req, res) => {
  try {
    const liveStream = await LiveStream.findById(req.params.id);
    
    if (!liveStream) {
      return res.status(404).json({ message: 'Live stream not found' });
    }
    
    if (liveStream.streamer.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to start this stream' });
    }
    
    liveStream.isLive = true;
    liveStream.status = 'live';
    liveStream.startTime = new Date();
    await liveStream.save();
    
    res.json(liveStream);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Stop a live stream
router.patch('/:id/stop', auth, async (req, res) => {
  try {
    const liveStream = await LiveStream.findById(req.params.id);
    
    if (!liveStream) {
      return res.status(404).json({ message: 'Live stream not found' });
    }
    
    if (liveStream.streamer.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to stop this stream' });
    }
    
    liveStream.isLive = false;
    liveStream.status = 'ended';
    liveStream.endTime = new Date();
    
    if (liveStream.startTime) {
      liveStream.duration = Math.floor((liveStream.endTime - liveStream.startTime) / 1000);
    }
    
    await liveStream.save();
    
    res.json(liveStream);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update viewer count
router.patch('/:id/viewers', async (req, res) => {
  try {
    const { viewerCount } = req.body;
    const liveStream = await LiveStream.findByIdAndUpdate(
      req.params.id,
      { viewerCount },
      { new: true }
    );
    res.json(liveStream);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update like count
router.patch('/:id/like', async (req, res) => {
  try {
    const { likeCount } = req.body;
    const liveStream = await LiveStream.findByIdAndUpdate(
      req.params.id,
      { likeCount },
      { new: true }
    );
    res.json(liveStream);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update live stream
router.put('/:id', auth, async (req, res) => {
  try {
    const liveStream = await LiveStream.findById(req.params.id);
    
    if (!liveStream) {
      return res.status(404).json({ message: 'Live stream not found' });
    }
    
    if (liveStream.streamer.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to update this stream' });
    }
    
    const updatedLiveStream = await LiveStream.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    
    res.json(updatedLiveStream);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete live stream
router.delete('/:id', auth, async (req, res) => {
  try {
    const liveStream = await LiveStream.findById(req.params.id);
    
    if (!liveStream) {
      return res.status(404).json({ message: 'Live stream not found' });
    }
    
    if (liveStream.streamer.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to delete this stream' });
    }
    
    await LiveStream.findByIdAndDelete(req.params.id);
    res.json({ message: 'Live stream deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get currently live streams
router.get('/live/current', async (req, res) => {
  try {
    const liveStreams = await LiveStream.find({ 
      isLive: true, 
      isPublic: true 
    })
    .populate('streamer', 'name email profileImage')
    .sort({ startTime: -1 });
    
    res.json(liveStreams);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router; 