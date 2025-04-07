import { Link } from 'react-router-dom';
import '../../styles/personal-dashboard3.css';
import useAuth from '../../hooks/useAuth';
import React, { useEffect, useState } from 'react';
import axios from '../../api/axios';

function StudentPersonalDashboard() {
  const { user, token } = useAuth();
  const [courses, setCourses] = useState([]);

useEffect(() => {
  async function fetchMyCourses() {
    try {
      const response = await axios.get('/student/my-courses/', {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log("📦 My enrolled courses:", response.data);
      setCourses(response.data);
    } catch (error) {
      console.error('❌ Failed to fetch personal courses', error);
    }
  }

  if (token) fetchMyCourses();
}, [token]);

  const handleLogout = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/student/logout/', {}, {
        headers: { 'X-CSRFToken': document.cookie.split('csrftoken=')[1] },
        withCredentials: true,
      });
      window.location.href = '/';
    } catch (err) {
      console.error('Logout failed', err);
    }
  };

const handleRemove = async (courseId) => {
  try {
    await axios.post(`/student/remove-applied/${courseId}/`, {}, {
      headers: {
        'X-CSRFToken': document.cookie.split('csrftoken=')[1],
      },
      withCredentials: true,
    });
    // Refresh course list after removal
    setCourses(prev => prev.filter(c => c.id !== courseId));
  } catch (err) {
    console.error("❌ Remove failed", err);
  }
};

  return (
    <div className="lector-dashboard-wrapper">
      {/* Navigation Bar */}
      <nav className="navbar">
        <ul className="nav-links">
          <li><Link to="/student/edit-profile">Profile</Link></li>
          <li><Link to="/student/dashboard">All Courses</Link></li>
          <li>
            <button onClick={handleLogout} className="nav-link-button">Logout</button>
          </li>
        </ul>
        <div className="user-info">
          <span>Welcome, {user?.username}</span>
        </div>
      </nav>

      {/* Main Content */}
      <div className="main-content">
        <h1>Welcome to My Courses Dashboard</h1>

        <div className="courses-container">
          {Array.isArray(courses) && courses.length > 0 ? (
            courses.map((course) => (
              <div className="course-box" key={course.id}>
                <h2 className="course-title">{course.title}</h2>
                <p className="course-author">Author: {course.author}</p>

                <div className="course-actions">
                  <Link to={`/student/course/${course.id}`} className="btn edit">Enter</Link>

                  <button
                    onClick={() => handleRemove(course.id)}
                    className="btn delete"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))
          ) : (
            <p>No courses created yet. Apply for a course to display it here.</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default StudentPersonalDashboard;
