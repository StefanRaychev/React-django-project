import React, {useEffect, useState} from 'react';
import axios from '../../api/axios';
import { useNavigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import '../../styles/login.css';


console.log("🧠 LOADED: StudentLoginPage.js in use");

const StudentLoginPage = () => {
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuth();

  // ✅ Redirect once login is successful and token is set
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/student/dashboard');
    }
  }, [isAuthenticated, navigate]);


  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const response = await axios.post('/student/login/', formData);
const data = response?.data;
console.log("✅ Full response:", data);

if (!data || !data.token) {
  console.error("❌ No token in response!");
  return;
}

const { user, token } = data;
console.log("✅ Parsed token:", token);
console.log("📦 Calling login() with:", user, token);

login(user, token);
    } catch (error) {
      setError(error.response?.data?.detail || 'Login failed.');
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h2 className="login-title">Student LOGIN</h2>
        {error && <div className="error-message">{error}</div>}
        <form onSubmit={handleSubmit}>
          <input type="text" name="username" placeholder="USERNAME" value={formData.username} onChange={handleChange} className="login-input" required />
          <input type="password" name="password" placeholder="PASSWORD" value={formData.password} onChange={handleChange} className="login-input" required />
          <div className="login-actions">
            <button type="submit" className="login-button">Login</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StudentLoginPage;
