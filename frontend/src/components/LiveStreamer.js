import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Header from './ui/header';
import { FaPlay, FaStop, FaVolumeUp, FaVolumeMute, FaExpand, FaCog, FaMicrophone, FaMicrophoneSlash, FaVideo, FaVideoSlash, FaUsers, FaEye } from 'react-icons/fa';
import './css/LiveStreamer.css';

const LiveStreamer = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  
  const [isLive, setIsLive] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isMicEnabled, setIsMicEnabled] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [viewerCount, setViewerCount] = useState(0);
  const [streamTitle, setStreamTitle] = useState('My Live Stream');
  const [streamKey, setStreamKey] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [streamDuration, setStreamDuration] = useState(0);
  const [streamStartTime, setStreamStartTime] = useState(null);
  const [uploadedVideo, setUploadedVideo] = useState(null);
  const [selectedPlatform, setSelectedPlatform] = useState('dreamio');
  const [streamDescription, setStreamDescription] = useState('');
  const [isVideoUploaded, setIsVideoUploaded] = useState(false);

  // Handle video from VideoEditor
  useEffect(() => {
    if (location.state?.fromEditor && location.state?.videoUrl) {
      setUploadedVideo({
        file: null,
        url: location.state.videoUrl,
        name: location.state.videoName || 'Edited Video'
      });
      setIsVideoUploaded(true);
      setSelectedPlatform('dreamio');
      
      // Set video as source for preview
      if (videoRef.current) {
        videoRef.current.src = location.state.videoUrl;
      }
    }
  }, [location.state]);

  // Simulate viewer count
  useEffect(() => {
    if (isLive) {
      const interval = setInterval(() => {
        setViewerCount(prev => prev + Math.floor(Math.random() * 3) - 1);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [isLive]);

  // Stream duration timer
  useEffect(() => {
    let interval;
    if (isLive && streamStartTime) {
      interval = setInterval(() => {
        setStreamDuration(Math.floor((Date.now() - streamStartTime) / 1000));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isLive, streamStartTime]);

  const formatDuration = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };



  const stopStream = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    
    setIsLive(false);
    setStreamStartTime(null);
    setStreamDuration(0);
    setViewerCount(0);
    
    console.log('Stream stopped');
  };

  const toggleMute = () => {
    if (streamRef.current) {
      const audioTrack = streamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMuted(!audioTrack.enabled);
      }
    }
  };

  const toggleVideo = () => {
    if (streamRef.current) {
      const videoTrack = streamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoEnabled(videoTrack.enabled);
      }
    }
  };

  const toggleMic = () => {
    if (streamRef.current) {
      const audioTrack = streamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMicEnabled(audioTrack.enabled);
      }
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

  const handleBackToDashboard = () => {
    if (isLive) {
      if (window.confirm('You are currently live. Are you sure you want to stop the stream and go back?')) {
        stopStream();
        navigate('/designer');
      }
    } else {
      navigate('/designer');
    }
  };

  const handleVideoUpload = (event) => {
    const file = event.target.files[0];
    if (file && file.type.startsWith('video/')) {
      const videoUrl = URL.createObjectURL(file);
      setUploadedVideo({
        file: file,
        url: videoUrl,
        name: file.name
      });
      setIsVideoUploaded(true);
      
      // Set video as source for preview
      if (videoRef.current) {
        videoRef.current.src = videoUrl;
      }
    } else {
      alert('Please select a valid video file');
    }
  };

  const handlePlatformChange = (platform) => {
    setSelectedPlatform(platform);
    if (platform === 'dreamio') {
      setStreamKey(''); // Clear stream key for Dreamio
    }
  };

  const startStream = async () => {
    if (selectedPlatform !== 'dreamio' && !streamKey.trim()) {
      alert('Please enter a stream key for external platforms');
      return;
    }

    if (selectedPlatform === 'dreamio' && !isVideoUploaded && !uploadedVideo) {
      alert('Please upload a video to go live on Dreamio');
      return;
    }

    setIsLoading(true);
    try {
      if (selectedPlatform === 'dreamio') {
        // For Dreamio platform - use uploaded video
        if (uploadedVideo && videoRef.current) {
          videoRef.current.src = uploadedVideo.url;
          videoRef.current.play();
        }
      } else {
        // For external platforms - use camera
        const stream = await navigator.mediaDevices.getUserMedia({
          video: isVideoEnabled,
          audio: isMicEnabled
        });
        
        streamRef.current = stream;
        
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      }
      
      // Simulate stream start delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setIsLive(true);
      setStreamStartTime(Date.now());
      setStreamDuration(0);
      setViewerCount(Math.floor(Math.random() * 50) + 10);
      
      console.log(`Stream started successfully on ${selectedPlatform}`);
    } catch (error) {
      console.error('Error starting stream:', error);
      alert('Failed to start stream. Please check your camera and microphone permissions.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="live-streamer-container">
      <Header />
      
      <div className="live-streamer-content">
        <div className="stream-header">
          <button className="back-button" onClick={handleBackToDashboard}>
            ← Back to Dashboard
          </button>
          <h1>Live Streamer</h1>
          <div className="stream-status">
            {isLive && (
              <div className="live-indicator">
                <span className="live-dot"></span>
                LIVE
              </div>
            )}
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
                className="preview-video"
              />
              
              {!isLive && (
                <div className="video-placeholder">
                  <div className="placeholder-content">
                    <FaVideo className="placeholder-icon" />
                    <p>Camera preview will appear here</p>
                    <p>Click "Go Live" to start streaming</p>
                  </div>
                </div>
              )}
              
              {isLive && (
                <div className="stream-overlay">
                  <div className="stream-info">
                    <div className="viewer-count">
                      <FaEye />
                      <span>{viewerCount} viewers</span>
                    </div>
                    <div className="stream-duration">
                      {formatDuration(streamDuration)}
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="video-controls">
              <button 
                className={`control-btn ${isMuted ? 'active' : ''}`}
                onClick={toggleMute}
                disabled={!isLive}
              >
                {isMuted ? <FaVolumeMute /> : <FaVolumeUp />}
              </button>
              
              <button 
                className={`control-btn ${!isVideoEnabled ? 'active' : ''}`}
                onClick={toggleVideo}
                disabled={!isLive}
              >
                {isVideoEnabled ? <FaVideo /> : <FaVideoSlash />}
              </button>
              
              <button 
                className={`control-btn ${!isMicEnabled ? 'active' : ''}`}
                onClick={toggleMic}
                disabled={!isLive}
              >
                {isMicEnabled ? <FaMicrophone /> : <FaMicrophoneSlash />}
              </button>
              
              <button 
                className="control-btn"
                onClick={toggleFullscreen}
              >
                <FaExpand />
              </button>
            </div>
          </div>

          <div className="controls-section">
            <div className="stream-settings">
              <h3>Stream Settings</h3>
              
              <div className="setting-group">
                <label>Stream Title</label>
                <input
                  type="text"
                  value={streamTitle}
                  onChange={(e) => setStreamTitle(e.target.value)}
                  placeholder="Enter stream title"
                  disabled={isLive}
                />
              </div>
              
              <div className="setting-group">
                <label>Stream Description</label>
                <textarea
                  value={streamDescription}
                  onChange={(e) => setStreamDescription(e.target.value)}
                  placeholder="Enter stream description"
                  disabled={isLive}
                  rows="3"
                />
              </div>
              
              <div className="setting-group">
                <label>Platform</label>
                <select 
                  value={selectedPlatform}
                  onChange={(e) => handlePlatformChange(e.target.value)}
                  disabled={isLive}
                >
                  <option value="dreamio">Dreamio Platform</option>
                  <option value="youtube">YouTube</option>
                  <option value="facebook">Facebook</option>
                  <option value="twitch">Twitch</option>
                  <option value="custom">Custom RTMP</option>
                </select>
              </div>
              
              {selectedPlatform !== 'dreamio' && (
                <div className="setting-group">
                  <label>Stream Key</label>
                  <input
                    type="password"
                    value={streamKey}
                    onChange={(e) => setStreamKey(e.target.value)}
                    placeholder="Enter your stream key"
                    disabled={isLive}
                  />
                </div>
              )}
              
              {selectedPlatform === 'dreamio' && (
                <div className="setting-group">
                  <label>Upload Video for Live Stream</label>
                  <input
                    type="file"
                    accept="video/*"
                    onChange={handleVideoUpload}
                    disabled={isLive}
                    className="file-input"
                  />
                  {uploadedVideo && (
                    <div className="uploaded-video-info">
                      <p>✅ {uploadedVideo.name}</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="stream-actions">
              {!isLive ? (
                <button
                  className="go-live-btn"
                  onClick={startStream}
                  disabled={isLoading}
                >
                  {isLoading ? 'Starting...' : 'Go Live'}
                </button>
              ) : (
                <button
                  className="stop-stream-btn"
                  onClick={stopStream}
                >
                  Stop Stream
                </button>
              )}
            </div>

            {isLive && (
              <div className="live-stats">
                <div className="stat-item">
                  <FaUsers />
                  <span>{viewerCount} viewers</span>
                </div>
                <div className="stat-item">
                  <FaEye />
                  <span>{formatDuration(streamDuration)}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LiveStreamer; 