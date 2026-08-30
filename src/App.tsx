import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { LanguageProvider } from './context/LanguageContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AnimatePresence } from 'framer-motion';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Home from './pages/Home';
import Courses from './pages/Courses';
import Labs from './pages/Labs';
import Internships from './pages/Internships';
import AIAdvisor from './pages/AIAdvisor';
import Progress from './pages/Progress';
import Projects from './pages/Projects';
import Notifications from './pages/Notifications';
import Certifications from './pages/Certifications';
import Login from './pages/Login';
import Register from './pages/Register';
import CourseEnroll from './pages/CourseEnroll';
import CourseLearn from './pages/CourseLearn';

function ProtectedRoute({ allowedRoles, children }: { allowedRoles?: string[]; children: React.ReactNode }) {
  const { user, isAuthenticated } = useAuth();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const role = user?.role || 'Student';
  if (allowedRoles && !allowedRoles.includes(role) && role !== 'Admin') {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

function AnimatedRoutes() {
  const location = useLocation();
  
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Home />} />
        <Route path="/courses" element={<Courses />} />
        <Route path="/courses/:id/enroll" element={<CourseEnroll />} />
        <Route path="/courses/:id/login" element={<CourseEnroll />} />
        <Route path="/courses/:id/learn" element={
          <ProtectedRoute allowedRoles={['Student', 'Trainer', 'Admin']}>
            <CourseLearn />
          </ProtectedRoute>
        } />
        <Route path="/labs" element={<Labs />} />
        <Route path="/internships" element={<Internships />} />
        <Route path="/projects" element={<Projects />} />
        <Route path="/ai-advisor" element={<AIAdvisor />} />
        <Route path="/progress" element={
          <ProtectedRoute>
            <Progress />
          </ProtectedRoute>
        } />
        <Route path="/notifications" element={
          <ProtectedRoute>
            <Notifications />
          </ProtectedRoute>
        } />
        <Route path="/certifications" element={<Certifications />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Routes>
    </AnimatePresence>
  );
}

function MainLayout() {
  const { isAuthenticated } = useAuth();
  
  return (
    <div className="flex flex-col min-h-screen bg-slate-50 font-sans selection:bg-green-500 selection:text-white">
      <Navbar />
      <div className="flex flex-grow max-w-[100vw] overflow-x-hidden">
        {isAuthenticated && <Sidebar />}
        <main className="flex-grow w-full">
          <AnimatedRoutes />
        </main>
      </div>
      <footer className="bg-slate-900 text-slate-400 py-10 text-center border-t border-slate-800">
        <p className="font-medium">© 2024 RuralLearn. Empowering the future.</p>
      </footer>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <LanguageProvider>
        <Router>
          <MainLayout />
        </Router>
      </LanguageProvider>
    </AuthProvider>
  );
}

export default App;
