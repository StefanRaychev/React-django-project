import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import axios from '../../api/axios';
import Cookies from 'js-cookie';
import '../../styles/course-detail1.css';
import { Link } from 'react-router-dom';

function LectorCourseDetail() {
  const { id } = useParams(); // ✅ matches :id in route
  const { user } = useAuth();
  const navigate = useNavigate();

  const [course, setCourse] = useState(null);
  const [textbookFile, setTextbookFile] = useState(null);
  const [error, setError] = useState('');

useEffect(() => {
  const fetchCourse = async () => {
    try {
      const res = await axios.get(`lector/courses/${id}/`);
      console.log('📥 Received course from API:', res.data);
      if (res.data.textbook_files) {
        console.log('📚 Textbook files from API:', res.data.textbook_files);
      } else {
        console.warn('⚠️ No textbook_files field found in course data');
      }
      setCourse(res.data);
    } catch (err) {
      console.error('❌ Failed to load course:', err);
      setError('Course not found or error loading data.');
    }
  };
  fetchCourse();
}, [id]);


const handleUpload = async (e) => {
  e.preventDefault();
  const csrfToken = Cookies.get('csrftoken');

  const formData = new FormData();
  formData.append('textbooks', textbookFile);

  console.log('📤 Starting textbook upload...');
  console.log('📁 File name:', textbookFile?.name);
  console.log('🔐 CSRF Token:', csrfToken);
  console.log('🚀 API Endpoint:', `lector/course/${id}/upload-textbook/`);

  try {
    const response = await axios.post(`lector/course/${id}/upload-textbook/`, formData, {
      headers: {
        'X-CSRFToken': csrfToken,
        'Content-Type': 'multipart/form-data',
      },
    });

    console.log('✅ Upload response:', response);
    alert('✅ Textbook uploaded successfully!');
    window.location.reload();
  } catch (err) {
    console.error('❌ Upload failed:', err);
    if (err.response) {
      console.error('⚠️ Server Response:', err.response.data);
    } else {
      console.error('⚠️ No server response.');
    }
  }
};


  const handleDeleteTextbook = async (textbookId) => {
    const csrfToken = Cookies.get('csrftoken');
    try {
      await axios.delete(`lector/textbooks/${textbookId}/`, {
        headers: { 'X-CSRFToken': csrfToken },
      });
      window.location.reload();
      alert('✅ Textbook deleted!');

    } catch (err) {
      console.error('Delete failed', err);
    }
  };

  if (error) return <div className="lector-course-detail-wrapper">{error}</div>;
  if (!course) return <div className="lector-course-detail-wrapper">Loading...</div>;

  return (
    <div className="lector-course-detail-wrapper">
      <nav className="lcd-navbar">
        <ul className="lcd-nav-links">
          <li><Link to="/lector/edit-profile">Profile</Link></li>
          <li><Link to="/lector/logout">Logout</Link></li>
          <li><a href="/lector/personal-dashboard">My Courses</a></li>
        </ul>
        <div className="lcd-user-info">
          <span>Welcome {user?.username}, you are in "{course.title}" course</span>
        </div>
      </nav>

      <div className="lcd-main-content">
        <h1>Course: {course.title}</h1>
        <p><strong>Description:</strong> {course.description}</p>

        <div className="lcd-students-section">
          <h2>Enrolled Students</h2>
          {course.students?.length > 0 ? (
            <ul>
              {course.students.map((student) => (
                <li key={student.id}><Link to={`/lector/lector/course/${course.id}/student/${student.id}`}>{student.username}</Link>
                </li>
              ))}
            </ul>
          ) : (
            <p>No students enrolled in this course yet.</p>
          )}
        </div>

        <div className="lcd-materials-section">
          <h2>Textbooks</h2>

          {course.textbook_files?.length > 0 ? (
            course.textbook_files.map((tb, i) => (
              <div key={tb.id} className="lcd-material-item">

                <a
  href={tb.file}   download // ✅ This triggers download instead of opening in-browser
  target="_blank"
  rel="noopener noreferrer"
>
                    {i + 1}. {tb.file_name.endsWith('.pdf') ? '📄' : '📁'} {tb.file_name}
</a>>

                <button
                  onClick={() => handleDeleteTextbook(tb.id)}
                  className="lcd-btn lcd-delete-btn"
                >
                  Delete Textbook
                </button>
              </div>
            ))
          ) : (
            <p>No textbooks uploaded yet.</p>
          )}

          <form onSubmit={handleUpload} className="lcd-upload-form">
            <input
              type="file"
              name="textbooks"
              className="lcd-file-input"
              onChange={(e) => setTextbookFile(e.target.files[0])}
              required
            />
            <button type="submit" className="lcd-btn lcd-upload-btn">Upload Textbook</button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default LectorCourseDetail;