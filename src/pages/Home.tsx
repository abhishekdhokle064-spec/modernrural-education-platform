import React, { useEffect, useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { ArrowRight, BookOpen, FlaskConical, Briefcase, BrainCircuit, Award } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion, useAnimation } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

const AnimatedCounter = ({ end, duration = 2 }: { end: number, duration?: number }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTime: number | null = null;
    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / (duration * 1000), 1);
      
      // Easing function (easeOutExpo)
      const easeOut = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      
      setCount(Math.floor(easeOut * end));
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    requestAnimationFrame(animate);
  }, [end, duration]);

  return <span>{count}</span>;
};

export default function Home() {
  const { t } = useLanguage();
  const { user, isAuthenticated } = useAuth();
  const role = user?.role || 'Student';

  const roleFeatures: Record<string, Array<{ title: string; description: string; icon: any; path: string; color: string; shadow: string }>> = {
    Student: [
      {
        title: t('courses.title'),
        description: 'Access localized tech courses, view syllabus modules, and start learning.',
        icon: BookOpen,
        path: '/courses',
        color: 'from-blue-400 to-indigo-500',
        shadow: 'shadow-blue-500/20'
      },
      {
        title: t('labs.title'),
        description: 'Book testing and computer lab sessions with hands-on equipment.',
        icon: FlaskConical,
        path: '/labs',
        color: 'from-emerald-400 to-green-600',
        shadow: 'shadow-emerald-500/20'
      },
      {
        title: t('internships.title'),
        description: 'Apply to regional internships, industrial jobs, and micro-projects.',
        icon: Briefcase,
        path: '/internships',
        color: 'from-orange-400 to-red-500',
        shadow: 'shadow-orange-500/20'
      },
      {
        title: t('ai.title'),
        description: 'Get AI career guidance, skill mapping, and personalized course advice.',
        icon: BrainCircuit,
        path: '/ai-advisor',
        color: 'from-purple-400 to-fuchsia-500',
        shadow: 'shadow-purple-500/20'
      }
    ],
    Trainer: [
      {
        title: 'Course Management & Curriculum',
        description: 'Create and update course modules, syllabus lectures, and competency quizzes.',
        icon: BookOpen,
        path: '/courses',
        color: 'from-blue-500 to-indigo-600',
        shadow: 'shadow-blue-500/20'
      },
      {
        title: 'Lab Workshops & Facilities',
        description: 'Schedule lab demonstrations and inspect facility equipment inventory.',
        icon: FlaskConical,
        path: '/labs',
        color: 'from-emerald-500 to-teal-600',
        shadow: 'shadow-emerald-500/20'
      },
      {
        title: 'Student Enrollments & Progress',
        description: 'Track student module completion, quiz results, and performance milestones.',
        icon: Award,
        path: '/progress',
        color: 'from-purple-500 to-fuchsia-600',
        shadow: 'shadow-purple-500/20'
      },
      {
        title: 'Certificates & Credentials',
        description: 'Review and verify course completion certificates issued to students.',
        icon: Award,
        path: '/certifications',
        color: 'from-amber-500 to-orange-600',
        shadow: 'shadow-amber-500/20'
      }
    ],
    Recruiter: [
      {
        title: 'Post Jobs & Internships',
        description: 'Publish verified opportunities with skill requirements and stipends.',
        icon: Briefcase,
        path: '/internships',
        color: 'from-orange-500 to-red-600',
        shadow: 'shadow-orange-500/20'
      },
      {
        title: 'Candidate Applications',
        description: 'Review student applicants, assess competency scores, and update hiring statuses.',
        icon: Briefcase,
        path: '/internships',
        color: 'from-indigo-500 to-purple-600',
        shadow: 'shadow-indigo-500/20'
      },
      {
        title: 'Student Talent Profiles',
        description: 'Discover certified rural talent by technical competencies and practical skills.',
        icon: Award,
        path: '/progress',
        color: 'from-emerald-500 to-teal-600',
        shadow: 'shadow-emerald-500/20'
      },
      {
        title: 'Company Profile & Settings',
        description: 'Manage employer branding, hiring contacts, and recruitment drives.',
        icon: BrainCircuit,
        path: '/progress',
        color: 'from-blue-500 to-cyan-600',
        shadow: 'shadow-blue-500/20'
      }
    ],
    Admin: [
      {
        title: 'Student & Trainer Directory',
        description: 'Manage registered users, assign roles, and monitor engagement metrics.',
        icon: Award,
        path: '/progress',
        color: 'from-blue-600 to-indigo-700',
        shadow: 'shadow-blue-500/20'
      },
      {
        title: 'Courses & Curriculum Hub',
        description: 'Review and publish hardware, software, agriculture, and tech courses.',
        icon: BookOpen,
        path: '/courses',
        color: 'from-purple-600 to-fuchsia-700',
        shadow: 'shadow-purple-500/20'
      },
      {
        title: 'Regional Labs & Equipment',
        description: 'Oversee lab capacities, equipment slots, and booking schedules.',
        icon: FlaskConical,
        path: '/labs',
        color: 'from-emerald-600 to-green-700',
        shadow: 'shadow-emerald-500/20'
      },
      {
        title: 'Opportunities & Accreditations',
        description: 'Audit corporate postings, institutional partnerships, and certificates.',
        icon: Briefcase,
        path: '/internships',
        color: 'from-amber-600 to-orange-700',
        shadow: 'shadow-amber-500/20'
      }
    ]
  };

  const features = isAuthenticated ? (roleFeatures[role] || roleFeatures.Student) : roleFeatures.Student;

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen"
    >
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-slate-900 text-white py-24 sm:py-32 px-4 sm:px-6 lg:px-8">
        <div className="absolute inset-0 bg-gradient-to-br from-green-900/40 via-slate-900 to-emerald-900/40" />
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80')] opacity-10 bg-cover bg-center mix-blend-overlay" />
        
        <div className="relative max-w-7xl mx-auto text-center z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6">
              <span className="text-gradient from-green-300 via-emerald-400 to-teal-300">
                {isAuthenticated ? `Welcome back, ${user?.name}!` : t('hero.title')}
              </span>
            </h1>
            <p className="text-xl md:text-2xl max-w-2xl mx-auto text-slate-300 mb-10 leading-relaxed font-light">
              {isAuthenticated ? `Access your ${user?.role} Dashboard below to continue your journey.` : t('hero.subtitle')}
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link to="/courses">
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-full sm:w-auto bg-gradient-to-r from-green-500 to-emerald-600 text-white px-8 py-4 rounded-full font-bold text-lg hover:from-green-400 hover:to-emerald-500 transition-all shadow-lg shadow-green-500/30 flex items-center justify-center gap-2"
                >
                  {t('hero.cta')} <ArrowRight className="h-5 w-5" />
                </motion.button>
              </Link>
            </div>
          </motion.div>
        </div>
        
        {/* Floating elements animation */}
        <motion.div
          animate={{ y: [0, -20, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-20 left-10 w-24 h-24 bg-green-500/10 rounded-full blur-2xl"
        />
        <motion.div
          animate={{ y: [0, 20, 0] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute bottom-20 right-10 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl"
        />
      </div>

      {/* Features Grid */}
      <div className="max-w-7xl mx-auto py-24 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ y: -10 }}
                className={`bg-white rounded-3xl p-8 border border-slate-100 shadow-xl ${feature.shadow} hover:shadow-2xl transition-all duration-300 flex flex-col items-center text-center group`}
              >
                <div className={`p-5 rounded-2xl mb-6 bg-gradient-to-br ${feature.color} text-white transform group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                  <Icon className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">{feature.title}</h3>
                <p className="text-slate-600 mb-8 flex-grow leading-relaxed">{feature.description}</p>
                <Link to={feature.path} className="mt-auto">
                  <motion.div 
                    whileHover={{ x: 5 }}
                    className="text-slate-900 font-bold flex items-center gap-2 group-hover:text-green-600 transition-colors"
                  >
                    Explore <ArrowRight className="h-4 w-4" />
                  </motion.div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Stats Section */}
      <div className="bg-gradient-to-b from-white to-slate-50 py-24 border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-12 text-center">
            <motion.div initial={{ opacity: 0, scale: 0.5 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }}>
              <div className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-emerald-500 mb-2">
                <AnimatedCounter end={500} />+
              </div>
              <div className="text-slate-500 font-medium tracking-wide uppercase text-sm">Students Enrolled</div>
            </motion.div>
            <motion.div initial={{ opacity: 0, scale: 0.5 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: 0.1 }}>
              <div className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-500 mb-2">
                <AnimatedCounter end={50} />+
              </div>
              <div className="text-slate-500 font-medium tracking-wide uppercase text-sm">Partner Labs</div>
            </motion.div>
            <motion.div initial={{ opacity: 0, scale: 0.5 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: 0.2 }}>
              <div className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-fuchsia-500 mb-2">
                <AnimatedCounter end={100} />+
              </div>
              <div className="text-slate-500 font-medium tracking-wide uppercase text-sm">Courses Available</div>
            </motion.div>
            <motion.div initial={{ opacity: 0, scale: 0.5 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: 0.3 }}>
              <div className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-red-500 mb-2">
                <AnimatedCounter end={200} />+
              </div>
              <div className="text-slate-500 font-medium tracking-wide uppercase text-sm">Internships</div>
            </motion.div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
