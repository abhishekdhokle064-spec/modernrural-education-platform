import { API_URL } from '../config';
import React, { useState, useEffect } from 'react';
import { Briefcase, MapPin, Building, Calendar, CheckCircle, Clock, AlertCircle, IndianRupee, Laptop, Users, Target, Search } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

export default function Internships() {
  const { t, language } = useLanguage();
  const { user, token, isAuthenticated } = useAuth();
  const [internships, setInternships] = useState<any[]>([]);
  const [applications, setApplications] = useState<any[]>([]);
  const [activeCategory, setActiveCategory] = useState('All');
  const role = user?.role || 'Student';
  
  const categories = [
    { key: 'All', label: t('cat.all') },
    { key: 'Internships', label: language === 'mr' ? 'इंटर्नशिप' : language === 'hi' ? 'इंटर्नशिप' : 'Internships' },
    { key: 'Jobs', label: language === 'mr' ? 'नोकऱ्या' : language === 'hi' ? 'नौकरियां' : 'Jobs' },
    { key: 'Apprenticeships', label: language === 'mr' ? 'शिकाऊ उमेदवारी' : language === 'hi' ? 'प्रशिक्षुता' : 'Apprenticeships' },
    { key: 'Freelance', label: language === 'mr' ? 'फ्रीलान्स' : language === 'hi' ? 'फ्रीलांस' : 'Freelance' },
    { key: 'Projects', label: language === 'mr' ? 'प्रकल्प' : language === 'hi' ? 'परियोजनाएं' : 'Projects' },
    { key: 'Scholarships', label: language === 'mr' ? 'शिष्यवृत्ती' : language === 'hi' ? 'छात्रवृत्ति' : 'Scholarships' }
  ];

  // Post Form State
  const [showPostForm, setShowPostForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '', company: '', location: '', type: 'Full-time', required_skills: '', description: '',
    eligibility: '', mode: 'On-site', compensation: '', deadline: '', category: 'Jobs'
  });

  useEffect(() => {
    fetchInternships();
    if (isAuthenticated && token) {
      fetchApplications();
    }
  }, [isAuthenticated, token, role]);

  const fetchInternships = async () => {
    try {
      const res = await fetch(`${API_URL}/api/internships`);
      const data = await res.json();
      if (Array.isArray(data)) setInternships(data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchApplications = async () => {
    try {
      const res = await fetch(`${API_URL}/api/applications`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (Array.isArray(data)) setApplications(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleApply = async (id: number) => {
    if (!isAuthenticated) return alert(language === 'mr' ? 'अर्ज करण्यासाठी कृपया लॉगिन करा.' : language === 'hi' ? 'आवेदन के लिए कृपया लॉगिन करें।' : 'Please log in to apply.');
    try {
      const res = await fetch(`${API_URL}/api/applications`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ internship_id: id })
      });
      if (res.ok) fetchApplications();
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateStatus = async (appId: number, status: string) => {
    try {
      const res = await fetch(`http://localhost:3001/api/applications/${appId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status })
      });
      if (res.ok) fetchApplications();
    } catch (err) {
      console.error(err);
    }
  };

  const handlePostInternship = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_URL}/api/internships`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        setShowPostForm(false);
        setFormData({ title: '', company: '', location: '', type: 'Full-time', required_skills: '', description: '', eligibility: '', mode: 'On-site', compensation: '', deadline: '', category: 'Jobs' });
        fetchInternships();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const filteredInternships = internships.filter(i => activeCategory === 'All' || i.category === activeCategory);

  const StatusStepper = ({ status }: { status: string }) => {
    const steps = [
      { key: 'Pending', label: language === 'mr' ? 'अर्ज केला' : language === 'hi' ? 'आवेदित' : 'Pending' },
      { key: 'Review', label: language === 'mr' ? 'तपासणी सुरू' : language === 'hi' ? 'समीक्षाधीन' : 'Review' },
      { key: 'Shortlisted', label: language === 'mr' ? 'शॉर्टलिस्ट' : language === 'hi' ? 'शॉर्टलिस्ट' : 'Shortlisted' },
      { key: 'Interview', label: language === 'mr' ? 'मुलाखत' : language === 'hi' ? 'साक्षात्कार' : 'Interview' },
      { key: 'Selected', label: language === 'mr' ? 'निवड झाली' : language === 'hi' ? 'चयनित' : 'Selected' }
    ];
    const currentIdx = steps.findIndex(s => s.key === status);
    
    return (
      <div className="flex items-center justify-between w-full mt-4 bg-slate-50 p-4 rounded-xl border border-slate-100 relative">
        {status === 'Rejected' ? (
          <div className="w-full text-center text-rose-600 font-bold flex items-center justify-center gap-2">
            <AlertCircle className="h-5 w-5" /> {language === 'mr' ? 'अर्ज नाकारला' : language === 'hi' ? 'आवेदन अस्वीकृत' : 'Application Rejected'}
          </div>
        ) : (
          steps.map((step, idx) => (
            <div key={step.key} className="flex flex-col items-center relative z-10 w-full">
              <div className={`h-6 w-6 rounded-full flex items-center justify-center text-[10px] font-bold ${idx <= currentIdx ? 'bg-green-500 text-white' : 'bg-slate-200 text-slate-400'}`}>
                {idx <= currentIdx ? <CheckCircle className="h-4 w-4" /> : idx + 1}
              </div>
              <span className={`text-[10px] mt-1 font-bold ${idx <= currentIdx ? 'text-green-700' : 'text-slate-400'}`}>{step.label}</span>
            </div>
          ))
        )}
      </div>
    );
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8"
    >
      <div className="mb-8 bg-gradient-to-r from-indigo-900 to-blue-900 rounded-3xl p-10 text-white shadow-2xl relative overflow-hidden flex justify-between items-center flex-wrap gap-4">
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 bg-blue-500 rounded-full mix-blend-overlay filter blur-3xl opacity-50 animate-pulse"></div>
        <div className="relative z-10 max-w-2xl">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4 flex items-center gap-3">
            <Target className="h-10 w-10 text-blue-300" /> {t('internships.title')}
          </h1>
          <p className="text-blue-100 text-lg">
            {t('internships.subtitle')}
          </p>
        </div>
        
        {role === 'Recruiter' && (
          <button 
            onClick={() => setShowPostForm(!showPostForm)}
            className="relative z-10 bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-xl transition-colors shadow-lg shadow-blue-500/30 cursor-pointer"
          >
            {showPostForm ? (language === 'mr' ? 'सूची पहा' : language === 'hi' ? 'सूची देखें' : 'View Listings') : (language === 'mr' ? 'नवीन संधी पोस्ट करा' : language === 'hi' ? 'नया अवसर पोस्ट करें' : 'Post New Opportunity')}
          </button>
        )}
      </div>

      {!showPostForm && (
        <div className="flex overflow-x-auto pb-4 mb-8 gap-3 hide-scrollbar">
          {categories.map(cat => (
            <button
              key={cat.key}
              onClick={() => setActiveCategory(cat.key)}
              className={`px-5 py-2.5 rounded-full font-bold whitespace-nowrap transition-all cursor-pointer ${
                activeCategory === cat.key ? 'bg-blue-600 text-white shadow-md' : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      )}

      {showPostForm && role === 'Recruiter' ? (
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 mb-12">
          <h2 className="text-2xl font-bold mb-6">
            {language === 'mr' ? 'नवीन नोकरी / इंटर्नशिप पोस्ट करा' : language === 'hi' ? 'नया अवसर पोस्ट करें' : 'Post a New Opportunity'}
          </h2>
          <form onSubmit={handlePostInternship} className="space-y-4 max-w-3xl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><label className="block text-sm font-bold text-slate-700 mb-1">{language === 'mr' ? 'पद / शीर्षक' : language === 'hi' ? 'पद / शीर्षक' : 'Title'}</label><input required className="w-full p-3 border border-slate-200 focus:ring-2 focus:ring-blue-500 rounded-xl" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} /></div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">{t('cat.categories')}</label>
                <select className="w-full p-3 border border-slate-200 focus:ring-2 focus:ring-blue-500 rounded-xl" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
                  {categories.filter(c => c.key !== 'All').map(c => <option key={c.key} value={c.key}>{c.label}</option>)}
                </select>
              </div>
              <div><label className="block text-sm font-bold text-slate-700 mb-1">{language === 'mr' ? 'कंपनी / संस्था' : language === 'hi' ? 'कंपनी / संस्थान' : 'Company/Org'}</label><input required className="w-full p-3 border border-slate-200 focus:ring-2 focus:ring-blue-500 rounded-xl" value={formData.company} onChange={e => setFormData({...formData, company: e.target.value})} /></div>
              <div><label className="block text-sm font-bold text-slate-700 mb-1">{t('internships.location')}</label><input required className="w-full p-3 border border-slate-200 focus:ring-2 focus:ring-blue-500 rounded-xl" value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} /></div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">{language === 'mr' ? 'कामाचे स्वरूप' : language === 'hi' ? 'कार्य का प्रकार' : 'Mode'}</label>
                <select className="w-full p-3 border border-slate-200 focus:ring-2 focus:ring-blue-500 rounded-xl" value={formData.mode} onChange={e => setFormData({...formData, mode: e.target.value})}>
                  <option>On-site</option>
                  <option>Remote</option>
                  <option>Hybrid</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">{t('internships.type')}</label>
                <select className="w-full p-3 border border-slate-200 focus:ring-2 focus:ring-blue-500 rounded-xl" value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})}>
                  <option>Full-time</option>
                  <option>Part-time</option>
                  <option>Flexible</option>
                </select>
              </div>
              <div><label className="block text-sm font-bold text-slate-700 mb-1">{t('internships.stipend')}</label><input required placeholder="e.g. ₹20,000/month or Unpaid" className="w-full p-3 border border-slate-200 focus:ring-2 focus:ring-blue-500 rounded-xl" value={formData.compensation} onChange={e => setFormData({...formData, compensation: e.target.value})} /></div>
              <div><label className="block text-sm font-bold text-slate-700 mb-1">{t('internships.deadline')}</label><input type="date" required className="w-full p-3 border border-slate-200 focus:ring-2 focus:ring-blue-500 rounded-xl" value={formData.deadline} onChange={e => setFormData({...formData, deadline: e.target.value})} /></div>
            </div>
            <div><label className="block text-sm font-bold text-slate-700 mb-1">{t('internships.eligibility')}</label><input required placeholder="e.g. B.Tech 3rd Year, Open to all" className="w-full p-3 border border-slate-200 focus:ring-2 focus:ring-blue-500 rounded-xl" value={formData.eligibility} onChange={e => setFormData({...formData, eligibility: e.target.value})} /></div>
            <div><label className="block text-sm font-bold text-slate-700 mb-1">{t('courses.skills_gained')} (Comma separated)</label><input required placeholder="e.g. React, Python, Communication" className="w-full p-3 border border-slate-200 focus:ring-2 focus:ring-blue-500 rounded-xl" value={formData.required_skills} onChange={e => setFormData({...formData, required_skills: e.target.value})} /></div>
            <div><label className="block text-sm font-bold text-slate-700 mb-1">{language === 'mr' ? 'वर्णन' : language === 'hi' ? 'विवरण' : 'Description'}</label><textarea required rows={4} className="w-full p-3 border border-slate-200 focus:ring-2 focus:ring-blue-500 rounded-xl" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} /></div>
            <button type="submit" className="w-full md:w-auto bg-blue-600 text-white font-bold py-3 px-10 rounded-xl hover:bg-blue-700 transition-colors shadow-md cursor-pointer">
              {language === 'mr' ? 'संधी पोस्ट करा' : language === 'hi' ? 'अवसर पोस्ट करें' : 'Post Opportunity'}
            </button>
          </form>
        </div>
      ) : (
        <>
          {role === 'Recruiter' && applications.length > 0 && (
            <div className="mb-12">
              <h2 className="text-2xl font-bold text-slate-900 mb-6">
                {language === 'mr' ? 'उमेदवार अर्ज व्यवस्थापन' : language === 'hi' ? 'उम्मीदवार आवेदन प्रबंधन' : 'Manage Candidate Applications'}
              </h2>
              <div className="grid grid-cols-1 gap-6">
                {applications.map(app => (
                  <div key={app.id} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="w-full md:w-2/3">
                      <div className="flex justify-between items-start mb-2">
                        <span className="font-extrabold text-lg text-slate-900">{app.applicant_name}</span>
                        <span className={`text-xs font-bold px-3 py-1 rounded-full ${app.status === 'Selected' ? 'bg-green-100 text-green-700' : app.status === 'Rejected' ? 'bg-rose-100 text-rose-700' : 'bg-blue-100 text-blue-700'}`}>{app.status}</span>
                      </div>
                      <p className="text-sm font-medium text-slate-600 mb-2">
                        {language === 'mr' ? 'अर्ज केलेले पद:' : language === 'hi' ? 'आवेदित पद:' : 'Applied for:'} <span className="text-slate-900 font-bold">{app.internship_title}</span>
                      </p>
                      <p className="text-sm text-slate-500 mb-1">{language === 'mr' ? 'उमेदवाराची कौशल्ये:' : language === 'hi' ? 'उम्मीदवार कौशल:' : 'Candidate Skills:'} {app.applicant_skills}</p>
                    </div>
                    {app.status !== 'Selected' && app.status !== 'Rejected' && (
                      <div className="w-full md:w-1/3 flex flex-col gap-2">
                        <select 
                          className="p-2.5 text-sm border border-slate-200 rounded-xl bg-slate-50 font-bold outline-none focus:ring-2 focus:ring-blue-500"
                          value={app.status}
                          onChange={(e) => handleUpdateStatus(app.id, e.target.value)}
                        >
                          <option value="Pending">Pending (Applied)</option>
                          <option value="Review">Under Review</option>
                          <option value="Shortlisted">Shortlist</option>
                          <option value="Interview">Schedule Interview</option>
                          <option value="Selected">Select Candidate</option>
                          <option value="Rejected">Reject Candidate</option>
                        </select>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {filteredInternships.map(internship => {
              const myApp = applications.find(a => a.internship_id === internship.id);
              
              // Basic matching highlight for student if their skills intersect (mocking user skills logic here for visuals)
              const userSkills = user?.skills?.toLowerCase() || '';
              const matchCount = internship.required_skills?.split(',').filter((s:string) => userSkills.includes(s.trim().toLowerCase())).length || 0;
              const isHighMatch = matchCount > 0 && role === 'Student';

              return (
                <div key={internship.id} className={`bg-white p-8 rounded-3xl border ${isHighMatch ? 'border-blue-300 shadow-blue-100' : 'border-slate-100'} shadow-sm hover:shadow-xl transition-all flex flex-col justify-between relative overflow-hidden group`}>
                  {isHighMatch && <div className="absolute top-0 right-0 bg-blue-500 text-white text-xs font-bold px-3 py-1 rounded-bl-xl z-10">{language === 'mr' ? 'कौशल्याशी जुळणारे' : language === 'hi' ? 'उच्च मिलान' : 'High Match'}</div>}
                  
                  <div>
                    <div className="flex justify-between items-start mb-4">
                      <div className="bg-blue-50 text-blue-600 p-3 rounded-xl group-hover:scale-110 transition-transform"><Briefcase className="h-6 w-6" /></div>
                      <div className="flex gap-2">
                        <span className="text-xs font-bold bg-slate-100 px-3 py-1.5 rounded-full text-slate-700">{internship.category || internship.type}</span>
                        <span className="text-xs font-bold bg-blue-50 px-3 py-1.5 rounded-full text-blue-700">{internship.mode || 'On-site'}</span>
                      </div>
                    </div>
                    <h3 className="text-2xl font-bold text-slate-900 mb-2">{internship.title}</h3>
                    
                    <div className="grid grid-cols-2 gap-y-3 gap-x-2 text-sm text-slate-600 mb-6 font-medium bg-slate-50 p-4 rounded-2xl border border-slate-100">
                      <span className="flex items-center gap-1.5"><Building className="h-4 w-4 text-slate-400" /> {internship.company}</span>
                      <span className="flex items-center gap-1.5"><MapPin className="h-4 w-4 text-slate-400" /> {internship.location}</span>
                      <span className="flex items-center gap-1.5"><IndianRupee className="h-4 w-4 text-emerald-500" /> <span className="text-emerald-700 font-bold">{internship.compensation || (language === 'mr' ? 'विनावेतन' : language === 'hi' ? 'अवैतनिक' : 'Unpaid')}</span></span>
                      <span className="flex items-center gap-1.5"><Calendar className="h-4 w-4 text-rose-400" /> {t('internships.deadline')}: {internship.deadline || 'Rolling'}</span>
                      <span className="flex items-center gap-1.5 col-span-2 text-indigo-600"><Users className="h-4 w-4" /> {t('internships.eligibility')}: {internship.eligibility || (language === 'mr' ? 'सर्वांसाठी खुले' : language === 'hi' ? 'सभी के लिए खुला' : 'Open to all')}</span>
                    </div>

                    <div className="mb-6">
                      <p className="text-xs font-bold uppercase text-slate-400 mb-2">{t('courses.skills_gained')}</p>
                      <div className="flex flex-wrap gap-2">
                        {internship.required_skills?.split(',').map((s:string, i:number) => (
                          <span key={i} className="text-xs font-bold bg-slate-100 text-slate-700 px-2.5 py-1.5 rounded-lg border border-slate-200">{s.trim()}</span>
                        ))}
                      </div>
                    </div>
                    <p className="text-sm text-slate-600 mb-8 leading-relaxed line-clamp-3">{internship.description}</p>
                  </div>
                  
                  {role === 'Student' && (
                    myApp ? (
                      <div>
                        <div className="font-bold text-slate-700 text-sm mb-2 border-t pt-4 border-slate-100">
                          {language === 'mr' ? 'अर्जाची सद्य स्थिती:' : language === 'hi' ? 'आवेदन की स्थिति:' : 'Application Status Tracker:'}
                        </div>
                        <StatusStepper status={myApp.status} />
                      </div>
                    ) : (
                      <button onClick={() => handleApply(internship.id)} className="w-full bg-slate-900 text-white font-bold py-3.5 rounded-xl hover:bg-blue-600 transition-colors shadow-md flex items-center justify-center gap-2 cursor-pointer">
                        {t('btn.submit_app')}
                      </button>
                    )
                  )}
                </div>
              );
            })}
            
            {filteredInternships.length === 0 && (
              <div className="col-span-full text-center py-20 bg-white rounded-3xl border border-slate-100">
                <Search className="h-16 w-16 text-slate-200 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-slate-700">
                  {language === 'mr' ? 'कोणत्याही संधी सापडल्या नाहीत' : language === 'hi' ? 'कोई अवसर नहीं मिला' : 'No Opportunities Found'}
                </h3>
                <p className="text-slate-500 mt-2">
                  {language === 'mr' ? 'कृपया दुसरा विभाग निवडून तपासा.' : language === 'hi' ? 'कृपया अन्य श्रेणी चुनकर प्रयास करें।' : 'Try selecting a different category.'}
                </p>
              </div>
            )}
          </div>
        </>
      )}
    </motion.div>
  );
}
