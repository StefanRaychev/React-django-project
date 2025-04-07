import React, { useState, useEffect } from 'react';
import '../../styles/edit_course.css';
import { useNavigate, useParams } from 'react-router-dom';
import axios from '../../api/axios';
import Cookies from 'js-cookie';

function LectorEditCourse() {
  const { id } = useParams();
  const [formData, setFormData] = useState({ title: '', description: '' });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // 🟡 Fetch course data on mount
  useEffect(() => {
    const fetchCourse = async () => {
      try {
        console.log(`📡 Fetching course data from: /lector/courses/${id}/`);
        const response = await axios.get(`/lector/courses/${id}/`);
        console.log('📥 Received course data:', response.data);

        setFormData({
          title: response.data.title,
          description: response.data.description,
        });
        setLoading(false);
      } catch (error) {
        console.error('❌ Error fetching course:', error);
        if (error.response) {
          console.error('❗ Backend responded with:', error.response.status, error.response.data);
        }
        setLoading(false);
      }
    };
    fetchCourse();
  }, [id]);

  // 🟠 Handle form field changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    console.log(`✏️ Field changed: ${name} = ${value}`);
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // 🔴 Submit edited course data
  const handleSubmit = async (e) => {
    e.preventDefault();
    const url = `/lector/edit-course/${id}/`;
    const csrfToken = Cookies.get('csrftoken');

    try {
      console.log(`📤 Sending PUT request to: ${url}`);
      console.log('📦 Payload:', formData);
      console.log('🔐 CSRF Token:', csrfToken);

      const response = await axios.put(url, formData, {
        headers: {
          'X-CSRFToken': csrfToken,
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      });

      console.log("✅ Course update response:", response);
      console.log("✅ Course updated successfully:", response.data);

      navigate('/lector/personal-dashboard');
    } catch (error) {
      console.error('❌ Error during update request:', error);
      if (error.response) {
        console.error('⚠️ Response status:', error.response.status);
        console.error('⚠️ Response headers:', error.response.headers);
        console.error('⚠️ Response data:', error.response.data);
      } else if (error.request) {
        console.error('⚠️ No response received:', error.request);
      } else {
        console.error('⚠️ Request setup error:', error.message);
      }
    }
  };

  if (loading) return <div>⏳ Loading course...</div>;

  return (
    <div className="edit-course-wrapper">
      <div className="edit-course-container">
        <h1>Edit Course</h1>
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
          </div>
          <div>
            <label htmlFor="description">Course Description:</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
            />
          </div>
          <div className="button-group">
            <button type="submit" className="btn create-btn">Save Changes</button>
            <a href="/lector/personal-dashboard" className="btn cancel-btn">Cancel</a>
          </div>
        </form>
      </div>
    </div>
  );
}

export default LectorEditCourse;
