import React, { useState } from 'react';
import axios from '../../api/axios';
import { useNavigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import '../../styles/registration1.css';

await axios.get('csrf/'); // Fetch the CSRF cookie first


const StudentRegistration = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password1: '',
    password2: ''
  });

  const [errors, setErrors] = useState({});
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
console.log("📤 Sending data to backend:", formData);

try {
  await axios.get("csrf/");
  console.log("✅ CSRF cookie requested");

  const getCSRFToken = () => {
    const name = "csrftoken=";
    const cookies = document.cookie.split(";");
    for (let cookie of cookies) {
      cookie = cookie.trim();
      if (cookie.startsWith(name)) {
        return cookie.substring(name.length);
      }
    }
    return null;
  };

  const csrfToken = getCSRFToken();
  console.log("🔑 Extracted CSRF token:", csrfToken);

  const response = await axios.post("/student/register/", formData, {
    headers: {
      "X-CSRFToken": csrfToken,
    },
    withCredentials: true,
  });

  console.log("✅ Response from backend:", response.data);
  const { user, token } = response.data;
  login(user, token);
  navigate("/student/dashboard");

} catch (error) {
  console.error("❌ Axios Error:");
  console.error("Status:", error?.response?.status);
  console.error("Data:", error?.response?.data);
  console.error("Headers:", error?.response?.headers);
}

  };

  return (
    <div className="registration-container">
      <div className="registration-box">
        <h2 className="registration-title">STUDENT REGISTRATION FORM</h2>
        {Object.keys(errors).length > 0 && (
  <div className="alert alert-danger">
    <strong>Error:</strong> Please correct the following:
    <ul>
      {Object.entries(errors).map(([field, msgs]) =>
        (Array.isArray(msgs) ? msgs : [msgs]).map((msg, idx) => (
          <li key={`${field}-${idx}`}>{field}: {msg}</li>
        ))
      )}
    </ul>
  </div>
)}
        <form onSubmit={handleSubmit}>
          <input type="text" name="username" placeholder="USERNAME" value={formData.username} onChange={handleChange} className="registration-input" required />
          <input type="email" name="email" placeholder="EMAIL" value={formData.email} onChange={handleChange} className="registration-input" required />
          <input type="password" name="password1" placeholder="PASSWORD" value={formData.password1} onChange={handleChange} className="registration-input" required />
          <input type="password" name="password2" placeholder="CONFIRM PASSWORD" value={formData.password2} onChange={handleChange} className="registration-input" required />
          <div className="registration-actions">
            <button type="submit" className="register-button">Register</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StudentRegistration;
