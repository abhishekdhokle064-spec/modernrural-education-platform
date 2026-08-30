import { API_URL } from '../config';
import React, { useState, useEffect } from 'react';
import { Search, Filter, PlayCircle, Clock, CheckCircle, Star, Award, BookOpen, ChevronRight, X, Sparkles, Building2, Layers, Check } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Courses() {
  const { t, language } = useLanguage();
  const { user, token, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  const [courses, setCourses] = useState<any[]>([]);
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [filterCategory, setFilterCategory] = useState('All');
  const [filterLevel, setFilterLevel] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCourse, setSelectedCourse] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const categories = [
    { key: 'All', label: t('cat.all') },
    { key: 'Hardware', label: t('cat.hardware') },
    { key: 'Software', label: t('cat.software') },
    { key: 'Agriculture', label: t('cat.agriculture') },
    { key: 'Technology', label: t('cat.technology') },
    { key: 'Business', label: t('cat.business') }
  ];

  const levels = [
    { key: 'All', label: t('cat.all') },
    { key: 'Beginner', label: t('cat.beginner') },
    { key: 'Intermediate', label: t('cat.intermediate') },
    { key: 'Advanced', label: t('cat.advanced') }
  ];

  useEffect(() => {
    fetchCourses();
    if (isAuthenticated && token) {
      fetchEnrollments();
    }
  }, [isAuthenticated, token]);

  const fetchCourses = () => {
    setLoading(true);
    fetch(`${API_URL}/api/courses`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setCourses(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  };

  const fetchEnrollments = () => {
    fetch(`${API_URL}/api/enrollments`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setEnrollments(data);
      })
      .catch(console.error);
  };

  const handleEnrollOrContinue = async (courseId: number, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();

    const enrollment = enrollments.find(e => e.course_id === courseId);
    
    if (isAuthenticated && enrollment && enrollment.progress > 0) {
      navigate(`/courses/${courseId}/learn`);
    } else {
      navigate(`/courses/${courseId}/enroll`);
    }
  };

  const filteredCourses = courses.filter(course => {
    const matchesSearch = 
      course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (course.description && course.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (course.provider && course.provider.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (Array.isArray(course.skills_gained) && course.skills_gained.some((s: string) => s.toLowerCase().includes(searchTerm.toLowerCase())));
    
    const matchesCategory = filterCategory === 'All' || course.category === filterCategory;
    const matchesLevel = filterLevel === 'All' || course.level === filterLevel;
    
    return matchesSearch && matchesCategory && matchesLevel;
  });

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8"
    >
      {/* Header Banner */}
      <div className="mb-10 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-8 sm:p-10 text-white shadow-2xl relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-72 h-72 bg-green-500 rounded-full mix-blend-overlay filter blur-3xl opacity-40 animate-pulse"></div>
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md text-green-400 text-xs font-bold uppercase tracking-wider mb-4 border border-white/10">
            <Sparkles className="h-3.5 w-3.5" /> {language === 'mr' ? 'तांत्रिक व व्यावसायिक कौशल्ये' : language === 'hi' ? 'तकनीकी एवं औद्योगिक कौशल' : 'Industry & Rural Technical Skills'}
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight mb-3">
            {t('courses.title')}
          </h1>
          <p className="text-slate-300 text-base sm:text-lg">
            {t('courses.subtitle')}
          </p>
        </div>

        {/* Live Stat Badges */}
        <div className="relative z-10 flex flex-row md:flex-col gap-3 shrink-0">
          <div className="bg-white/10 backdrop-blur-md px-5 py-3 rounded-2xl border border-white/10 text-center md:text-left">
            <span className="text-2xl font-black text-white">{courses.length}</span>
            <span className="block text-xs font-medium text-slate-300">{t('stats.courses')}</span>
          </div>
          <div className="bg-white/10 backdrop-blur-md px-5 py-3 rounded-2xl border border-white/10 text-center md:text-left">
            <span className="text-2xl font-black text-green-400">{enrollments.length}</span>
            <span className="block text-xs font-medium text-slate-300">{t('progress.enrolled_courses')}</span>
          </div>
        </div>
      </div>

      {/* Search and Filters Bar */}
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 mb-8 space-y-5">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          {/* Search */}
          <div className="relative w-full md:w-96 group">
            <input
              type="text"
              placeholder={t('cat.search_courses')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200/80 rounded-2xl focus:bg-white focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all shadow-inner text-sm"
            />
            <Search className="absolute left-4 top-3.5 h-5 w-5 text-slate-400 group-focus-within:text-green-500 transition-colors" />
          </div>

          {/* Level Filter */}
          <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
            <span className="text-xs font-bold uppercase text-slate-400 mr-1 flex items-center gap-1">
              <Filter className="h-3.5 w-3.5" /> {t('cat.level')}:
            </span>
            {levels.map(lvl => (
              <button
                key={lvl.key}
                onClick={() => setFilterLevel(lvl.key)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  filterLevel === lvl.key
                    ? 'bg-slate-900 text-white shadow-md'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {lvl.label}
              </button>
            ))}
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100">
          <span className="text-xs font-bold uppercase text-slate-400 mr-2">{t('cat.categories')}:</span>
          {categories.map(cat => (
            <button
              key={cat.key}
              onClick={() => setFilterCategory(cat.key)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                filterCategory === cat.key
                  ? cat.key === 'Hardware' 
                    ? 'bg-amber-500 text-white shadow-md shadow-amber-500/20'
                    : cat.key === 'Software'
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                    : cat.key === 'Technology'
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                    : cat.key === 'Agriculture'
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                    : 'bg-green-600 text-white shadow-md shadow-green-600/20'
                  : 'bg-slate-50 text-slate-600 border border-slate-200/60 hover:bg-slate-100'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Courses Grid */}
      <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <AnimatePresence>
          {filteredCourses.map((course, index) => {
            const enrollment = enrollments.find(e => e.course_id === course.id);
            const isEnrolled = !!enrollment;
            const progress = enrollment ? enrollment.progress : 0;
            const isCompleted = progress === 100;

            return (
              <motion.div
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.25, delay: index * 0.04 }}
                whileHover={{ y: -6 }}
                key={course.id} 
                onClick={() => setSelectedCourse(course)}
                className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col group cursor-pointer relative"
              >
                {/* Completion Badge */}
                {isCompleted && (
                  <div className="absolute top-4 right-4 z-30 bg-green-500 text-white rounded-full px-3 py-1 text-xs font-bold flex items-center gap-1 shadow-lg">
                    <CheckCircle className="h-4 w-4" /> {language === 'mr' ? 'पूर्ण झाले' : language === 'hi' ? 'पूर्ण हुआ' : 'Completed'}
                  </div>
                )}

                {/* Course Image & Banner */}
                <div className="relative overflow-hidden h-48">
                  <div className={`absolute inset-0 bg-gradient-to-t ${course.color || 'from-slate-900 to-transparent'} opacity-50 mix-blend-multiply z-10`} />
                  <img 
                    src={course.image} 
                    alt={course.title} 
                    className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-4 left-4 z-20 flex gap-2">
                    <span className={`px-3 py-1 backdrop-blur-md rounded-full text-xs font-extrabold uppercase tracking-wider text-white shadow-md ${
                      course.category === 'Hardware' ? 'bg-amber-600/90' :
                      course.category === 'Software' ? 'bg-indigo-600/90' :
                      course.category === 'Technology' ? 'bg-blue-600/90' :
                      course.category === 'Agriculture' ? 'bg-emerald-600/90' : 'bg-slate-900/90'
                    }`}>
                      {t(`cat.${course.category.toLowerCase()}`) || course.category}
                    </span>
                  </div>

                  <div className="absolute bottom-3 left-4 right-4 z-20 flex justify-between items-center text-white text-xs font-semibold">
                    <span className="bg-black/40 backdrop-blur-sm px-2.5 py-1 rounded-md flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5 text-amber-300" /> {course.duration}
                    </span>
                    <span className="bg-black/40 backdrop-blur-sm px-2.5 py-1 rounded-md">
                      {t(`cat.${course.level.toLowerCase()}`) || course.level}
                    </span>
                  </div>
                </div>

                {/* Progress Bar (if enrolled) */}
                {isEnrolled && (
                  <div className="h-2 w-full bg-slate-100 overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }} 
                      animate={{ width: `${progress}%` }} 
                      transition={{ duration: 0.8 }} 
                      className={`h-full ${isCompleted ? 'bg-green-500' : 'bg-gradient-to-r from-blue-500 to-indigo-600'}`}
                    />
                  </div>
                )}

                {/* Content */}
                <div className="p-6 flex-grow flex flex-col justify-between">
                  <div>
                    {course.provider && (
                      <p className="text-xs font-semibold text-slate-400 mb-1.5 flex items-center gap-1.5">
                        <Building2 className="h-3.5 w-3.5 text-slate-400" /> {course.provider}
                      </p>
                    )}
                    <h3 className="text-xl font-extrabold text-slate-900 mb-2 leading-snug group-hover:text-green-600 transition-colors">
                      {course.title}
                    </h3>
                    <p className="text-slate-500 text-sm mb-4 line-clamp-2 leading-relaxed">
                      {course.description || 'Hands-on practical training tailored for modern technological proficiency.'}
                    </p>

                    {/* Skills pills preview */}
                    {Array.isArray(course.skills_gained) && course.skills_gained.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-6">
                        {course.skills_gained.slice(0, 3).map((skill: string, idx: number) => (
                          <span key={idx} className="text-[11px] font-medium bg-slate-100 text-slate-600 px-2.5 py-1 rounded-md">
                            {skill}
                          </span>
                        ))}
                        {course.skills_gained.length > 3 && (
                          <span className="text-[11px] font-bold text-slate-400 px-1 py-1">
                            +{course.skills_gained.length - 3} {language === 'mr' ? 'इतर' : language === 'hi' ? 'अन्य' : 'more'}
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="space-y-2 pt-2 border-t border-slate-100">
                    <div className="flex gap-2">
                      <button
                        onClick={(e) => { e.stopPropagation(); setSelectedCourse(course); }}
                        className="flex-1 bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold py-2.5 px-3 rounded-xl text-xs transition-colors border border-slate-200/70 text-center cursor-pointer"
                      >
                        {t('btn.view_syllabus')}
                      </button>

                      <button 
                        onClick={(e) => handleEnrollOrContinue(course.id, e)}
                        className={`flex-1 font-bold py-2.5 px-3 rounded-xl text-xs transition-all duration-200 flex items-center justify-center gap-1.5 shadow-md cursor-pointer ${
                          isEnrolled && progress > 0
                            ? isCompleted 
                              ? 'bg-green-100 text-green-700 hover:bg-green-200' 
                              : 'bg-green-600 text-white hover:bg-green-700 shadow-green-600/20' 
                            : 'bg-slate-900 text-white hover:bg-slate-800 shadow-slate-900/20'
                        }`}
                      >
                        <PlayCircle className="h-4 w-4" /> 
                        {isEnrolled && progress > 0 
                          ? (isCompleted ? (language === 'mr' ? 'पूर्ण झाले' : language === 'hi' ? 'पूर्ण हुआ' : 'Completed') : `${language === 'mr' ? 'सुरू ठेवा' : language === 'hi' ? 'जारी रखें' : 'Continue'} (${progress}%)`) 
                          : t('btn.enroll_now')
                        }
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </motion.div>
      
      {filteredCourses.length === 0 && !loading && (
        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          className="text-center py-20 bg-white rounded-3xl border border-slate-100 mt-8"
        >
          <div className="inline-block p-4 bg-slate-50 rounded-full mb-4">
            <Search className="h-8 w-8 text-slate-400" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-2">
            {language === 'mr' ? 'कोणतेही अभ्यासक्रम सापडले नाहीत' : language === 'hi' ? 'कोई पाठ्यक्रम नहीं मिला' : 'No matching courses found'}
          </h3>
          <p className="text-slate-500">
            {language === 'mr' ? 'कृपया शोध निकष बदला किंवा दुसरा विभाग निवडा.' : language === 'hi' ? 'कृपया खोज मापदंड बदलें या अन्य श्रेणी चुनें।' : 'Try adjusting your search criteria or choosing a different category.'}
          </p>
        </motion.div>
      )}

      {/* Course Details & Syllabus Modal */}
      <AnimatePresence>
        {selectedCourse && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedCourse(null)}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl shadow-2xl overflow-hidden max-w-3xl w-full relative flex flex-col max-h-[90vh]"
            >
              {/* Modal Close Button */}
              <button 
                onClick={() => setSelectedCourse(null)}
                className="absolute top-4 right-4 z-20 p-2 bg-black/40 hover:bg-black/60 rounded-full text-white transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>

              {/* Modal Hero Header */}
              <div className="relative h-48 sm:h-56 bg-slate-900 overflow-hidden shrink-0">
                <img 
                  src={selectedCourse.image} 
                  alt={selectedCourse.title} 
                  className="w-full h-full object-cover opacity-50"
                />
                <div className={`absolute inset-0 bg-gradient-to-t ${selectedCourse.color || 'from-slate-900'} opacity-80 mix-blend-multiply`} />
                <div className="absolute inset-0 p-6 sm:p-8 flex flex-col justify-end text-white">
                  <div className="flex flex-wrap gap-2 mb-2">
                    <span className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-bold uppercase tracking-wider">
                      {t(`cat.${selectedCourse.category.toLowerCase()}`) || selectedCourse.category}
                    </span>
                    <span className="px-3 py-1 bg-green-500/80 backdrop-blur-md rounded-full text-xs font-bold uppercase tracking-wider">
                      {t(`cat.${selectedCourse.level.toLowerCase()}`) || selectedCourse.level}
                    </span>
                    <span className="px-3 py-1 bg-black/40 backdrop-blur-md rounded-full text-xs font-bold flex items-center gap-1">
                      <Clock className="h-3 w-3" /> {selectedCourse.duration}
                    </span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white leading-tight">
                    {selectedCourse.title}
                  </h2>
                  <p className="text-slate-300 text-xs sm:text-sm mt-1 flex items-center gap-1.5 font-medium">
                    <Building2 className="h-4 w-4 text-slate-300" /> {t('courses.provider')}: {selectedCourse.provider || 'RuralLearn Technical Hub'}
                  </p>
                </div>
              </div>

              {/* Modal Body */}
              <div className="p-6 sm:p-8 overflow-y-auto space-y-6">
                {/* Description */}
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                    {language === 'mr' ? 'अभ्यासक्रम परिचय' : language === 'hi' ? 'पाठ्यक्रम परिचय' : 'Overview'}
                  </h4>
                  <p className="text-slate-700 text-sm leading-relaxed">
                    {selectedCourse.description}
                  </p>
                </div>

                {/* Skills Gained */}
                {Array.isArray(selectedCourse.skills_gained) && selectedCourse.skills_gained.length > 0 && (
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2.5">{t('courses.skills_gained')}</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedCourse.skills_gained.map((skill: string, i: number) => (
                        <span key={i} className="text-xs font-semibold bg-green-50 text-green-700 border border-green-200/60 px-3 py-1.5 rounded-xl flex items-center gap-1.5">
                          <Check className="h-3.5 w-3.5 text-green-600" /> {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Syllabus Modules */}
                {Array.isArray(selectedCourse.modules) && selectedCourse.modules.length > 0 && (
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
                      <Layers className="h-4 w-4 text-indigo-500" /> {t('courses.syllabus_title')}
                    </h4>
                    <div className="space-y-2.5">
                      {selectedCourse.modules.map((mod: string, idx: number) => (
                        <div key={idx} className="flex items-start gap-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                          <span className="h-6 w-6 rounded-lg bg-indigo-100 text-indigo-700 font-extrabold text-xs flex items-center justify-center shrink-0">
                            {idx + 1}
                          </span>
                          <span className="text-sm font-semibold text-slate-800 pt-0.5">{mod}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Modal Footer Action */}
              <div className="p-4 sm:px-8 bg-slate-50 border-t border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-4">
                <div className="text-xs text-slate-500 flex items-center gap-2">
                  <Award className="h-4 w-4 text-amber-500" />
                  <span>{t('cert.verified_badge')}</span>
                </div>

                <div className="flex gap-3 w-full sm:w-auto">
                  {(() => {
                    const enrollment = enrollments.find(e => e.course_id === selectedCourse.id);
                    const isEnrolled = !!enrollment;
                    const progress = enrollment ? enrollment.progress : 0;
                    const isCompleted = progress === 100;

                    return (
                      <button
                        onClick={() => handleEnrollOrContinue(selectedCourse.id)}
                        className={`w-full sm:w-auto font-bold py-2.5 px-6 rounded-xl text-sm transition-all flex items-center justify-center gap-2 shadow-lg cursor-pointer ${
                          isEnrolled && progress > 0
                            ? isCompleted
                              ? 'bg-green-600 text-white'
                              : 'bg-green-600 hover:bg-green-700 text-white shadow-green-600/30'
                            : 'bg-slate-900 hover:bg-slate-800 text-white shadow-slate-900/30'
                        }`}
                      >
                        <PlayCircle className="h-4 w-4" />
                        {isEnrolled && progress > 0 
                          ? (isCompleted ? (language === 'mr' ? 'पूर्ण झाले (100%)' : language === 'hi' ? 'पूर्ण हुआ (100%)' : 'Completed (100%)') : `${language === 'mr' ? 'शिक्षण सुरू ठेवा' : language === 'hi' ? 'सीखना जारी रखें' : 'Continue Learning'} (${progress}%)`) 
                          : t('btn.enroll_now')
                        }
                      </button>
                    );
                  })()}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
