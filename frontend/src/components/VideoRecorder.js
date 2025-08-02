import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FaMicrophone, FaVideo, FaStop, FaPause, FaPlay, 
  FaCube, FaHandPaper, FaUpload, FaLink, FaFacebookF, 
  FaYoutube, FaDownload, FaThLarge, FaTh, FaSquare,
  FaEdit, FaVrCardboard, FaRegPlayCircle
} from 'react-icons/fa';
import Header from './ui/header';
import './css/VideoRecorder.css';

const SERVER_URL = 'http://localhost:5000';

const VideoRecorder = () => {
  const navigate = useNavigate();
  
  // State for video panels and recording
  const [streams, setStreams] = useState(Array(4).fill(null));
  const [recordings, setRecordings] = useState(Array(4).fill(null));
  const [activePanel, setActivePanel] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [gridLayout, setGridLayout] = useState('2x2'); // '2x2', '1x1', '2x1'
  const [isMicEnabled, setIsMicEnabled] = useState(true);
  const [isCameraEnabled, setIsCameraEnabled] = useState(true);
  const [previewVideo, setPreviewVideo] = useState(null);
  const [isLive, setIsLive] = useState(false);
  const [recordingPanel, setRecordingPanel] = useState(null);
  const [recordingBlobs, setRecordingBlobs] = useState(Array(4).fill(null));
  const [editEnabled, setEditEnabled] = useState(false);

  // Refs for video elements and recording
  const videoRefs = useRef(Array(4).fill(null));
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);

  // Function to handle video upload
  const handleUpload = async (panelIndex, e) => {
    e.stopPropagation(); // Prevent panel click event
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'video/*';
    input.onchange = async (e) => {
      const file = e.target.files[0];
      if (file) {
        const url = URL.createObjectURL(file);
        const newStreams = [...streams];
        newStreams[panelIndex] = url;
        setStreams(newStreams);
        if (videoRefs.current[panelIndex]) {
          videoRefs.current[panelIndex].src = url;
        }
      }
    };
    input.click();
  };

  // Function to connect webcam
  const handleConnect = async (panelIndex, e) => {
    e.stopPropagation(); // Prevent panel click event
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: isCameraEnabled, 
        audio: isMicEnabled 
      });
      const newStreams = [...streams];
      newStreams[panelIndex] = stream;
      setStreams(newStreams);
      if (videoRefs.current[panelIndex]) {
        videoRefs.current[panelIndex].srcObject = stream;
      }
    } catch (error) {
      console.error('Error accessing webcam:', error);
      alert('Failed to access webcam. Please check permissions.');
    }
  };

  // Function to start recording
  const handleSelectPanel = async (panelIndex) => {
    if (recordingPanel !== null && recordingPanel !== panelIndex) {
      await stopRecording();
    }
    const stream = streams[panelIndex];
    if (!stream || !(stream instanceof MediaStream)) {
      alert('No webcam stream connected for this panel. Please connect webcam.');
      return;
    }
    const mediaRecorder = new MediaRecorder(stream);
    mediaRecorderRef.current = mediaRecorder;
    chunksRef.current = [];
    mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) {
        chunksRef.current.push(e.data);
      }
    };
    mediaRecorder.onstop = async () => {
      const blob = new Blob(chunksRef.current, { type: 'video/webm' });
      const result = await uploadRecordedVideo(blob, panelIndex);
      const newBlobs = [...recordingBlobs];
      newBlobs[panelIndex] = result.id || blob;
      setRecordingBlobs(newBlobs);
      setEditEnabled(true);
      const url = URL.createObjectURL(blob);
      const newRecordings = [...recordings];
      newRecordings[panelIndex] = { url, blob, timestamp: new Date().toISOString() };
      setRecordings(newRecordings);
      setPreviewVideo(url);
    };
    mediaRecorder.start();
    setActivePanel(panelIndex);
    setRecordingPanel(panelIndex);
    setIsRecording(true);
    setIsPaused(false);
  };

  // Function to stop recording
  const stopRecording = async () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setIsPaused(false);
      setActivePanel(null);
      setRecordingPanel(null);
    }
  };

  // Function to pause/resume recording
  const togglePause = () => {
    if (!mediaRecorderRef.current) return;

    if (mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.pause();
      setIsPaused(true);
    } else if (mediaRecorderRef.current.state === 'paused') {
      mediaRecorderRef.current.resume();
      setIsPaused(false);
    }
  };

  // Function to handle edit video
  const handleEditVideo = () => {
    if (previewVideo) {
      navigate('/video-editor');
    }
  };

  // Function to download all recordings
  const handleDownloadAll = () => {
    recordings.forEach((recording, index) => {
      if (recording) {
        const a = document.createElement('a');
        a.href = recording.url;
        a.download = `recording-${index}-${recording.timestamp}.webm`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      }
    });
  };

  // Simulate API upload for recorded video
  const uploadRecordedVideo = async (blob, panelIndex) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        console.log(`Uploaded video for panel ${panelIndex}`, blob);
        resolve({ success: true, id: `video-${panelIndex}-${Date.now()}` });
      }, 1000);
    });
  };

  // Cleanup function
  useEffect(() => {
    return () => {
      streams.forEach(stream => {
        if (stream && stream.getTracks) {
          stream.getTracks().forEach(track => track.stop());
        }
      });
    };
  }, [streams]);

  return (
    <div className="video-recorder-container">
      <Header />
      
      {/* Left Sidebar */}
      <div className="sidebar">
        <button className="sidebar-button">
          <FaVideo />
          <span>Media</span>
        </button>
      </div>

      {/* Main Content */}
      <div className="main-content">
        <div className={`video-grid grid-${gridLayout}`}>
          {Array(4).fill(null).map((_, index) => (
            <div 
              key={index} 
              className={`video-panel ${activePanel === index ? 'recording' : ''}`}
              onClick={() => {}}
            >
              <video
                ref={el => videoRefs.current[index] = el}
                autoPlay
                muted
                playsInline
                className="video-preview"
              />
              <div className="panel-overlay">
                <div className="panel-buttons">
                  <button onClick={(e) => handleUpload(index, e)}>
                    <FaUpload /> Upload
                  </button>
                  <button onClick={(e) => handleConnect(index, e)}>
                    <FaLink /> Connect
                  </button>
                </div>
                <div className="panel-footer">
                  <span className="timestamp">
                    {new Date().toLocaleTimeString()}
                  </span>
                  <div className="icon-set">
                    <FaCube />
                    <FaHandPaper />
                  </div>
                </div>
              </div>
              <div style={{ textAlign: 'center', marginTop: 4 }}>
                <button onClick={() => handleSelectPanel(index)} disabled={isRecording && recordingPanel !== index}>
                  Select
                </button>
                {activePanel === index && isRecording && (
                  <button onClick={stopRecording} style={{ marginLeft: 8 }}>
                    <FaStop /> Stop
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right Panel */}
      <div className="right-panel">
        <div className="preview-player">
          {previewVideo ? (
            <video src={previewVideo} controls />
          ) : (
            <div className="no-preview">
              <FaRegPlayCircle />
              <span>No preview available</span>
            </div>
          )}
        </div>
        
        <div className="control-buttons">
          <button onClick={handleEditVideo} disabled={!editEnabled}>
            <FaEdit /> Edit Video
          </button>
          <button>
            <FaVrCardboard /> Augmented Reality
          </button>
          <button>
            <FaFacebookF /> Facebook Live
          </button>
          <button>
            <FaYoutube /> YouTube Live
          </button>
          <button onClick={handleDownloadAll}>
            <FaDownload /> Download All
          </button>
        </div>

        <div className="layout-controls">
          <button onClick={() => setGridLayout('1x1')} className={gridLayout === '1x1' ? 'active' : ''}>
            <FaSquare />
          </button>
          <button onClick={() => setGridLayout('2x1')} className={gridLayout === '2x1' ? 'active' : ''}>
            <FaTh />
          </button>
          <button onClick={() => setGridLayout('2x2')} className={gridLayout === '2x2' ? 'active' : ''}>
            <FaThLarge />
          </button>
        </div>
      </div>

      {/* Bottom Control Bar */}
      <div className="control-bar">
        <div className="left-controls">
          <button 
            className={`mic-toggle ${isMicEnabled ? 'active' : ''}`}
            onClick={() => setIsMicEnabled(!isMicEnabled)}
          >
            <FaMicrophone />
          </button>
          <button 
            className={`camera-toggle ${isCameraEnabled ? 'active' : ''}`}
            onClick={() => setIsCameraEnabled(!isCameraEnabled)}
          >
            <FaVideo />
          </button>
        </div>

        <div className="center-controls">
          {isRecording ? (
            <>
              <button onClick={togglePause}>
                {isPaused ? <FaPlay /> : <FaPause />}
              </button>
              <button onClick={stopRecording}>
                <FaStop />
              </button>
            </>
          ) : (
            <button 
              className="record-button" 
              onClick={() => activePanel !== null && handleSelectPanel(activePanel)}
            >
              <FaVideo /> Record
            </button>
          )}
        </div>

        <div className="right-controls">
          <button 
            className={`live-button ${isLive ? 'active' : ''}`}
            onClick={() => setIsLive(!isLive)}
          >
            Live
          </button>
        </div>
      </div>
    </div>
  );
};

export default VideoRecorder; 