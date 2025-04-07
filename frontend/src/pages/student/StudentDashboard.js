import React, { useEffect, useState } from 'react';
import axios from '../../api/axios';
import useAuth from '../../hooks/useAuth';
import '../../styles/StudentDashboard.css';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';

const StudentDashboard = () => {
  const { user, token, logout } = useAuth();
const [username, setUsername] = useState(user?.username || '');
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

useEffect(() => {
  async function fetchCourses() {
    try {
      const allCoursesResponse = await axios.get('/lector/all-courses/', {
        headers: { Authorization: `Bearer ${token}` }
      });

      const myCoursesResponse = await axios.get('/student/my-courses/', {
        headers: { Authorization: `Bearer ${token}` }
      });

      const myAppliedIds = myCoursesResponse.data.map(course => course.id);
      const updated = allCoursesResponse.data.map(course => ({
        ...course,
        applied: myAppliedIds.includes(course.id),
      }));

      setCourses(updated);
    } catch (err) {
      setError('Failed to load courses.');
      console.error("❌ Fetch error:", err);
    } finally {
      setLoading(false);
    }
  }

  if (token) fetchCourses();
}, [token]);


    const handleLogout = () => {
    logout();
    navigate('/');
  };


const handleApply = async (courseId) => {
  console.log("🚀 Applying for course ID:", courseId);

  try {
    const csrfToken = Cookies.get('csrftoken');

    const response = await axios.post(`/student/apply/${courseId}/`, {}, {
      headers: {
        Authorization: `Bearer ${token}`,
        'X-CSRFToken': csrfToken,     // ✅ Important!
        'Content-Type': 'application/json',
      },
      withCredentials: true           // ✅ Also important if using cookies
    });

    console.log("✅ Successfully applied:", response.data);

    setCourses(prevCourses =>
      prevCourses.map(course =>
        course.id === courseId ? { ...course, applied: true } : course
      )
    );
  } catch (error) {
    console.error("❌ Error applying for course:", error);
  }
};







  return (
    <div className="dashboard-wrapper">
      {/* Navigation Bar */}
      <nav className="navbar">
        <ul className="nav-links">
          <li><a href="/student/edit-profile">Profile</a></li>
          <li><a href="/student/personal-dashboard">My Courses</a></li>
          <li>
                          <button className="nav-link-button" onClick={handleLogout}>
              Logout
            </button>
          </li>
        </ul>
        <div className="user-info">
          <span>Welcome, student {user?.username}</span>
        </div>
      </nav>

      {/* Main Content Section */}
      <div className="main-content">
        <h1>All Courses</h1>

        <div className="courses-container">
          {loading && <p>Loading courses...</p>}
          {error && <p className="error-message">{error}</p>}

          {!loading && !error && courses.length > 0 ? (
            courses.map(course => (
              <div key={course.id} className="course-box">
                <h2 className="course-title">{course.title}</h2>
                <p className="course-author">Author: {course.author}</p>
                <p className="course-description">{course.description}</p>
{course.applied ? (
  <button disabled className="btn applied-btn">Applied!</button>
) : (
  <button onClick={() => handleApply(course.id)} className="btn apply-btn">Apply</button>
)}
              </div>
            ))
          ) : (
            <p>No courses created yet.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
