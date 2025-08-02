import { useState } from 'react';
import axios from 'axios';
import '../Auth.css';
import { Link, useNavigate } from 'react-router-dom';

const Register = () => {
  const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'User' });
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });

    if (e.target.name === 'password') {
      checkPasswordStrength(e.target.value);
    }
  };

  const checkPasswordStrength = (password) => {
    let strength = password.length;

    if (strength < 6) {
      setPasswordStrength(20);
    } else if (strength >= 6 && strength < 10) {
      setPasswordStrength(60);
    } else if (strength >= 10) {
      setPasswordStrength(100);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    
    try {
      const response = await axios.post('http://localhost:5000/api/auth/register', formData);
      if (response.data) {
        alert('Registration successful! Please login.');
        navigate('/login');
      }
    } catch (error) {
      let errorMessage = 'Registration failed. Please try again.';
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data) {
        errorMessage = error.response.data;
      }
      setError(errorMessage);
      console.error('Registration error:', error.response);
    }
  };

  return (
    <div className="auth-container">
      
      <form onSubmit={handleSubmit} className="auth-form">
      <h2>Register</h2>
        {error && <div className="auth-error">{error}</div>}
        <input 
          type="text" 
          name="name" 
          placeholder="Name" 
          onChange={handleChange} 
          value={formData.name} 
          className="auth-input" 
          required 
        />
        <input 
          type="email" 
          name="email" 
          placeholder="Email" 
          onChange={handleChange} 
          value={formData.email} 
          className="auth-input" 
          required 
        />
        <input 
          type="password" 
          name="password" 
          placeholder="Password" 
          onChange={handleChange} 
          value={formData.password} 
          className="auth-input" 
          required 
        />
        
        <div className="password-strength-container">
          <div 
            className="password-strength-bar"
            style={{ width: `${passwordStrength}%`, backgroundColor: getStrengthColor(passwordStrength) }}
          ></div>
        </div>

        <div className="password-strength-text">
          {passwordStrength < 40 ? "Weak" : passwordStrength < 80 ? "Medium" : "Strong"}
        </div>

        <select 
          name="role" 
          onChange={handleChange} 
          value={formData.role} 
          className="auth-input"
        >
          <option value="User">User</option>
          <option value="Designer">Designer</option>
          <option value="Admin">Admin</option>
        </select>
        <button type="submit" className="auth-button">Register</button>
        <p className="auth-link">
        Already have an account? <Link to="/login">Login here</Link>
      </p>
      </form>
      
    </div>
  );
};

const getStrengthColor = (strength) => {
  if (strength < 40) return 'red';
  if (strength < 80) return 'orange';
  return 'green';
};

export default Register;