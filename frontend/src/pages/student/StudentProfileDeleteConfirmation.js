
import React from 'react';
import '../../styles/course-delete1.css';
import { useNavigate, useParams } from 'react-router-dom';
import axios from '../../api/axios';
import Cookies from 'js-cookie';
import useAuth from '../../hooks/useAuth';

function StudentProfileDeleteConfirmation() {

  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleDelete = async () => {
    try {
      await axios.delete('/student/profile/', {
        withCredentials: true,
        headers: {
          'X-CSRFToken': getCookie('csrftoken')
        }
      });

      logout(); // clear context + localStorage
      navigate('/'); // go to homepage or login
    } catch (err) {
      console.error('Profile deletion failed', err);
      alert('Something went wrong.');
    }
  };

  const getCookie = (name) => {
    const cookie = document.cookie
      .split('; ')
      .find((row) => row.startsWith(name + '='));
    return cookie ? decodeURIComponent(cookie.split('=')[1]) : null;
  };

  const handleCancel = () => {
    navigate('/student/dashboard');
  };

  return (
    <div className="profile-delete-wrapper">
      <div className="container">
        <h1>Are you sure you want to delete your profile?</h1>
        <p>This action cannot be undone.</p>

        <button className="btn delete" onClick={handleDelete}>
          Yes, Delete
        </button>

        <button className="btn cancel" onClick={handleCancel}>
          Cancel
        </button>
      </div>
    </div>
  );
}

export default StudentProfileDeleteConfirmation;
