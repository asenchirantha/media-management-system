import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import './css/DesignerDashboard.css';
import Header from "./ui/header";
import { FaVideo, FaStream, FaCube, FaCog, FaCalendarAlt, FaEdit, FaChevronDown } from 'react-icons/fa';

const DesignerDashboard = () => {
  const [isNavVisible, setIsNavVisible] = useState(true);
  const [isButtonRotated, setIsButtonRotated] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    // Hide nav bar after 3 seconds
    const timer = setTimeout(() => {
      setIsNavVisible(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  const handleMouseEnter = () => {
    setIsNavVisible(true);
  };

  const toggleNav = () => {
    setIsNavVisible(!isNavVisible);
    setIsButtonRotated(!isButtonRotated);
  };

  const handleNavigation = (route) => {
    navigate(route);
  };

  return (
    <div className="dashboard-container">
      <Header />
      
      <div className="hover-zone" onMouseEnter={handleMouseEnter}></div>
      
      <button 
        className={`toggle-nav-button ${isButtonRotated ? 'rotated' : ''}`}
        onClick={toggleNav}
      >
        <FaChevronDown />
      </button>

      <div className={`sub-nav ${isNavVisible ? 'visible' : ''}`}>
        <div className="nav-buttons">
          <button className="nav-button" onClick={() => handleNavigation('/events')}>
            <FaCalendarAlt />
            <span>Events</span>
          </button>
          <button className="nav-button" onClick={() => handleNavigation('/video-recorder')}>
            <FaVideo />
            <span>Video Recorder</span>
          </button>
          <button className="nav-button" onClick={() => handleNavigation('/video-editor')}>
            <FaEdit />
            <span>Video Editor</span>
          </button>
          <button className="nav-button" onClick={() => handleNavigation('/live-streamer')}>
            <FaStream />
            <span>Live Streamer</span>
          </button>
          <button className="nav-button" onClick={() => handleNavigation('/ar-modeling')}>
            <FaCube />
            <span>AR Modeling</span>
          </button>
          <button className="nav-button" onClick={() => handleNavigation('/settings')}>
            <FaCog />
            <span>Settings</span>
          </button>
        </div>
      </div>

      <div className="main-content">
        <div className="dashboard-header">
          <h2>Designer Dashboard</h2>
        </div>
        
        <div className="feature-grid">
          <div className="feature-card" onClick={() => handleNavigation('/events')}>
            <FaCalendarAlt className="feature-icon" />
            <h3>Events</h3>
            <p>Create and manage your events</p>
          </div>
          
          <div className="feature-card" onClick={() => handleNavigation('/video-recorder')}>
            <FaVideo className="feature-icon" />
            <h3>Video Recorder</h3>
            <p>Record high-quality videos</p>
          </div>
          
          <div className="feature-card" onClick={() => handleNavigation('/video-editor')}>
            <FaEdit className="feature-icon" />
            <h3>Video Editor</h3>
            <p>Edit and enhance your videos</p>
          </div>
          
          <div className="feature-card" onClick={() => handleNavigation('/live-streamer')}>
            <FaStream className="feature-icon" />
            <h3>Live Streamer</h3>
            <p>Stream your events live</p>
          </div>
          
          <div className="feature-card" onClick={() => handleNavigation('/ar-modeling')}>
            <FaCube className="feature-icon" />
            <h3>AR Modeling</h3>
            <p>Create AR experiences</p>
          </div>
          
          <div className="feature-card" onClick={() => handleNavigation('/settings')}>
            <FaCog className="feature-icon" />
            <h3>Settings</h3>
            <p>Manage your preferences</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DesignerDashboard;