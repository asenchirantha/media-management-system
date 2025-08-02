import { useState, useEffect } from 'react';
import axios from 'axios';
import Header from './ui/header';
import { FaUsers, FaCalendarAlt, FaVideo, FaChartBar, FaCog, FaTrash, FaEdit, FaChevronDown } from 'react-icons/fa';
import './css/AdminDashboard.css';
import './css/AdminDashboard_Users.css';
import { useNavigate } from 'react-router-dom';
import { DonutChart, Card, Title, Metric, Text, Flex, Grid } from '@tremor/react';

const SERVER_URL = 'http://localhost:5000';

const AdminDashboard = () => {
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editFormData, setEditFormData] = useState({
    title: '',
    description: '',
    date: '',
    location: ''
  });
  const [imagePreview, setImagePreview] = useState(null);
  const [videoPreview, setVideoPreview] = useState(null);
  const [newEvent, setNewEvent] = useState({
    title: '',
    description: '',
    date: '',
    location: '',
    coverImage: null,
    videoFile: null
  });
  const [showCreateForm, setShowCreateForm] = useState(false);
  const navigate = useNavigate();
  const [isNavVisible, setIsNavVisible] = useState(true);
  const [isButtonRotated, setIsButtonRotated] = useState(false);
  const [activeTab, setActiveTab] = useState('events');
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [usersError, setUsersError] = useState('');
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [sortDir, setSortDir] = useState('asc');
  const [form, setForm] = useState({ fullName: '', email: '', role: 'User' });
  const [editingIndex, setEditingIndex] = useState(null);
  const [notification, setNotification] = useState('');

  const fetchUsers = async () => {
    setLoadingUsers(true);
    setUsersError('');
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:5000/api/users', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(res.data);
    } catch (err) {
      setUsersError(err.response?.data?.message || 'Failed to fetch users');
    } finally {
      setLoadingUsers(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'users') fetchUsers();
    // eslint-disable-next-line
  }, [activeTab]);

  const filteredUsers = users
    .filter(u =>
      u.name?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => {
      let valA = a[sortBy]?.toLowerCase?.() || '';
      let valB = b[sortBy]?.toLowerCase?.() || '';
      if (valA < valB) return sortDir === 'asc' ? -1 : 1;
      if (valA > valB) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });

  const handleSort = (field) => {
    if (sortBy === field) setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    else {
      setSortBy(field);
      setSortDir('asc');
    }
  };

  const handleRefresh = () => fetchUsers();

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/events', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      setEvents(response.data);
    } catch (error) {
      console.error('Error fetching events:', error);
      if (error.response?.status === 401) {
        alert('Session expired. Please login again');
        navigate('/login');
      }
    }
  };

  const handleDelete = async (eventId) => {
    if (window.confirm('Are you sure you want to delete this event?')) {
      try {
        const token = localStorage.getItem('token');
        
        if (!token) {
          alert('Please login again');
          navigate('/login');
          return;
        }

        const response = await axios.delete(
          `http://localhost:5000/api/events/${eventId}`,
          {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          }
        );

        if (response.data.success) {
          alert('Event deleted successfully');
          fetchEvents(); // Refresh the events list
        } else {
          throw new Error(response.data.message || 'Failed to delete event');
        }
      } catch (error) {
        console.error('Error deleting event:', error);
        if (error.response?.status === 401) {
          alert('Session expired. Please login again');
          navigate('/login');
        } else {
          alert(error.response?.data?.message || 'Error deleting event. Please try again.');
        }
      }
    }
  };

  const handleEdit = (event) => {
    setSelectedEvent(event);
    setEditFormData({
      title: event.title,
      description: event.description,
      date: event.date.split('T')[0], // Format date for input
      location: event.location
    });
    setIsEditing(true);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const formDataToSend = new FormData();
      
      // Append text fields
      formDataToSend.append('title', editFormData.title);
      formDataToSend.append('description', editFormData.description);
      formDataToSend.append('date', editFormData.date);
      formDataToSend.append('location', editFormData.location);
      
      // Append files only if new ones are selected
      if (editFormData.coverImage instanceof File) {
        formDataToSend.append('coverImage', editFormData.coverImage);
      }
      if (editFormData.videoFile instanceof File) {
        formDataToSend.append('videoFile', editFormData.videoFile);
      }

      const token = localStorage.getItem('token');
      const res = await axios.put(
        `http://localhost:5000/api/events/${selectedEvent._id}`,
        formDataToSend,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (res.data) {
        setIsEditing(false);
        setImagePreview(null);
        setVideoPreview(null);
        fetchEvents();
        alert('Event updated successfully');
      }
    } catch (error) {
      console.error('Error updating event:', error);
      alert(error.response?.data?.message || 'Error updating event');
    }
  };

  const handleChange = (e) => {
    if (e.target.type === 'file') {
      const file = e.target.files[0];
      if (e.target.name === 'coverImage') {
        setImagePreview(URL.createObjectURL(file));
      } else if (e.target.name === 'videoFile') {
        setVideoPreview(URL.createObjectURL(file));
      }
      setEditFormData({ ...editFormData, [e.target.name]: file });
    } else {
      setEditFormData({ ...editFormData, [e.target.name]: e.target.value });
    }
  };

  const handleCreateEvent = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append('title', newEvent.title);
      formData.append('description', newEvent.description);
      formData.append('date', newEvent.date);
      formData.append('location', newEvent.location);
      
      if (newEvent.coverImage) {
        formData.append('coverImage', newEvent.coverImage);
      }
      if (newEvent.videoFile) {
        formData.append('videoFile', newEvent.videoFile);
      }

      const token = localStorage.getItem('token');
      const response = await axios.post(
        'http://localhost:5000/api/events/create',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (response.data) {
        setEvents([...events, response.data]);
        setShowCreateForm(false);
        setNewEvent({
          title: '',
          description: '',
          date: '',
          location: '',
          coverImage: null,
          videoFile: null
        });
        setImagePreview(null);
        setVideoPreview(null);
      }
    } catch (error) {
      console.error('Error creating event:', error);
      alert(error.response?.data?.message || 'Error creating event');
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (e.target.name === 'coverImage') {
        setImagePreview(URL.createObjectURL(file));
      } else if (e.target.name === 'videoFile') {
        setVideoPreview(URL.createObjectURL(file));
      }
      setNewEvent({
        ...newEvent,
        [e.target.name]: file
      });
    }
  };

  // Add this function to handle image URLs
  const getImageUrl = (imagePath) => {
    if (!imagePath) return '/default-event-image.jpg';
    return `${SERVER_URL}${imagePath}`;
  };

  const handleMouseEnter = () => {
    setIsNavVisible(true);
  };

  const toggleNav = () => {
    setIsNavVisible(!isNavVisible);
    setIsButtonRotated(!isButtonRotated);
  };

  const handleTabClick = (tab) => {
    setActiveTab(tab);
  };

  const handleUserInputChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleUserSubmit = (e) => {
    e.preventDefault();
    if (!form.fullName.trim() || !form.email.trim()) {
      setNotification('Please fill all fields');
      setTimeout(() => setNotification(''), 2000);
      return;
    }
    if (editingIndex !== null) {
      // Edit user
      const updatedUsers = [...users];
      updatedUsers[editingIndex] = { ...updatedUsers[editingIndex], ...form };
      setUsers(updatedUsers);
      setNotification('User Updated');
      console.log('User updated:', updatedUsers[editingIndex]);
    } else {
      // Add user
      const newUser = { ...form, id: Date.now() };
      setUsers([...users, newUser]);
      setNotification('User Added');
      console.log('User added:', newUser);
    }
    setForm({ fullName: '', email: '', role: 'User' });
    setEditingIndex(null);
    setTimeout(() => setNotification(''), 2000);
  };

  const handleEditUser = (idx) => {
    setForm({ ...users[idx] });
    setEditingIndex(idx);
  };

  const handleDeleteUser = (idx) => {
    const updatedUsers = users.filter((_, i) => i !== idx);
    setUsers(updatedUsers);
    setNotification('User Deleted');
    console.log('User deleted:', users[idx]);
    setTimeout(() => setNotification(''), 2000);
    if (editingIndex === idx) {
      setForm({ fullName: '', email: '', role: 'User' });
      setEditingIndex(null);
    }
  };

  const userRoleCounts = users.reduce((acc, user) => {
    acc[user.role] = (acc[user.role] || 0) + 1;
    return acc;
  }, {});
  const donutData = [
    { name: 'User', value: userRoleCounts['User'] || 0 },
    { name: 'Designer', value: userRoleCounts['Designer'] || 0 },
    { name: 'Admin', value: userRoleCounts['Admin'] || 0 },
  ];

  return (
    <div className="admin-dashboard">
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
          <button className={`nav-button ${activeTab === 'events' ? 'active' : ''}`} onClick={() => handleTabClick('events')}>
            <FaCalendarAlt />
            <span>Events</span>
          </button>
          <button className={`nav-button ${activeTab === 'users' ? 'active' : ''}`} onClick={() => handleTabClick('users')}>
            <FaUsers />
            <span>Users</span>
          </button>
          <button className={`nav-button ${activeTab === 'videos' ? 'active' : ''}`} onClick={() => handleTabClick('videos')}>
            <FaVideo />
            <span>Videos</span>
          </button>
          <button className={`nav-button ${activeTab === 'analytics' ? 'active' : ''}`} onClick={() => handleTabClick('analytics')}>
            <FaChartBar />
            <span>Analytics</span>
          </button>
          <button className={`nav-button ${activeTab === 'settings' ? 'active' : ''}`} onClick={() => handleTabClick('settings')}>
            <FaCog />
            <span>Settings</span>
          </button>
        </div>
      </div>

      <div className="main-content">
        <div className="dashboard-header">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Admin Dashboard</h2>
          <div className="text-lg font-semibold text-blue-600 mb-6">
            {activeTab === 'events' && 'Events'}
            {activeTab === 'users' && 'Users'}
            {activeTab === 'videos' && 'Videos'}
            {activeTab === 'analytics' && 'Analytics'}
            {activeTab === 'settings' && 'Settings'}
          </div>
        </div>

        {activeTab === 'users' ? (
          <div className="users-management-container">
            {/* Enhanced Dashboard Header */}
            <div className="dashboard-header-modern">
              <div className="header-content">
                <div className="header-text">
                  <h1 className="dashboard-title">User Management</h1>
                  <p className="dashboard-subtitle">Manage user accounts, roles, and permissions with advanced analytics</p>
                </div>
                <div className="header-actions">
                  <button className="btn-secondary" onClick={handleRefresh}>
                    <FaUsers />
                    Export Data
                  </button>
                  <button className="btn-primary">
                    <FaUsers />
                    Add User
                  </button>
                </div>
              </div>
            </div>

            {/* Enhanced Stats Cards */}
            <div className="stats-grid">
              <div className="stat-card stat-card-primary">
                <div className="stat-content">
                  <div className="stat-icon">
                    <FaUsers />
                  </div>
                  <div className="stat-details">
                    <div className="stat-label">Total Users</div>
                    <div className="stat-value">{users.length}</div>
                    <div className="stat-change positive">
                      <span>+12%</span> from last month
                    </div>
                  </div>
                </div>
              </div>

              <div className="stat-card stat-card-success">
                <div className="stat-content">
                  <div className="stat-icon">
                    <FaEdit />
                  </div>
                  <div className="stat-details">
                    <div className="stat-label">Designers</div>
                    <div className="stat-value">{userRoleCounts['Designer'] || 0}</div>
                    <div className="stat-change positive">
                      <span>+5%</span> from last month
                    </div>
                  </div>
                </div>
              </div>

              <div className="stat-card stat-card-warning">
                <div className="stat-content">
                  <div className="stat-icon">
                    <FaCog />
                  </div>
                  <div className="stat-details">
                    <div className="stat-label">Admins</div>
                    <div className="stat-value">{userRoleCounts['Admin'] || 0}</div>
                    <div className="stat-change neutral">
                      No change
                    </div>
                  </div>
                </div>
              </div>

              <div className="stat-card stat-card-info">
                <div className="stat-content">
                  <div className="stat-icon">
                    <FaChartBar />
                  </div>
                  <div className="stat-details">
                    <div className="stat-label">Active Users</div>
                    <div className="stat-value">{Math.floor(users.length * 0.85)}</div>
                    <div className="stat-change positive">
                      <span>+8%</span> from last week
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Charts Section */}
            <div className="charts-grid">
              <div className="chart-card">
                <div className="chart-header">
                  <h3>User Distribution</h3>
                  <p>Role-based user breakdown</p>
                </div>
                <div className="chart-content">
                  <DonutChart
                    data={donutData}
                    category="value"
                    index="name"
                    colors={["blue", "green", "red"]}
                    className="chart-donut"
                  />
                </div>
              </div>

              <div className="chart-card">
                <div className="chart-header">
                  <h3>User Activity</h3>
                  <p>Monthly engagement metrics</p>
                </div>
                <div className="chart-content">
                  <div className="activity-metrics">
                    <div className="metric-item">
                      <span className="metric-label">Active Users</span>
                      <span className="metric-value">{Math.floor(users.length * 0.85)}</span>
                    </div>
                    <div className="metric-item">
                      <span className="metric-label">New This Month</span>
                      <span className="metric-value">{Math.floor(users.length * 0.12)}</span>
                    </div>
                    <div className="metric-item">
                      <span className="metric-label">Online Now</span>
                      <span className="metric-value">{Math.floor(users.length * 0.15)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Enhanced Controls */}
            <div className="controls-card">
              <div className="controls-header">
                <div className="controls-title-section">
                  <h3>User Directory</h3>
                  <span className="results-count">{filteredUsers.length} users found</span>
                </div>
              </div>

              <div className="controls-filters">
                <div className="search-container">
                  <FaUsers className="search-icon" />
                  <input
                    type="text"
                    placeholder="Search by name or email..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="search-input"
                  />
                </div>

                <div className="sort-controls">
                  <button 
                    onClick={() => handleSort('name')} 
                    className={`sort-btn ${sortBy === 'name' ? 'active' : ''}`}
                  >
                    Name {sortBy === 'name' && (sortDir === 'asc' ? '↑' : '↓')}
                  </button>
                  <button 
                    onClick={() => handleSort('email')} 
                    className={`sort-btn ${sortBy === 'email' ? 'active' : ''}`}
                  >
                    Email {sortBy === 'email' && (sortDir === 'asc' ? '↑' : '↓')}
                  </button>
                  <button 
                    onClick={() => handleSort('role')} 
                    className={`sort-btn ${sortBy === 'role' ? 'active' : ''}`}
                  >
                    Role {sortBy === 'role' && (sortDir === 'asc' ? '↑' : '↓')}
                  </button>
                </div>
              </div>
            </div>

            {/* Professional Users Table */}
            <div className="table-card">
              <div className="table-container">
                <table className="modern-table">
                  <thead>
                    <tr>
                      <th className="table-header">Profile</th>
                      <th 
                        className="table-header sortable" 
                        onClick={() => handleSort('name')}
                      >
                        <div className="header-content">
                          Name {sortBy === 'name' && (sortDir === 'asc' ? '↑' : '↓')}
                        </div>
                      </th>
                      <th 
                        className="table-header sortable" 
                        onClick={() => handleSort('email')}
                      >
                        <div className="header-content">
                          Email {sortBy === 'email' && (sortDir === 'asc' ? '↑' : '↓')}
                        </div>
                      </th>
                      <th 
                        className="table-header sortable" 
                        onClick={() => handleSort('role')}
                      >
                        <div className="header-content">
                          Role {sortBy === 'role' && (sortDir === 'asc' ? '↑' : '↓')}
                        </div>
                      </th>
                      <th className="table-header">Status</th>
                      <th className="table-header">Joined</th>
                      <th className="table-header">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loadingUsers ? (
                      <tr>
                        <td colSpan="7" className="loading-cell">
                          <div className="loading-spinner">
                            <div className="spinner"></div>
                            <span>Loading users...</span>
                          </div>
                        </td>
                      </tr>
                    ) : usersError ? (
                      <tr>
                        <td colSpan="7" className="error-cell">
                          <div className="error-message">
                            <span className="error-icon">⚠️</span>
                            {usersError}
                          </div>
                        </td>
                      </tr>
                    ) : filteredUsers.length === 0 ? (
                      <tr>
                        <td colSpan="7" className="empty-cell">
                          <div className="empty-state">
                            <FaUsers className="empty-icon" />
                            <span>No users found</span>
                          </div>
                        </td>
                      </tr>
                    ) : filteredUsers.map((user) => (
                      <tr key={user._id} className="table-row">
                        <td className="table-cell">
                          <div className="profile-container">
                            {user.profileImage ? (
                              <img 
                                src={`http://localhost:5000${user.profileImage}`} 
                                alt={user.name} 
                                className="profile-image"
                              />
                            ) : (
                              <div className="profile-placeholder">
                                {user.name?.[0]?.toUpperCase() || '?'}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="table-cell">
                          <div className="user-info">
                            <span className="user-name">{user.name}</span>
                            <span className="user-id">ID: {user._id?.slice(-6)}</span>
                          </div>
                        </td>
                        <td className="table-cell">
                          <span className="user-email">{user.email}</span>
                        </td>
                        <td className="table-cell">
                          <span className={`role-badge role-${user.role?.toLowerCase()}`}>
                            {user.role}
                          </span>
                        </td>
                        <td className="table-cell">
                          <span className="status-badge status-active">
                            Active
                          </span>
                        </td>
                        <td className="table-cell">
                          <span className="join-date">
                            {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                          </span>
                        </td>
                        <td className="table-cell">
                          <div className="action-buttons">
                            <button className="action-btn action-btn-view" title="View">
                              <FaUsers />
                            </button>
                            <button className="action-btn action-btn-edit" title="Edit">
                              <FaEdit />
                            </button>
                            <button className="action-btn action-btn-delete" title="Delete">
                              <FaTrash />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ) : (
          <>
            {isEditing ? (
              <div className="edit-form-container">
                <h3>Edit Event</h3>
                <form onSubmit={handleUpdate} className="edit-form">
                  <input
                    type="text"
                    name="title"
                    value={editFormData.title}
                    onChange={handleChange}
                    placeholder="Event Title"
                    required
                  />
                  <textarea
                    name="description"
                    value={editFormData.description}
                    onChange={handleChange}
                    placeholder="Event Description"
                    required
                  ></textarea>
                  <input
                    type="date"
                    name="date"
                    value={editFormData.date}
                    onChange={handleChange}
                    required
                  />
                  <input
                    type="text"
                    name="location"
                    value={editFormData.location}
                    onChange={handleChange}
                    placeholder="Event Location"
                    required
                  />

                  <div className="file-input-container">
                    <label className="file-input-label">
                      Cover Image:
                      <input
                        type="file"
                        name="coverImage"
                        onChange={handleChange}
                        accept="image/*"
                        className="file-input"
                      />
                    </label>
                    {imagePreview && (
                      <div className="image-preview">
                        <img src={imagePreview} alt="Cover preview" />
                      </div>
                    )}
                    {selectedEvent?.coverImage && !imagePreview && (
                      <div className="image-preview">
                        <img 
                          src={getImageUrl(selectedEvent.coverImage)}
                          alt="Current cover" 
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = '/default-event-image.jpg';
                          }}
                        />
                        <p className="current-file-note">Current image</p>
                      </div>
                    )}
                  </div>

                  <div className="file-input-container">
                    <label className="file-input-label">
                      Video File:
                      <input
                        type="file"
                        name="videoFile"
                        onChange={handleChange}
                        accept="video/*"
                        className="file-input"
                      />
                    </label>
                    {videoPreview && (
                      <div className="video-preview">
                        <video 
                          src={videoPreview} 
                          controls 
                          width="100%" 
                          poster={imagePreview || (selectedEvent?.coverImage ? `${SERVER_URL}${selectedEvent.coverImage}` : '/default-event-image.jpg')}
                        />
                      </div>
                    )}
                    {selectedEvent?.videoFile && !videoPreview && (
                      <div className="video-preview">
                        <video 
                          src={`${SERVER_URL}${selectedEvent.videoFile}`} 
                          controls 
                          width="100%" 
                          poster={selectedEvent?.coverImage ? `${SERVER_URL}${selectedEvent.coverImage}` : '/default-event-image.jpg'}
                        />
                        <p className="current-file-note">Current video</p>
                      </div>
                    )}
                  </div>

                  <div className="form-buttons">
                    <button type="submit" className="update-button">Update Event</button>
                    <button type="button" onClick={() => {
                      setIsEditing(false);
                      setImagePreview(null);
                      setVideoPreview(null);
                    }} className="cancel-button">
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            ) : (
              <div className="events-grid">
                {events.map((event) => (
                  <div key={event._id} className="event-card">
                    <div className="event-image">
                      <img 
                        src={getImageUrl(event.coverImage)}
                        alt={event.title} 
                        className="event-cover-image"
                        onError={(e) => {
                          console.log('Image load error:', e);
                          e.target.onerror = null; // Prevent infinite loop
                          e.target.src = '/default-event-image.jpg';
                        }}
                      />
                    </div>
                    <div className="event-details">
                      <h3>{event.title}</h3>
                      <p>{event.description}</p>
                      <p><strong>Date:</strong> {new Date(event.date).toLocaleDateString()}</p>
                      <p><strong>Location:</strong> {event.location}</p>
                      <div className="event-actions">
                        <button onClick={() => handleEdit(event)} className="edit-button">
                          <FaEdit /> Edit
                        </button>
                        <button onClick={() => handleDelete(event._id)} className="delete-button">
                          <FaTrash /> Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;