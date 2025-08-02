import React, { useState, useEffect } from 'react';
import { FaSearch, FaBars, FaTimes } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './header.css';

const SERVER_URL = 'http://localhost:5000';

const Header = () => {
  const [showMenu, setShowMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchUserProfile();
  }, []);

  useEffect(() => {
    // Listen for profile updates
    const handleProfileUpdate = () => {
      fetchUserProfile();
    };

    window.addEventListener('profileUpdated', handleProfileUpdate);

    return () => {
      window.removeEventListener('profileUpdated', handleProfileUpdate);
    };
  }, []);

  const fetchUserProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await axios.get(`${SERVER_URL}/api/auth/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUser(response.data);
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("userRole");
    localStorage.removeItem("token");
    navigate("/login");
  };

  const handleProfileClick = () => {
    navigate("/profile");
    setShowMenu(false);
  };

  const toggleMobileMenu = () => {
    setShowMobileMenu(!showMobileMenu);
  };

  return (
    <>
      <header className="header">
        <div className="logo">
          <img src="./Logo.png" alt="Dreami Logo" className="logo-image" />
        </div>

        <div className="header-right">
          <div className="search-container">
            <input type="text" placeholder="" className="search-input" />
            <div className="search-icon">
              <FaSearch size={16} />
            </div>
          </div>

          <button className="action-button">
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
          </button>

          <button className="mobile-menu-button" onClick={toggleMobileMenu}>
            {showMobileMenu ? <FaTimes size={24} /> : <FaBars size={24} />}
          </button>

          <div className="profile-container">
            <img 
              src={user?.profileImage ? `${SERVER_URL}${user.profileImage}` : '/default-avatar.png'}
              alt="Profile" 
              className="profile-image"
              onClick={() => setShowMenu(!showMenu)}
            />
            {showMenu && (
              <div className="profile-menu">
                <div className="menu-item" onClick={handleProfileClick}>Profile</div>
                <div className="menu-item">Settings</div>
                <div className="menu-item logout" onClick={handleLogout}>Logout</div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      {showMobileMenu && (
        <div className="mobile-menu">
          <div className="mobile-search">
            <div className="search-container">
              <input type="text" placeholder="" className="search-input" />
              <div className="search-icon">
                <FaSearch size={16} />
              </div>
            </div>
          </div>
          <div className="mobile-actions">
            <button className="mobile-action-button">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0" />
              </svg>
              <span>Notifications</span>
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default Header;