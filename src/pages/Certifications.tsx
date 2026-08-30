import React, { useState } from 'react';
import { Trophy, ShieldCheck, Calendar, User, Building, ExternalLink, Eye, Hash, CheckCircle, GraduationCap, BarChart, X, Download, Award } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../context/LanguageContext';

export default function Certifications() {
  const { t, language } = useLanguage();
  const [selectedCert, setSelectedCert] = useState<any>(null);

  // Diverse, unique mock data as explicitly requested
  const mockCertificates = [
    {
      id: 1,
      title: 'Advanced Machine Learning in Agriculture',
      certId: 'AGRI-ML-2026-X992',
      date: 'Oct 12, 2026',
      recipient: 'Ramesh Patil',
      institution: 'Pune Institute of Technology',
      issuer: 'TechCrop Analytics Pvt Ltd',
      grade: 'Distinction (A+)',
      score: '98/100',
      competencies: ['Python', 'TensorFlow', 'Crop Prediction'],
      checks: 14
    },
    {
      id: 2,
      title: 'Smart IoT Sensor Deployment',
      certId: 'IOT-SENS-2025-B411',
      date: 'Jul 05, 2025',
      recipient: 'Anjali Deshmukh',
      institution: 'Govt. Engineering College, Aurangabad',
      issuer: 'AgriSense Hardware Ltd.',
      grade: 'Excellent (A)',
      score: '94/100',
      competencies: ['IoT', 'Arduino', 'Soldering'],
      checks: 8
    },
    {
      id: 3,
      title: 'Rural Agri-Business Management',
      certId: 'BUS-AGR-2026-C883',
      date: 'Jan 20, 2026',
      recipient: 'Vikram Rathod',
      institution: 'Koprgaon Commerce College',
      issuer: 'State Rural Livelihood Mission',
      grade: 'Outstanding (O)',
      score: '96/100',
      competencies: ['Finance', 'Supply Chain', 'Marketing'],
      checks: 21
    },
    {
      id: 4,
      title: 'Modern Web Development (React & Node)',
      certId: 'WEB-DEV-2024-Y117',
      date: 'Nov 30, 2024',
      recipient: 'Priya Sharma',
      institution: 'Mumbai University',
      issuer: 'RuralLearn Tech Academy',
      grade: 'First Class (B+)',
      score: '88/100',
      competencies: ['React', 'Node.js', 'TypeScript'],
      checks: 5
    }
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8"
    >
      <div className="mb-12 bg-gradient-to-r from-amber-600 to-orange-500 rounded-3xl p-10 text-white shadow-2xl relative overflow-hidden flex justify-between items-center flex-wrap gap-4">
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 bg-yellow-400 rounded-full mix-blend-overlay filter blur-3xl opacity-50 animate-pulse"></div>
        <div className="relative z-10 max-w-2xl">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4 flex items-center gap-3">
            <Trophy className="h-10 w-10 md:h-12 md:w-12 text-amber-200" />
            {t('cert.title')}
          </h1>
          <p className="text-amber-100 text-lg">
            {t('cert.subtitle')}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {mockCertificates.map((cert, index) => (
          <motion.div
            key={cert.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-3xl shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-200 overflow-hidden relative group flex flex-col"
          >
            {/* Background decorative pattern */}
            <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-amber-100 to-orange-50 rounded-bl-full opacity-50 transition-transform group-hover:scale-110 pointer-events-none"></div>
            
            <div className="p-8 relative z-10 flex flex-col flex-grow">
              {/* Header: Trophy + Cert ID + Verified Badge + Date */}
              <div className="flex flex-wrap justify-between items-start gap-4 mb-6">
                <div className="flex flex-wrap items-center gap-3">
                  <div className="bg-amber-100 p-2 rounded-xl">
                    <Trophy className="h-5 w-5 text-amber-600" />
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-500 text-sm font-mono bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                    <Hash className="h-3.5 w-3.5" /> {cert.certId}
                  </div>
                  <div className="flex items-center gap-1.5 bg-green-50 text-green-700 px-3 py-1.5 rounded-lg border border-green-200 shadow-sm">
                    <ShieldCheck className="h-4 w-4" />
                    <span className="text-xs font-bold uppercase tracking-wider">{language === 'mr' ? 'पडताळणी झालेले' : language === 'hi' ? 'सत्यापित' : 'Verified'}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 text-slate-500 text-sm font-medium whitespace-nowrap">
                  <Calendar className="h-4 w-4 text-slate-400" /> {cert.date}
                </div>
              </div>

              {/* Body: Title, Recipient, Issuer */}
              <div className="mb-6 flex-grow">
                <h2 className="text-2xl font-extrabold text-slate-900 mb-4 leading-tight group-hover:text-blue-700 transition-colors">{cert.title}</h2>
                
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <User className="h-5 w-5 text-indigo-400 mt-0.5" />
                    <div>
                      <p className="text-sm font-bold text-slate-900">{cert.recipient}</p>
                      <p className="text-xs font-medium text-slate-500 flex items-center gap-1"><GraduationCap className="h-3 w-3" /> {cert.institution}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <Building className="h-5 w-5 text-amber-500 mt-0.5" />
                    <div>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-0.5">{language === 'mr' ? 'प्रमाणपत्र जारीकर्ता' : language === 'hi' ? 'जारीकर्ता' : 'Issuer'}</p>
                      <p className="text-sm font-bold text-slate-800">{cert.issuer}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Details: Evaluation & Competencies */}
              <div className="mb-6 space-y-4">
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <BarChart className="h-5 w-5 text-emerald-500" />
                    <div>
                      <p className="text-xs font-bold uppercase text-slate-400">{t('cert.grade')}</p>
                      <p className="text-sm font-extrabold text-slate-800">{cert.grade}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-bold uppercase text-slate-400">{language === 'mr' ? 'गुण' : language === 'hi' ? 'अंक' : 'Score'}</p>
                    <p className="text-lg font-black text-emerald-600">{cert.score}</p>
                  </div>
                </div>

                <div>
                  <p className="text-xs font-bold uppercase text-slate-400 mb-2">{t('cert.skills_verified')}</p>
                  <div className="flex flex-wrap gap-2">
                    {cert.competencies.map((comp: string, i: number) => (
                      <span key={i} className="text-xs font-bold bg-amber-50 text-amber-700 px-3 py-1.5 rounded-lg border border-amber-100 flex items-center gap-1.5">
                        <CheckCircle className="h-3.5 w-3.5" /> {comp}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Footer: Verification Count & Button */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-slate-100 mt-auto">
                <div className="flex items-center gap-2 text-slate-500 text-sm font-medium">
                  <div className="bg-blue-50 p-1.5 rounded-full">
                    <Eye className="h-4 w-4 text-blue-500" />
                  </div>
                  <span>
                    {language === 'mr' ? `${cert.checks} कंपन्यांद्वारे पडताळणी` : language === 'hi' ? `${cert.checks} नियोक्ताओं द्वारा सत्यापित` : `Verified by ${cert.checks} recruiters`}
                  </span>
                </div>
                
                <button 
                  onClick={() => setSelectedCert(cert)}
                  className="w-full sm:w-auto bg-blue-600 text-white font-bold py-2.5 px-6 rounded-xl hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20 hover:shadow-blue-600/40 cursor-pointer"
                >
                  {t('btn.view_cert')} <ExternalLink className="h-4 w-4" />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Modal for Full Credential */}
      <AnimatePresence>
        {selectedCert && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedCert(null)}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl shadow-2xl overflow-hidden max-w-4xl w-full relative flex flex-col max-h-[90vh]"
            >
              {/* Close Button */}
              <button 
                onClick={() => setSelectedCert(null)}
                className="absolute top-4 right-4 z-20 p-2 bg-slate-100/50 hover:bg-slate-200 rounded-full text-slate-500 transition-colors cursor-pointer"
              >
                <X className="h-6 w-6" />
              </button>

              {/* Authentic Certificate Design */}
              <div 
                className="p-10 sm:p-16 relative overflow-y-auto min-h-[600px] flex flex-col justify-center items-center text-center" 
                style={{ backgroundImage: 'radial-gradient(circle, #ffffff, #f9f6f0)', boxShadow: 'inset 0 0 100px rgba(217, 194, 142, 0.2)' }}
              >
                {/* Ornate Borders */}
                <div className="absolute inset-3 sm:inset-5 border-[8px] border-double border-amber-300/60 pointer-events-none rounded-sm"></div>
                <div className="absolute inset-5 sm:inset-7 border border-amber-400/40 pointer-events-none rounded-sm"></div>
                
                {/* Subtle Watermark */}
                <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none">
                  <Award className="w-[500px] h-[500px]" />
                </div>

                <div className="relative z-10 w-full max-w-3xl flex flex-col items-center">
                  <div className="flex items-center gap-3 mb-8 opacity-80">
                    <Building className="h-8 w-8 text-slate-800" />
                    <span className="text-xl font-serif font-bold text-slate-800 tracking-[0.3em] uppercase">{selectedCert.issuer}</span>
                  </div>

                  <h1 className="text-4xl sm:text-5xl md:text-6xl font-serif text-slate-900 mb-6" style={{ fontVariant: 'small-caps', letterSpacing: '2px' }}>
                    {language === 'mr' ? 'प्रमाणपत्र' : language === 'hi' ? 'प्रमाणपत्र' : 'Certificate of Achievement'}
                  </h1>
                  
                  <p className="text-amber-700 font-serif italic mb-8 tracking-[0.2em] text-sm uppercase">
                    {t('cert.issued_to')}
                  </p>

                  <div className="w-full max-w-xl border-b border-slate-300 pb-4 mb-8">
                    <h2 className="text-5xl sm:text-6xl text-slate-800" style={{ fontFamily: '"Brush Script MT", "Great Vibes", "Snell Roundhand", cursive' }}>
                      {selectedCert.recipient}
                    </h2>
                  </div>

                  <p className="text-slate-600 font-serif italic text-lg mb-4 px-4">
                    {t('cert.for_mastering')}
                  </p>

                  <h3 className="text-2xl sm:text-3xl font-serif font-bold text-slate-900 mb-8 px-8 uppercase tracking-wide">
                    {selectedCert.title}
                  </h3>

                  <p className="text-slate-700 font-serif text-md mb-16 max-w-2xl leading-relaxed">
                    {language === 'mr' ? `श्रेणी: ${selectedCert.grade} आणि गुण: ${selectedCert.score}` : language === 'hi' ? `श्रेणी: ${selectedCert.grade} एवं अंक: ${selectedCert.score}` : `having achieved a formal evaluation of ${selectedCert.grade} with a score of ${selectedCert.score}`}. 
                    <br/><br/>
                    <span className="text-sm text-slate-500 italic">{t('cert.skills_verified')}: {selectedCert.competencies.join(', ')}.</span>
                  </p>

                  <div className="w-full flex justify-between items-end px-4 sm:px-8">
                    <div className="text-center w-40 sm:w-48">
                      <p className="border-b border-slate-400 pb-2 mb-2 font-serif text-lg text-slate-800">{selectedCert.date}</p>
                      <p className="text-[10px] sm:text-xs font-bold tracking-widest text-slate-400 uppercase">{t('cert.issued_date')}</p>
                    </div>

                    <div className="flex flex-col items-center translate-y-4">
                      <div className="relative flex items-center justify-center">
                        <Award className="h-24 w-24 sm:h-28 sm:w-28 text-amber-500 drop-shadow-lg" />
                        <ShieldCheck className="h-8 w-8 sm:h-10 sm:w-10 text-white absolute mt-2" />
                      </div>
                      <p className="text-[9px] sm:text-[10px] font-mono text-slate-400 mt-2 tracking-wider">{t('cert.cert_id')}: {selectedCert.certId}</p>
                    </div>

                    <div className="text-center w-40 sm:w-48">
                      <div className="border-b border-slate-400 pb-2 mb-2 h-10 flex items-end justify-center">
                        <span className="text-2xl text-slate-700 leading-none" style={{ fontFamily: '"Brush Script MT", cursive' }}>Authorized</span>
                      </div>
                      <p className="text-[10px] sm:text-xs font-bold tracking-widest text-slate-400 uppercase">{t('cert.authorized_by')}</p>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Modal Action Bar */}
              <div className="bg-slate-900 p-4 sm:px-8 flex justify-between items-center">
                <span className="text-slate-400 text-sm flex items-center gap-2">
                  <Eye className="h-4 w-4" /> {language === 'mr' ? `${selectedCert.checks} कंपन्यांनी पाहिले` : language === 'hi' ? `${selectedCert.checks} नियोक्ताओं ने देखा` : `${selectedCert.checks} recruiters viewed this`}
                </span>
                <button 
                  onClick={() => window.print()}
                  className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg font-bold text-sm transition-colors flex items-center gap-2 cursor-pointer"
                >
                  <Download className="h-4 w-4" /> {t('btn.print_cert')}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
