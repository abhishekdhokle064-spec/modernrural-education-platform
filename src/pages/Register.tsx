import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { motion } from 'framer-motion';
import { UserPlus } from 'lucide-react';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('Student');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const { t, language } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();

  const enrollCourseId = (location.state as any)?.enrollCourseId;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    try {
      const res = await fetch('http://localhost:3001/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, role })
      });
      const data = await res.json();
      
      if (res.ok) {
        login(data.token, data.user);
        
        // If user came by clicking Enroll on a specific course, auto-enroll them
        if (enrollCourseId) {
          try {
            await fetch('http://localhost:3001/api/enrollments', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${data.token}`
              },
              body: JSON.stringify({ course_id: enrollCourseId })
            });
          } catch (enrollErr) {
            console.error('Auto-enroll error', enrollErr);
          }
          navigate('/courses');
        } else {
          navigate('/');
        }
      } else {
        setError(data.error || (language === 'mr' ? 'नोंदणी अयशस्वी झाली' : language === 'hi' ? 'पंजीकरण विफल' : 'Registration failed'));
      }
    } catch (err) {
      setError(language === 'mr' ? 'सर्व्हरशी संपर्क होऊ शकला नाही' : language === 'hi' ? 'सर्वर से संपर्क विफल' : 'Failed to connect to server');
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="max-w-md mx-auto py-12 px-4 sm:px-6"
    >
      <div className="bg-white p-8 rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-emerald-100 text-emerald-600 mb-4">
            <UserPlus className="h-8 w-8" />
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900">{t('nav.register')}</h1>
          <p className="text-slate-500 mt-2">
            {language === 'mr' ? 'रुरल-लर्न समुदायात सामील व्हा आणि शिकणे सुरू करा.' : language === 'hi' ? 'रूरल-लर्न से जुड़ें और अपना कौशल बढ़ाएं।' : 'Join RuralLearn to start your journey.'}
          </p>
        </div>

        {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-6 text-center">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">
              {language === 'mr' ? 'मी एक...' : language === 'hi' ? 'मेरी भूमिका...' : 'I am a...'}
            </label>
            <select 
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all bg-white"
            >
              <option value="Student">{t('portal.student')}</option>
              <option value="Trainer">{t('portal.trainer')}</option>
              <option value="Recruiter">{t('portal.recruiter')}</option>
              <option value="Admin">{t('portal.admin')}</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">{t('auth.name')}</label>
            <input 
              type="text" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Vikram Rathod"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
              required 
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">{t('auth.email')}</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="user@rurallearn.edu"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
              required 
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">{t('auth.password')}</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
              required 
            />
          </div>
          <button 
            type="submit" 
            className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50 transition-all hover:-translate-y-0.5 cursor-pointer"
          >
            {t('nav.register')}
          </button>
        </form>

        <p className="text-center mt-8 text-sm text-slate-500">
          {language === 'mr' ? 'आधीच खाते आहे?' : language === 'hi' ? 'पहले से खाता है?' : 'Already have an account?'}{' '}
          <Link to="/login" className="font-bold text-emerald-600 hover:text-emerald-700">
            {t('nav.login')}
          </Link>
        </p>
      </div>
    </motion.div>
  );
}
