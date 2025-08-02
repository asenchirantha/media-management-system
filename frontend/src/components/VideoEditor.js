import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Rnd } from 'react-rnd';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Box, Sphere, Cylinder } from '@react-three/drei';
import { 
  FaPlay, FaPause, FaCut, FaVolumeUp, FaImage, 
  FaCube, FaDownload, FaBroadcastTower, FaTimes,
  FaEye, FaPlus, FaGripVertical, FaExpand, FaCompress,
  FaFolder, FaSearch, FaCog, FaUndo, FaRedo, FaSave,
  FaLayerGroup, FaVideo, FaMusic, FaTextHeight, FaShapes,
  FaStepBackward, FaStepForward, FaVolumeMute, FaVolumeUp as FaVolumeUpIcon,
  FaClock, FaRuler, FaCrop, FaMagic, FaPalette, FaSlidersH, FaFile
} from 'react-icons/fa';
import './css/VideoEditor.css';

// AR 3D Model Component
const ARModel = ({ modelType, color = '#ff6b6b' }) => {
  const renderModel = () => {
    switch (modelType) {
      case 'cube':
        return <Box args={[1, 1, 1]}><meshStandardMaterial color={color} /></Box>;
      case 'sphere':
        return <Sphere args={[0.5, 32, 32]}><meshStandardMaterial color={color} /></Sphere>;
      case 'cylinder':
        return <Cylinder args={[0.5, 0.5, 1, 32]}><meshStandardMaterial color={color} /></Cylinder>;
      default:
        return <Box args={[1, 1, 1]}><meshStandardMaterial color={color} /></Box>;
    }
  };

  return (
    <Canvas camera={{ position: [0, 0, 3], fov: 75 }}>
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} intensity={1} />
      {renderModel()}
      <OrbitControls enableZoom={false} enablePan={false} />
    </Canvas>
  );
};

// Overlay Component (Logo/Image/3D Model)
const Overlay = ({ overlay, onUpdate, onRemove }) => {
  const handleResize = useCallback((e, direction, ref, delta, position) => {
    onUpdate(overlay.id, {
      ...overlay,
      width: ref.style.width,
      height: ref.style.height,
      x: position.x,
      y: position.y,
    });
  }, [overlay, onUpdate]);

  const handleDrag = useCallback((e, d) => {
    onUpdate(overlay.id, {
      ...overlay,
      x: d.x,
      y: d.y,
    });
  }, [overlay, onUpdate]);

  const renderOverlayContent = () => {
    switch (overlay.type) {
      case 'image':
        return (
          <img 
            src={overlay.src} 
            alt="Overlay" 
            style={{ width: '100%', height: '100%', objectFit: 'contain' }}
          />
        );
      case '3d-model':
        return (
          <div style={{ width: '100%', height: '100%' }}>
            <ARModel modelType={overlay.modelType} color={overlay.color} />
          </div>
        );
      case 'text':
        return (
          <div style={{ 
            width: '100%', 
            height: '100%', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            color: overlay.color || '#ffffff',
            fontSize: overlay.fontSize || '24px',
            fontWeight: 'bold',
            textShadow: '2px 2px 4px rgba(0,0,0,0.8)'
          }}>
            {overlay.text || 'Sample Text'}
          </div>
        );
      default:
        return (
          <div style={{ 
            width: '100%', 
            height: '100%', 
            backgroundColor: '#0078d4',
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            color: 'white',
            fontSize: '14px'
          }}>
            {overlay.name || 'Overlay'}
          </div>
        );
    }
  };

  return (
    <Rnd
      size={{ width: overlay.width || 150, height: overlay.height || 150 }}
      position={{ x: overlay.x || 0, y: overlay.y || 0 }}
      onDragStop={handleDrag}
      onResizeStop={handleResize}
      bounds="parent"
      className="overlay-container"
      minWidth={50}
      minHeight={50}
    >
      <div className="overlay-content">
        {renderOverlayContent()}
        <button
          onClick={() => onRemove(overlay.id)}
          className="overlay-remove-btn"
        >
          <FaTimes />
        </button>
      </div>
    </Rnd>
  );
};

