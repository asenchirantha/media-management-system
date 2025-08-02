import { useState, useEffect } from 'react';
import axios from 'axios';
import Header from './ui/header';
import { FaUsers, FaCalendarAlt, FaVideo, FaChartBar, FaCog, FaTrash, FaEdit, FaChevronDown, FaCalendar, FaList } from 'react-icons/fa';
import './css/AdminDashboard.css';
import './css/AdminDashboard_Users.css';
import { useNavigate } from 'react-router-dom';
import { DonutChart, Card, Title, Metric, Text, Flex, Grid } from '@tremor/react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, AreaChart, Area, RadialBarChart, RadialBar 
} from 'recharts';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title as ChartTitle,
  Tooltip as ChartTooltip,
  Legend as ChartLegend,
  ArcElement,
  BarElement,
} from 'chart.js';
import { Line as ChartJSLine, Doughnut, Bar as ChartJSBar } from 'react-chartjs-2';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ChartTitle,
  ChartTooltip,
  ChartLegend,
  ArcElement,
  BarElement
);

const SERVER_URL = 'http://localhost:5000';
const localizer = momentLocalizer(moment);

const AdminDashboard = () => {
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [eventViewMode, setEventViewMode] = useState('grid'); // 'grid' or 'calendar'
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
  const [lastUpdated, setLastUpdated] = useState(null);
  
  // Analytics state
  const [analyticsData, setAnalyticsData] = useState({
    userStats: [],
    designStats: [],
    videoStats: [],
    eventStats: [],
    monthlyGrowth: [],
    userActivity: [],
    contentPerformance: [],
    systemMetrics: []
  });

  const fetchUsers = async () => {
    setLoadingUsers(true);
    setUsersError('');
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setUsersError('No authentication token found. Please login again.');
        navigate('/login');
        return;
      }
      
      console.log('Fetching users with token:', token.substring(0, 20) + '...');
      
      const res = await axios.get('http://localhost:5000/api/users', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log('Users fetched successfully:', res.data.length);
      setUsers(res.data);
      setLastUpdated(new Date());
      
      // Show success notification
      if (res.data.length > 0) {
        setNotification(`Successfully loaded ${res.data.length} users`);
        setTimeout(() => setNotification(''), 3000);
      }
    } catch (err) {
      console.error('Error fetching users:', err);
      console.error('Error response:', err.response?.data);
      
      if (err.response?.status === 401 || err.response?.status === 403) {
        setUsersError('Authentication failed. Please login again.');
        navigate('/login');
      } else {
        setUsersError(err.response?.data?.message || 'Failed to fetch users');
      }
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

  const handleRefresh = () => {
    fetchUsers();
    setNotification('Refreshing user data...');
    setTimeout(() => setNotification(''), 2000);
  };

  // User management functions
  const handleViewUser = (user) => {
    alert(`User Details:\nName: ${user.name}\nEmail: ${user.email}\nRole: ${user.role}\nJoined: ${user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}`);
  };

  const handleEditUser = (user) => {
    // For now, just show an alert. You can implement a modal here
    const newRole = prompt(`Edit role for ${user.name}\nCurrent role: ${user.role}\nEnter new role (Admin, Designer, User):`, user.role);
    if (newRole && ['Admin', 'Designer', 'User'].includes(newRole)) {
      updateUserRole(user._id, newRole);
    }
  };

  const handleDeleteUser = async (user) => {
    if (window.confirm(`Are you sure you want to delete user "${user.name}"?`)) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`http://localhost:5000/api/users/${user._id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setNotification(`User "${user.name}" deleted successfully`);
        setTimeout(() => setNotification(''), 3000);
        fetchUsers(); // Refresh the list
      } catch (error) {
        console.error('Error deleting user:', error);
        setNotification('Error deleting user');
        setTimeout(() => setNotification(''), 3000);
      }
    }
  };

  const updateUserRole = async (userId, newRole) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`http://localhost:5000/api/users/${userId}`, 
        { role: newRole },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setNotification(`User role updated to ${newRole}`);
      setTimeout(() => setNotification(''), 3000);
      fetchUsers(); // Refresh the list
    } catch (error) {
      console.error('Error updating user role:', error);
      setNotification('Error updating user role');
      setTimeout(() => setNotification(''), 3000);
    }
  };

  // Calendar functions
  const convertEventsToCalendarFormat = () => {
    return events.map(event => ({
      id: event._id,
      title: event.title,
      start: new Date(event.date),
      end: new Date(event.date),
      resource: event,
      description: event.description,
      location: event.location
    }));
  };

  const handleSelectEvent = (calendarEvent) => {
    setSelectedEvent(calendarEvent.resource);
    setIsEditing(false);
  };

  const handleSelectSlot = (slotInfo) => {
    // Create new event on calendar slot selection
    const newEventData = {
      title: 'New Event',
      description: '',
      date: slotInfo.start.toISOString().split('T')[0],
      location: ''
    };
    setSelectedEvent(null);
    setEditFormData(newEventData);
    setIsEditing(true);
  };

  useEffect(() => {
    fetchEvents();
    // Also load users data when component mounts
    fetchUsers();
    
    // Generate analytics data when users or events data changes
    if (users.length > 0 || events.length > 0) {
      generateAnalyticsData();
    }
    
    // Set up auto-refresh for users every 30 seconds
    const interval = setInterval(() => {
      if (activeTab === 'users') {
        fetchUsers();
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [activeTab, users.length, events.length]);

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

  // Analytics functions
  const generateAnalyticsData = () => {
    // Generate realistic mock data based on actual system data
    const monthlyData = [
      { month: 'Jan', users: Math.floor(users.length * 0.3), events: Math.floor(events.length * 0.2), videos: Math.floor(events.length * 0.4) },
      { month: 'Feb', users: Math.floor(users.length * 0.5), events: Math.floor(events.length * 0.3), videos: Math.floor(events.length * 0.6) },
      { month: 'Mar', users: Math.floor(users.length * 0.7), events: Math.floor(events.length * 0.5), videos: Math.floor(events.length * 0.8) },
      { month: 'Apr', users: Math.floor(users.length * 0.8), events: Math.floor(events.length * 0.7), videos: Math.floor(events.length * 0.9) },
      { month: 'May', users: Math.floor(users.length * 0.9), events: Math.floor(events.length * 0.8), videos: Math.floor(events.length * 0.95) },
      { month: 'Jun', users: users.length, events: events.length, videos: events.length },
    ];

    const userActivityData = [
      { day: 'Mon', active: Math.floor(users.length * 0.7), inactive: Math.floor(users.length * 0.3) },
      { day: 'Tue', active: Math.floor(users.length * 0.8), inactive: Math.floor(users.length * 0.2) },
      { day: 'Wed', active: Math.floor(users.length * 0.75), inactive: Math.floor(users.length * 0.25) },
      { day: 'Thu', active: Math.floor(users.length * 0.85), inactive: Math.floor(users.length * 0.15) },
      { day: 'Fri', active: Math.floor(users.length * 0.9), inactive: Math.floor(users.length * 0.1) },
      { day: 'Sat', active: Math.floor(users.length * 0.6), inactive: Math.floor(users.length * 0.4) },
      { day: 'Sun', active: Math.floor(users.length * 0.5), inactive: Math.floor(users.length * 0.5) },
    ];

    const contentPerformanceData = [
      { type: 'Videos', views: 15430, downloads: 2340, shares: 890 },
      { type: 'Images', views: 8970, downloads: 4560, shares: 1230 },
      { type: 'Events', views: 12340, downloads: 890, shares: 2340 },
      { type: 'Live Streams', views: 5670, downloads: 0, shares: 1890 },
    ];

    const systemMetricsData = [
      { metric: 'Storage Used', value: 68, total: 100, color: '#8884d8' },
      { metric: 'Bandwidth', value: 45, total: 100, color: '#82ca9d' },
      { metric: 'API Calls', value: 78, total: 100, color: '#ffc658' },
      { metric: 'DB Queries', value: 56, total: 100, color: '#ff7300' },
    ];

    setAnalyticsData({
      userStats: Object.entries(userRoleCounts).map(([role, count]) => ({ name: role, value: count })),
      designStats: monthlyData,
      videoStats: contentPerformanceData,
      eventStats: events.map(event => ({
        name: event.title.length > 20 ? event.title.substring(0, 20) + '...' : event.title,
        date: new Date(event.date).toLocaleDateString(),
        views: Math.floor(Math.random() * 1000) + 100,
        engagement: Math.floor(Math.random() * 100) + 10
      })),
      monthlyGrowth: monthlyData,
      userActivity: userActivityData,
      contentPerformance: contentPerformanceData,
      systemMetrics: systemMetricsData
    });
  };

  // Chart color schemes
  const colors = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#00ff7f', '#ff6b6b', '#4ecdc4', '#45b7d1'];

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

  const handleEditLocalUser = (idx) => {
    setForm({ ...users[idx] });
    setEditingIndex(idx);
  };

  const handleDeleteLocalUser = (idx) => {
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
                    Refresh Users
                  </button>
                  <button className="btn-primary" onClick={() => navigate('/register')}>
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

            {/* Notification Display */}
            {notification && (
              <div className="notification-banner success">
                <span className="notification-icon">✅</span>
                <span className="notification-text">{notification}</span>
              </div>
            )}

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
                  <span className="results-count">
                    {filteredUsers.length} users found
                    {lastUpdated && (
                      <span className="last-updated">
                        • Last updated: {lastUpdated.toLocaleTimeString()}
                      </span>
                    )}
                  </span>
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
                            <button 
                              className="action-btn action-btn-view" 
                              title="View User Details"
                              onClick={() => handleViewUser(user)}
                            >
                              <FaUsers />
                            </button>
                            <button 
                              className="action-btn action-btn-edit" 
                              title="Edit User Role"
                              onClick={() => handleEditUser(user)}
                            >
                              <FaEdit />
                            </button>
                            <button 
                              className="action-btn action-btn-delete" 
                              title="Delete User"
                              onClick={() => handleDeleteUser(user)}
                            >
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
        ) : activeTab === 'analytics' ? (
          // Analytics Dashboard
          <div className="analytics-dashboard">
            <div className="analytics-header">
              <h1 className="dashboard-title">Analytics Dashboard</h1>
              <p className="dashboard-subtitle">Comprehensive insights into users, content, and system performance</p>
            </div>

            {/* Key Metrics Overview */}
            <div className="analytics-overview">
              <div className="metric-card">
                <div className="metric-icon">
                  <FaUsers />
                </div>
                <div className="metric-content">
                  <div className="metric-value">{users.length}</div>
                  <div className="metric-label">Total Users</div>
                  <div className="metric-change positive">+{Math.floor(users.length * 0.12)} this month</div>
                </div>
              </div>
              
              <div className="metric-card">
                <div className="metric-icon">
                  <FaVideo />
                </div>
                <div className="metric-content">
                  <div className="metric-value">{events.length}</div>
                  <div className="metric-label">Total Events</div>
                  <div className="metric-change positive">+{Math.floor(events.length * 0.08)} this month</div>
                </div>
              </div>
              
              <div className="metric-card">
                <div className="metric-icon">
                  <FaChartBar />
                </div>
                <div className="metric-content">
                  <div className="metric-value">{Math.floor(users.length * 0.75)}</div>
                  <div className="metric-label">Active Users</div>
                  <div className="metric-change positive">+5.2% engagement</div>
                </div>
              </div>
              
              <div className="metric-card">
                <div className="metric-icon">
                  <FaEdit />
                </div>
                <div className="metric-content">
                  <div className="metric-value">{(userRoleCounts['Designer'] || 0) + (userRoleCounts['Admin'] || 0)}</div>
                  <div className="metric-label">Content Creators</div>
                  <div className="metric-change neutral">Stable growth</div>
                </div>
              </div>
            </div>

            {/* Charts Grid */}
            <div className="analytics-charts-grid">
              {/* User Distribution Chart */}
              <div className="chart-container">
                <div className="chart-header">
                  <h3>User Distribution by Role</h3>
                  <p>Breakdown of user roles in the system</p>
                </div>
                <div className="chart-content">
                  <PieChart width={350} height={250}>
                    <Pie
                      data={analyticsData.userStats}
                      cx={175}
                      cy={125}
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                      label={(entry) => `${entry.name}: ${entry.value}`}
                    >
                      {analyticsData.userStats.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </div>
              </div>

              {/* Monthly Growth Chart */}
              <div className="chart-container">
                <div className="chart-header">
                  <h3>Monthly Growth Trends</h3>
                  <p>Users, events, and content over time</p>
                </div>
                <div className="chart-content">
                  <LineChart width={400} height={250} data={analyticsData.monthlyGrowth}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="users" stroke="#8884d8" strokeWidth={2} />
                    <Line type="monotone" dataKey="events" stroke="#82ca9d" strokeWidth={2} />
                    <Line type="monotone" dataKey="videos" stroke="#ffc658" strokeWidth={2} />
                  </LineChart>
                </div>
              </div>

              {/* User Activity Chart */}
              <div className="chart-container">
                <div className="chart-header">
                  <h3>Weekly User Activity</h3>
                  <p>Active vs inactive users by day</p>
                </div>
                <div className="chart-content">
                  <BarChart width={400} height={250} data={analyticsData.userActivity}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="active" fill="#8884d8" />
                    <Bar dataKey="inactive" fill="#ffc658" />
                  </BarChart>
                </div>
              </div>

              {/* Content Performance Chart */}
              <div className="chart-container">
                <div className="chart-header">
                  <h3>Content Performance</h3>
                  <p>Views, downloads, and shares by content type</p>
                </div>
                <div className="chart-content">
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={analyticsData.contentPerformance}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="type" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="views" fill="#8884d8" />
                      <Bar dataKey="downloads" fill="#82ca9d" />
                      <Bar dataKey="shares" fill="#ffc658" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* System Metrics */}
              <div className="chart-container">
                <div className="chart-header">
                  <h3>System Resource Usage</h3>
                  <p>Current system performance metrics</p>
                </div>
                <div className="chart-content">
                  <div className="system-metrics">
                    {analyticsData.systemMetrics.map((metric, index) => (
                      <div key={index} className="metric-item">
                        <div className="metric-info">
                          <span className="metric-name">{metric.metric}</span>
                          <span className="metric-percentage">{metric.value}%</span>
                        </div>
                        <div className="progress-bar">
                          <div 
                            className="progress-fill" 
                            style={{ 
                              width: `${metric.value}%`, 
                              backgroundColor: metric.color 
                            }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Event Analytics */}
              <div className="chart-container full-width">
                <div className="chart-header">
                  <h3>Event Performance Analytics</h3>
                  <p>Individual event engagement and viewership data</p>
                </div>
                <div className="chart-content">
                  {analyticsData.eventStats.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <AreaChart data={analyticsData.eventStats}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Area type="monotone" dataKey="views" stackId="1" stroke="#8884d8" fill="#8884d8" />
                        <Area type="monotone" dataKey="engagement" stackId="1" stroke="#82ca9d" fill="#82ca9d" />
                      </AreaChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="no-data">
                      <p>No event data available</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Analytics Summary Table */}
            <div className="analytics-summary">
              <div className="summary-header">
                <h3>Quick Summary</h3>
              </div>
              <div className="summary-grid">
                <div className="summary-item">
                  <div className="summary-label">Most Active Day</div>
                  <div className="summary-value">Friday</div>
                </div>
                <div className="summary-item">
                  <div className="summary-label">Top Content Type</div>
                  <div className="summary-value">Videos</div>
                </div>
                <div className="summary-item">
                  <div className="summary-label">Growth Rate</div>
                  <div className="summary-value">+12.5%</div>
                </div>
                <div className="summary-item">
                  <div className="summary-label">User Retention</div>
                  <div className="summary-value">85.2%</div>
                </div>
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
              <>
                {/* View Toggle Buttons */}
                <div className="events-header">
                  <div className="events-title">
                    <h2>Events Management</h2>
                  </div>
                  <div className="view-toggle">
                    <button 
                      className={`view-btn ${eventViewMode === 'grid' ? 'active' : ''}`}
                      onClick={() => setEventViewMode('grid')}
                    >
                      <FaList /> Grid View
                    </button>
                    <button 
                      className={`view-btn ${eventViewMode === 'calendar' ? 'active' : ''}`}
                      onClick={() => setEventViewMode('calendar')}
                    >
                      <FaCalendar /> Calendar View
                    </button>
                  </div>
                </div>

                {/* Conditional Rendering based on view mode */}
                {eventViewMode === 'calendar' ? (
                  <div className="calendar-container">
                    <Calendar
                      localizer={localizer}
                      events={convertEventsToCalendarFormat()}
                      startAccessor="start"
                      endAccessor="end"
                      style={{ height: 600 }}
                      onSelectEvent={handleSelectEvent}
                      onSelectSlot={handleSelectSlot}
                      selectable
                      popup
                      views={['month', 'week', 'day', 'agenda']}
                      defaultView="month"
                      eventPropGetter={(event) => ({
                        style: {
                          backgroundColor: '#3174ad',
                          borderRadius: '5px',
                          opacity: 0.8,
                          color: 'white',
                          border: '0px',
                          display: 'block'
                        }
                      })}
                    />
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
          </>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;