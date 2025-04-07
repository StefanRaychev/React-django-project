import React, { useState } from 'react';
import '../../styles/create-course1.css';
import { useNavigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import axios from '../../api/axios';
import Cookies from 'js-cookie';

function LectorCreateCourse() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    const csrfToken = Cookies.get('csrftoken');

    try {
      await axios.post('/lector/courses/create/', formData, {
        headers: {
          'X-CSRFToken': csrfToken,
        },
        withCredentials: true,
      });

      navigate('/lector/personal-dashboard');
    } catch (err) {
      if (err.response?.data) {
        setErrors(err.response.data);
      } else {
        alert('Something went wrong.');
      }
    }
  };

  const handleCancel = () => {
    navigate('/lector/personal-dashboard');
  };

  return (
    <div className="create-course-wrapper">
      <div className="container">
        <h1>Create New Course</h1>
        <form onSubmit={handleSubmit}>
          <div>
            <label htmlFor="title">Course Title:</label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
            />
            {errors.title && <p className="error">{errors.title}</p>}
          </div>

          <div>
            <label htmlFor="description">Course Description:</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="4"
              required
            />
            {errors.description && <p className="error">{errors.description}</p>}
          </div>

          <button type="submit" className="btn create-btn">Create Course</button>
          <button type="button" className="btn cancel-btn" onClick={handleCancel}>Cancel</button>
        </form>
      </div>
    </div>
  );
}

export default LectorCreateCourse;