// Project Panel Component
const ProjectPanel = ({ onFileUpload, mediaItems, onAddClip }) => {
  const fileInputRef = useRef();
  const handleFileChange = (event) => {
    const files = Array.from(event.target.files);
    files.forEach(file => {
      onFileUpload(file);
    });
  };
  // Helper: get thumbnail/icon
  const getMediaThumb = (item) => {
    if (item.type.startsWith('image')) return <img src={item.url} alt={item.name} style={{ width: 48, height: 36, objectFit: 'cover', borderRadius: 4 }} />;
    if (item.type.startsWith('video')) return <video src={item.url} style={{ width: 48, height: 36, objectFit: 'cover', borderRadius: 4 }} />;
    if (item.type.startsWith('audio')) return <FaMusic style={{ fontSize: 32, color: '#3949ab' }} />;
    return <FaFile style={{ fontSize: 32 }} />;
  };
  return (
    <div className="project-panel">
      <div className="panel-header">
        <FaFolder className="panel-icon" />
        <span>Project</span>
      </div>
      <div className="panel-content">
        <div className="search-box">
          <FaSearch className="search-icon" />
          <input type="text" placeholder="Search..." className="search-input" />
        </div>
        <div className="media-bins">
          <div className="bin-item">
            <FaVideo className="bin-icon" />
            <span>Video ({mediaItems.filter(item => item.type.startsWith('video')).length})</span>
          </div>
          <div className="bin-item">
            <FaMusic className="bin-icon" />
            <span>Audio ({mediaItems.filter(item => item.type.startsWith('audio')).length})</span>
          </div>
          <div className="bin-item">
            <FaImage className="bin-icon" />
            <span>Images ({mediaItems.filter(item => item.type.startsWith('image')).length})</span>
          </div>
          <div className="bin-item">
            <FaShapes className="bin-icon" />
            <span>Graphics ({mediaItems.filter(item => item.type === 'graphics').length})</span>
          </div>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="video/*,image/*,audio/*"
          onChange={handleFileChange}
          multiple
          className="hidden"
        />
        <button 
          onClick={() => fileInputRef.current?.click()}
          className="import-button"
        >
          <FaPlus />
          Import Media
        </button>
        {/* Show imported files */}
        <div className="imported-media-list" style={{ marginTop: 16, display: 'flex', flexWrap: 'wrap', gap: 12 }}>
          {mediaItems.map(item => (
            <div key={item.id} className="imported-media-item" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer', width: 60 }}
              onClick={() => onAddClip && onAddClip(item)}
              title={item.name}
            >
              {getMediaThumb(item)}
              <span style={{ fontSize: 10, marginTop: 2, textAlign: 'center', width: '100%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.name}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Effects Panel Component
const EffectsPanel = ({ onAddEffect }) => {
  const effects = [
    { name: 'Blur', icon: FaEye, category: 'Video Effects' },
    { name: 'Color Correction', icon: FaCog, category: 'Video Effects' },
    { name: 'Transitions', icon: FaLayerGroup, category: 'Transitions' },
    { name: 'Text', icon: FaTextHeight, category: 'Graphics' },
    { name: '3D Models', icon: FaCube, category: 'Graphics' },
  ];

  const categories = [...new Set(effects.map(effect => effect.category))];

  return (
    <div className="effects-panel">
      <div className="panel-header">
        <FaCog className="panel-icon" />
        <span>Effects</span>
      </div>
      <div className="panel-content">
        <div className="search-box">
          <FaSearch className="search-icon" />
          <input type="text" placeholder="Search effects..." className="search-input" />
        </div>
        <div className="effects-list">
          {categories.map(category => (
            <div key={category} className="effect-category">
              <h4 className="category-title">{category}</h4>
              {effects
                .filter(effect => effect.category === category)
                .map((effect, index) => (
                  <div 
                    key={index}
                    className="effect-item"
                    onClick={() => onAddEffect(effect.name)}
                  >
                    <effect.icon className="effect-icon" />
                    <span>{effect.name}</span>
                  </div>
                ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Timeline Component
const Timeline = ({ 
  currentTime, 
  duration, 
  isPlaying, 
  onTimeUpdate, 
  onPlayPause, 
  trimStart, 
  trimEnd, 
  onTrimChange,
  clips,
  onClipSelect,
  onClipUpdate
}) => {
  const timelineRef = useRef(null);
  const [draggingPlayhead, setDraggingPlayhead] = useState(false);
  const [draggingTrim, setDraggingTrim] = useState(null); // 'start' or 'end'
  const [draggingClipId, setDraggingClipId] = useState(null);

  // --- Playhead Drag ---
  const handlePlayheadMouseDown = (e) => {
    setDraggingPlayhead(true);
    e.stopPropagation();
  };
  const handleTimelineMouseMove = (e) => {
    if (draggingPlayhead && timelineRef.current) {
      const rect = timelineRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const pct = Math.max(0, Math.min(1, x / rect.width));
      onTimeUpdate(pct * duration);
    }
    if (draggingTrim && timelineRef.current) {
      const rect = timelineRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const pct = Math.max(0, Math.min(1, x / rect.width));
      const time = pct * duration;
      onTrimChange(draggingTrim, time);
    }
  };
  const handleTimelineMouseUp = () => {
    setDraggingPlayhead(false);
    setDraggingTrim(null);
  };
  useEffect(() => {
    if (draggingPlayhead || draggingTrim) {
      window.addEventListener('mousemove', handleTimelineMouseMove);
      window.addEventListener('mouseup', handleTimelineMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleTimelineMouseMove);
        window.removeEventListener('mouseup', handleTimelineMouseUp);
      };
    }
  });

  // --- Trim Handles ---
  const handleTrimMouseDown = (type, e) => {
    setDraggingTrim(type);
    e.stopPropagation();
  };

  // --- Timeline Click ---
  const handleTimelineClick = (e) => {
    if (timelineRef.current) {
      const rect = timelineRef.current.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const percentage = clickX / rect.width;
      const newTime = percentage * duration;
      onTimeUpdate(newTime);
    }
  };

  // --- Draggable/Resizable Clip ---
  const DraggableClip = ({ clip }) => {
    const minWidth = 10; // px
    const trackWidth = timelineRef.current ? timelineRef.current.offsetWidth : 1;
    const left = (clip.startTime / duration) * trackWidth;
    const width = (clip.duration / duration) * trackWidth;
    return (
      <Rnd
        size={{ width: width, height: '80%' }}
        position={{ x: left, y: 0 }}
        minWidth={minWidth}
        maxWidth={trackWidth - left}
        bounds="parent"
        enableResizing={{ left: true, right: true, top: false, bottom: false }}
        onDragStart={() => setDraggingClipId(clip.id)}
        onDragStop={(e, d) => {
          const pct = d.x / trackWidth;
          const newStart = Math.max(0, Math.min(duration - clip.duration, pct * duration));
          onClipUpdate(clip.id, { startTime: newStart });
          setDraggingClipId(null);
        }}
        onResizeStop={(e, dir, ref, delta, pos) => {
          let newStart = clip.startTime;
          let newDuration = clip.duration;
          if (dir === 'left') {
            const pct = pos.x / trackWidth;
            newStart = Math.max(0, Math.min(clip.startTime + clip.duration - 1, pct * duration));
            newDuration = clip.duration + (clip.startTime - newStart);
          } else if (dir === 'right') {
            const pct = (pos.x + ref.offsetWidth) / trackWidth;
            newDuration = Math.max(1, Math.min(duration - clip.startTime, pct * duration - clip.startTime));
          }
          onClipUpdate(clip.id, { startTime: newStart, duration: newDuration });
          setDraggingClipId(null);
        }}
        dragAxis="x"
        className={`clip ${draggingClipId === clip.id ? 'dragging' : ''} ${clip.type}-clip`}
        style={{ top: '10%' }}
        onClick={() => onClipSelect(clip)}
      >
        <span>{clip.name}</span>
      </Rnd>
    );
  };

  // --- Timeline Render ---
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    const frames = Math.floor((seconds % 1) * 30); // Assuming 30fps
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}:${frames.toString().padStart(2, '0')}`;
  };

  return (
    <div className="timeline-container">
      {/* Timeline Header */}
      <div className="timeline-header">
        <div className="timeline-tracks-header">
          <div className="track-header">Video</div>
          <div className="track-header">Audio</div>
          <div className="track-header">Graphics</div>
        </div>
        <div className="timeline-ruler" ref={timelineRef} onClick={handleTimelineClick} style={{ position: 'relative' }}>
          {/* Trimmed Region Overlay */}
          <div
            className="trimmed-region"
            style={{
              left: `${(trimStart / duration) * 100}%`,
              width: `${((trimEnd - trimStart) / duration) * 100}%`,
            }}
          />
          {/* Trim Handles */}
          <div
            className="trim-handle start"
            style={{ left: `${(trimStart / duration) * 100}%` }}
            onMouseDown={e => handleTrimMouseDown('start', e)}
          />
          <div
            className="trim-handle end"
            style={{ left: `${(trimEnd / duration) * 100}%` }}
            onMouseDown={e => handleTrimMouseDown('end', e)}
          />
          {/* Playhead */}
          <div
            className={`playhead${draggingPlayhead ? ' dragging' : ''}`}
            style={{ left: `${(currentTime / duration) * 100}%` }}
            onMouseDown={handlePlayheadMouseDown}
          />
          <div className="ruler-markers">
            {Array.from({ length: Math.ceil(duration / 10) }, (_, i) => (
              <div key={i} className="ruler-marker">
                <span className="ruler-time">{formatTime(i * 10)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      {/* Timeline Tracks */}
      <div className="timeline-tracks">
        <div className="track video-track">
          <div className="track-label">V1</div>
          <div className="track-content" style={{ position: 'relative' }}>
            {clips.filter(clip => clip.type === 'video').map((clip) => (
              <DraggableClip key={clip.id} clip={clip} />
            ))}
          </div>
        </div>
        <div className="track audio-track">
          <div className="track-label">A1</div>
          <div className="track-content" style={{ position: 'relative' }}>
            {clips.filter(clip => clip.type === 'audio').map((clip) => (
              <DraggableClip key={clip.id} clip={clip} />
            ))}
          </div>
        </div>
        <div className="track graphics-track">
          <div className="track-label">G1</div>
          <div className="track-content" style={{ position: 'relative' }}>
            {clips.filter(clip => clip.type === 'graphics').map((clip) => (
              <DraggableClip key={clip.id} clip={clip} />
            ))}
          </div>
        </div>
      </div>
      {/* Timeline Controls */}
      <div className="timeline-controls">
        <div className="transport-controls">
          <button className="transport-btn">
            <FaStepBackward />
          </button>
          <button className="transport-btn">
            <FaUndo />
          </button>
          <button className="transport-btn">
            <FaRedo />
          </button>
          <button onClick={onPlayPause} className="play-btn">
            {isPlaying ? <FaPause /> : <FaPlay />}
          </button>
          <button className="transport-btn">
            <FaCut />
          </button>
          <button className="transport-btn">
            <FaStepForward />
          </button>
        </div>
        <div className="time-display">
          {formatTime(currentTime)} / {formatTime(duration)}
        </div>
        <div className="timeline-zoom">
          <input
            type="range"
            min="0.1"
            max="2"
            step="0.1"
            defaultValue="1"
            className="zoom-slider"
          />
        </div>
      </div>
    </div>
  );
};

// AR Model Modal Component
const ARModelModal = ({ isOpen, onClose, onAddModel }) => {
  const [selectedModel, setSelectedModel] = useState('cube');
  const [modelColor, setModelColor] = useState('#ff6b6b');

  const models = [
    { id: 'cube', name: 'Cube', icon: FaCube },
    { id: 'sphere', name: 'Sphere', icon: FaCube },
    { id: 'cylinder', name: 'Cylinder', icon: FaCube },
  ];

  const handleAddModel = () => {
    onAddModel({
      id: Date.now(),
      type: '3d-model',
      modelType: selectedModel,
      color: modelColor,
      x: 100,
      y: 100,
      width: 150,
      height: 150,
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h3>Add 3D Model</h3>
          <button onClick={onClose} className="close-btn">
            <FaTimes />
          </button>
        </div>
        <div className="modal-body">
          <div className="model-preview">
            <ARModel modelType={selectedModel} color={modelColor} />
          </div>
          <div className="model-controls">
            <div className="control-group">
              <label>Model Type</label>
              <div className="model-options">
                {models.map((model) => (
                  <button
                    key={model.id}
                    onClick={() => setSelectedModel(model.id)}
                    className={`model-option ${selectedModel === model.id ? 'selected' : ''}`}
                  >
                    <model.icon />
                    <span>{model.name}</span>
                  </button>
                ))}
              </div>
            </div>
            <div className="control-group">
              <label>Color</label>
              <input
                type="color"
                value={modelColor}
                onChange={(e) => setModelColor(e.target.value)}
                className="color-picker"
              />
            </div>
          </div>
        </div>
        <div className="modal-footer">
          <button onClick={onClose} className="btn-secondary">
            Cancel
          </button>
          <button onClick={handleAddModel} className="btn-primary">
            <FaPlus />
            Add to Timeline
          </button>
        </div>
      </div>
    </div>
  );
};

// Text Overlay Modal Component
const TextOverlayModal = ({ isOpen, onClose, onAddText }) => {
  const [text, setText] = useState('Sample Text');
  const [textColor, setTextColor] = useState('#ffffff');
  const [fontSize, setFontSize] = useState(24);

  const handleAddText = () => {
    onAddText({
      id: Date.now(),
      type: 'text',
      text: text,
      color: textColor,
      fontSize: fontSize,
      x: 100,
      y: 100,
      width: 200,
      height: 100,
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h3>Add Text Overlay</h3>
          <button onClick={onClose} className="close-btn">
            <FaTimes />
          </button>
        </div>
        <div className="modal-body">
          <div className="control-group">
            <label>Text</label>
            <input
              type="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="text-input"
              placeholder="Enter text..."
            />
          </div>
          <div className="control-group">
            <label>Color</label>
            <input
              type="color"
              value={textColor}
              onChange={(e) => setTextColor(e.target.value)}
              className="color-picker"
            />
          </div>
          <div className="control-group">
            <label>Font Size: {fontSize}px</label>
            <input
              type="range"
              min="12"
              max="72"
              value={fontSize}
              onChange={(e) => setFontSize(parseInt(e.target.value))}
              className="font-size-slider"
            />
          </div>
        </div>
        <div className="modal-footer">
          <button onClick={onClose} className="btn-secondary">
            Cancel
          </button>
          <button onClick={handleAddText} className="btn-primary">
            <FaPlus />
            Add Text
          </button>
        </div>
      </div>
    </div>
  );
};

// Main Video Editor Component
const VideoEditor = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(120);
  const [trimStart, setTrimStart] = useState(0);
  const [trimEnd, setTrimEnd] = useState(120);
  const [overlays, setOverlays] = useState([]);
  const [isARModalOpen, setIsARModalOpen] = useState(false);
  const [isTextModalOpen, setIsTextModalOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [sourceFile, setSourceFile] = useState(null);
  const [activePanel, setActivePanel] = useState('project');
  const [mediaItems, setMediaItems] = useState([]);
  const [clips, setClips] = useState([]);
  const [selectedClip, setSelectedClip] = useState(null);
  const [activePreview, setActivePreview] = useState('program');
  const [selectedTool, setSelectedTool] = useState('select'); // select, cut, crop, effects
  const [fitToScreen, setFitToScreen] = useState(true);

  const videoRef = useRef(null);
  const sourceVideoRef = useRef(null);

  // Video control handlers
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

  const handleTimeUpdate = (time) => {
    setCurrentTime(time);
  };

  const handleTrimChange = (type, value) => {
    if (type === 'start') {
      setTrimStart(Math.min(value, trimEnd - 1));
    } else {
      setTrimEnd(Math.max(value, trimStart + 1));
    }
  };

  // Overlay management
  const addOverlay = (overlay) => {
    setOverlays([...overlays, overlay]);
  };

  const updateOverlay = (id, updates) => {
    setOverlays(overlays.map(overlay => 
      overlay.id === id ? { ...overlay, ...updates } : overlay
    ));
  };

  const removeOverlay = (id) => {
    setOverlays(overlays.filter(overlay => overlay.id !== id));
  };

  // File upload handler
  const handleFileUpload = (file) => {
    const url = URL.createObjectURL(file);
    const mediaItem = {
      id: Date.now(),
      name: file.name,
      type: file.type,
      url: url,
      file: file
    };
    
    setMediaItems([...mediaItems, mediaItem]);
    
    // If it's a video file, set it as the main video
    if (file.type.startsWith('video/')) {
      if (!selectedFile) {
        setSelectedFile(url);
      } else if (!sourceFile) {
        setSourceFile(url);
      }
      
      // Add to timeline as a clip
      const clip = {
        id: Date.now(),
        name: file.name,
        type: 'video',
        startTime: 0,
        duration: 120, // Default duration
        url: url
      };
      setClips([...clips, clip]);
    }
  };

  // Effect handler
  const handleAddEffect = (effectName) => {
    if (effectName === '3D Models') {
      setIsARModalOpen(true);
    } else if (effectName === 'Text') {
      setIsTextModalOpen(true);
    } else {
      console.log(`Adding effect: ${effectName}`);
    }
  };

  // Clip selection handler
  const handleClipSelect = (clip) => {
    setSelectedClip(clip);
  };

  // Video event handlers
  useEffect(() => {
    if (videoRef.current) {
      const video = videoRef.current;
      
      const handleLoadedMetadata = () => {
        setDuration(video.duration);
      };
      
      const handleTimeUpdate = () => {
        setCurrentTime(video.currentTime);
      };
      
      const handleEnded = () => {
        setIsPlaying(false);
        setCurrentTime(0);
      };
      
      video.addEventListener('loadedmetadata', handleLoadedMetadata);
      video.addEventListener('timeupdate', handleTimeUpdate);
      video.addEventListener('ended', handleEnded);
      
      return () => {
        video.removeEventListener('loadedmetadata', handleLoadedMetadata);
        video.removeEventListener('timeupdate', handleTimeUpdate);
        video.removeEventListener('ended', handleEnded);
      };
    }
  }, [selectedFile]);

  // Fit to screen handler
  const handleFitToScreen = () => setFitToScreen(f => !f);

  // New handlers for all toolbar and timeline buttons
  const handleUndo = () => console.log('Undo');
  const handleRedo = () => console.log('Redo');
  const handleCut = () => {
    if (!selectedClip) return;
    const cutTime = currentTime;
    setClips(clips.flatMap(clip => {
      if (clip.id !== selectedClip.id) return [clip];
      if (cutTime <= clip.startTime || cutTime >= clip.startTime + clip.duration) return [clip];
      // Split into two clips
      const first = { ...clip, duration: cutTime - clip.startTime };
      const second = { ...clip, startTime: cutTime, duration: (clip.startTime + clip.duration) - cutTime, id: Date.now() + 1 };
      return [first, second];
    }));
    setSelectedClip(null);
  };
  const handleSave = () => console.log('Save');
  const handleDownload = () => console.log('Download');
  const handleGoLive = () => {
    if (selectedFile) {
      // Navigate to live streamer with the current video
      navigate('/live-streamer', { 
        state: { 
          videoUrl: selectedFile,
          videoName: 'Edited Video',
          fromEditor: true 
        } 
      });
    } else {
      alert('Please import a video first before going live');
    }
  };

  // Add clip from ProjectPanel
  const handleAddClip = (item) => {
    if (item.type.startsWith('video')) {
      const clip = {
        id: Date.now(),
        name: item.name,
        type: 'video',
        startTime: 0,
        duration: 30, // default 30s
        url: item.url
      };
      setClips([...clips, clip]);
    } else if (item.type.startsWith('audio')) {
      const clip = {
        id: Date.now(),
        name: item.name,
        type: 'audio',
        startTime: 0,
        duration: 30,
        url: item.url
      };
      setClips([...clips, clip]);
    }
    // images: preview only, not timeline
  };

  // Trim: apply trimStart/trimEnd to selected video clip
  const handleTrim = () => {
    if (!selectedClip || selectedClip.type !== 'video') return;
    setClips(clips.map(clip =>
      clip.id === selectedClip.id
        ? { ...clip, startTime: trimStart, duration: trimEnd - trimStart }
        : clip
    ));
  };

  // Add Sound Track: add first audio file from mediaItems
  const handleAddSoundTrack = () => {
    const audio = mediaItems.find(item => item.type.startsWith('audio'));
    if (audio) handleAddClip(audio);
  };

  return (
    <div className="video-editor-container">
      {/* Top Menu Bar */}
      <div className="menu-bar">
        <div className="menu-item">File</div>
        <div className="menu-item">Edit</div>
        <div className="menu-item">View</div>
        <div className="menu-item">Window</div>
        <div className="menu-item">Help</div>
      </div>

      {/* Professional Toolbar */}
      <div className="toolbar">
        <div className="toolbar-left">
          <button className="toolbar-btn" onClick={handleUndo}>
            <FaUndo />
          </button>
          <button className="toolbar-btn" onClick={handleRedo}>
            <FaRedo />
          </button>
          <div className="toolbar-separator"></div>
          <button className="toolbar-btn" onClick={handleCut}>
            <FaCut />
          </button>
          <button className="toolbar-btn" onClick={handleTrim}>
            <FaCrop />
          </button>
          <button className="toolbar-btn" onClick={handleSave}>
            <FaSave />
          </button>
        </div>
        <div className="toolbar-center">
          <button onClick={handlePlayPause} className="play-btn-large">
            {isPlaying ? <FaPause /> : <FaPlay />}
          </button>
        </div>
        <div className="toolbar-right">
          <button className="toolbar-btn" onClick={handleDownload}>
            <FaDownload />
          </button>
          <button className="toolbar-btn" onClick={handleGoLive}>
            <FaBroadcastTower />
          </button>
          <button className="toolbar-btn" onClick={handleAddSoundTrack}>
            <FaMusic />
          </button>
        </div>
      </div>

      {/* Professional Tools Bar */}
      <div className="tools-bar">
        <div className="tool-group">
          <button 
            className={`tool-btn ${selectedTool === 'select' ? 'active' : ''}`}
            onClick={() => setSelectedTool('select')}
            title="Selection Tool"
          >
            <FaEye />
          </button>
          <button 
            className={`tool-btn ${selectedTool === 'cut' ? 'active' : ''}`}
            onClick={() => setSelectedTool('cut')}
            title="Cut Tool"
          >
            <FaCut />
          </button>
          <button 
            className={`tool-btn ${selectedTool === 'crop' ? 'active' : ''}`}
            onClick={() => setSelectedTool('crop')}
            title="Crop Tool"
          >
            <FaCrop />
          </button>
        </div>
        <div className="tool-group">
          <button className="tool-btn" title="Effects">
            <FaMagic />
          </button>
          <button className="tool-btn" title="Color Correction">
            <FaPalette />
          </button>
          <button className="tool-btn" title="Audio Mixer">
            <FaVolumeUp />
          </button>
        </div>
        <div className="tool-group">
          <button className="tool-btn" title="Ruler">
            <FaRuler />
          </button>
          <button className="tool-btn" title="Time Display">
            <FaClock />
          </button>
          <button className="tool-btn" title="Settings">
            <FaSlidersH />
          </button>
        </div>
      </div>

      {/* Main Workspace */}
      <div className="workspace">
        {/* Left Panels */}
        <div className="left-panels">
          <div className="panel-tabs">
            <button 
              className={`panel-tab ${activePanel === 'project' ? 'active' : ''}`}
              onClick={() => setActivePanel('project')}
            >
              Project
            </button>
            <button 
              className={`panel-tab ${activePanel === 'effects' ? 'active' : ''}`}
              onClick={() => setActivePanel('effects')}
            >
              Effects
            </button>
          </div>
          <div className="panel-content-area">
            {activePanel === 'project' && (
              <ProjectPanel onFileUpload={handleFileUpload} mediaItems={mediaItems} onAddClip={handleAddClip} />
            )}
            {activePanel === 'effects' && (
              <EffectsPanel onAddEffect={handleAddEffect} />
            )}
          </div>
        </div>

        {/* Dual Preview Area - Vertical Layout */}
        <div className="preview-area">
          <div className="preview-header">
            <div className="preview-tabs">
              <div 
                className={`preview-tab ${activePreview === 'program' ? 'active' : ''}`}
                onClick={() => setActivePreview('program')}
              >
                Program Monitor
              </div>
              <div 
                className={`preview-tab ${activePreview === 'source' ? 'active' : ''}`}
                onClick={() => setActivePreview('source')}
              >
                Source Monitor
              </div>
            </div>
            <div className="preview-controls">
              <button className="preview-btn" onClick={handleFitToScreen} title="Fit to Screen">
                {fitToScreen ? <FaExpand /> : <FaCompress />}
              </button>
              <button className="preview-btn">
                <FaCog />
              </button>
            </div>
          </div>
          
          {/* Dual Preview Screens - Vertical Layout */}
          <div className="dual-preview-container">
            {/* Program Monitor - Left */}
            <div className={`preview-screen program-monitor ${activePreview === 'program' ? 'active' : ''}`}>
              <div className="preview-label">Program Monitor</div>
              <div className="video-preview">
                <div className="video-player">
                  {selectedFile ? (
                    <video
                      ref={videoRef}
                      src={selectedFile}
                      controls={false}
                      className="video-element"
                      style={{ objectFit: fitToScreen ? 'contain' : 'cover' }}
                    />
                  ) : (
                    <div className="video-placeholder">
                      <div className="placeholder-icon">🎬</div>
                      <p>No video selected</p>
                      <p>Import media to start editing</p>
                    </div>
                  )}
                  
                  {/* Overlays Container */}
                  <div className="overlays-container">
                    {overlays.map((overlay) => (
                      <Overlay
                        key={overlay.id}
                        overlay={overlay}
                        onUpdate={updateOverlay}
                        onRemove={removeOverlay}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Source Monitor - Right */}
            <div className={`preview-screen source-monitor ${activePreview === 'source' ? 'active' : ''}`}>
              <div className="preview-label">Source Monitor</div>
              <div className="video-preview">
                <div className="video-player">
                  {sourceFile ? (
                    <video
                      ref={sourceVideoRef}
                      src={sourceFile}
                      controls={false}
                      className="video-element"
                    />
                  ) : (
                    <div className="video-placeholder">
                      <div className="placeholder-icon">📹</div>
                      <p>No source video</p>
                      <p>Import additional media</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Timeline */}
      <Timeline
        currentTime={currentTime}
        duration={duration}
        isPlaying={isPlaying}
        onTimeUpdate={handleTimeUpdate}
        onPlayPause={handlePlayPause}
        trimStart={trimStart}
        trimEnd={trimEnd}
        onTrimChange={handleTrimChange}
        clips={clips}
        onClipSelect={handleClipSelect}
        onClipUpdate={(id, updates) => setClips(clips.map(clip => clip.id === id ? { ...clip, ...updates } : clip))}
      />

      {/* Modals */}
      <ARModelModal
        isOpen={isARModalOpen}
        onClose={() => setIsARModalOpen(false)}
        onAddModel={addOverlay}
      />
      
      <TextOverlayModal
        isOpen={isTextModalOpen}
        onClose={() => setIsTextModalOpen(false)}
        onAddText={addOverlay}
      />
    </div>
  );
};

export default VideoEditor; 