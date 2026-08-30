import { API_URL } from '../config';
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { BookOpen, Clock, Building2, CheckCircle, ShieldCheck, Sparkles, Award, Lock, ArrowRight, User, Mail, Key } from 'lucide-react';

export default function CourseEnroll() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, token, isAuthenticated, login } = useAuth();
  const { t, language } = useLanguage();

  const [course, setCourse] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    if (id) {
      fetch(`http://localhost:3001/api/courses/${id}`)
        .then(res => {
          if (!res.ok) throw new Error('Course not found');
          return res.json();
        })
        .then(data => {
          setCourse(data);
          setLoading(false);
        })
        .catch(err => {
          console.error(err);
          setLoading(false);
        });
    }
  }, [id]);

  const handleAuthAndEnroll = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      let authToken = token;
      let authUser = user;

      if (!isAuthenticated) {
        const endpoint = authMode === 'login' ? '/api/login' : '/api/register';
        const payload = authMode === 'login' ? { email, password } : { name, email, password, role: 'Student' };

        const authRes = await fetch(`http://localhost:3001${endpoint}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        const authData = await authRes.json();
        if (!authRes.ok) {
          setError(authData.error || (language === 'mr' ? 'लॉगिन अयशस्वी झाले' : language === 'hi' ? 'प्रमाणीकरण विफल' : 'Authentication failed'));
          setSubmitting(false);
          return;
        }

        authToken = authData.token;
        authUser = authData.user;
        if (authToken && authUser) {
          login(authToken, authUser);
        }
      }

      // Now persist enrollment in SQLite database
      const enrollRes = await fetch(`${API_URL}/api/enrollments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`
        },
        body: JSON.stringify({ course_id: Number(id) })
      });

      if (enrollRes.ok) {
        setSuccessMsg(`🎉 ${language === 'mr' ? 'अभ्यासक्रमात यशस्वी प्रवेश!' : language === 'hi' ? 'पाठ्यक्रम में सफल नामांकन!' : `Successfully enrolled in ${course ? course.title : 'the course'}!`}`);
        setTimeout(() => {
          navigate(`/courses/${id}/learn`);
        }, 1200);
      } else {
        const enrollData = await enrollRes.json();
        if (enrollData.error && enrollData.error.includes('Already enrolled')) {
          setSuccessMsg(language === 'mr' ? 'तुम्ही आधीच प्रवेश घेतला आहे! डॅशबोर्डवर नेत आहोत...' : language === 'hi' ? 'आप पहले से नामांकित हैं! डैशबोर्ड पर पुनर्निर्देशित किया जा रहा है...' : 'You are already enrolled! Redirecting to course dashboard...');
          setTimeout(() => navigate(`/courses/${id}/learn`), 1000);
        } else {
          setError(enrollData.error || 'Failed to complete enrollment');
        }
      }
    } catch (err) {
      setError('Connection to backend failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-green-500 border-t-transparent"></div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="max-w-md mx-auto py-20 px-4 text-center">
        <h2 className="text-2xl font-bold text-slate-900 mb-3">
          {language === 'mr' ? 'अभ्यासक्रम सापडला नाही' : language === 'hi' ? 'पाठ्यक्रम नहीं मिला' : 'Course Not Found'}
        </h2>
        <p className="text-slate-500 mb-6">
          {language === 'mr' ? 'तुम्ही शोधत असलेला अभ्यासक्रम अस्तित्वात नाही किंवा हलवला गेला आहे.' : language === 'hi' ? 'आप जिस पाठ्यक्रम में नामांकन का प्रयास कर रहे हैं वह मौजूद नहीं है।' : 'The course you are trying to enroll in does not exist or has been moved.'}
        </p>
        <Link to="/courses" className="inline-block bg-slate-900 text-white font-bold px-6 py-3 rounded-xl hover:bg-slate-800 transition-colors">
          {language === 'mr' ? 'सर्व अभ्यासक्रम पहा' : language === 'hi' ? 'सभी पाठ्यक्रम देखें' : 'Browse All Courses'}
        </Link>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="max-w-6xl mx-auto py-12 px-4 sm:px-6 lg:px-8"
    >
      {/* Breadcrumb / Back Link */}
      <div className="mb-8">
        <Link to="/courses" className="text-sm font-semibold text-slate-500 hover:text-green-600 transition-colors inline-flex items-center gap-1">
          ← {language === 'mr' ? 'सर्व अभ्यासक्रमांकडे परत जा' : language === 'hi' ? 'सभी पाठ्यक्रमों पर वापस जाएं' : 'Back to All Courses'}
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Dedicated Course Overview */}
        <div className="lg:col-span-6 bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-100 space-y-6">
          <div className="relative h-56 rounded-2xl overflow-hidden">
            <img src={course.image} alt={course.title} className="w-full h-full object-cover" />
            <div className={`absolute inset-0 bg-gradient-to-t ${course.color || 'from-slate-900'} opacity-60 mix-blend-multiply`} />
            <div className="absolute top-4 left-4 flex gap-2">
              <span className="px-3.5 py-1 bg-white/90 backdrop-blur-md text-slate-900 rounded-full text-xs font-black uppercase tracking-wider shadow-md">
                {t(`cat.${course.category.toLowerCase()}`) || course.category}
              </span>
              <span className="px-3.5 py-1 bg-green-500 text-white rounded-full text-xs font-bold uppercase tracking-wider shadow-md">
                {t(`cat.${course.level.toLowerCase()}`) || course.level}
              </span>
            </div>
            <div className="absolute bottom-4 left-4 right-4 flex justify-between items-center text-white text-xs font-semibold">
              <span className="bg-black/50 backdrop-blur-sm px-3 py-1.5 rounded-lg flex items-center gap-1.5">
                <Clock className="h-4 w-4 text-amber-300" /> {course.duration}
              </span>
              {course.rating && (
                <span className="bg-black/50 backdrop-blur-sm px-3 py-1.5 rounded-lg font-bold text-amber-300">
                  ★ {course.rating} / 5.0
                </span>
              )}
            </div>
          </div>

          <div>
            {course.provider && (
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <Building2 className="h-3.5 w-3.5 text-slate-400" /> {t('courses.provider')}: {course.provider}
              </p>
            )}
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 leading-tight mb-3">
              {course.title}
            </h1>
            <p className="text-slate-600 text-sm leading-relaxed mb-6">
              {course.description}
            </p>
          </div>

          {/* Competencies */}
          {Array.isArray(course.skills_gained) && course.skills_gained.length > 0 && (
            <div className="pt-4 border-t border-slate-100">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                {t('courses.skills_gained')}
              </h3>
              <div className="flex flex-wrap gap-2">
                {course.skills_gained.map((skill: string, i: number) => (
                  <span key={i} className="text-xs font-semibold bg-green-50 text-green-700 px-3 py-1 rounded-lg border border-green-200/60">
                    ✓ {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Certificate Notice */}
          <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-2xl flex items-center gap-3 text-amber-900 text-xs font-medium">
            <Award className="h-6 w-6 text-amber-500 shrink-0" />
            <span>{t('cert.verified_badge')}</span>
          </div>
        </div>

        {/* Right Column: Course-Specific Authentication & Enrollment Card */}
        <div className="lg:col-span-6 bg-white rounded-3xl p-8 shadow-xl shadow-slate-200/50 border border-slate-100 relative">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-gradient-to-tr from-green-500 to-emerald-600 text-white mb-4 shadow-lg shadow-green-500/30">
              <BookOpen className="h-8 w-8" />
            </div>
            <h2 className="text-2xl font-extrabold text-slate-900">
              {isAuthenticated 
                ? (language === 'mr' ? 'प्रवेश निश्चित करा' : language === 'hi' ? 'नामांकन की पुष्टि करें' : 'Confirm Your Enrollment') 
                : (language === 'mr' ? 'अभ्यासक्रम प्रवेश व लॉगिन' : language === 'hi' ? 'पाठ्यक्रम पहुंच एवं नामांकन' : 'Course Access & Enrollment')
              }
            </h2>
            <p className="text-slate-500 text-sm mt-1.5">
              {isAuthenticated 
                ? `${language === 'mr' ? 'लॉगिन केलेले नाव:' : language === 'hi' ? 'लॉग इन उपयोगकर्ता:' : 'Logged in as'} ${user?.name}.` 
                : `${language === 'mr' ? `${course.title} मध्ये प्रवेश घेण्यासाठी लॉगिन करा किंवा नोंदणी करा.` : language === 'hi' ? `${course.title} में प्रवेश हेतु लॉगिन या पंजीकरण करें।` : `Log in or create a student account to enroll in ${course.title}.`}`
              }
            </p>
          </div>

          {/* Error / Success Alerts */}
          {error && (
            <div className="bg-red-50 text-red-600 p-3.5 rounded-xl text-xs font-bold mb-6 text-center border border-red-200">
              {error}
            </div>
          )}
          {successMsg && (
            <div className="bg-green-50 text-green-700 p-3.5 rounded-xl text-xs font-bold mb-6 text-center border border-green-200 flex items-center justify-center gap-2">
              <CheckCircle className="h-4 w-4" /> {successMsg}
            </div>
          )}

          {!isAuthenticated ? (
            <div>
              {/* Tab Selector */}
              <div className="flex bg-slate-100 p-1 rounded-2xl mb-6">
                <button
                  type="button"
                  onClick={() => setAuthMode('login')}
                  className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    authMode === 'login' 
                      ? 'bg-white text-slate-900 shadow-sm' 
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  {t('nav.login')} & {t('btn.enroll_now')}
                </button>
                <button
                  type="button"
                  onClick={() => setAuthMode('register')}
                  className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    authMode === 'register' 
                      ? 'bg-white text-slate-900 shadow-sm' 
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  {t('nav.register')}
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleAuthAndEnroll} className="space-y-4">
                {authMode === 'register' && (
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      {t('auth.name')}
                    </label>
                    <div className="relative">
                      <input 
                        type="text" 
                        value={name} 
                        onChange={(e) => setName(e.target.value)} 
                        placeholder="e.g. Ramesh Patil"
                        required
                        className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-green-500 outline-none transition-all"
                      />
                      <User className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    {t('auth.email')}
                  </label>
                  <div className="relative">
                    <input 
                      type="email" 
                      value={email} 
                      onChange={(e) => setEmail(e.target.value)} 
                      placeholder="student@rurallearn.edu"
                      required
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-green-500 outline-none transition-all"
                    />
                    <Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    {t('auth.password')}
                  </label>
                  <div className="relative">
                    <input 
                      type="password" 
                      value={password} 
                      onChange={(e) => setPassword(e.target.value)} 
                      placeholder="••••••••"
                      required
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-green-500 outline-none transition-all"
                    />
                    <Key className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                  </div>
                </div>

                <button 
                  type="submit" 
                  disabled={submitting}
                  className="w-full mt-4 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-green-600/30 transition-all flex items-center justify-center gap-2 text-sm disabled:opacity-50 cursor-pointer"
                >
                  <Lock className="h-4 w-4" />
                  {submitting 
                    ? (language === 'mr' ? 'प्रक्रिया सुरू आहे...' : language === 'hi' ? 'प्रक्रिया जारी है...' : 'Processing...') 
                    : (authMode === 'login' 
                        ? `${t('nav.login')} & ${t('btn.start_course')}` 
                        : `${t('nav.register')} & ${t('btn.start_course')}`)}
                  <ArrowRight className="h-4 w-4" />
                </button>
              </form>
            </div>
          ) : (
            <div className="space-y-6 text-center">
              <div className="p-6 bg-green-50 border border-green-200/80 rounded-2xl">
                <p className="text-sm font-semibold text-green-900">
                  {language === 'mr' ? `${course.title} मध्ये प्रवेश घेण्यास तयार आहात का?` : language === 'hi' ? `क्या आप ${course.title} में नामांकन के लिए तैयार हैं?` : `Ready to enroll in ${course.title}?`}
                </p>
                <p className="text-xs text-green-700 mt-1">
                  {language === 'mr' ? 'तुमची शिकण्याची प्रगती आणि लॅब सेशन्स तुमच्या प्रोफाइलमध्ये सेव्ह होतील.' : language === 'hi' ? 'आपकी प्रगति और लैब सत्र आपकी प्रोफाइल में ट्रैक किए जाएंगे।' : 'Your learning progress and lab practice sessions will be tracked in your Student Profile.'}
                </p>
              </div>

              <button 
                onClick={() => handleAuthAndEnroll()}
                disabled={submitting}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-green-600/30 transition-all flex items-center justify-center gap-2 text-sm cursor-pointer"
              >
                <CheckCircle className="h-5 w-5" />
                {submitting 
                  ? (language === 'mr' ? 'प्रवेश घेत आहे...' : language === 'hi' ? 'नामांकन हो रहा है...' : 'Enrolling...') 
                  : (language === 'mr' ? 'निश्चित करा आणि शिक्षण सुरू करा' : language === 'hi' ? 'पुष्टि करें और सीखना शुरू करें' : 'Confirm & Start Learning Now')
                }
              </button>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
