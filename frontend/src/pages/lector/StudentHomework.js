import React, { useEffect, useState } from 'react';
import axios from '../../api/axios';
import { useParams, useNavigate, Link } from 'react-router-dom';
import '../../styles/student-homework1.css';
import useAuth from '../../hooks/useAuth';
import Cookies from 'js-cookie';

function StudentHomework() {
  const { courseId, studentId } = useParams();
  const { user, token } = useAuth();

  const [student, setStudent] = useState({});
  const [course, setCourse] = useState({});
  const [homeworks, setHomeworks] = useState([]);
  const [score, setScore] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    async function fetchData() {
      try {
      console.log("🌐 Fetching homework data...");
        const res = await axios.get(`lector/lector/course/${courseId}/student/${studentId}/homeworks/`, {
          headers: { Authorization: `Bearer ${token}` },
        });
              console.log("✅ Response received:", res.data);

        setCourse(res.data.course);
        setStudent(res.data.student);
        setHomeworks(res.data.homeworks);

      // ✅ Set score from fetched data
      // ✅ Corrected check
if (res.data.score !== null && res.data.score !== undefined) {
  const stringScore = res.data.score.toString();
  setScore(stringScore);
  console.log("🎯 Loaded score from backend into input:", stringScore);
} else {
  setScore("");
  console.log("⚠️ No score found. Setting empty.");
}

    } catch (err) {
      console.error("❌ Failed to fetch homework data", err);
    }
  }

    fetchData();
  }, [courseId, studentId, token]);

const handleScoreSubmit = async (e) => {
  e.preventDefault();

  console.log("📤 Attempting to submit score...");
  console.log("📌 courseId:", courseId);
  console.log("📌 studentId:", studentId);
  console.log("✏️ Score value to submit:", score);

  const csrfToken = Cookies.get('csrftoken');
  console.log("🛡️ CSRF token:", csrfToken);

  if (!score || isNaN(score)) {
    console.warn("⚠️ Invalid or empty score. Submission halted.");
    setMessage("❌ Invalid score. Please enter a number.");
    return;
  }

  const url = `/lector/course/${courseId}/student/${studentId}/update-score/`;
  console.log("🔗 API endpoint:", url);

  try {
    const response = await axios.post(url, { score }, {
      headers: {
        Authorization: `Bearer ${token}`,
        'X-CSRFToken': csrfToken, // ✅ CSRF token here
        'Content-Type': 'application/json'
      },
    });

    console.log("✅ Score submission response:", response.data);
    setMessage('✅ Score saved!');
  } catch (err) {
    console.error("❌ Failed to submit score:", err);

    if (err.response) {
      console.error("🧾 Server response data:", err.response.data);
      console.error("📊 Status:", err.response.status);
      console.error("📄 Headers:", err.response.headers);
    } else if (err.request) {
      console.error("📡 No response received:", err.request);
    } else {
      console.error("🚫 Error setting up request:", err.message);
    }

    setMessage('❌ Failed to save score.');
  }
};




  return (
    <div className="StudentHomework">
      <nav className="navbar">
        <ul className="nav-links">
          <li><Link to="/lector/edit-profile">Profile</Link></li>
          <li><Link to="/lector/logout">Logout</Link></li>
          <li><Link to={`/lector/course/${courseId}`}>Back to Course</Link></li>
        </ul>
        <div className="user-info">
          <span>Welcome {user?.username}</span>
        </div>
      </nav>

      <div className="main-content">
        {student && <h2>Student: {student.username}</h2>}

        <p><strong>Course:</strong> {course.title}</p>

<div className="materials-section">
  <h2>Homework</h2>
  {homeworks?.length > 0 ? (
    homeworks.map(hw => (
      <div key={hw.id} className="material-item">
        <a
          href={hw.file}
          target="_blank"
          rel="noopener noreferrer"
          download={hw.file_name} // ✅ this triggers file download
        >
          View or Download: {hw.file_name}
        </a>
      </div>
    ))
  ) : (
    <p>No homework submitted yet.</p>
  )}
</div>


        <div className="score-section">
          {score !== "" && (
  <p style={{ color: 'white', fontWeight: 'bold', marginTop: '10px' }}>
    Current Score: {score}
  </p>
)}

          <form onSubmit={handleScoreSubmit}>
            <label htmlFor="score"><strong>Score:</strong></label>
            <input
              type="number"
              id="score"
              name="score"
                className="score-input-field"

              value={score}
              onChange={(e) => setScore(e.target.value)}
            />
            <button type="submit" className="save-btn">Save Score</button>
          </form>
          {message && <p>{message}</p>}
        </div>
      </div>
    </div>
  );
}

export default StudentHomework;
