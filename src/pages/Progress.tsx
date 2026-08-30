import React, { useState, useEffect } from 'react';
import { Award, BookOpen, CheckCircle, Clock, Zap, Target, TrendingUp, Save, MapPin, GraduationCap, Link as LinkIcon, Briefcase } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

export default function Progress() {
  const { t, language } = useLanguage();
  const { user, token, updateUser, isAuthenticated } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [labBookings, setLabBookings] = useState<any[]>([]);
  const [certificates, setCertificates] = useState<any[]>([]);
  const [trainerStudents, setTrainerStudents] = useState<any[]>([]);
  const [recruiterApplicants, setRecruiterApplicants] = useState<any[]>([]);
  const [adminUsers, setAdminUsers] = useState<any[]>([]);
  const [adminStats, setAdminStats] = useState<any>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    education: '',
    branch: '',
    year: '',
    location: '',
    skills: '',
    interests: '',
    preference: 'Both',
    career_goal: '',
    preferred_courses: '',
    photo: '',
    resume: ''
  });

  useEffect(() => {
    if (user && token) {
      setFormData({
        name: user.name || '',
        education: user.education || '',
        branch: user.branch || '',
        year: user.year || '',
        location: user.location || '',
        skills: user.skills || '',
        interests: user.interests || '',
        preference: user.preference || 'Both',
        career_goal: user.career_goal || '',
        preferred_courses: user.preferred_courses || '',
        photo: user.photo || '',
        resume: user.resume || ''
      });
      
      // Fetch enrollments
      fetch('http://localhost:3001/api/enrollments', {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setEnrollments(data);
      })
      .catch(console.error);
      
      // Fetch lab bookings
      fetch('http://localhost:3001/api/bookings', {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setLabBookings(data);
      })
      .catch(console.error);

      // Fetch certificates
      fetch('http://localhost:3001/api/certificates', {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setCertificates(data);
      })
      .catch(console.error);

      // Fetch Trainer Data
      if (user.role === 'Trainer' || user.role === 'Admin') {
        fetch('http://localhost:3001/api/trainer/students', {
          headers: { Authorization: `Bearer ${token}` }
        })
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) setTrainerStudents(data);
        })
        .catch(console.error);
      }

      // Fetch Recruiter Data
      if (user.role === 'Recruiter' || user.role === 'Admin') {
        fetch('http://localhost:3001/api/recruiter/applicants', {
          headers: { Authorization: `Bearer ${token}` }
        })
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) setRecruiterApplicants(data);
        })
        .catch(console.error);
      }

      // Fetch Admin Data
      if (user.role === 'Admin') {
        fetch('http://localhost:3001/api/admin/users', {
          headers: { Authorization: `Bearer ${token}` }
        })
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) setAdminUsers(data);
        })
        .catch(console.error);

        fetch('http://localhost:3001/api/admin/stats', {
          headers: { Authorization: `Bearer ${token}` }
        })
        .then(res => res.json())
        .then(data => setAdminStats(data))
        .catch(console.error);
      }
    }
  }, [user, token]);

  if (!isAuthenticated) {
    return (
      <div className="max-w-7xl mx-auto py-20 px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-2xl font-bold text-slate-900 mb-4">
          {language === 'mr' ? 'प्रोफाइल पाहण्यासाठी कृपया लॉगिन करा' : language === 'hi' ? 'प्रोफाइल देखने के लिए कृपया लॉगिन करें' : 'Please log in to view your profile'}
        </h2>
        <Link to="/login" className="inline-block bg-green-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-green-700 transition-colors">
          {t('nav.login')}
        </Link>
      </div>
    );
  }

  const handleSave = async () => {
    try {
      const res = await fetch('http://localhost:3001/api/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        const updatedUser = await res.json();
        updateUser(updatedUser);
        setIsEditing(false);
      }
    } catch (err) {
      console.error('Failed to update profile');
    }
  };

  const handleRoleChange = async (userId: number, newRole: string) => {
    try {
      const res = await fetch(`http://localhost:3001/api/admin/users/${userId}/role`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ role: newRole })
      });
      if (res.ok) {
        setAdminUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u));
      }
    } catch (err) {
      console.error('Failed to change role', err);
    }
  };

  const handleStatusChange = async (appId: number, newStatus: string) => {
    try {
      const res = await fetch(`http://localhost:3001/api/applications/${appId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        setRecruiterApplicants(prev => prev.map(a => a.application_id === appId ? { ...a, status: newStatus } : a));
      }
    } catch (err) {
      console.error('Failed to update application status', err);
    }
  };

  const getInitials = (name: string) => {
    return name ? name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : 'ST';
  };

  // Calculate profile completion
  const profileFields = [
    'name', 'education', 'branch', 'year', 'location', 'skills', 
    'interests', 'preference', 'career_goal', 'preferred_courses', 'photo', 'resume'
  ];
  const filledFields = profileFields.filter(field => formData[field as keyof typeof formData]);
  const completionPercentage = Math.round((filledFields.length / profileFields.length) * 100);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8"
    >
      {/* Profile Header */}
      <div className="mb-8 flex flex-col md:flex-row items-center gap-6 bg-white p-8 rounded-3xl shadow-sm border border-slate-100 relative">
        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full blur-lg opacity-50"></div>
          {formData.photo && !isEditing ? (
            <img src={formData.photo} alt="Profile" className="h-24 w-24 rounded-full object-cover relative z-10 border-4 border-white shadow-xl" />
          ) : (
            <div className="h-24 w-24 bg-gradient-to-br from-green-400 to-emerald-600 text-white rounded-full flex items-center justify-center text-3xl font-extrabold relative z-10 border-4 border-white shadow-xl">
              {getInitials(formData.name)}
            </div>
          )}
        </div>
        
        <div className="text-center md:text-left flex-grow">
          {isEditing ? (
            <div className="space-y-3 w-full max-w-md">
              <input 
                type="text" 
                value={formData.name} 
                onChange={e => setFormData({...formData, name: e.target.value})} 
                placeholder="Full Name"
                className="w-full text-2xl font-bold text-slate-900 border-b-2 border-green-500 focus:outline-none bg-transparent"
              />
              <input 
                type="text" 
                value={formData.photo} 
                onChange={e => setFormData({...formData, photo: e.target.value})} 
                placeholder="Photo URL (Optional)"
                className="w-full text-sm p-2 border border-slate-200 rounded-lg focus:ring-1 focus:ring-green-500 outline-none"
              />
            </div>
          ) : (
            <>
              <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">{user?.name}</h1>
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mt-2 text-slate-500">
                <span>{user?.email}</span>
                <span className="bg-emerald-100 text-emerald-700 text-xs px-2.5 py-1 rounded-full font-bold flex items-center gap-1">
                  <Zap className="h-3 w-3" /> {user?.role || 'Student'}
                </span>
                {formData.location && (
                  <span className="flex items-center gap-1 text-sm"><MapPin className="h-4 w-4" /> {formData.location}</span>
                )}
              </div>
            </>
          )}
        </div>
        
        <div className="flex-shrink-0 flex flex-col items-center gap-3">
          {/* Profile Completion Circle */}
          <div className="flex flex-col items-center">
            <div className="text-xs font-bold text-slate-500 mb-1">{t('progress.completion')}</div>
            <div className="w-full bg-slate-200 rounded-full h-2.5 w-32 overflow-hidden shadow-inner mb-1">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${completionPercentage}%` }}
                transition={{ duration: 1.5, type: "spring" }}
                className={`h-full rounded-full ${completionPercentage === 100 ? 'bg-gradient-to-r from-emerald-400 to-green-500' : 'bg-gradient-to-r from-amber-400 to-orange-500'}`}
              />
            </div>
            <span className={`text-sm font-bold ${completionPercentage === 100 ? 'text-green-600' : 'text-amber-600'}`}>{completionPercentage}%</span>
          </div>

          {isEditing ? (
            <button onClick={handleSave} className="bg-green-600 text-white px-6 py-2 rounded-xl font-bold flex items-center gap-2 hover:bg-green-700 transition-colors w-full justify-center shadow-md cursor-pointer">
              <Save className="h-4 w-4" /> {t('btn.save')}
            </button>
          ) : (
            <button onClick={() => setIsEditing(true)} className="bg-slate-100 text-slate-700 px-6 py-2 rounded-xl font-bold hover:bg-slate-200 transition-colors w-full justify-center cursor-pointer">
              {t('progress.edit_profile')}
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Details */}
        <div className="lg:col-span-1 space-y-8">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8 space-y-5"
          >
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2 mb-2">
              <GraduationCap className="text-blue-500 h-6 w-6" /> {t('progress.academic_details')}
            </h2>
            
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">{t('progress.degree')}</label>
              {isEditing ? (
                <input type="text" value={formData.education} onChange={e => setFormData({...formData, education: e.target.value})} className="w-full p-2.5 border border-slate-200 rounded-lg text-sm focus:ring-1 focus:ring-blue-500 outline-none" placeholder="e.g. B.Tech, B.Sc" />
              ) : (
                <p className="text-slate-800 font-medium">{formData.education || (language === 'mr' ? 'नोंदवले नाही' : language === 'hi' ? 'निर्दिष्ट नहीं' : 'Not specified')}</p>
              )}
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">{t('progress.branch')}</label>
                {isEditing ? (
                  <input type="text" value={formData.branch} onChange={e => setFormData({...formData, branch: e.target.value})} className="w-full p-2.5 border border-slate-200 rounded-lg text-sm focus:ring-1 focus:ring-blue-500 outline-none" placeholder="e.g. Computer Science" />
                ) : (
                  <p className="text-slate-800 font-medium">{formData.branch || '-'}</p>
                )}
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">{t('progress.year')}</label>
                {isEditing ? (
                  <input type="text" value={formData.year} onChange={e => setFormData({...formData, year: e.target.value})} className="w-full p-2.5 border border-slate-200 rounded-lg text-sm focus:ring-1 focus:ring-blue-500 outline-none" placeholder="e.g. 3rd Year" />
                ) : (
                  <p className="text-slate-800 font-medium">{formData.year || '-'}</p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">{t('progress.location')}</label>
              {isEditing ? (
                <input type="text" value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} className="w-full p-2.5 border border-slate-200 rounded-lg text-sm focus:ring-1 focus:ring-blue-500 outline-none" placeholder="e.g. Pune, Maharashtra" />
              ) : (
                <p className="text-slate-800 font-medium">{formData.location || (language === 'mr' ? 'नोंदवले नाही' : language === 'hi' ? 'निर्दिष्ट नहीं' : 'Not specified')}</p>
              )}
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8 space-y-5"
          >
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2 mb-2">
              <Target className="text-purple-500 h-6 w-6" /> {t('progress.professional_profile')}
            </h2>
            
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">{t('progress.pref')}</label>
              {isEditing ? (
                <select value={formData.preference} onChange={e => setFormData({...formData, preference: e.target.value})} className="w-full p-2.5 border border-slate-200 rounded-lg text-sm focus:ring-1 focus:ring-purple-500 outline-none">
                  <option value="Hardware">Hardware</option>
                  <option value="Software">Software</option>
                  <option value="Both">Both</option>
                </select>
              ) : (
                <span className="inline-block bg-purple-50 text-purple-700 px-3 py-1 rounded-full text-sm font-semibold">{formData.preference || 'Both'}</span>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">{t('progress.career_goal')}</label>
              {isEditing ? (
                <textarea value={formData.career_goal} onChange={e => setFormData({...formData, career_goal: e.target.value})} className="w-full p-2.5 border border-slate-200 rounded-lg text-sm focus:ring-1 focus:ring-purple-500 outline-none" rows={2} placeholder="e.g. Become a Full Stack Developer" />
              ) : (
                <p className="text-slate-800 text-sm font-medium">{formData.career_goal || (language === 'mr' ? 'नोंदवले नाही' : language === 'hi' ? 'निर्दिष्ट नहीं' : 'Not specified')}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">{t('progress.resume_link')}</label>
              {isEditing ? (
                <input type="url" value={formData.resume} onChange={e => setFormData({...formData, resume: e.target.value})} className="w-full p-2.5 border border-slate-200 rounded-lg text-sm focus:ring-1 focus:ring-purple-500 outline-none" placeholder="https://link-to-resume.pdf" />
              ) : formData.resume ? (
                <a href={formData.resume} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-semibold text-sm">
                  <LinkIcon className="h-4 w-4" /> {language === 'mr' ? 'रेझ्युमे पहा' : language === 'hi' ? 'रिज्यूमे देखें' : 'View Resume'}
                </a>
              ) : (
                <p className="text-slate-500 text-sm italic">{language === 'mr' ? 'रेझ्युमे जोडलेला नाही' : language === 'hi' ? 'कोई रिज्यूमे नहीं' : 'No resume uploaded'}</p>
              )}
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8 space-y-5"
          >
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2 mb-2">
              <Award className="text-amber-500 h-6 w-6" /> {t('progress.certificates')}
            </h2>
            
            <div className="space-y-3">
              {certificates.length === 0 ? (
                <p className="text-sm text-slate-500 italic">{language === 'mr' ? 'अजून कोणतेही प्रमाणपत्र प्राप्त नाही.' : language === 'hi' ? 'अभी तक कोई प्रमाणपत्र अर्जित नहीं हुआ।' : 'No certificates earned yet.'}</p>
              ) : (
                certificates.map((cert) => (
                  <div key={cert.id} className="p-4 bg-amber-50 border border-amber-100 rounded-xl flex items-start gap-3">
                    <Award className="h-5 w-5 text-amber-500 mt-0.5" />
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm leading-tight">{cert.title}</h4>
                      <div className="text-xs text-slate-500 mt-1 flex justify-between">
                        <span>{cert.issuer}</span>
                        <span>{cert.date}</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        </div>

        {/* Right Column - Interests, Skills & Dashboard */}
        <div className="lg:col-span-2 space-y-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8"
          >
            <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
              <Briefcase className="text-emerald-500 h-6 w-6" /> {t('progress.skills_interests')}
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">{t('progress.core_skills')}</label>
                {isEditing ? (
                  <textarea 
                    value={formData.skills} 
                    onChange={e => setFormData({...formData, skills: e.target.value})} 
                    className="w-full p-3 border border-slate-200 rounded-lg text-sm focus:ring-1 focus:ring-emerald-500 outline-none" 
                    rows={3} 
                    placeholder="e.g. React, Node.js, Python (comma separated)" 
                  />
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {formData.skills ? formData.skills.split(',').map((skill, i) => (
                      <span key={i} className="bg-slate-100 text-slate-700 px-3 py-1.5 rounded-lg text-sm font-medium">
                        {skill.trim()}
                      </span>
                    )) : <span className="text-slate-500 text-sm">{language === 'mr' ? 'कोणतीही कौशल्ये जोडलेली नाहीत' : language === 'hi' ? 'कोई कौशल नहीं जोड़ा गया' : 'No skills added'}</span>}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">{t('progress.interests')}</label>
                {isEditing ? (
                  <textarea 
                    value={formData.interests} 
                    onChange={e => setFormData({...formData, interests: e.target.value})} 
                    className="w-full p-3 border border-slate-200 rounded-lg text-sm focus:ring-1 focus:ring-emerald-500 outline-none" 
                    rows={3} 
                    placeholder="e.g. AI, Web Development, IoT (comma separated)" 
                  />
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {formData.interests ? formData.interests.split(',').map((interest, i) => (
                      <span key={i} className="bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-lg text-sm font-medium border border-emerald-100">
                        {interest.trim()}
                      </span>
                    )) : <span className="text-slate-500 text-sm">{language === 'mr' ? 'कोणतीही आवड जोडलेली नाही' : language === 'hi' ? 'कोई रुचि नहीं जोड़ी गई' : 'No interests added'}</span>}
                  </div>
                )}
              </div>
            </div>
            
            <div className="mt-8">
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">{t('progress.preferred_courses')}</label>
              {isEditing ? (
                <input 
                  type="text" 
                  value={formData.preferred_courses} 
                  onChange={e => setFormData({...formData, preferred_courses: e.target.value})} 
                  className="w-full p-2.5 border border-slate-200 rounded-lg text-sm focus:ring-1 focus:ring-emerald-500 outline-none" 
                  placeholder="e.g. Advanced React, Embedded Systems" 
                />
              ) : (
                <p className="text-slate-800 text-sm font-medium bg-slate-50 p-4 rounded-xl border border-slate-100">
                  {formData.preferred_courses || (language === 'mr' ? 'नोंदवले नाही' : language === 'hi' ? 'निर्दिष्ट नहीं' : 'Not specified')}
                </p>
              )}
            </div>
          </motion.div>

          {/* Activity Placeholder */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8"
          >
            <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
              <TrendingUp className="text-orange-500 h-6 w-6" /> {t('progress.recent_activity')}
            </h2>
            
            <div className="space-y-4">
              {enrollments.length === 0 ? (
                <div className="text-slate-500 italic text-sm">
                  {language === 'mr' ? 'अद्याप कोणत्याही अभ्यासक्रमात प्रवेश नाही.' : language === 'hi' ? 'अभी तक किसी पाठ्यक्रम में नामांकन नहीं।' : 'No courses enrolled yet.'} <Link to="/courses" className="text-green-600 font-bold hover:underline">{t('nav.courses')}</Link>
                </div>
              ) : (
                enrollments.map((enrollment, idx) => {
                  const title = enrollment.title || `Course #${enrollment.course_id}`;
                  return (
                    <div key={enrollment.course_id || idx} className="border border-slate-100 bg-slate-50 rounded-2xl p-6 flex flex-col sm:flex-row items-center gap-6 relative overflow-hidden group">
                      <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 to-teal-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                      
                      <div className="h-16 w-16 bg-white shadow-sm rounded-2xl flex-shrink-0 flex items-center justify-center relative z-10">
                        <BookOpen className="h-8 w-8 text-emerald-500" />
                      </div>
                      <div className="flex-grow w-full relative z-10">
                        <div className="flex justify-between items-end mb-3">
                          <h3 className="text-lg font-bold text-slate-900">{title}</h3>
                          <span className="text-sm font-extrabold text-emerald-600">{enrollment.progress}%</span>
                        </div>
                        <div className="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden shadow-inner">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${enrollment.progress}%` }}
                            transition={{ duration: 1.5, delay: 0.1 * idx, type: "spring" }}
                            className="bg-gradient-to-r from-emerald-400 to-green-500 h-full rounded-full"
                          />
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </motion.div>

          {/* Lab Bookings (For Students & All) */}
          {(user?.role === 'Student' || user?.role === 'Admin') && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8"
            >
              <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                <MapPin className="text-blue-500 h-6 w-6" /> {t('progress.lab_bookings')}
              </h2>
              
              <div className="space-y-4">
                {labBookings.length === 0 ? (
                  <div className="text-slate-500 italic text-sm">
                    {language === 'mr' ? 'कोणतीही लॅब बुक केलेली नाही.' : language === 'hi' ? 'कोई लैब सत्र बुक नहीं है।' : 'No lab sessions booked.'} <Link to="/labs" className="text-blue-600 font-bold hover:underline">{t('nav.labs')}</Link>
                  </div>
                ) : (
                  labBookings.map((booking) => {
                    const labName = booking.lab_name || `Regional Lab #${booking.lab_id}`;
                    return (
                      <div key={booking.id} className="border border-slate-100 bg-blue-50/50 rounded-2xl p-6 flex flex-col sm:flex-row items-center gap-6 relative">
                        <div className="flex-grow w-full">
                          <div className="flex justify-between items-start mb-2">
                            <h3 className="text-lg font-bold text-slate-900">{labName}</h3>
                            <span className="text-xs font-bold bg-blue-100 text-blue-700 px-2.5 py-1 rounded-md">{booking.status || (language === 'mr' ? 'निश्चित केले' : language === 'hi' ? 'आरक्षित' : 'Confirmed')}</span>
                          </div>
                          <div className="text-sm font-medium text-slate-600 flex items-center gap-4">
                            <span className="flex items-center gap-1"><CheckCircle className="h-4 w-4 text-emerald-500" /> {booking.date}</span>
                            <span className="flex items-center gap-1"><Clock className="h-4 w-4 text-blue-500" /> {booking.time_slot}</span>
                          </div>
                          {booking.purpose && (
                            <p className="text-xs text-slate-500 mt-2 italic">{t('labs.purpose')}: {booking.purpose}</p>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </motion.div>
          )}

          {/* TRAINER PANEL: Student Enrollments & Batch Progress */}
          {(user?.role === 'Trainer' || user?.role === 'Admin') && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8"
            >
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                    <GraduationCap className="text-indigo-600 h-6 w-6" /> {language === 'mr' ? 'प्रशिक्षक: विद्यार्थी नोंदणी व प्रगती' : language === 'hi' ? 'प्रशिक्षक: छात्र नामांकन एवं प्रगति' : 'Trainer: Student Enrollments & Progress'}
                  </h2>
                  <p className="text-slate-500 text-xs mt-1">{language === 'mr' ? 'तुमच्या बॅचमधील सर्व विद्यार्थ्यांची रिअल-टाइम प्रगती' : language === 'hi' ? 'आपके पाठ्यक्रमों में नामांकित छात्रों की प्रगति' : 'Live tracking of students enrolled across your course batches'}</p>
                </div>
                <span className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-xs font-extrabold border border-indigo-100">
                  {trainerStudents.length} {language === 'mr' ? 'विद्यार्थी' : language === 'hi' ? 'सक्रिय नामांकन' : 'Active Enrollments'}
                </span>
              </div>

              <div className="space-y-3">
                {trainerStudents.length === 0 ? (
                  <div className="text-slate-500 italic text-sm">{language === 'mr' ? 'कोणतीही विद्यार्थी नोंदणी नाही.' : language === 'hi' ? 'कोई छात्र नामांकन दर्ज नहीं है।' : 'No student enrollments recorded yet.'}</div>
                ) : (
                  trainerStudents.map((st, i) => (
                    <div key={i} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-sm">
                          {getInitials(st.student_name)}
                        </div>
                        <div>
                          <div className="font-bold text-slate-900 text-sm">{st.student_name}</div>
                          <div className="text-xs text-slate-500">{st.student_email} • <span className="font-semibold text-slate-700">{st.course_title}</span></div>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 min-w-[200px]">
                        <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                          <div className="bg-indigo-600 h-full rounded-full" style={{ width: `${st.progress}%` }} />
                        </div>
                        <span className="text-xs font-bold text-indigo-600 shrink-0">{st.progress}%</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          )}

          {/* RECRUITER PANEL: Candidate Applications & Shortlisting */}
          {(user?.role === 'Recruiter' || user?.role === 'Admin') && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.55 }}
              className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8"
            >
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                    <Briefcase className="text-orange-500 h-6 w-6" /> {language === 'mr' ? 'नियोक्ता: उमेदवार अर्ज व निवड' : language === 'hi' ? 'नियोक्ता: उम्मीदवार आवेदन एवं शॉर्टलिस्टिंग' : 'Recruiter: Candidate Applications & Shortlisting'}
                  </h2>
                  <p className="text-slate-500 text-xs mt-1">{language === 'mr' ? 'विद्यार्थी प्रोफाइल तपासा आणि अर्जाची स्थिती अद्यतनित करा' : language === 'hi' ? 'उम्मीदवार प्रोफाइल की समीक्षा करें एवं स्थिति अपडेट करें' : 'Review student talent profiles and update application hiring statuses'}</p>
                </div>
                <span className="px-3 py-1 bg-orange-50 text-orange-700 rounded-full text-xs font-extrabold border border-orange-100">
                  {recruiterApplicants.length} {language === 'mr' ? 'उमेदवार' : language === 'hi' ? 'उम्मीदवार' : 'Candidates'}
                </span>
              </div>

              <div className="space-y-3">
                {recruiterApplicants.length === 0 ? (
                  <div className="text-slate-500 italic text-sm">{language === 'mr' ? 'कोणतेही अर्ज प्राप्त झालेले नाहीत.' : language === 'hi' ? 'कोई आवेदन प्राप्त नहीं हुआ।' : 'No job/internship applications received yet.'}</div>
                ) : (
                  recruiterApplicants.map((app) => (
                    <div key={app.application_id} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 text-sm">{app.candidate_name}</span>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                            app.status === 'Shortlisted' ? 'bg-green-100 text-green-700' :
                            app.status === 'Rejected' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                          }`}>
                            {app.status || 'Submitted'}
                          </span>
                        </div>
                        <div className="text-xs text-slate-500 mt-0.5">
                          {language === 'mr' ? 'अर्ज केलेले पद:' : language === 'hi' ? 'आवेदित पद:' : 'Applying for:'} <strong className="text-slate-700">{app.job_title}</strong> ({app.company}) • {app.date}
                        </div>
                        {app.skills && (
                          <div className="text-[11px] text-slate-600 mt-1">{t('courses.skills_gained')}: {app.skills}</div>
                        )}
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => handleStatusChange(app.application_id, 'Shortlisted')}
                          className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-lg text-xs font-bold transition-all shadow-sm cursor-pointer"
                        >
                          Shortlist
                        </button>
                        <button
                          onClick={() => handleStatusChange(app.application_id, 'Under Review')}
                          className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-xs font-bold transition-all shadow-sm cursor-pointer"
                        >
                          Review
                        </button>
                        <button
                          onClick={() => handleStatusChange(app.application_id, 'Rejected')}
                          className="px-3 py-1.5 bg-slate-200 hover:bg-red-100 hover:text-red-700 text-slate-700 rounded-lg text-xs font-bold transition-all cursor-pointer"
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          )}

          {/* ADMIN PANEL: System Stats & User Role Management */}
          {user?.role === 'Admin' && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8 space-y-6"
            >
              <div>
                <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                  <Award className="text-purple-600 h-6 w-6" /> {language === 'mr' ? 'प्रशासक पॅनल: प्रणाली आढावा व भूमिका व्यवस्थापन' : language === 'hi' ? 'व्यवस्थापक कंसोल: प्रणाली समीक्षा एवं भूमिका प्रबंधन' : 'Admin Console: System Overview & Role Management'}
                </h2>
                <p className="text-slate-500 text-xs mt-1">{language === 'mr' ? 'वापरकर्ते, भूमिका आणि संसाधनांचे संपूर्ण व्यवस्थापन' : language === 'hi' ? 'उपयोगकर्ताओं, भूमिकाओं और संसाधनों का पूर्ण प्रशासनिक नियंत्रण' : 'Full administrative authority over platform users, roles, and resource metrics'}</p>
              </div>

              {/* Admin Stat Cards */}
              {adminStats && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="p-4 bg-blue-50/60 rounded-2xl border border-blue-100 text-center">
                    <div className="text-2xl font-black text-blue-700">{adminStats.students}</div>
                    <div className="text-xs font-bold uppercase text-slate-500 mt-1">{t('stats.students')}</div>
                  </div>
                  <div className="p-4 bg-purple-50/60 rounded-2xl border border-purple-100 text-center">
                    <div className="text-2xl font-black text-purple-700">{adminStats.trainers}</div>
                    <div className="text-xs font-bold uppercase text-slate-500 mt-1">{t('portal.trainer')}</div>
                  </div>
                  <div className="p-4 bg-orange-50/60 rounded-2xl border border-orange-100 text-center">
                    <div className="text-2xl font-black text-orange-700">{adminStats.recruiters}</div>
                    <div className="text-xs font-bold uppercase text-slate-500 mt-1">{t('portal.recruiter')}</div>
                  </div>
                  <div className="p-4 bg-emerald-50/60 rounded-2xl border border-emerald-100 text-center">
                    <div className="text-2xl font-black text-emerald-700">{adminStats.courses}</div>
                    <div className="text-xs font-bold uppercase text-slate-500 mt-1">{t('stats.courses')}</div>
                  </div>
                </div>
              )}

              {/* Users & Roles Directory Table */}
              <div className="border border-slate-100 rounded-2xl overflow-hidden">
                <div className="px-4 py-3 bg-slate-100/70 border-b border-slate-200 text-xs font-bold text-slate-600 uppercase">
                  {language === 'mr' ? 'वापरकर्ते व भूमिका व्यवस्थापन' : language === 'hi' ? 'उपयोगकर्ता सूची एवं भूमिका नियंत्रण' : 'User Directory & Role Controls'}
                </div>
                <div className="divide-y divide-slate-100 max-h-80 overflow-y-auto">
                  {adminUsers.map((u) => (
                    <div key={u.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white hover:bg-slate-50">
                      <div>
                        <div className="font-bold text-slate-900 text-sm flex items-center gap-2">
                          {u.name}
                          <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                            u.role === 'Admin' ? 'bg-purple-100 text-purple-700' :
                            u.role === 'Trainer' ? 'bg-blue-100 text-blue-700' :
                            u.role === 'Recruiter' ? 'bg-orange-100 text-orange-700' : 'bg-green-100 text-green-700'
                          }`}>
                            {u.role}
                          </span>
                        </div>
                        <div className="text-xs text-slate-500">{u.email} • ID #{u.id}</div>
                      </div>

                      <div className="flex items-center gap-2">
                        <label className="text-xs font-bold text-slate-400">{language === 'mr' ? 'भूमिका बदला:' : language === 'hi' ? 'भूमिका बदलें:' : 'Change Role:'}</label>
                        <select
                          value={u.role}
                          onChange={(e) => handleRoleChange(u.id, e.target.value)}
                          className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-700 focus:ring-1 focus:ring-purple-500 outline-none"
                        >
                          <option value="Student">Student</option>
                          <option value="Trainer">Trainer</option>
                          <option value="Recruiter">Recruiter</option>
                          <option value="Admin">Admin</option>
                        </select>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
