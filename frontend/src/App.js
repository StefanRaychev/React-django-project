import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import Home from './pages/Home';

// Lector pages
import LectorDashboard from './pages/lector/LectorDashboard';
import LectorLoginPage from './pages/lector/LectorLoginPage';
import LectorRegisterPage from './pages/lector/LectorRegistration';
import LectorProfileEdit from './pages/lector/LectorProfileEdit';
import LectorCourseDetail from './pages/lector/LectorCourseDetail';
import LectorCreateCourse from './pages/lector/LectorCreateCourse';
import LectorEditCourse from './pages/lector/LectorEditCourse';
import LectorPersonalDashboard from './pages/lector/LectorPersonalDashboard';
import LectorCourseDeleteConfirmation from './pages/lector/LectorCourseDeleteConfirmation';
import LectorProfileDeleteConfirmation from './pages/lector/LectorProfileDeleteConfirmation';

// Student pages
import StudentDashboard from './pages/student/StudentDashboard';
import StudentLoginPage from './pages/student/StudentLoginPage';
import StudentRegisterPage from './pages/student/StudentRegistration';
import StudentProfileEditPage from './pages/student/StudentProfileEditPage';
import StudentPersonalDashboard from './pages/student/StudentPersonalDashboard';
import StudentHomework from './pages/lector/StudentHomework';
import StudentProfileDeleteConfirmation from './pages/student/StudentProfileDeleteConfirmation';
import CourseDetails from './pages/student/CourseDetails';


// Route guards
import PrivateRoute from './components/PrivateRoute';
import PublicRoute from './components/PublicRoute';

function App() {
  return (
      <Routes>
        {/* Public Landing Page */}
        <Route path="/" element={<Home />} />

        {/* Lector Routes */}
        <Route
          path="/lector/login"
          element={
            <PublicRoute>
              <LectorLoginPage />
            </PublicRoute>
          }
        />
        <Route
          path="/lector/register"
          element={
            <PublicRoute>
              <LectorRegisterPage />
            </PublicRoute>
          }
        />
        <Route
          path="/lector/dashboard"
          element={
            <PrivateRoute>
              <LectorDashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/lector/personal-dashboard"
          element={
            <PrivateRoute>
              <LectorPersonalDashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/lector/edit-profile"
          element={
            <PrivateRoute>
              <LectorProfileEdit />
            </PrivateRoute>
          }
        />
        <Route
          path="/lector/delete-profile"
          element={
            <PrivateRoute>
              <LectorProfileDeleteConfirmation />
            </PrivateRoute>
          }
        />
        <Route
          path="/lector/create-course"
          element={
            <PrivateRoute>
              <LectorCreateCourse />
            </PrivateRoute>
          }
        />
        <Route
          path="/lector/edit-course/:id"
          element={
            <PrivateRoute>
              <LectorEditCourse />
            </PrivateRoute>
          }
        />
        <Route
          path="/lector/course/:id"
          element={
            <PrivateRoute>
              <LectorCourseDetail />
            </PrivateRoute>
          }
        />
        <Route
          path="/lector/delete-course/:id"
          element={
            <PrivateRoute>
              <LectorCourseDeleteConfirmation />
            </PrivateRoute>
          }
        />

        {/* Student Routes */}
        <Route
          path="/student/login"
          element={
            <PublicRoute>
              <StudentLoginPage />
            </PublicRoute>
          }
        />
        <Route
          path="/student/register"
          element={
            <PublicRoute>
              <StudentRegisterPage />
            </PublicRoute>
          }
        />
        <Route
          path="/student/dashboard"
          element={
            <PrivateRoute>
              <StudentDashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/student/personal-dashboard"
          element={
            <PrivateRoute>
              <StudentPersonalDashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/student/edit-profile"
          element={
            <PrivateRoute>
              <StudentProfileEditPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/student/delete-profile"
          element={
            <PrivateRoute>
              <StudentProfileDeleteConfirmation />
            </PrivateRoute>
          }
        />
        <Route
  path="lector/lector/course/:courseId/student/:studentId"
          element={
            <PrivateRoute>
              <StudentHomework />
            </PrivateRoute>
          }
        />

        {/* Shared Route */}
        <Route
          path="/student/course/:id"
          element={
            <PrivateRoute>
              <CourseDetails />
            </PrivateRoute>
          }
        />
      </Routes>
  );
}

export default App;
