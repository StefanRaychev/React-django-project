
import React from 'react';
import '../../styles/course-delete1.css';
import { useNavigate, useParams } from 'react-router-dom';
import axios from '../../api/axios';
import Cookies from 'js-cookie';

function LectorCourseDeleteConfirmation() {
  const navigate = useNavigate();
  const {id} = useParams();

  const handleDelete = async () => {
        console.log('🟠 Trying to delete course ID:', id);

    try {
      const csrfToken = Cookies.get('csrftoken');
      await axios.delete(`/lector/delete-course/${id}/`, {
        headers: {'X-CSRFToken': csrfToken},
      });
      navigate('/lector/personal-dashboard');
    } catch (err) {
      console.error('Failed to delete course:', err);
    }
  };

  return (
      <div className="delete-course-wrapper">
        <div className="container">
          <h1>Delete Course</h1>
          <p>
            Are you sure you want to delete the course <strong>this course</strong>?
          </p>
          <p>This action cannot be undone.</p>

          <button type="button" onClick={handleDelete} className="btn delete-btn">Yes, Delete</button>
          <button onClick={() => navigate('/lector/personal-dashboard')} className="btn cancel-btn">Cancel</button>
        </div>
      </div>
  );
}
export default LectorCourseDeleteConfirmation;
