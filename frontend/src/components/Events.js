import { useState } from "react";
import axios from "axios";
import './css/Events.css';
import Header from "./ui/header";

const Events = () => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    date: "",
    location: "",
    coverImage: null,
    videoFile: null
  });
  const [imagePreview, setImagePreview] = useState(null);
  const [videoPreview, setVideoPreview] = useState(null);

  const handleChange = (e) => {
    if (e.target.type === 'file') {
      const file = e.target.files[0];
      if (e.target.name === 'coverImage') {
        setImagePreview(URL.createObjectURL(file));
      } else if (e.target.name === 'videoFile') {
        setVideoPreview(URL.createObjectURL(file));
      }
      setFormData({ ...formData, [e.target.name]: file });
    } else {
      setFormData({ ...formData, [e.target.name]: e.target.value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const createdBy = localStorage.getItem("userRole");
    
    if (!createdBy) {
      alert("User role is missing. Please login first.");
      return;
    }

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('title', formData.title);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('date', formData.date);
      formDataToSend.append('location', formData.location);
      formDataToSend.append('createdBy', createdBy);
      
      if (formData.coverImage) {
        formDataToSend.append('coverImage', formData.coverImage);
      }
      
      if (formData.videoFile) {
        formDataToSend.append('videoFile', formData.videoFile);
      }

      const res = await axios.post(
        "http://localhost:5000/api/events/create", 
        formDataToSend,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      if (res.data) {
        alert("Event Created Successfully!");
        setFormData({ 
          title: "", 
          description: "", 
          date: "", 
          location: "", 
          coverImage: null, 
          videoFile: null 
        });
        setImagePreview(null);
        setVideoPreview(null);
      }
    } catch (error) {
      console.error("Error creating event:", error);
      alert(error.response?.data?.message || "Error creating event. Please try again.");
    }
  };

  return (
    <div className="events-container">
      <Header />
      <div className="main-content">
        <div className="dashboard-header">
          <h2 className="CreateEvent">Create Event</h2>
        </div>
        
        <form onSubmit={handleSubmit} className="event-form">
          <input
            type="text"
            name="title"
            placeholder="Event Title"
            value={formData.title}
            onChange={handleChange}
            className="form-input"
            required
          />
          <textarea
            name="description"
            placeholder="Event Description"
            value={formData.description}
            onChange={handleChange}
            className="form-textarea"
            required
          ></textarea>
          <input
            type="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            className="form-input"
            required
          />
          <input
            type="text"
            name="location"
            placeholder="Event Location"
            value={formData.location}
            onChange={handleChange}
            className="form-input"
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
                required
              />
            </label>
            {imagePreview && (
              <div className="image-preview">
                <img src={imagePreview} alt="Cover preview" />
              </div>
            )}
          </div>

          <div className="file-input-container">
            <label className="file-input-label">
              Video File (Optional):
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
                <video src={videoPreview} controls width="300" />
              </div>
            )}
          </div>

          <button type="submit" className="form-button">Create Event</button>
        </form>
      </div>
    </div>
  );
};

export default Events; 