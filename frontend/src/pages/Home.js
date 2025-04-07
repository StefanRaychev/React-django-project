import React, { useState, useEffect } from 'react';
import '../styles/home1.css';
import schoolLogo from '../assets/images/school-logo.bmp';
import { useNavigate, Link } from 'react-router-dom';
import axios from '../api/axios';
import useAuth from '../hooks/useAuth';

function Home() {
  const navigate = useNavigate();
  const { login, isAuthenticated, user } = useAuth();

  // Controlled inputs
  const [lectorUsername, setLectorUsername] = useState('');
  const [lectorPassword, setLectorPassword] = useState('');
  const [studentUsername, setStudentUsername] = useState('');
  const [studentPassword, setStudentPassword] = useState('');

  // ✅ Redirect after successful login
  useEffect(() => {
    if (isAuthenticated && user?.role === 'lector') {
      navigate('/lector/dashboard');
    }
    if (isAuthenticated && user?.role === 'student') {
      navigate('/student/dashboard');
    }
  }, [isAuthenticated, user, navigate]);

  // ✅ Get CSRF token from cookies
  const getCSRFToken = () => {
    const name = 'csrftoken=';
    const cookies = document.cookie.split(';');
    for (let cookie of cookies) {
      cookie = cookie.trim();
      if (cookie.startsWith(name)) {
        return cookie.substring(name.length);
      }
    }
    return null;
  };

  // ✅ Lector Login
  const handleLectorLogin = async (e) => {
    e.preventDefault();
    try {
      await axios.get('csrf/'); // fetch CSRF cookie
      const csrfToken = getCSRFToken();

      const response = await axios.post(
        'lector/login/',
        {
          username: lectorUsername,
          password: lectorPassword,
        },
        {
          headers: {
            'X-CSRFToken': csrfToken,
          },
          withCredentials: true,
        }
      );

      console.log("✅ Login response:", response.data);
login(response.data.user, response.data.token); // ✅ proper fix
    } catch (error) {
      console.error("❌ Lector login failed:", error.response?.data || error.message);
      alert("Lector login failed.");
    }
  };

  // ✅ Student Login
  const handleStudentLogin = async (e) => {
    e.preventDefault();
    try {
      await axios.get('csrf/');
      const csrfToken = getCSRFToken();

      const response = await axios.post(
        'student/login/',
        {
          username: studentUsername,
          password: studentPassword,
        },
        {
          headers: {
            'X-CSRFToken': csrfToken,
          },
          withCredentials: true,
        }
      );

       console.log("✅ Login response:", response.data);
login(response.data.user, response.data.token); // ✅ proper fix
    } catch (error) {
      console.error("❌ Student login failed:", error.response?.data || error.message);
      alert("Student login failed.");
    }
  };

  return (
    <div className="container">
      {/* Lector Login */}
      <div className="section lector">
        <h2>Lector Login</h2>
        <form onSubmit={handleLectorLogin}>
          <input
            type="text"
            name="username"
            placeholder="Username"
            value={lectorUsername}
            onChange={(e) => setLectorUsername(e.target.value)}
            required
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={lectorPassword}
            onChange={(e) => setLectorPassword(e.target.value)}
            required
          />
          <button type="submit">Log In</button>
        </form>
        <p>
          Don't have an account?{' '}
          <Link to="/lector/register">Register</Link>
        </p>
      </div>

      {/* Logo Section */}
      <div className="section logo">
        <img src={schoolLogo} alt="School Logo" />
        <h1>SCHOOL DEMO</h1>
      </div>

      {/* Student Login */}
      <div className="section student">
        <h2>Student Login</h2>
        <form onSubmit={handleStudentLogin}>
          <input
            type="text"
            name="username"
            placeholder="Username"
            value={studentUsername}
            onChange={(e) => setStudentUsername(e.target.value)}
            required
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={studentPassword}
            onChange={(e) => setStudentPassword(e.target.value)}
            required
          />
          <button type="submit">Log In</button>
        </form>
        <p>
          Don't have an account?{' '}
          <Link to="/student/register">Register</Link>
        </p>
      </div>
    </div>
  );
}

export default Home;
