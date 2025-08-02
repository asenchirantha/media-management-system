import { useState, useEffect } from 'react';
import axios from 'axios';
import './css/Profile.css';
import { FaCamera, FaSpinner } from 'react-icons/fa';
import Header from './ui/header';

const SERVER_URL = 'http://localhost:5000';

const Profile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(`${SERVER_URL}/api/auth/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUser(response.data);
    } catch (error) {
      console.error('Error fetching profile:', error);
      setError('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setUploadLoading(true);
      const formData = new FormData();
      formData.append('profileImage', file);

      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${SERVER_URL}/api/auth/upload-profile-image`,
        formData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      if (response.data.success) {
        setUser(prev => ({ ...prev, profileImage: response.data.profileImage }));
        // Trigger a custom event to notify header of profile update
        window.dispatchEvent(new CustomEvent('profileUpdated'));
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      setError('Failed to upload image');
    } finally {
      setUploadLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="profile-container">
        <Header />
        <div className="profile-loading">
          <FaSpinner className="spinner" />
          <p>Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-container">
      <Header />
      
      <div className="profile-content">
        {error && <div className="error-message">{error}</div>}
        
        <div className="profile-header">
          <div className="profile-image-container">
            <img
              src={user?.profileImage ? `${SERVER_URL}${user.profileImage}` : '/default-avatar.png'}
              alt="Profile"
              className="profile-image"
            />
            <label className="image-upload-label" htmlFor="profile-image-input">
              <FaCamera />
              <input
                type="file"
                id="profile-image-input"
                accept="image/*"
                onChange={handleImageChange}
                style={{ display: 'none' }}
              />
            </label>
            {uploadLoading && (
              <div className="loading-overlay">
                <FaSpinner className="spinner" />
              </div>
            )}
          </div>
          <h2>{user?.name}</h2>
          <p>{user?.email}</p>
          <p className="role-badge">{user?.role}</p>
        </div>
      </div>
    </div>
  );
};

export default Profile; 