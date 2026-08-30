import React, { useState, useEffect, useRef } from 'react';
import { 
  BrainCircuit, Send, User, Sparkles, Target, Zap, CheckCircle2, 
  AlertCircle, BookOpen, FlaskConical, ArrowRight, Compass, Clock, Award, 
  Plus, X, RefreshCw, Save, Download, Copy, Check, ChevronRight, HelpCircle, Layers, MapPin
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';

interface RoleBenchmark {
  role: string;
  category: string;
  requiredSkills: string[];
  courseId: number;
  courseTitle: string;
  courseDuration: string;
  labId: number;
  labName: string;
  labType: string;
  description: string;
}

const PRESET_ROLES: RoleBenchmark[] = [
  {
    role: 'Full-Stack Web Developer',
    category: 'Software',
    requiredSkills: ['React', 'TypeScript', 'Node.js', 'Express', 'SQLite', 'REST APIs'],
    courseId: 15,
    courseTitle: 'Full-Stack Web Development (React & Node.js)',
    courseDuration: '10 weeks',
    labId: 5,
    labName: 'Advanced Software & Cloud Lab',
    labType: 'Computer Lab',
    description: 'Build modern web applications with frontend UI, backend APIs, and database persistence.'
  },
  {
    role: 'IoT & Smart Hardware Engineer',
    category: 'Hardware',
    requiredSkills: ['Arduino', 'ESP32', 'Circuit Design', 'Sensor Calibration', 'Soldering', 'Microcontrollers'],
    courseId: 12,
    courseTitle: 'IoT Hardware & Smart Sensor Deployment',
    courseDuration: '5 weeks',
    labId: 4,
    labName: 'IoT & Embedded Systems Makerspace',
    labType: 'Hardware Lab',
    description: 'Interface microcontrollers with rural IoT sensors, fabricate circuits, and transmit telemetry.'
  },
  {
    role: 'Solar PV Installation & Energy Technician',
    category: 'Hardware',
    requiredSkills: ['Solar Panel Sizing', 'Inverter Setup', 'DC Wiring', 'Electrical Safety', 'Battery Storage'],
    courseId: 13,
    courseTitle: 'Solar PV System Installation & Maintenance',
    courseDuration: '4 weeks',
    labId: 2,
    labName: 'Taluka Hardware & Electronics Workshop',
    labType: 'Hardware Lab',
    description: 'Install and service off-grid solar panels, battery charge controllers, and farm inverters.'
  },
  {
    role: 'Agricultural Drone Assembly Specialist',
    category: 'Hardware',
    requiredSkills: ['BLDC Motors', 'ESC Calibration', 'ArduPilot', 'Drone Wiring', 'Soldering', 'Flight Testing'],
    courseId: 14,
    courseTitle: 'Agricultural Drone Assembly & Troubleshooting',
    courseDuration: '8 weeks',
    labId: 2,
    labName: 'Taluka Hardware & Electronics Workshop',
    labType: 'Hardware Lab',
    description: 'Assemble, wire, and calibrate autonomous spraying and survey multirotors.'
  },
  {
    role: 'AI & Rural Data Analyst',
    category: 'Technology',
    requiredSkills: ['Python', 'Machine Learning', 'Computer Vision', 'OpenCV', 'Pandas', 'Predictive Analytics'],
    courseId: 19,
    courseTitle: 'Artificial Intelligence & Rural Data Analytics',
    courseDuration: '8 weeks',
    labId: 5,
    labName: 'Advanced Software & Cloud Lab',
    labType: 'Computer Lab',
    description: 'Train machine learning models for crop disease detection and rural survey data processing.'
  },
  {
    role: 'Cybersecurity & Digital Defense Specialist',
    category: 'Technology',
    requiredSkills: ['Network Security', 'Firewall Setup', 'Phishing Defense', 'Cryptography', 'Digital Safety'],
    courseId: 20,
    courseTitle: 'Cybersecurity Fundamentals & Digital Banking Safety',
    courseDuration: '6 weeks',
    labId: 1,
    labName: 'Koprgaon Regional IT & Computer Center',
    labType: 'Computer Lab',
    description: 'Protect village digital payment channels, harden systems against intrusion, and ensure cyber compliance.'
  },
  {
    role: 'Precision Agriculture Specialist',
    category: 'Agriculture',
    requiredSkills: ['Drip Automation', 'Soil Analysis', 'Weather Forecasting', 'Crop Health', 'pH Testing'],
    courseId: 23,
    courseTitle: 'Modern Precision Agriculture Techniques',
    courseDuration: '4 weeks',
    labId: 3,
    labName: 'District Soil & Water Testing Center',
    labType: 'Agriculture Lab',
    description: 'Automate farm irrigation schedules, interpret soil chemistry reports, and forecast crop yield.'
  },
  {
    role: 'Cloud Computing & Linux Administrator',
    category: 'Software',
    requiredSkills: ['Linux', 'Bash', 'Docker', 'Nginx', 'Cloud Hosting', 'DevOps Basics'],
    courseId: 18,
    courseTitle: 'Cloud Computing & Linux Server Administration',
    courseDuration: '6 weeks',
    labId: 5,
    labName: 'Advanced Software & Cloud Lab',
    labType: 'Computer Lab',
    description: 'Deploy containerized web services, configure reverse proxies, and manage cloud Linux servers.'
  }
];

const POPULAR_SKILL_SUGGESTIONS = [
  'HTML', 'CSS', 'JavaScript', 'React', 'Node.js', 'Python', 'Arduino',
  'ESP32', 'Soldering', 'Solar Basics', 'DC Wiring', 'Linux', 'SQL',
  'Drip Automation', 'Soil Analysis', 'Network Security', 'Docker', 'Circuit Design'
];

interface ChatMessage {
  id: number;
  text: string;
  sender: 'bot' | 'user';
  recommendations?: {
    course?: { id: number; title: string };
    lab?: { id: number; name: string };
  };
  followUps?: string[];
}

export default function AIAdvisor() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'predictor' | 'chat'>('predictor');

  // --- CHAT STATE ---
  const [messages, setMessages] = useState<ChatMessage[]>([
    { 
      id: 1, 
      text: `Hello${user?.name ? ` ${user.name}` : ''}! I am your RuralLearn AI Career & Skill Advisor. Share your current skills, education level (e.g. 12th / Diploma / Degree), or career aspirations, and I will identify your exact skill gaps, recommend matching courses & labs, and build your personalized learning roadmap.`, 
      sender: 'bot',
      followUps: [
        "I want to become a Full-Stack Web Developer",
        "I have a Diploma and want to build IoT Hardware",
        "How do I become a Solar Installation Technician?",
        "What skills do I need for Agricultural Drones?"
      ]
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // --- PREDICTOR STATE ---
  const [selectedRole, setSelectedRole] = useState<string>(PRESET_ROLES[0].role);
  const [educationLevel, setEducationLevel] = useState<string>('Polytechnic Diploma');
  const [learningPace, setLearningPace] = useState<string>('Standard (8-10 hrs/week)');
  const [userSkills, setUserSkills] = useState<string[]>(['HTML', 'CSS', 'JavaScript', 'Soldering']);
  const [customSkillInput, setCustomSkillInput] = useState('');
  const [predictionResult, setPredictionResult] = useState<any>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [savedRoadmapNotice, setSavedRoadmapNotice] = useState(false);
  const [copiedNotice, setCopiedNotice] = useState(false);

  // Auto-fill from user profile if available
  useEffect(() => {
    if (user?.skills) {
      const skillsArray = user.skills.split(',').map(s => s.trim()).filter(Boolean);
      if (skillsArray.length > 0) {
        setUserSkills(skillsArray);
      }
    }
    if (user?.education) {
      setEducationLevel(user.education);
    }
    // Check saved roadmap
    const saved = localStorage.getItem('rurallearn_saved_roadmap');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.role) {
          setSelectedRole(parsed.role);
          if (parsed.userSkills) setUserSkills(parsed.userSkills);
        }
      } catch (e) {}
    }
  }, [user]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (activeTab === 'chat') {
      scrollToBottom();
    }
  }, [messages, isTyping, activeTab]);

  // Run initial prediction on load
  useEffect(() => {
    runPrediction(selectedRole, userSkills, educationLevel, learningPace);
  }, []);

  // --- CONTEXTUAL AI CHAT ENGINE ---
  const generateAIResponse = (userText: string): { reply: string; rec?: any; followUps?: string[] } => {
    const text = userText.toLowerCase();

    if (text.includes('web') || text.includes('full-stack') || text.includes('react') || text.includes('frontend') || text.includes('developer')) {
      return {
        reply: `For Full-Stack Web Development, industry employers look for proficiency across React UI, TypeScript, REST API development with Node.js/Express, and SQLite database modeling.\n\nBased on your background, your primary skill gap is mastering asynchronous backend architecture and database persistence.`,
        rec: {
          course: { id: 15, title: 'Full-Stack Web Development (React & Node.js)' },
          lab: { id: 5, name: 'Advanced Software & Cloud Lab' }
        },
        followUps: [
          "What is the step-by-step roadmap for Web Development?",
          "Can I do this with an ITI / Diploma background?",
          "Are there local internship opportunities for web developers?"
        ]
      };
    }

    if (text.includes('iot') || text.includes('sensor') || text.includes('arduino') || text.includes('esp32') || text.includes('hardware')) {
      return {
        reply: `Smart IoT Engineering combines embedded microcontroller programming (ESP32/Arduino), ADC sensor calibration for agricultural soils, and custom PCB soldering.\n\nRecommended practical path: Bridge firmware programming and practice breadboard/soldering wiring at our local makerspace.`,
        rec: {
          course: { id: 12, title: 'IoT Hardware & Smart Sensor Deployment' },
          lab: { id: 4, name: 'IoT & Embedded Systems Makerspace' }
        },
        followUps: [
          "Generate my IoT learning roadmap",
          "What equipment is available in the Koprgaon IoT lab?",
          "How can IoT sensors help local farmers in Ahmednagar?"
        ]
      };
    }

    if (text.includes('solar') || text.includes('renewable') || text.includes('inverter') || text.includes('pv') || text.includes('electricity')) {
      return {
        reply: `Solar PV Installation & Energy Technician is one of the highest-demand rural vocations in Maharashtra! Key competencies include DC string wiring, inverter sizing calculations, battery storage management, and electrical earthing safety.`,
        rec: {
          course: { id: 13, title: 'Solar PV System Installation & Maintenance' },
          lab: { id: 2, name: 'Taluka Hardware & Electronics Workshop' }
        },
        followUps: [
          "How long does solar certification take?",
          "What safety gear is needed for solar labs?",
          "Show me jobs in solar maintenance"
        ]
      };
    }

    if (text.includes('drone') || text.includes('spraying') || text.includes('uav') || text.includes('flight')) {
      return {
        reply: `Agricultural Drone Specialists are critical for precision spraying and aerial crop surveys. You will need hands-on skills in BLDC motor ESC calibration, ArduPilot flight controllers, transceiver telemetry, and payload assembly.`,
        rec: {
          course: { id: 14, title: 'Agricultural Drone Assembly & Troubleshooting' },
          lab: { id: 2, name: 'Taluka Hardware & Electronics Workshop' }
        },
        followUps: [
          "What are the DGCA drone pilot requirements?",
          "Can I practice drone assembly in the lab?",
          "Generate roadmap for Drone Assembly Specialist"
        ]
      };
    }

    if (text.includes('ai') || text.includes('data') || text.includes('python') || text.includes('machine learning')) {
      return {
        reply: `For AI & Rural Data Analytics, Python programming with Pandas and OpenCV provides the baseline for computer vision crop disease detection and predictive crop-yield modeling.\n\nRecommended: Pair theory with GPU workstation testing in the computer center.`,
        rec: {
          course: { id: 19, title: 'Artificial Intelligence & Rural Data Analytics' },
          lab: { id: 5, name: 'Advanced Software & Cloud Lab' }
        },
        followUps: [
          "How do I use AI for agricultural soil & crop analysis?",
          "Generate 8-week AI learning roadmap",
          "What math prerequisites are needed for AI?"
        ]
      };
    }

    if (text.includes('agri') || text.includes('farm') || text.includes('soil') || text.includes('crop') || text.includes('irrigation')) {
      return {
        reply: `Precision Agriculture integrates automated drip irrigation controllers, digital soil moisture and NPK chemical analysis, and localized weather forecast planning to optimize farm yields.`,
        rec: {
          course: { id: 23, title: 'Modern Precision Agriculture Techniques' },
          lab: { id: 3, name: 'District Soil & Water Testing Center' }
        },
        followUps: [
          "How do I book a soil testing session at the lab?",
          "What are the best smart irrigation sensors?",
          "Generate Precision Agriculture roadmap"
        ]
      };
    }

    if (text.includes('roadmap') || text.includes('plan') || text.includes('how to start') || text.includes('schedule')) {
      return {
        reply: `I have pre-configured a customized 4-phase learning roadmap for you! Switch to our **Skill Gap Predictor** tab at the top to view your matched score, required milestones, recommended lab hours, and save your progress.`,
        followUps: [
          "Switch to Skill Gap Predictor tab",
          "Recommend courses for beginners",
          "How do verifiable certificates work?"
        ]
      };
    }

    // Default intelligent response
    return {
      reply: `Thank you for sharing! To achieve your goal, I recommend identifying your baseline competencies and pairing theory lectures with hands-on lab sessions at our Koprgaon centers. Check out our Skill Gap Predictor tab for a complete phase-by-phase breakdown!`,
      followUps: [
        "What are the highest demand courses right now?",
        "Show me computer and hardware labs in Koprgaon",
        "How can I earn a verifiable diploma?"
      ]
    };
  };

  const handleSend = (e?: React.FormEvent, customText?: string) => {
    if (e) e.preventDefault();
    const query = (customText || input).trim();
    if (!query) return;

    const userMsg: ChatMessage = { id: Date.now(), text: query, sender: 'user' };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    setTimeout(() => {
      const responseData = generateAIResponse(query);
      const botMsg: ChatMessage = {
        id: Date.now() + 1,
        text: responseData.reply,
        sender: 'bot',
        recommendations: responseData.rec,
        followUps: responseData.followUps
      };
      setMessages(prev => [...prev, botMsg]);
      setIsTyping(false);
    }, 1000);
  };

  // Skill Gap Prediction Logic
  const runPrediction = (
    roleName: string, 
    skills: string[], 
    eduLevel: string = educationLevel, 
    pace: string = learningPace
  ) => {
    setAnalyzing(true);
    const targetBenchmark = PRESET_ROLES.find(r => r.role === roleName) || PRESET_ROLES[0];
    
    // Normalize skills
    const normalizedUserSkills = skills.map(s => s.trim().toLowerCase());
    
    const acquiredSkills: string[] = [];
    const missingGaps: string[] = [];

    targetBenchmark.requiredSkills.forEach(reqSkill => {
      const isAcquired = normalizedUserSkills.some(us => 
        us === reqSkill.toLowerCase() || 
        us.includes(reqSkill.toLowerCase()) || 
        reqSkill.toLowerCase().includes(us)
      );
      if (isAcquired) {
        acquiredSkills.push(reqSkill);
      } else {
        missingGaps.push(reqSkill);
      }
    });

    const totalRequired = targetBenchmark.requiredSkills.length;
    const matchScore = Math.min(100, Math.max(15, Math.round((acquiredSkills.length / totalRequired) * 100)));

    // Generate dynamic phase durations based on pace
    const isIntensive = pace.includes('Intensive');
    const isWeekend = pace.includes('Weekend');

    const durationWeeks = isIntensive ? '6 Weeks' : isWeekend ? '12 Weeks' : '8 Weeks';

    setTimeout(() => {
      const resultObj = {
        role: targetBenchmark.role,
        category: targetBenchmark.category,
        educationLevel: eduLevel,
        learningPace: pace,
        durationTotal: durationWeeks,
        description: targetBenchmark.description,
        matchScore,
        userSkills: skills,
        acquiredSkills,
        missingGaps,
        courseId: targetBenchmark.courseId,
        courseTitle: targetBenchmark.courseTitle,
        courseDuration: targetBenchmark.courseDuration,
        labId: targetBenchmark.labId,
        labName: targetBenchmark.labName,
        labType: targetBenchmark.labType,
        roadmap: [
          {
            phase: 'Phase 1: Foundational Skill Bridging',
            time: isIntensive ? 'Week 1' : 'Weeks 1 - 2',
            focus: `Master prerequisite theory and bridge gap in: ${missingGaps.slice(0, 2).join(', ') || 'Core Principles'}`,
            deliverable: 'Complete initial video lectures and pass module competency self-checks.',
            labActivity: 'Basic workstation & multimeter safety orientation.'
          },
          {
            phase: 'Phase 2: Practical Lab Bench Diagnostics',
            time: isIntensive ? 'Weeks 2 - 3' : 'Weeks 3 - 5',
            focus: `Hands-on bench exercises at ${targetBenchmark.labName} targeting ${missingGaps.slice(2, 4).join(', ') || 'Applied Industry Protocols'}.`,
            deliverable: 'Execute 4 supervised practical lab worksheets and circuit assembly.',
            labActivity: 'Book physical time slots and calibrate equipment under trainer supervision.'
          },
          {
            phase: 'Phase 3: Real-World Rural Capstone Project',
            time: isIntensive ? 'Weeks 4 - 5' : 'Weeks 6 - 7',
            focus: `Build an end-to-end capstone addressing a real regional challenge in ${targetBenchmark.category}.`,
            deliverable: 'Submit functional prototype code or assembled hardware board for trainer review.',
            labActivity: 'Final stress-testing and demonstration at partner lab center.'
          },
          {
            phase: 'Phase 4: Verifiable Certification & Job Placement',
            time: isIntensive ? 'Week 6' : 'Week 8',
            focus: `Pass the final certification assessment and apply directly to matched partner opportunities.`,
            deliverable: 'Unlock official digitally verifiable diploma on /certifications and submit resumes.',
            labActivity: 'Graduate showcase with regional recruiters and agribusiness employers.'
          }
        ]
      };
      setPredictionResult(resultObj);
      setAnalyzing(false);
    }, 350);
  };

  const handleAddSkill = (skill: string) => {
    const trimmed = skill.trim();
    if (trimmed && !userSkills.some(s => s.toLowerCase() === trimmed.toLowerCase())) {
      const updated = [...userSkills, trimmed];
      setUserSkills(updated);
      setCustomSkillInput('');
      runPrediction(selectedRole, updated, educationLevel, learningPace);
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    const updated = userSkills.filter(s => s !== skillToRemove);
    setUserSkills(updated);
    runPrediction(selectedRole, updated, educationLevel, learningPace);
  };

  const handleRoleSelect = (role: string) => {
    setSelectedRole(role);
    runPrediction(role, userSkills, educationLevel, learningPace);
  };

  const handleSaveRoadmap = () => {
    if (predictionResult) {
      localStorage.setItem('rurallearn_saved_roadmap', JSON.stringify(predictionResult));
      setSavedRoadmapNotice(true);
      setTimeout(() => setSavedRoadmapNotice(false), 3000);
    }
  };

  const handleCopyRoadmap = () => {
    if (!predictionResult) return;
    const text = `
=== RuralLearn AI Career Roadmap ===
Target Role: ${predictionResult.role} (${predictionResult.category})
Readiness Score: ${predictionResult.matchScore}%
Education Level: ${predictionResult.educationLevel}
Pace: ${predictionResult.learningPace}

Acquired Skills: ${predictionResult.acquiredSkills.join(', ') || 'None'}
Identified Skill Gaps: ${predictionResult.missingGaps.join(', ') || 'None'}

Recommended Course: ${predictionResult.courseTitle}
Recommended Lab: ${predictionResult.labName}

Roadmap Steps:
${predictionResult.roadmap.map((s: any, i: number) => `${i + 1}. [${s.time}] ${s.phase}\n   - Focus: ${s.focus}\n   - Deliverable: ${s.deliverable}`).join('\n')}
    `.trim();

    navigator.clipboard.writeText(text);
    setCopiedNotice(true);
    setTimeout(() => setCopiedNotice(false), 2500);
  };

  const handleDownloadRoadmap = () => {
    if (!predictionResult) return;
    const content = `
# RuralLearn Personalized Career Roadmap
**Target Role:** ${predictionResult.role} (${predictionResult.category})
**Match Readiness Score:** ${predictionResult.matchScore}%
**Student Education Level:** ${predictionResult.educationLevel}
**Learning Pace:** ${predictionResult.learningPace}
**Generated Date:** ${new Date().toLocaleDateString()}

---

## 1. Skill Assessment Breakdown
- **Validated Skills Acquired:** ${predictionResult.acquiredSkills.join(', ') || 'None'}
- **Identified Skill Gaps to Bridge:** ${predictionResult.missingGaps.join(', ') || 'None'}

## 2. Recommended Platform Learning
- **Primary Course:** ${predictionResult.courseTitle} (${predictionResult.courseDuration})
- **Hands-on Practical Lab:** ${predictionResult.labName} (${predictionResult.labType})

---

## 3. Step-by-Step Learning Timeline
${predictionResult.roadmap.map((s: any, i: number) => `
### ${i + 1}. ${s.phase} (${s.time})
- **Focus:** ${s.focus}
- **Milestone Deliverable:** ${s.deliverable}
- **Lab Practical Component:** ${s.labActivity}
`).join('')}

---
*Generated by RuralLearn AI Skill Advisor • Empowering Rural Technical Careers*
    `.trim();

    const blob = new Blob([content], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `RuralLearn_Roadmap_${predictionResult.role.replace(/[^a-zA-Z0-9]/g, '_')}.md`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      className="max-w-6xl mx-auto py-8 px-4 sm:px-6 lg:px-8 min-h-[calc(100vh-5rem)] flex flex-col"
    >
      {/* Top Header Banner */}
      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
        <div className="flex items-center gap-4">
          <div className="bg-gradient-to-br from-purple-500 to-fuchsia-600 p-3.5 rounded-2xl text-white shadow-lg shadow-purple-500/30">
            <BrainCircuit className="h-8 w-8" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              {t('ai.title')}
              <span className="bg-purple-100 text-purple-700 text-xs px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider">AI Intelligence</span>
            </h1>
            <p className="text-slate-500 text-xs sm:text-sm">Personalized career analysis, skill gap predictions & interactive learning roadmaps</p>
          </div>
        </div>

        {/* Tab Toggle */}
        <div className="flex bg-slate-100 p-1.5 rounded-2xl border border-slate-200 self-start md:self-auto">
          <button
            onClick={() => setActiveTab('predictor')}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'predictor'
                ? 'bg-purple-600 text-white shadow-md shadow-purple-600/20'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Zap className="h-4 w-4" /> Skill Gap Predictor & Roadmap
          </button>
          <button
            onClick={() => setActiveTab('chat')}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'chat'
                ? 'bg-purple-600 text-white shadow-md shadow-purple-600/20'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Sparkles className="h-4 w-4" /> AI Career Chat
          </button>
        </div>
      </div>

      {/* TAB 1: SKILL GAP PREDICTOR & ROADMAP */}
      {activeTab === 'predictor' && (
        <div className="space-y-8">
          {/* Top Inputs: Target Role, Education, Pace, Current Skills */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left: Configuration Inputs */}
            <div className="lg:col-span-5 bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-slate-100 space-y-5">
              <div className="border-b border-slate-100 pb-3">
                <span className="text-xs font-black uppercase text-purple-600 tracking-wider">Step 1: Career Parameters</span>
                <h3 className="text-lg font-bold text-slate-900 mt-0.5">Customize Your Assessment</h3>
              </div>

              {/* 1. Target Role */}
              <div>
                <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-500 mb-1.5 flex items-center gap-1.5">
                  <Target className="h-3.5 w-3.5 text-purple-600" /> Target Career Role
                </label>
                <select
                  value={selectedRole}
                  onChange={(e) => handleRoleSelect(e.target.value)}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:bg-white focus:ring-2 focus:ring-purple-500 outline-none transition-all cursor-pointer"
                >
                  {PRESET_ROLES.map((r) => (
                    <option key={r.role} value={r.role}>
                      {r.role} ({r.category})
                    </option>
                  ))}
                </select>
              </div>

              {/* 2. Education Level & Learning Pace in a 2-col row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-500 mb-1.5">
                    Education Level
                  </label>
                  <select
                    value={educationLevel}
                    onChange={(e) => {
                      setEducationLevel(e.target.value);
                      runPrediction(selectedRole, userSkills, e.target.value, learningPace);
                    }}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:bg-white focus:ring-2 focus:ring-purple-500 outline-none cursor-pointer"
                  >
                    <option value="10th / 12th Standard">10th / 12th Standard</option>
                    <option value="Polytechnic Diploma">Polytechnic Diploma</option>
                    <option value="ITI Certificate">ITI Certificate</option>
                    <option value="Bachelor of Engineering (B.E.)">Engineering (B.E./B.Tech)</option>
                    <option value="Bachelor of Science / BCA">B.Sc / BCA</option>
                    <option value="Other Graduate">Other Graduate</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-500 mb-1.5">
                    Weekly Pace
                  </label>
                  <select
                    value={learningPace}
                    onChange={(e) => {
                      setLearningPace(e.target.value);
                      runPrediction(selectedRole, userSkills, educationLevel, e.target.value);
                    }}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:bg-white focus:ring-2 focus:ring-purple-500 outline-none cursor-pointer"
                  >
                    <option value="Standard (8-10 hrs/week)">Standard (8-10h/wk)</option>
                    <option value="Intensive (15-20 hrs/week)">Intensive (15-20h/wk)</option>
                    <option value="Weekend (4-6 hrs/week)">Weekend (4-6h/wk)</option>
                  </select>
                </div>
              </div>

              {/* 3. Current Skills Input */}
              <div className="pt-2 border-t border-slate-100">
                <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-500 mb-2 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Award className="h-3.5 w-3.5 text-purple-600" /> Current Skills & Competencies
                  </span>
                  {user?.skills && (
                    <button
                      onClick={() => {
                        const skillsArray = user.skills?.split(',').map(s => s.trim()).filter(Boolean) || [];
                        setUserSkills(skillsArray);
                        runPrediction(selectedRole, skillsArray, educationLevel, learningPace);
                      }}
                      className="text-[10px] text-purple-600 font-bold hover:underline"
                    >
                      Sync Profile
                    </button>
                  )}
                </label>
                
                <div className="flex gap-2 mb-2.5">
                  <input
                    type="text"
                    value={customSkillInput}
                    onChange={(e) => setCustomSkillInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddSkill(customSkillInput);
                      }
                    }}
                    placeholder="Type skill & hit Enter (e.g. Python)"
                    className="flex-grow p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:ring-2 focus:ring-purple-500 outline-none"
                  />
                  <button
                    onClick={() => handleAddSkill(customSkillInput)}
                    disabled={!customSkillInput.trim()}
                    className="px-3.5 bg-purple-600 hover:bg-purple-700 disabled:opacity-40 text-white rounded-xl font-bold text-xs flex items-center gap-1 transition-all cursor-pointer"
                  >
                    <Plus className="h-3.5 w-3.5" /> Add
                  </button>
                </div>

                {/* User Skills Badges */}
                <div className="flex flex-wrap gap-1.5 min-h-[55px] p-2.5 bg-slate-50/80 rounded-2xl border border-slate-100">
                  {userSkills.length === 0 ? (
                    <span className="text-slate-400 text-xs italic">No skills added yet. Tap quick suggestions below.</span>
                  ) : (
                    userSkills.map((skill) => (
                      <span
                        key={skill}
                        className="inline-flex items-center gap-1 px-2.5 py-1 bg-white text-slate-800 rounded-lg text-xs font-bold border border-slate-200 shadow-xs"
                      >
                        {skill}
                        <button
                          onClick={() => handleRemoveSkill(skill)}
                          className="text-slate-400 hover:text-red-500 transition-colors ml-0.5"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))
                  )}
                </div>

                {/* Quick Add Suggestions */}
                <div className="mt-3">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">Quick Add:</span>
                  <div className="flex flex-wrap gap-1">
                    {POPULAR_SKILL_SUGGESTIONS.slice(0, 10).map((sug) => {
                      const isAdded = userSkills.some(s => s.toLowerCase() === sug.toLowerCase());
                      return (
                        <button
                          key={sug}
                          disabled={isAdded}
                          onClick={() => handleAddSkill(sug)}
                          className={`px-2 py-0.5 rounded-md text-[10px] font-semibold transition-all ${
                            isAdded
                              ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                              : 'bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-100 cursor-pointer'
                          }`}
                        >
                          + {sug}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Action: Regenerate Roadmap */}
              <button
                onClick={() => runPrediction(selectedRole, userSkills, educationLevel, learningPace)}
                className="w-full py-3 bg-slate-900 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${analyzing ? 'animate-spin' : ''}`} />
                {analyzing ? 'Analyzing Skills...' : 'Regenerate Assessment & Roadmap'}
              </button>
            </div>

            {/* Right: Skill Gap Analysis Overview */}
            <div className="lg:col-span-7 bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-slate-100 flex flex-col justify-between">
              {predictionResult ? (
                <div className="space-y-5">
                  {/* Readiness Banner */}
                  <div className="p-5 bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 text-white rounded-2xl relative overflow-hidden">
                    <div className="relative z-10">
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="text-[11px] font-extrabold uppercase tracking-widest text-purple-300">
                            Role Readiness Assessment
                          </span>
                          <h3 className="text-xl sm:text-2xl font-extrabold mt-0.5">{predictionResult.role}</h3>
                          <span className="text-xs text-purple-200 mt-1 block">
                            Target Duration: <strong>{predictionResult.durationTotal}</strong> • {predictionResult.learningPace}
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="text-3xl sm:text-4xl font-black text-emerald-400">{predictionResult.matchScore}%</span>
                          <span className="block text-[10px] text-purple-200 uppercase font-bold">Match Score</span>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div className="w-full bg-white/20 rounded-full h-2.5 mt-3.5 overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${predictionResult.matchScore}%` }}
                          transition={{ duration: 0.8, type: 'spring' }}
                          className={`h-full rounded-full ${
                            predictionResult.matchScore >= 70 ? 'bg-emerald-400' :
                            predictionResult.matchScore >= 40 ? 'bg-amber-400' : 'bg-orange-400'
                          }`}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Skills Breakdown: Acquired vs Gaps */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    {/* Acquired */}
                    <div className="p-4 bg-emerald-50/60 rounded-2xl border border-emerald-100 space-y-2">
                      <div className="flex items-center gap-1.5 text-emerald-800 font-extrabold text-xs uppercase tracking-wider">
                        <CheckCircle2 className="h-4 w-4 text-emerald-600" /> Acquired Skills ({predictionResult.acquiredSkills.length})
                      </div>
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {predictionResult.acquiredSkills.length === 0 ? (
                          <span className="text-xs text-slate-500 italic">No direct matching skills detected.</span>
                        ) : (
                          predictionResult.acquiredSkills.map((s: string) => (
                            <span key={s} className="px-2.5 py-1 bg-white text-emerald-800 rounded-lg text-xs font-bold border border-emerald-200 shadow-xs">
                              ✓ {s}
                            </span>
                          ))
                        )}
                      </div>
                    </div>

                    {/* Missing Gaps */}
                    <div className="p-4 bg-amber-50/60 rounded-2xl border border-amber-100 space-y-2">
                      <div className="flex items-center gap-1.5 text-amber-800 font-extrabold text-xs uppercase tracking-wider">
                        <AlertCircle className="h-4 w-4 text-amber-600" /> Identified Skill Gaps ({predictionResult.missingGaps.length})
                      </div>
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {predictionResult.missingGaps.length === 0 ? (
                          <span className="text-xs text-emerald-700 font-bold">Awesome! You meet all core requirements!</span>
                        ) : (
                          predictionResult.missingGaps.map((s: string) => (
                            <span key={s} className="px-2.5 py-1 bg-white text-amber-800 rounded-lg text-xs font-bold border border-amber-200 shadow-xs">
                              ⚡ {s}
                            </span>
                          ))
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Recommendation Bridge Cards */}
                  <div className="space-y-2.5 pt-1">
                    <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                      <Compass className="h-3.5 w-3.5 text-purple-600" /> Recommended Matching Course & Hands-on Lab
                    </span>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {/* Course Card */}
                      <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col justify-between group hover:border-purple-200 transition-all">
                        <div>
                          <span className="text-[10px] font-extrabold uppercase tracking-wider text-purple-600 bg-purple-50 px-2 py-0.5 rounded">
                            Recommended Course
                          </span>
                          <h4 className="font-bold text-slate-900 text-sm mt-1 line-clamp-2">{predictionResult.courseTitle}</h4>
                          <span className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                            <Clock className="h-3.5 w-3.5" /> {predictionResult.courseDuration}
                          </span>
                        </div>
                        <Link 
                          to={`/courses/${predictionResult.courseId}/enroll`}
                          className="mt-3 inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-slate-900 group-hover:bg-purple-600 text-white rounded-xl text-xs font-bold transition-all shadow-sm"
                        >
                          Enroll Now <ArrowRight className="h-3.5 w-3.5" />
                        </Link>
                      </div>

                      {/* Lab Card */}
                      <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col justify-between group hover:border-blue-200 transition-all">
                        <div>
                          <span className="text-[10px] font-extrabold uppercase tracking-wider text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                            Hands-On Practical Lab
                          </span>
                          <h4 className="font-bold text-slate-900 text-sm mt-1 line-clamp-2">{predictionResult.labName}</h4>
                          <span className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                            <FlaskConical className="h-3.5 w-3.5" /> {predictionResult.labType}
                          </span>
                        </div>
                        <Link 
                          to="/labs"
                          className="mt-3 inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm"
                        >
                          Book Lab Slot <ArrowRight className="h-3.5 w-3.5" />
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full py-12 text-slate-400">
                  <BrainCircuit className="h-12 w-12 text-purple-300 animate-pulse mb-3" />
                  <p className="text-sm font-bold">Predicting skill gap assessment...</p>
                </div>
              )}
            </div>
          </div>

          {/* Bottom Section: Step-by-Step Personalized Learning Roadmap */}
          {predictionResult && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-slate-100 space-y-6"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                <div>
                  <h3 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
                    <Compass className="text-purple-600 h-6 w-6" /> Step-by-Step Personalized Learning & Lab Roadmap
                  </h3>
                  <p className="text-slate-500 text-xs mt-0.5">
                    Targeting: <strong>{predictionResult.role}</strong> • Duration: {predictionResult.durationTotal} ({predictionResult.learningPace})
                  </p>
                </div>

                {/* Roadmap Controls: Save, Copy, Download */}
                <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
                  <button
                    onClick={handleSaveRoadmap}
                    className="px-3 py-1.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    {savedRoadmapNotice ? <Check className="h-3.5 w-3.5 text-green-600" /> : <Save className="h-3.5 w-3.5" />}
                    <span>{savedRoadmapNotice ? 'Roadmap Saved!' : 'Save Progress'}</span>
                  </button>

                  <button
                    onClick={handleCopyRoadmap}
                    className="px-3 py-1.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    {copiedNotice ? <Check className="h-3.5 w-3.5 text-green-600" /> : <Copy className="h-3.5 w-3.5" />}
                    <span>{copiedNotice ? 'Copied!' : 'Copy'}</span>
                  </button>

                  <button
                    onClick={handleDownloadRoadmap}
                    className="px-3.5 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
                  >
                    <Download className="h-3.5 w-3.5" />
                    <span>Download Roadmap</span>
                  </button>
                </div>
              </div>

              {/* 4-Phase Step-by-Step Timeline Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {predictionResult.roadmap.map((step: any, idx: number) => (
                  <div 
                    key={idx} 
                    className="p-5 bg-slate-50/80 rounded-2xl border border-slate-100 flex flex-col justify-between relative group hover:bg-white hover:border-purple-200 transition-all hover:shadow-md"
                  >
                    <div>
                      <div className="flex justify-between items-center mb-2.5">
                        <span className="text-[10px] font-black uppercase text-purple-700 bg-purple-100 px-2 py-0.5 rounded-full">
                          {step.time}
                        </span>
                        <span className="h-6 w-6 rounded-full bg-slate-900 text-white font-black text-xs flex items-center justify-center">
                          {idx + 1}
                        </span>
                      </div>
                      <h4 className="font-extrabold text-slate-900 text-sm mb-1.5">{step.phase}</h4>
                      <p className="text-xs text-slate-600 leading-relaxed mb-3">{step.focus}</p>
                    </div>

                    <div className="space-y-2 pt-3 border-t border-slate-200/60">
                      <div className="text-[11px] font-semibold text-slate-700 flex items-start gap-1.5">
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0 mt-0.5" />
                        <span>{step.deliverable}</span>
                      </div>
                      <div className="text-[11px] font-semibold text-blue-700 flex items-start gap-1.5 bg-blue-50/80 p-2 rounded-lg border border-blue-100">
                        <FlaskConical className="h-3.5 w-3.5 text-blue-600 shrink-0 mt-0.5" />
                        <span>{step.labActivity}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      )}

      {/* TAB 2: AI CAREER CHAT (Intelligent Assistant) */}
      {activeTab === 'chat' && (
        <div className="flex-grow bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 flex flex-col overflow-hidden relative min-h-[520px]">
          <div className="absolute inset-0 bg-gradient-to-b from-purple-50/40 to-transparent pointer-events-none" />
          
          {/* Chat Messages */}
          <div className="flex-grow p-6 overflow-y-auto space-y-6 relative z-10 scroll-smooth max-h-[520px]">
            <AnimatePresence>
              {messages.map(msg => (
                <motion.div 
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  key={msg.id} 
                  className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`flex gap-3 max-w-[90%] sm:max-w-[85%] ${msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                    <div className={`flex-shrink-0 h-10 w-10 rounded-2xl flex items-center justify-center shadow-md ${msg.sender === 'user' ? 'bg-slate-900 text-white' : 'bg-gradient-to-br from-purple-500 to-fuchsia-600 text-white shadow-purple-500/30'}`}>
                      {msg.sender === 'user' ? <User className="h-5 w-5" /> : <Sparkles className="h-5 w-5" />}
                    </div>
                    
                    <div className="space-y-2.5">
                      <div className={`p-4 rounded-2xl text-[14px] sm:text-[15px] leading-relaxed shadow-sm whitespace-pre-line ${
                        msg.sender === 'user' 
                          ? 'bg-slate-900 text-white rounded-tr-sm' 
                          : 'bg-white border border-slate-100 text-slate-800 rounded-tl-sm'
                      }`}>
                        {msg.text}
                      </div>

                      {/* Course / Lab Recommendation Embedded Badges */}
                      {msg.recommendations && (
                        <div className="flex flex-wrap gap-2 pt-1">
                          {msg.recommendations.course && (
                            <Link
                              to={`/courses/${msg.recommendations.course.id}/enroll`}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-800 border border-purple-200 rounded-xl text-xs font-bold transition-all shadow-xs"
                            >
                              <BookOpen className="h-3.5 w-3.5 text-purple-600" />
                              <span>{msg.recommendations.course.title}</span>
                              <ChevronRight className="h-3.5 w-3.5 text-purple-400" />
                            </Link>
                          )}
                          {msg.recommendations.lab && (
                            <Link
                              to="/labs"
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200 rounded-xl text-xs font-bold transition-all shadow-xs"
                            >
                              <FlaskConical className="h-3.5 w-3.5 text-blue-600" />
                              <span>{msg.recommendations.lab.name}</span>
                              <ChevronRight className="h-3.5 w-3.5 text-blue-400" />
                            </Link>
                          )}
                        </div>
                      )}

                      {/* Interactive Follow-up Question Suggestion Pills */}
                      {msg.followUps && msg.followUps.length > 0 && (
                        <div className="pt-2 space-y-1.5">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Suggested Questions:</span>
                          <div className="flex flex-wrap gap-1.5">
                            {msg.followUps.map((fText, fIdx) => (
                              <button
                                key={fIdx}
                                onClick={() => handleSend(undefined, fText)}
                                className="px-3 py-1 bg-slate-50 hover:bg-purple-50 hover:text-purple-700 text-slate-600 rounded-full text-xs font-semibold border border-slate-200/80 transition-all text-left cursor-pointer"
                              >
                                💬 {fText}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
              
              {isTyping && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex justify-start"
                >
                  <div className="flex gap-3 max-w-[85%] flex-row">
                    <div className="flex-shrink-0 h-10 w-10 rounded-2xl flex items-center justify-center bg-gradient-to-br from-purple-500 to-fuchsia-600 text-white shadow-purple-500/30">
                      <Sparkles className="h-5 w-5" />
                    </div>
                    <div className="p-4 rounded-2xl bg-white border border-slate-100 rounded-tl-sm flex items-center gap-2">
                      <motion.div animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }} transition={{ repeat: Infinity, duration: 1 }} className="w-2 h-2 bg-purple-500 rounded-full" />
                      <motion.div animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }} transition={{ repeat: Infinity, duration: 1, delay: 0.2 }} className="w-2 h-2 bg-purple-500 rounded-full" />
                      <motion.div animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }} transition={{ repeat: Infinity, duration: 1, delay: 0.4 }} className="w-2 h-2 bg-purple-500 rounded-full" />
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            <div ref={messagesEndRef} />
          </div>

          {/* Input Form */}
          <div className="p-6 bg-white border-t border-slate-100 relative z-10">
            <form onSubmit={(e) => handleSend(e)} className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-purple-500 to-fuchsia-600 rounded-[2rem] blur opacity-25 group-focus-within:opacity-50 transition duration-1000 group-focus-within:duration-200"></div>
              <div className="relative flex gap-2 bg-white rounded-full p-2 border border-slate-200 shadow-sm">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask about skills, lab requirements, career roadmaps, or internships..."
                  className="flex-grow px-6 py-3 bg-transparent border-transparent rounded-full focus:ring-0 focus:outline-none text-slate-800 placeholder-slate-400 text-sm"
                />
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  type="submit"
                  disabled={!input.trim()}
                  className="bg-slate-900 hover:bg-purple-700 text-white px-6 py-3 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shadow-md cursor-pointer"
                >
                  <Send className="h-5 w-5" />
                </motion.button>
              </div>
            </form>
          </div>
        </div>
      )}
    </motion.div>
  );
}
