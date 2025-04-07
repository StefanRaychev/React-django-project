// LectorPersonalDashboard.js
import { Link } from 'react-router-dom';
import '../../styles/personal-dashboard3.css'; // adjust path if needed
import useAuth from '../../hooks/useAuth';
import React, { useEffect, useState } from 'react';
import axios from '../../api/axios';




function LectorPersonalDashboard() {
  const { user, token } = useAuth();
  const [courses, setCourses] = useState([]);

console.log('user in dashboard:', user);

useEffect(() => {
  console.log('user in dashboard:', user);
}, [user]);

  useEffect(() => {
    async function fetchMyCourses() {
      try {
        const response = await axios.get('/lector/my-courses/', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setCourses(response.data);
      } catch (error) {
        console.error('Failed to fetch personal courses', error);
      }
    }

    if (token) fetchMyCourses();
  }, [token]);

  return (
    <div className="lector-dashboard-wrapper">
      {/* Navigation Bar */}
      <nav className="navbar">
        <ul className="nav-links">
          <li><Link to="/lector/edit-profile">Profile</Link></li>
          <li>
            <form method="POST" action="/api/lector/logout">
              <button type="submit" className="nav-link-button">Logout</button>
            </form>
          </li>
          <li><Link to="/lector/dashboard">All Courses</Link></li>
        </ul>
        <div className="user-info">
<span>Welcome Lector: {user?.username}</span>
        </div>
      </nav>

      {/* Main Content */}
      <div className="main-content">
        <h1>Welcome to My Courses Dashboard</h1>

        <div className="create-course-container">
          <Link to="/lector/create-course" className="btn create-course-btn">
            Create New Course
          </Link>
        </div>

        <div className="courses-container">
          {courses.length > 0 ? (
            courses.map((course) => (
              <div className="course-box" key={course.id}>
                <h2 className="course-title">{course.title}</h2>
                <p className="course-author">Author: {course.author}</p>
                <p className="course-author">Number of Enrolled Students: {course.student_count}</p>

                <div className="course-actions">
                  <Link to={`/lector/edit-course/${course.id}`} className="btn edit">Edit</Link>
                  <Link to={`/lector/course/${course.id}`} className="btn enter">Enter</Link>
                  <Link to={`/lector/delete-course/${course.id}`} className="btn delete">Delete</Link>
                </div>
              </div>
            ))
          ) : (
            <p>No courses created yet. Create a course to display it here.</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default LectorPersonalDashboard;

