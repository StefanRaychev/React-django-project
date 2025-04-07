// LectorProfileEdit.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../styles/profile-edit1.css';
import axios from '../../api/axios';
import useAuth from '../../hooks/useAuth';
import Cookies from 'js-cookie'; // if not already installed

function StudentProfileEditPage() {
  const { token, user, setUser } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    username: user?.username || '',
    email: user?.email || '',
    password1: '',
    password2: '',
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };





  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});

    try {
    console.log('Submitting form...');

const csrfToken = Cookies.get('csrftoken');

const response = await axios.put('/student/profile/', formData, {
  headers: {
    'X-CSRFToken': csrfToken
  }
});



    const refreshedUser = await axios.get('/student/profile/', {
      withCredentials: true
    });

    console.log('Refreshed user from GET:', refreshedUser.data);
    console.log('PUT response complete.');

    if (setUser) {
      console.log('Calling setUser...');
      setUser(refreshedUser.data);
        localStorage.setItem("user", JSON.stringify(refreshedUser.data)); // ✅ fix refresh issue

      }
    console.log('Redirecting...');

      navigate('/student/personal-dashboard');
    } catch (err) {
          console.error('Error during profile update:', err);

      if (err.response?.data) {
        setErrors(err.response.data);
      } else {
        alert('An unexpected error occurred.');
      }
    }
  };






  const handleDelete = () => {
    window.location.href = '/student/delete-profile';
  };

  const handleCancel = () => {
    window.history.back();
  };

  return (
    <div className="lector-profile-edit-wrapper">
      <div className="container">
        <div className="edit-profile-container">
          <h2>Edit Student Profile</h2>
          <form onSubmit={handleSubmit}>
            {/* Username */}
            <div>
              <label htmlFor="username">Username:</label>
              <input
                name="username"
                id="username"
                value={formData.username}
                onChange={handleChange}
                type="text"
              />
              {errors.username && (
                <p className="error-message active">{errors.username.join(' ')}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email">Email address:</label>
              <input
                name="email"
                id="email"
                value={formData.email}
                onChange={handleChange}
                type="email"
              />
              {errors.email && (
                <p className="error-message active">{errors.email.join(' ')}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password1">Password:</label>
              <input
                name="password1"
                id="password1"
                value={formData.password1}
                onChange={handleChange}
                type="password"
              />
              {errors.password1 && (
                <p className="error-message active">{errors.password1.join(' ')}</p>
              )}
            </div>

            {/* Password confirmation */}
            <div>
              <label htmlFor="password2">Password confirmation:</label>
              <input
                name="password2"
                id="password2"
                value={formData.password2}
                onChange={handleChange}
                type="password"
              />
              {errors.password2 && (
                <p className="error-message active">{errors.password2.join(' ')}</p>
              )}
            </div>

          <button type="submit" className="save-btn">Save Changes</button>
          </form>

          <button type="button" className="delete-btn" onClick={handleDelete}>
            Delete Profile
          </button>

          <button type="button" className="cancel-btn" onClick={handleCancel}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

export default StudentProfileEditPage;
