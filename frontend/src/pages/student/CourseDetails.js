import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import axios from '../../api/axios';
import Cookies from 'js-cookie';
import '../../styles/course-detail1.css';

function CourseDetails() {
  const { id } = useParams(); // course_id
  const { user } = useAuth();

  const [course, setCourse] = useState(null);
  const [score, setScore] = useState(null);
  const [homeworks, setHomeworks] = useState([]);
  const [homeworkFiles, setHomeworkFiles] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchCourseDetails = async () => {
      try {
        const response = await axios.get(`/student/course/${id}/`);
        console.log('📦 Course detail:', response.data);
        setCourse(response.data.course);
        setScore(response.data.score);
        setHomeworks(response.data.homeworks || []);
      } catch (err) {
        console.error('❌ Error loading course details:', err);
        setError('Failed to load course.');
      }
    };
    fetchCourseDetails();
  }, [id]);

  const handleHomeworkUpload = async (e) => {
  e.preventDefault();
  const formData = new FormData();
  const csrfToken = Cookies.get('csrftoken');

  console.log("📁 Files selected for upload:", homeworkFiles);
  for (let i = 0; i < homeworkFiles.length; i++) {
    console.log("📤 Appending file:", homeworkFiles[i]);
    formData.append('file', homeworkFiles[i]);  // ✅ Correct key name
  }

  try {
    const res = await axios.post(`/student/course/${id}/upload-homework/`, formData, {
      headers: {
        'X-CSRFToken': csrfToken,
        'Content-Type': 'multipart/form-data',
      },
      withCredentials: true,
    });
    console.log("✅ Homework uploaded response:", res.data);
    alert('✅ Homework uploaded!');
    window.location.reload();
  } catch (err) {
    console.error('❌ Upload failed:', err);
    alert('Failed to upload homework.');
  }
};

const handleDeleteHomework = async (homeworkId) => {
  const csrfToken = Cookies.get('csrftoken');
  try {
    await axios.delete(`/student/homework/${homeworkId}/delete/`, {
      headers: { 'X-CSRFToken': csrfToken },
      withCredentials: true,
    });
    alert('🗑️ Homework deleted!');
    window.location.reload();
  } catch (err) {
    console.error('❌ Deletion failed:', err);
  }
};


  if (error) return <div className="lector-course-detail-wrapper">{error}</div>;
  if (!course) return <div className="lector-course-detail-wrapper">Loading...</div>;

  return (
    <div className="lector-course-detail-wrapper">
      <nav className="lcd-navbar">
        <ul className="lcd-nav-links">
          <li><a href="/student/edit-profile">Profile</a></li>
          <li><a href="/student/dashboard">All Courses</a></li>
          <li><a href="/student/personal-dashboard">My Courses</a></li>
        </ul>
        <div className="lcd-user-info">
          <span>Welcome {user?.username}, you are in "{course.title}" course</span>
        </div>
      </nav>

      <div className="lcd-main-content">
        <h1>Course: {course.title}</h1>
        <p><strong>Author:</strong> {course.author?.username}</p>
        <p><strong>Description:</strong> {course.description}</p>
        <p><strong>Score:</strong> {score || 'Not yet graded'}</p>

        <div className="lcd-materials-section">
          <h2>Textbooks</h2>
          {course.textbook_files?.length > 0 ? (
            course.textbook_files.map((tb, i) => (
              <div key={tb.id} className="lcd-material-item">
                <a
                  href={tb.file}
                  target="_blank"
                  rel="noopener noreferrer"
                  download
                >
                  {i + 1}. {tb.file_name}
                </a>
              </div>
            ))
          ) : (
            <p>No textbooks uploaded yet.</p>
          )}
        </div>

        <div className="lcd-materials-section">
          <h2>Your Homeworks</h2>
          {homeworks.length > 0 ? (
            homeworks.map((hw, i) => (
              <div key={hw.id} className="lcd-material-item">
<a href={hw.file} target="_blank" rel="noopener noreferrer" download>
  📎 {hw.file_name}
</a>

                <button
                  onClick={() => handleDeleteHomework(hw.id)}
                  className="lcd-btn lcd-delete-btn"
                >
                  Delete Homework
                </button>
              </div>
            ))
          ) : (
            <p>No homeworks uploaded yet.</p>
          )}
        </div>

        <form onSubmit={handleHomeworkUpload} className="lcd-upload-form">
          <input
            type="file"
            name="homeworks"
            multiple
            className="lcd-file-input"
            onChange={(e) => setHomeworkFiles([...e.target.files])}
          />
          <button type="submit" className="lcd-btn lcd-upload-btn">Upload Homework</button>
        </form>
      </div>
    </div>
  );
}

export default CourseDetails;

