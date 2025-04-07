import React, { useEffect, useState } from 'react';
import axios from '../../api/axios';
import useAuth from '../../hooks/useAuth';
import '../../styles/dashboard2_scoped.css';
import { useNavigate } from 'react-router-dom';

const LectorDashboard = () => {
  const { user, token, logout } = useAuth();
const [username, setUsername] = useState(user?.username || '');
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();


  useEffect(() => {
  setUsername(user?.username || '');
}, [user]);


  useEffect(() => {
    async function fetchCourses() {
      try {
const response = await axios.get('lector/all-courses/');

        setCourses(response.data);
      } catch (err) {
        setError('No courses available yet.');
      } finally {
        setLoading(false);
      }
    }

    fetchCourses();
  }, [token]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="dashboard-wrapper"> {/* ✅ WRAPPER CLASS ADDED */}
      <nav className="navbar">
        <ul className="nav-links">
          <li>
            <button className="nav-link-button" onClick={() => navigate('/lector/edit-profile')}>
              Profile
            </button>
          </li>
          <li>
            <button className="nav-link-button" onClick={handleLogout}>
              Logout
            </button>
          </li>
          <li>
            <button className="nav-link-button" onClick={() => navigate('/lector/personal-dashboard')}>
              My Courses
            </button>
          </li>
        </ul>
        <div className="user-info">
          Welcome Lector: {username}
        </div>
      </nav>

      <div className="main-content">
        <h1>All Courses</h1>

        {loading && <p>Loading courses...</p>}
        {error && <p className="error-message">{error}</p>}

        <div className="courses-container">
          {!loading && !error && courses.length > 0 ? (
            courses.map(course => (
              <div key={course.id} className="course-box">
                <h2 className="course-title">{course.title}</h2>
                <p className="course-author"><strong>Author:</strong> {course.author}</p>
                <p className="course-description"><strong>Description:</strong> {course.description}</p>
              </div>
            ))
          ) : (
            !loading && !error && <p>No courses have been created yet.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default LectorDashboard;
