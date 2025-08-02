import React, { useState, useEffect, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, useGLTF, Box, Sphere, Cylinder, Torus } from '@react-three/drei';
import { FaUpload, FaSave, FaTimes, FaCube, FaCar, FaTree, FaHome, FaStar } from 'react-icons/fa';
import './css/ARModeling.css';

// Simple 3D Model Components
const SimpleCube = ({ color, scale }) => (
  <Box args={[1, 1, 1]} scale={scale}>
    <meshStandardMaterial color={color} />
  </Box>
);

const SimpleSphere = ({ color, scale }) => (
  <Sphere args={[0.5, 32, 32]} scale={scale}>
    <meshStandardMaterial color={color} />
  </Sphere>
);

const SimpleCylinder = ({ color, scale }) => (
  <Cylinder args={[0.5, 0.5, 1, 32]} scale={scale}>
    <meshStandardMaterial color={color} />
  </Cylinder>
);

const SimpleTorus = ({ color, scale }) => (
  <Torus args={[0.5, 0.2, 16, 32]} scale={scale}>
    <meshStandardMaterial color={color} />
  </Torus>
);

// AR Canvas Component
const ARCanvas = ({ modelType, modelColor, modelScale, onModelLoad }) => {
  const modelRef = useRef();

  useEffect(() => {
    if (modelRef.current) {
      onModelLoad && onModelLoad(modelRef.current);
    }
  }, [modelType, modelColor, modelScale, onModelLoad]);

  const renderModel = () => {
    const props = { color: modelColor, scale: modelScale };
    
    switch (modelType) {
      case 'cube':
        return <SimpleCube {...props} />;
      case 'sphere':
        return <SimpleSphere {...props} />;
      case 'cylinder':
        return <SimpleCylinder {...props} />;
      case 'torus':
        return <SimpleTorus {...props} />;
      case 'car':
        return <SimpleCylinder {...props} />;
      case 'tree':
        return <SimpleCylinder {...props} />;
      case 'house':
        return <SimpleCube {...props} />;
      case 'star':
        return <SimpleTorus {...props} />;
      default:
        return <SimpleCube {...props} />;
    }
  };

  return (
    <div className="ar-canvas-container">
      <Canvas
        camera={{ position: [0, 0, 5], fov: 75 }}
        style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}
      >
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={1} />
        <pointLight position={[-10, -10, -5]} intensity={0.5} />
        
        <group ref={modelRef}>
          {renderModel()}
        </group>
        
        <OrbitControls 
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          minDistance={1}
          maxDistance={20}
        />
        
        {/* Grid helper for reference */}
        <gridHelper args={[20, 20, 0x444444, 0x888888]} />
      </Canvas>
    </div>
  );
};

// Sidebar Controls Component
const SidebarControls = ({ 
  onFileUpload, 
  modelScale, 
  onScaleChange, 
  modelColor, 
  onColorChange, 
  onSave 
}) => {
  const fileInputRef = useRef();

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file && (file.name.endsWith('.glb') || file.name.endsWith('.gltf'))) {
      const url = URL.createObjectURL(file);
      onFileUpload(url, file.name);
    }
  };

  return (
    <div className="sidebar-controls">
      <div className="control-section">
        <h3 className="section-title">Model Controls</h3>
        
        {/* File Upload */}
        <div className="control-item">
          <label className="control-label">
            <FaUpload className="control-icon" />
            Upload 3D Model
          </label>
          <input
            ref={fileInputRef}
            type="file"
            accept=".glb,.gltf"
            onChange={handleFileChange}
            className="file-input"
          />
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="upload-button"
          >
            Choose File
          </button>
        </div>

        {/* Scale Control */}
        <div className="control-item">
          <label className="control-label">
            Scale: {modelScale.toFixed(1)}x
          </label>
          <input
            type="range"
            min="0.1"
            max="2"
            step="0.1"
            value={modelScale}
            onChange={(e) => onScaleChange(parseFloat(e.target.value))}
            className="scale-slider"
          />
        </div>

        {/* Color Picker */}
        <div className="control-item">
          <label className="control-label">
            Model Color
          </label>
          <input
            type="color"
            value={modelColor}
            onChange={(e) => onColorChange(e.target.value)}
            className="color-picker"
          />
        </div>

        {/* Save Button */}
        <div className="control-item">
          <button onClick={onSave} className="save-button">
            <FaSave className="button-icon" />
            Save & Exit
          </button>
        </div>
      </div>
    </div>
  );
};

