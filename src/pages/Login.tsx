import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { motion } from 'framer-motion';
import { LogIn } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const { t, language } = useLanguage();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    try {
      const res = await fetch('http://localhost:3001/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      
      if (res.ok) {
        login(data.token, data.user);
        navigate('/');
      } else {
        setError(data.error || (language === 'mr' ? 'लॉगिन अयशस्वी झाले' : language === 'hi' ? 'लॉगिन विफल' : 'Invalid email or password'));
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
      className="max-w-md mx-auto py-20 px-4 sm:px-6"
    >
      <div className="bg-white p-8 rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-green-100 text-green-600 mb-4">
            <LogIn className="h-8 w-8" />
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900">{t('nav.login')}</h1>
          <p className="text-slate-500 mt-2">
            {language === 'mr' ? 'तुमच्या खात्यात लॉगिन करा आणि शिक्षण सुरू ठेवा.' : language === 'hi' ? 'अपने खाते में लॉगिन करें और सीखना जारी रखें।' : 'Log in to track your learning progress.'}
          </p>
        </div>

        {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-6 text-center">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">{t('auth.email')}</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="user@rurallearn.edu"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all"
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
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all"
              required 
            />
          </div>
          <button 
            type="submit" 
            className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-green-500/30 hover:shadow-green-500/50 transition-all hover:-translate-y-0.5 cursor-pointer"
          >
            {t('nav.login')}
          </button>
        </form>

        <p className="text-center mt-8 text-sm text-slate-500">
          {language === 'mr' ? 'नवीन खाते तयार करायचे आहे?' : language === 'hi' ? 'नया खाता बनाना चाहते हैं?' : "Don't have an account?"}{' '}
          <Link to="/register" className="font-bold text-green-600 hover:text-green-700">
            {t('nav.register')}
          </Link>
        </p>
      </div>
    </motion.div>
  );
}
