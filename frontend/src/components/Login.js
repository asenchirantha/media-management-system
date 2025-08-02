import { useState, useContext } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import AuthContext from "../context/AuthContext";
import { Link } from "react-router-dom";
import '../Auth.css';

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    
    try {
      const res = await axios.post("http://localhost:5000/api/auth/login", { 
        email, 
        password 
      });
      
      if (res.data && res.data.token) {
        localStorage.setItem('token', `Bearer ${res.data.token}`);
        localStorage.setItem('userRole', res.data.role);
        login(res.data.token, res.data.role);
        // Navigate based on role
        const redirectPath = 
          res.data.role === "Admin" ? "/admin" : 
          res.data.role === "Designer" ? "/designer" : "/user";
        navigate(redirectPath);
      } else {
        setError("Invalid response from server");
      }
    } catch (error) {
      let errorMessage = "Login failed. Please try again.";
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data) {
        errorMessage = error.response.data;
      }
      setError(errorMessage);
      console.error('Login error:', error.response);
    }
  };

  return (
    <div className="auth-container">
      
      <form onSubmit={handleSubmit} className="auth-form">
      <h2>Login</h2>
        <input 
          type="email" 
          placeholder="Email" 
          onChange={(e) => setEmail(e.target.value)} 
          value={email} 
          className="auth-input"
          required 
        />
        <input 
          type="password" 
          placeholder="Password" 
          onChange={(e) => setPassword(e.target.value)} 
          value={password} 
          className="auth-input"
          required 
        />
        <button type="submit" className="auth-button">Login</button>
        {error && <div className="auth-error">{error}</div>}
      <p className="auth-link">
        Don't have an account? <Link to="/register">Register here</Link>
      </p>
      </form>
      
    </div>
  );
};

export default Login;