// Model Thumbnails Component
const ModelThumbnails = ({ onModelSelect, selectedModel }) => {
  const predefinedModels = [
    { id: 'cube', name: 'Cube', icon: FaCube },
    { id: 'sphere', name: 'Sphere', icon: FaStar },
    { id: 'cylinder', name: 'Cylinder', icon: FaTree },
    { id: 'torus', name: 'Torus', icon: FaStar },
    { id: 'car', name: 'Car', icon: FaCar },
    { id: 'house', name: 'House', icon: FaHome },
  ];

  return (
    <div className="model-thumbnails">
      <div className="thumbnails-container">
        {predefinedModels.map((model) => (
          <div
            key={model.id}
            className={`model-thumbnail ${selectedModel === model.id ? 'selected' : ''}`}
            onClick={() => onModelSelect(model.id)}
          >
            <model.icon className="thumbnail-icon" />
            <span className="thumbnail-name">{model.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// Main AR Modeling Component
const ARModeling = () => {
  const [currentModel, setCurrentModel] = useState('cube');
  const [modelColor, setModelColor] = useState('#ff6b6b');
  const [modelScale, setModelScale] = useState(1.0);
  const [modelData, setModelData] = useState(null);

  // Load saved model data from localStorage on component mount
  useEffect(() => {
    const savedData = localStorage.getItem('arModelData');
    if (savedData) {
      try {
        const data = JSON.parse(savedData);
        setCurrentModel(data.modelId || 'cube');
        setModelColor(data.color || '#ff6b6b');
        setModelScale(data.scale || 1.0);
        setModelData(data);
      } catch (error) {
        console.error('Error loading saved model data:', error);
      }
    }
  }, []);

  const handleModelSelect = (modelId) => {
    setCurrentModel(modelId);
  };

  const handleFileUpload = (url, fileName) => {
    // For now, we'll just show an alert since we're using simple geometries
    alert('File upload feature is available for GLB/GLTF files. Currently using predefined 3D geometries.');
  };

  const handleModelLoad = (scene) => {
    setModelData({
      modelId: currentModel,
      color: modelColor,
      scale: modelScale,
      position: scene.position,
      rotation: scene.rotation,
      timestamp: Date.now()
    });
  };

  const handleSave = () => {
    const dataToSave = {
      modelId: currentModel,
      color: modelColor,
      scale: modelScale,
      timestamp: Date.now()
    };
    
    localStorage.setItem('arModelData', JSON.stringify(dataToSave));
    alert('Model state saved successfully!');
  };

  return (
    <div className="ar-modeling-container">
      {/* Header */}
      <div className="ar-header">
        <h1 className="ar-title">AR Modeling Studio</h1>
        <p className="ar-subtitle">Create and customize 3D models for your AR experiences</p>
      </div>

      {/* Main Content */}
      <div className="ar-main-content">
        {/* 3D Canvas */}
        <div className="canvas-section">
          <ARCanvas
            modelType={currentModel}
            modelColor={modelColor}
            modelScale={modelScale}
            onModelLoad={handleModelLoad}
          />
        </div>

        {/* Sidebar Controls */}
        <SidebarControls
          onFileUpload={handleFileUpload}
          modelScale={modelScale}
          onScaleChange={setModelScale}
          modelColor={modelColor}
          onColorChange={setModelColor}
          onSave={handleSave}
        />
      </div>

      {/* Model Thumbnails */}
      <ModelThumbnails
        onModelSelect={handleModelSelect}
        selectedModel={currentModel}
      />
    </div>
  );
};

export default ARModeling; 