import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./css/UserDashboard.css";
import { FaWifi, FaStar, FaFire, FaUser, FaVideo, FaList, FaEdit, FaTrash, FaSearch } from "react-icons/fa";
import { Wifi } from "lucide-react";
import Header from "./ui/header";

const SERVER_URL = 'http://localhost:5000';

const UserDashboard = () => {
  const [events, setEvents] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  
  const navigate = useNavigate();

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/events");
      setEvents(res.data);
    } catch (error) {
      console.error("Error fetching events:", error);
    }
  };

  const filteredEvents = events.filter((event) =>
    event.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSearchClick = () => {
    setIsSearchOpen(true);
  };

  const handleSearchClose = () => {
    setIsSearchOpen(false);
    setSearchQuery('');
  };

  return (
    <div className="dashboard-container">
      <Header />

      <div className="search-trigger">
        <button onClick={handleSearchClick} className="search-button">
          <FaSearch />
        </button>
      </div>

      {isSearchOpen && (
        <div className="search-popup-overlay">
          <div className="search-popup">
            <div className="search-header">
              <input
                type="text"
                placeholder="Search events..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
                className="search-input"
              />
              <button onClick={handleSearchClose} className="close-search">
                ✕
              </button>
            </div>
            {searchQuery && (
              <div className="search-results">
                {filteredEvents.length > 0 ? (
                  filteredEvents.map((event) => (
                    <div key={event._id} className="search-result-item">
                      <img src={event.coverImage || "/default-event-image.jpg"} alt={event.title} />
                      <div className="search-result-details">
                        <h4>{event.title}</h4>
                        <p>{event.description.substring(0, 100)}...</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="no-results">No events found</div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      <section className="featured-event">
        <div className="featured-card">
          <div className="live-badge">
            <Wifi size={16} />
            <span>Live</span>
          </div>

          <div className="content">
            <div className="event-details">
              <h4 className="campus-name">ABC Campus</h4>
              <h2 className="event-title">Graduation Event</h2>
              <p className="presenter">Asen Chlrantha</p>
            </div>
            <button className="see-more-btn">See More</button>
          </div>
        </div>
      </section>


      <div className="button-container">
        <button className="btn live" onClick={() => navigate('/live-stream/1')}>
          <FaWifi /> Live
        </button>
        <button className="btn special">
          <FaStar /> Special
        </button>
        <button className="btn trending">
          <FaFire /> Trending
        </button>
        <button className="btn following">
          <FaUser /> Following
        </button>
        <button className="btn videos">
          <FaVideo /> Your Videos
        </button>
        <button className="btn playlist">
          <FaList /> Playlist
        </button>
      </div>


      <section className="events-panel">
        <h2>Popular Events</h2>
        <div className="event-cards">
          {filteredEvents.map((event) => (
            <div className="event-card" key={event._id}>
              <div className="event-image">
                <img
                  src={event.coverImage ? `${SERVER_URL}${event.coverImage}` : "/default-event-image.jpg"}
                  alt={event.title}
                  className="event-cover-image"
                  onError={(e) => {
                    e.target.onerror = null; // Prevent infinite loop
                    e.target.src = "/default-event-image.jpg";
                  }}
                />
              </div>
              <div className="event-details">
                <h3>{event.title}</h3>
                <p>{event.description}</p>
                <p>
                  <strong>Date:</strong> {new Date(event.date).toLocaleDateString()}
                </p>
                <p>
                  <strong>Location:</strong> {event.location}
                </p>

                <div className="profile-section">
                  <img src="/path/to/profile.jpg" alt="User" />
                  <span>Asen Chirantha</span>
                  <span className="verified-badge">✔️</span>
                </div>

                <div className="download-section">
                  <div className="download-left">
                    <button 
                      className="download-btn"
                      onClick={() => window.open(`${SERVER_URL}${event.videoFile}`, '_blank')}
                      disabled={!event.videoFile}
                    >
                      <span className="download-icon">⬇</span>
                      Download
                    </button>
                  </div>
                  <div className="download-right">
                    <span className="download-count">
                      <span className="count-icon">🔵</span>
                      4.2K Downloads
                    </span>
                  </div>
                </div>

                {event.videoFile && (
                  <div className="video-preview">
                    <video 
                      src={`${SERVER_URL}${event.videoFile}`} 
                      controls 
                      width="100%" 
                      poster={event.coverImage ? `${SERVER_URL}${event.coverImage}` : '/default-event-image.jpg'}
                    />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      <footer className="dashboard-footer">
        <div className="footer-content">
          <div className="footer-left">
            <img src="/logo.png" alt="Dreamio Logo" className="footer-logo" />
            <p>Dreamteam Media (Pvt) Ltd</p>
            <p>Lyceum Campus Building 9th Floor, No 10,</p>
            <p>Raymond Road, Nugegoda, 10260, Sri Lanka</p>
            <p>Phone: +94 77 771 6800</p>
            <p>Email: hello@dreamteam.lk</p>
          </div>
          <div className="footer-middle">
            <h3>Quick Links</h3>
            <ul>
              <li>Settings</li>
              <li>Events</li>
              <li>Contact Us</li>
              <li>Privacy Policy</li>
              <li>Terms & Conditions</li>
            </ul>
          </div>
          <div className="footer-right">
            <h3>Newsletter</h3>
            <p>Subscribe To Get Latest Media Updates</p>
            <button className="chat-btn">Chat</button>
          </div>
        </div>
        <div className="footer-bottom">
          <p>Made by: <a href="#">Asen Chirantha</a></p>
        </div>
      </footer>
    </div>
  );
};

export default UserDashboard;
