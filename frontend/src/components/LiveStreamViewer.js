import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Header from './ui/header';
import { FaPlay, FaPause, FaVolumeUp, FaVolumeMute, FaExpand, FaUsers, FaHeart, FaShare, FaComment, FaArrowLeft } from 'react-icons/fa';
import './css/LiveStreamViewer.css';

const LiveStreamViewer = () => {
  const navigate = useNavigate();
  const { streamId } = useParams();
  const videoRef = useRef(null);
  
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [viewerCount, setViewerCount] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [streamInfo, setStreamInfo] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Simulate live stream data
  useEffect(() => {
    // Simulate fetching stream info
    setTimeout(() => {
      setStreamInfo({
        id: streamId || '1',
        title: 'Live Graduation Ceremony 2024',
        streamer: 'Asen Chirantha',
        description: 'Join us for the annual graduation ceremony live from ABC Campus',
        thumbnail: '/default-event-image.jpg',
        isLive: true
      });
      setViewerCount(Math.floor(Math.random() * 1000) + 100);
      setLikeCount(Math.floor(Math.random() * 500) + 50);
      setIsLoading(false);
    }, 1000);

    // Simulate viewer count updates
    const interval = setInterval(() => {
      setViewerCount(prev => prev + Math.floor(Math.random() * 10) - 5);
    }, 5000);

    return () => clearInterval(interval);
  }, [streamId]);

  const handlePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
    }
    setIsPlaying(!isPlaying);
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted;
      setIsMuted(!isMuted);
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      videoRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const handleLike = () => {
    setIsLiked(!isLiked);
    setLikeCount(prev => isLiked ? prev - 1 : prev + 1);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: streamInfo?.title,
        text: streamInfo?.description,
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  const handleComment = () => {
    if (newComment.trim()) {
      const comment = {
        id: Date.now(),
        user: 'You',
        text: newComment,
        timestamp: new Date().toLocaleTimeString()
      };
      setComments([comment, ...comments]);
      setNewComment('');
    }
  };

  const handleBack = () => {
    navigate('/user');
  };

  if (isLoading) {
    return (
      <div className="live-stream-viewer-container">
        <Header />
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading live stream...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="live-stream-viewer-container">
      <Header />
      
      <div className="live-stream-content">
        <div className="stream-header">
          <button className="back-button" onClick={handleBack}>
            <FaArrowLeft />
            Back to Dashboard
          </button>
          <div className="stream-title">
            <h1>{streamInfo?.title}</h1>
            <div className="live-indicator">
              <span className="live-dot"></span>
              LIVE
            </div>
          </div>
        </div>

        <div className="stream-main">
          <div className="video-section">
            <div className="video-container">
              <video
                ref={videoRef}
                autoPlay
                muted
                playsInline
                className="live-video"
                poster={streamInfo?.thumbnail}
              >
                {/* In a real implementation, this would be the actual live stream URL */}
                <source src="/sample-live-stream.mp4" type="video/mp4" />
                Your browser does not support the video tag.
              </video>
              
              <div className="video-overlay">
                <div className="stream-info-overlay">
                  <div className="viewer-count">
                    <FaUsers />
                    <span>{viewerCount} watching</span>
                  </div>
                </div>
              </div>

              <div className="video-controls">
                <button className="control-btn" onClick={handlePlayPause}>
                  {isPlaying ? <FaPause /> : <FaPlay />}
                </button>
                
                <button className="control-btn" onClick={toggleMute}>
                  {isMuted ? <FaVolumeMute /> : <FaVolumeUp />}
                </button>
                
                <button className="control-btn" onClick={toggleFullscreen}>
                  <FaExpand />
                </button>
              </div>
            </div>

            <div className="stream-details">
              <div className="streamer-info">
                <img src="/path/to/profile.jpg" alt="Streamer" className="streamer-avatar" />
                <div className="streamer-details">
                  <h3>{streamInfo?.streamer}</h3>
                  <p>{streamInfo?.description}</p>
                </div>
              </div>

              <div className="stream-actions">
                <button className={`action-btn like-btn ${isLiked ? 'liked' : ''}`} onClick={handleLike}>
                  <FaHeart />
                  <span>{likeCount}</span>
                </button>
                
                <button className="action-btn" onClick={handleShare}>
                  <FaShare />
                  <span>Share</span>
                </button>
              </div>
            </div>
          </div>

          <div className="chat-section">
            <div className="chat-header">
              <h3>Live Chat</h3>
              <span className="online-count">{viewerCount} online</span>
            </div>
            
            <div className="chat-messages">
              {comments.map((comment) => (
                <div key={comment.id} className="chat-message">
                  <span className="message-user">{comment.user}:</span>
                  <span className="message-text">{comment.text}</span>
                  <span className="message-time">{comment.timestamp}</span>
                </div>
              ))}
            </div>
            
            <div className="chat-input">
              <input
                type="text"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Type a message..."
                onKeyPress={(e) => e.key === 'Enter' && handleComment()}
              />
              <button onClick={handleComment} disabled={!newComment.trim()}>
                <FaComment />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LiveStreamViewer; 