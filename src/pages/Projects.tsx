import React, { useState, useEffect } from 'react';
import { Briefcase, CheckCircle, UploadCloud, PlayCircle, ShieldAlert } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

export default function Projects() {
  const { t } = useLanguage();
  const { token, isAuthenticated } = useAuth();
  const [projects, setProjects] = useState<any[]>([]);
  const [fileUrl, setFileUrl] = useState('');
  const [activeProject, setActiveProject] = useState<number | null>(null);

  useEffect(() => {
    if (isAuthenticated && token) {
      fetchProjects();
    }
  }, [isAuthenticated, token]);

  const fetchProjects = async () => {
    try {
      const res = await fetch('http://localhost:3001/api/projects', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (Array.isArray(data)) setProjects(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmitProject = async (id: number) => {
    if (!fileUrl) {
      alert("Please enter a file or repo URL");
      return;
    }
    
    try {
      const res = await fetch(`http://localhost:3001/api/projects/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status: 'Submitted', file_url: fileUrl })
      });
      if (res.ok) {
        setFileUrl('');
        setActiveProject(null);
        fetchProjects();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkCompleted = async (id: number, title: string) => {
    try {
      const res = await fetch(`http://localhost:3001/api/projects/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status: 'Completed', file_url: projects.find(p => p.id === id)?.file_url })
      });
      
      if (res.ok) {
        // Also generate certificate
        await fetch('http://localhost:3001/api/certificates', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ title: `Certificate of Completion: ${title}`, issuer: 'RuralLearn Institute' })
        });
        
        fetchProjects();
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="max-w-7xl mx-auto py-20 px-4 text-center">
        <h2 className="text-2xl font-bold">Please log in to view Projects.</h2>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8"
    >
      <div className="mb-12 bg-white p-8 rounded-3xl shadow-sm border border-slate-100 flex flex-col md:flex-row items-center gap-6">
        <div className="h-16 w-16 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center">
          <Briefcase className="h-8 w-8" />
        </div>
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Assigned Projects</h1>
          <p className="text-slate-500 mt-2">Complete these hands-on projects to earn certificates.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {projects.map((project, index) => (
          <motion.div
            key={project.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden flex flex-col"
          >
            <div className={`p-6 border-b ${project.status === 'Completed' ? 'bg-green-50 border-green-100' : project.status === 'Submitted' ? 'bg-amber-50 border-amber-100' : 'bg-slate-50 border-slate-100'}`}>
              <div className="flex justify-between items-start mb-2">
                <span className={`text-xs font-bold px-3 py-1 rounded-full ${project.status === 'Completed' ? 'bg-green-200 text-green-800' : project.status === 'Submitted' ? 'bg-amber-200 text-amber-800' : 'bg-blue-200 text-blue-800'}`}>
                  {project.status}
                </span>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">{project.title}</h3>
              <p className="text-slate-600 text-sm">{project.description}</p>
            </div>
            
            <div className="p-6 flex-grow flex flex-col justify-between space-y-4">
              {project.status === 'Assigned' && (
                <>
                  {activeProject === project.id ? (
                    <div className="space-y-3">
                      <input 
                        type="url" 
                        value={fileUrl} 
                        onChange={(e) => setFileUrl(e.target.value)} 
                        placeholder="GitHub Repo or Drive Link" 
                        className="w-full p-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                      />
                      <div className="flex gap-2">
                        <button onClick={() => handleSubmitProject(project.id)} className="flex-1 bg-blue-600 text-white font-bold py-2 rounded-lg text-sm hover:bg-blue-700">Submit</button>
                        <button onClick={() => setActiveProject(null)} className="flex-1 bg-slate-100 text-slate-600 font-bold py-2 rounded-lg text-sm">Cancel</button>
                      </div>
                    </div>
                  ) : (
                    <button onClick={() => setActiveProject(project.id)} className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-colors">
                      <UploadCloud className="h-5 w-5" /> Submit Work
                    </button>
                  )}
                </>
              )}
              
              {project.status === 'Submitted' && (
                <div className="space-y-3">
                  <p className="text-sm text-slate-500 break-all bg-slate-50 p-2 rounded-lg border border-slate-100">
                    <span className="font-bold text-slate-700 block mb-1">Submitted Link:</span>
                    <a href={project.file_url} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">{project.file_url}</a>
                  </p>
                  <button onClick={() => handleMarkCompleted(project.id, project.title)} className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-colors shadow-lg shadow-green-500/30">
                    <CheckCircle className="h-5 w-5" /> Mark as Completed (Trainer Demo)
                  </button>
                </div>
              )}
              
              {project.status === 'Completed' && (
                <div className="bg-green-100 text-green-800 p-4 rounded-xl text-center border border-green-200 flex flex-col items-center gap-2">
                  <ShieldAlert className="h-8 w-8 text-green-600" />
                  <span className="font-bold">Project Completed!</span>
                  <span className="text-xs">Certificate added to your Profile.</span>
                </div>
              )}
            </div>
          </motion.div>
        ))}
        {projects.length === 0 && (
          <div className="col-span-full text-center py-10">
            <p className="text-slate-500">Loading projects...</p>
          </div>
        )}
      </div>
    </motion.div>
  );
}
