import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { BookOpen, FlaskConical, Briefcase, BrainCircuit, User, Menu, X, GraduationCap, ChevronRight, Award } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { language, setLanguage, t } = useLanguage();
  const { isAuthenticated, logout, user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const navLinks = [
    { name: t('nav.home'), path: '/', icon: GraduationCap, desc: t('hero.title') },
    { name: t('nav.courses'), path: '/courses', icon: BookOpen, desc: t('courses.title') },
    { name: t('nav.labs'), path: '/labs', icon: FlaskConical, desc: t('labs.title') },
    { name: t('nav.certifications'), path: '/certifications', icon: Award, desc: t('cert.title') },
    { name: t('nav.internships'), path: '/internships', icon: Briefcase, desc: t('internships.title') },
    { name: t('nav.ai_advisor'), path: '/ai-advisor', icon: BrainCircuit, desc: t('ai.title') },
    { name: t('nav.progress'), path: '/progress', icon: User, desc: t('progress.title') },
  ];

  return (
    <>
      <motion.nav 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5, type: 'spring', stiffness: 100 }}
        className="glass sticky top-0 z-40 text-slate-800 border-b border-slate-200"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center">
              <Link to="/" className="flex-shrink-0 flex items-center gap-3 group">
                <motion.div 
                  whileHover={{ rotate: 10, scale: 1.1 }}
                  className="bg-gradient-to-br from-green-400 to-emerald-600 p-2 rounded-xl text-white shadow-lg shadow-green-500/30"
                >
                  <GraduationCap className="h-6 w-6" />
                </motion.div>
                <span className="font-extrabold text-2xl tracking-tight text-gradient from-green-600 to-emerald-800 hidden sm:block">
                  RuralLearn
                </span>
              </Link>
            </div>
            
            <div className="hidden lg:flex items-center space-x-1 flex-grow justify-center">
              {navLinks.slice(1, 6).map((link) => {
                const Icon = link.icon;
                const isActive = location.pathname === link.path;
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`relative px-4 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 flex items-center gap-2 group
                      ${isActive ? 'text-green-700' : 'text-slate-600 hover:text-green-600'}`}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="activeNavTab"
                        className="absolute inset-0 bg-green-100 rounded-full -z-10"
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                      />
                    )}
                    <Icon className="h-4 w-4 transition-transform group-hover:scale-110" />
                    {link.name}
                  </Link>
                );
              })}
            </div>

            <div className="flex items-center gap-3">
              {/* Language Selector Pills */}
              <div className="hidden sm:flex items-center bg-slate-100 p-1 rounded-full border border-slate-200 shadow-sm">
                {(['en', 'mr', 'hi'] as const).map((lang) => (
                  <button
                    key={lang}
                    onClick={() => setLanguage(lang)}
                    className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                      language === lang
                        ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-sm'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {lang === 'en' ? 'English' : lang === 'mr' ? 'मराठी' : 'हिंदी'}
                  </button>
                ))}
              </div>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsOpen(true)}
                className="bg-gradient-to-r from-slate-900 to-slate-800 text-white px-5 py-2.5 rounded-full text-sm font-bold shadow-lg shadow-slate-900/20 hover:shadow-slate-900/40 transition-all flex items-center gap-2 cursor-pointer"
              >
                <Menu className="h-4 w-4" />
                <span>{language === 'mr' ? 'मेनू' : language === 'hi' ? 'मेनू' : 'Menu'}</span>
              </motion.button>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Full Screen Menu Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex justify-end"
          >
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col"
            >
              <div className="flex items-center justify-between p-6 border-b border-slate-100">
                <h2 className="text-xl font-bold text-slate-900">
                  {language === 'mr' ? 'नेव्हिगेशन व मेनू' : language === 'hi' ? 'नेविगेशन एवं मेनू' : 'Resources & Navigation'}
                </h2>
                <button 
                  onClick={() => setIsOpen(false)}
                  className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-full transition-colors cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              
              <div className="p-6 overflow-y-auto flex-grow flex flex-col gap-2">
                {navLinks.map((link, index) => {
                  const Icon = link.icon;
                  const isActive = location.pathname === link.path;
                  return (
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      key={link.path}
                    >
                      <Link
                        to={link.path}
                        onClick={() => setIsOpen(false)}
                        className={`group flex items-center justify-between p-4 rounded-2xl transition-all ${
                          isActive 
                            ? 'bg-green-50 border border-green-100 shadow-sm' 
                            : 'hover:bg-slate-50 border border-transparent hover:border-slate-100'
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          <div className={`p-3 rounded-xl ${isActive ? 'bg-green-500 text-white shadow-md shadow-green-500/20' : 'bg-slate-100 text-slate-600 group-hover:bg-green-100 group-hover:text-green-600 transition-colors'}`}>
                            <Icon className="h-6 w-6" />
                          </div>
                          <div>
                            <div className={`font-bold ${isActive ? 'text-green-700' : 'text-slate-900'}`}>
                              {link.name}
                            </div>
                            <div className="text-xs text-slate-500 mt-0.5">{link.desc}</div>
                          </div>
                        </div>
                        <ChevronRight className={`h-5 w-5 ${isActive ? 'text-green-500' : 'text-slate-300 group-hover:text-green-500'}`} />
                      </Link>
                    </motion.div>
                  );
                })}
              </div>
              
              <div className="p-6 border-t border-slate-100 bg-slate-50 space-y-3">
                <div className="bg-slate-100 p-1.5 rounded-2xl flex items-center justify-between border border-slate-200">
                  <span className="text-xs font-bold text-slate-500 pl-3">
                    {language === 'mr' ? 'भाषा निवडा:' : language === 'hi' ? 'भाषा चुनें:' : 'Language:'}
                  </span>
                  <div className="flex gap-1">
                    {(['en', 'mr', 'hi'] as const).map((lang) => (
                      <button
                        key={lang}
                        onClick={() => setLanguage(lang)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          language === lang
                            ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-sm'
                            : 'bg-white text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        {lang === 'en' ? 'English' : lang === 'mr' ? 'मराठी' : 'हिंदी'}
                      </button>
                    ))}
                  </div>
                </div>
                
                {isAuthenticated ? (
                  <button
                    onClick={() => {
                      logout();
                      setIsOpen(false);
                    }}
                    className="w-full bg-rose-50 text-rose-600 font-bold py-3 rounded-xl flex items-center justify-center hover:bg-rose-100 transition-colors cursor-pointer"
                  >
                    {t('nav.logout')}
                  </button>
                ) : (
                  <Link
                    to="/login"
                    onClick={() => setIsOpen(false)}
                    className="w-full bg-slate-900 text-white font-bold py-3 rounded-xl flex items-center justify-center hover:bg-slate-800 transition-colors shadow-md"
                  >
                    {t('nav.login')} / {t('nav.register')}
                  </Link>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
