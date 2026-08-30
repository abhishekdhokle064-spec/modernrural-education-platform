import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { 
  Home, BookOpen, Monitor, Code, FlaskConical, Briefcase, 
  Award, BrainCircuit, User, Users, ClipboardList, ShieldAlert,
  FileText, CheckSquare, Search, BarChart, Menu, X, Bell
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Sidebar() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const role = user?.role || 'Student';

  const menus = {
    Student: [
      { name: 'Dashboard', path: '/', icon: Home },
      { name: 'Courses', path: '/courses', icon: BookOpen },
      { name: 'Labs', path: '/labs', icon: FlaskConical },
      { name: 'My Learning', path: '/progress', icon: Award },
      { name: 'Progress', path: '/progress', icon: BarChart },
      { name: 'Quizzes', path: '/courses', icon: CheckSquare },
      { name: 'Certificates', path: '/certifications', icon: Award },
      { name: 'Opportunities/Apply', path: '/internships', icon: Briefcase },
      { name: 'AI Advisor', path: '/ai-advisor', icon: BrainCircuit },
      { name: 'Notifications', path: '/notifications', icon: Bell },
      { name: 'Profile', path: '/progress', icon: User },
    ],
    Trainer: [
      { name: 'Dashboard', path: '/', icon: Home },
      { name: 'My Courses', path: '/courses', icon: BookOpen },
      { name: 'Create/Edit Courses', path: '/courses', icon: FileText },
      { name: 'Modules/Lectures', path: '/courses', icon: BookOpen },
      { name: 'Upload Videos/PDFs/Notes', path: '/courses', icon: ClipboardList },
      { name: 'Quizzes', path: '/courses', icon: CheckSquare },
      { name: 'Enrollments', path: '/progress', icon: Users },
      { name: 'Student Progress', path: '/progress', icon: BarChart },
      { name: 'Certificates', path: '/certifications', icon: Award },
      { name: 'Notifications', path: '/notifications', icon: Bell },
      { name: 'Profile', path: '/progress', icon: User },
    ],
    Recruiter: [
      { name: 'Dashboard', path: '/', icon: Home },
      { name: 'Create/Manage Jobs & Internships', path: '/internships', icon: Briefcase },
      { name: 'Applicants', path: '/internships', icon: Users },
      { name: 'Student Profiles', path: '/progress', icon: User },
      { name: 'Shortlist/Reject', path: '/internships', icon: CheckSquare },
      { name: 'Application Status', path: '/internships', icon: ClipboardList },
      { name: 'Notifications', path: '/notifications', icon: Bell },
      { name: 'Company Profile', path: '/progress', icon: ShieldAlert },
    ],
    Admin: [
      { name: 'Dashboard', path: '/', icon: Home },
      { name: 'Manage Students', path: '/progress', icon: Users },
      { name: 'Trainers', path: '/progress', icon: Users },
      { name: 'Recruiters', path: '/internships', icon: Briefcase },
      { name: 'Courses', path: '/courses', icon: BookOpen },
      { name: 'Labs', path: '/labs', icon: FlaskConical },
      { name: 'Opportunities', path: '/internships', icon: Briefcase },
      { name: 'Certificates', path: '/certifications', icon: Award },
      { name: 'Users/Roles', path: '/progress', icon: ShieldAlert },
      { name: 'Reports & Settings', path: '/progress', icon: BarChart },
    ]
  };

  const currentMenu = menus[role as keyof typeof menus] || menus.Student;

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-white border-r border-slate-200">
      <div className="p-6">
        <div className="mb-6 px-4 py-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center gap-3">
          <div className="bg-green-100 text-green-700 p-2 rounded-lg font-bold">
            {role.charAt(0)}
          </div>
          <div>
            <div className="text-xs text-slate-400 font-bold uppercase">{role} {t('menu.portal')}</div>
            <div className="font-bold text-slate-800 text-sm truncate">{user?.name || role}</div>
          </div>
        </div>
        
        <div className="space-y-1 overflow-y-auto max-h-[calc(100vh-12rem)] pb-20">
          {currentMenu.map((item) => {
            const Icon = item.icon;
            const translatedLabel = t(`menu.${item.name}`) || item.name;
            return (
              <NavLink
                key={item.name}
                to={item.path}
                onClick={() => setIsOpen(false)}
                className={({ isActive }) => 
                  `flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all duration-200 ${
                    isActive && item.path !== '/#'
                      ? 'bg-green-50 text-green-700' 
                      : 'text-slate-600 hover:bg-slate-50 hover:text-green-600'
                  }`
                }
              >
                <Icon className="h-5 w-5" />
                {translatedLabel}
              </NavLink>
            );
          })}
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Toggle Button */}
      <button 
        onClick={() => setIsOpen(true)}
        className="md:hidden fixed bottom-6 left-6 z-40 bg-green-600 text-white p-4 rounded-full shadow-xl shadow-green-600/30 hover:bg-green-700 transition-colors cursor-pointer"
      >
        <Menu className="h-6 w-6" />
      </button>

      {/* Desktop Sidebar */}
      <motion.aside 
        initial={{ x: -200, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        className="w-64 h-[calc(100vh-5rem)] sticky top-20 hidden md:block shadow-sm z-30"
      >
        <SidebarContent />
      </motion.aside>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 md:hidden"
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 left-0 h-full w-72 bg-white z-50 md:hidden shadow-2xl flex flex-col"
            >
              <div className="flex justify-between items-center p-6 border-b border-slate-100">
                <span className="font-extrabold text-xl text-green-700">RuralLearn</span>
                <button onClick={() => setIsOpen(false)} className="p-2 bg-slate-100 text-slate-600 rounded-full cursor-pointer">
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="flex-grow overflow-y-auto">
                <SidebarContent />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
