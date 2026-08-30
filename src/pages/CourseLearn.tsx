import { API_URL } from '../config';
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useLanguage, Language } from '../context/LanguageContext';
import { 
  BookOpen, CheckCircle, Clock, Award, Building2, PlayCircle, ArrowRight, 
  ArrowLeft, Check, HelpCircle, Trophy, BarChart2, ShieldCheck, Sparkles,
  ChevronRight, Layers, Lightbulb, RefreshCw, Download, Globe, BookMarked, FileText
} from 'lucide-react';

export default function CourseLearn() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, token, isAuthenticated } = useAuth();
  const { language: globalLang, t } = useLanguage();

  const [course, setCourse] = useState<any>(null);
  const [enrollment, setEnrollment] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'lesson' | 'quiz' | 'certificate'>('lesson');
  const [activeModuleIdx, setActiveModuleIdx] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [lectureLang, setLectureLang] = useState<Language>(globalLang || 'en');

  useEffect(() => {
    if (globalLang) setLectureLang(globalLang);
  }, [globalLang]);

  // Quiz State
  const [quizAnswers, setQuizAnswers] = useState<Record<number, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizScore, setQuizScore] = useState<number>(0);
  const [updatingProgress, setUpdatingProgress] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate(`/courses/${id}/enroll`);
      return;
    }

    if (id) {
      // Fetch course
      fetch(`http://localhost:3001/api/courses/${id}`)
        .then(res => res.json())
        .then(data => {
          setCourse(data);
          setLoading(false);
        })
        .catch(err => {
          console.error(err);
          setLoading(false);
        });

      // Fetch enrollment
      fetch(`${API_URL}/api/enrollments`, {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) {
            const found = data.find((e: any) => e.course_id === Number(id));
            if (found) {
              setEnrollment(found);
            }
          }
        })
        .catch(console.error);
    }
  }, [id, isAuthenticated, token]);

  const updateProgress = async (newProgress: number) => {
    setUpdatingProgress(true);
    try {
      const res = await fetch(`http://localhost:3001/api/enrollments/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ progress: newProgress })
      });
      if (res.ok) {
        setEnrollment((prev: any) => ({ ...prev, progress: newProgress }));
      }
    } catch (err) {
      console.error('Failed to update progress', err);
    } finally {
      setUpdatingProgress(false);
    }
  };

  const handleNextLesson = async () => {
    if (!course) return;
    const totalModules = course.modules ? course.modules.length : 1;
    const progressPerLesson = Math.floor(80 / totalModules);
    const nextIdx = activeModuleIdx + 1;

    const currentProgress = enrollment ? enrollment.progress : 0;
    const calculated = Math.min(Math.max(currentProgress, (nextIdx) * progressPerLesson), 80);
    
    if (calculated > currentProgress) {
      await updateProgress(calculated);
    }

    if (nextIdx < totalModules) {
      setActiveModuleIdx(nextIdx);
    } else {
      setActiveTab('quiz');
    }
  };

  // Download Resource Handler
  const handleDownloadResource = (type: 'notes' | 'guide' | 'cheatsheet') => {
    if (!course) return;
    const currentModule = course.modules?.[activeModuleIdx] || 'Overview';
    
    let filename = '';
    let content = '';

    if (type === 'notes') {
      filename = `${course.title.replace(/[^a-zA-Z0-9]/g, '_')}_Module_${activeModuleIdx + 1}_Notes.txt`;
      content = `=====================================================
RURALLEARN TECHNICAL RESOURCE - LECTURE NOTES
Course: ${course.title}
Provider: ${course.provider}
Module ${activeModuleIdx + 1}: ${currentModule}
Language: ${lectureLang.toUpperCase()}
Student: ${user?.name || 'Enrolled Student'}
Date: ${new Date().toLocaleDateString()}
=====================================================

1. MODULE OBJECTIVE:
Master core concepts, diagnostic procedures, and industry-standard best practices.

2. KEY TECHNICAL CONCEPTS:
- Theoretical foundation and circuit/software architecture
- Step-by-step diagnostic workflows & safety standards
- Optimization techniques tailored for rural & regional installations

3. PRACTICAL WORKBENCH CHECKLIST:
[x] Inspect power supply & physical connectivity
[x] Execute benchmark diagnostic tests
[x] Record operational telemetry & parameters
[x] Verify safety compliance and earth grounding

4. KEY COMPETENCIES:
${Array.isArray(course.skills_gained) ? course.skills_gained.map((s: string) => `- ${s}`).join('\n') : '- Core Technical Skills'}

=====================================================
RuralLearn - Empowering Rural Education
=====================================================`;
    } else if (type === 'guide') {
      filename = `${course.title.replace(/[^a-zA-Z0-9]/g, '_')}_Lab_Worksheet.txt`;
      content = `=====================================================
RURALLEARN PRACTICAL LAB WORKSHEET
Course: ${course.title}
Lab Component: Hands-on Practice & Circuit Wiring
=====================================================

LAB EXERCISES:
1. Equipment calibration and pre-test safety check.
2. Assembly and component integration according to standard schematic.
3. Verification of output metrics and fault simulation.
4. Final sign-off by lab supervisor / instructor.

SAFETY GUIDELINES:
- Always wear ESD wrist straps when handling semiconductors.
- Check voltage ratings before powering up hardware boards.
- Keep emergency power shutoff accessible at all times.
=====================================================`;
    } else {
      filename = `${course.title.replace(/[^a-zA-Z0-9]/g, '_')}_Quick_Cheatsheet.txt`;
      content = `=====================================================
RURALLEARN QUICK REFERENCE CHEATSHEET
Course: ${course.title}
=====================================================

QUICK COMMANDS & FORMULAS:
- Power (Watts) = Voltage (V) x Current (I)
- Ohm's Law: V = I x R
- Diagnostic Exit Codes: 0 (Success), 1 (Error/Warning)
- Support Hotlines: rurallearn-support@edu.in
=====================================================`;
    }

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Trilingual Content Generator
  const getTrilingualLesson = () => {
    if (!course) return { title: '', desc: '', tips: [] };
    const rawModule = course.modules?.[activeModuleIdx] || 'General Introduction';

    if (lectureLang === 'mr') {
      return {
        title: rawModule,
        desc: `या सत्रामध्ये आपण ${rawModule} बद्दल सविस्तर माहिती आणि प्रात्यक्षिक कार्य शिकणार आहोत. ग्रामीण भागातील गरजांनुसार उपकरणांची जोडणी, तपासणी आणि सुरक्षितता नियम येथे शिकवले जातात.`,
        tips: [
          'घटकांची अचूक तपासणी आणि सुरक्षित हाताळणी.',
          'स्थानिक औद्योगिक आणि कृषी मानकांनुसार प्रत्यक्ष सराव.'
        ],
        overviewLabel: 'तांत्रिक संकल्पना आणि प्रात्यक्षिक कार्य'
      };
    } else if (lectureLang === 'hi') {
      return {
        title: rawModule,
        desc: `इस सत्र में हम ${rawModule} के मुख्य तकनीकी सिद्धांत और व्यावहारिक कार्य का अध्ययन करेंगे। ग्रामीण और क्षेत्रीय आवश्यकताओं के अनुसार हार्डवेयर/सॉफ्टवेयर की सही जांच और सुरक्षा नियमों का पालन सिखाया जाता है।`,
        tips: [
          'उपकरणों की सटीक जांच एवं सुरक्षित असेंबली कार्य।',
          'औद्योगिक और क्षेत्रीय मानकों के अनुसार व्यावहारिक अभ्यास।'
        ],
        overviewLabel: 'तकनीकी सिद्धांत और व्यावहारिक कार्य'
      };
    } else {
      return {
        title: rawModule,
        desc: `In this session on ${rawModule}, students gain hands-on proficiency in core components, diagnostic testing, circuit wiring, and software implementation tailored for rural environments.`,
        tips: [
          'Real-world step-by-step equipment setup & component safety.',
          'Practical exercises matching local industrial & agricultural standards.'
        ],
        overviewLabel: 'Key Technical Concepts & Practical Work'
      };
    }
  };

  // Generate dynamic quiz questions based on category and language
  const getQuizQuestions = () => {
    if (!course) return [];
    
    if (course.category === 'Hardware') {
      if (lectureLang === 'mr') {
        return [
          {
            q: 'हार्डवेअर असेंब्ली करताना व्होल्टेज वाढल्यास कोणता घटक संरक्षणासाठी वापरला जातो?',
            options: ['SMPS / UPS युनिट', 'थर्मल पेस्ट', 'SATA केबल', 'कूलिंग फॅन'],
            correct: 0
          },
          {
            q: 'मदरबोर्ड आणि मायक्रोकंट्रोलर हाताळण्यापूर्वी कोणती सुरक्षा खबरदारी घ्यावी?',
            options: ['लोकरीचे हातमोजे घालणे', 'ESD अँटीस्टॅटिक रिस्ट स्ट्रॅप वापरणे', 'उच्च व्होल्टेज देणे', 'पाण्याने धुणे'],
            correct: 1
          },
          {
            q: 'कोणता सेन्सर प्रोटोकॉल २ वायर्स (SDA आणि SCL) वापरतो?',
            options: ['I2C प्रोटोकॉल', 'VGA', 'PCIe', 'Ethernet'],
            correct: 0
          }
        ];
      } else if (lectureLang === 'hi') {
        return [
          {
            q: 'हार्डवेयर असेंबली के दौरान वोल्टेज के उतार-चढ़ाव से सुरक्षा के लिए कौन सा घटक प्रयोग होता है?',
            options: ['SMPS / UPS यूनिट', 'थर्मल पेस्ट', 'SATA केबल', 'कूलिंग फैन'],
            correct: 0
          },
          {
            q: 'मदरबोर्ड और माइक्रो-कंट्रोलर छूने से पहले कौन सी सुरक्षा सावधानी आवश्यक है?',
            options: ['ऊनी दस्ताने पहनना', 'ESD एंटी-स्टैटिक रिस्ट स्ट्रैप पहनना', 'हाई वोल्टेज देना', 'पानी से साफ करना'],
            correct: 1
          },
          {
            q: 'कौन सा सेंसर प्रोटोकॉल टेलीमेट्री के लिए 2 तारों (SDA और SCL) का उपयोग करता है?',
            options: ['I2C प्रोटोकॉल', 'VGA', 'PCIe', 'Ethernet'],
            correct: 0
          }
        ];
      } else {
        return [
          {
            q: 'Which component provides backup power and regulates voltage spikes during hardware assembly?',
            options: ['SMPS / UPS Unit', 'Thermal Paste', 'SATA Cable', 'Heat Sink Fan'],
            correct: 0
          },
          {
            q: 'What is the standard antistatic safety precaution before touching motherboards and microcontrollers?',
            options: ['Wearing wool gloves', 'Using an ESD antistatic wrist strap', 'Applying high voltage', 'Cleaning with water'],
            correct: 1
          },
          {
            q: 'Which sensor communication protocol uses 2 wires (SDA and SCL) for telemetry?',
            options: ['I2C Protocol', 'VGA', 'PCIe', 'Ethernet'],
            correct: 0
          }
        ];
      }
    } else if (course.category === 'Software') {
      if (lectureLang === 'mr') {
        return [
          {
            q: 'वेब ॲप्लिकेशन्समध्ये सुरक्षित प्रमाणीकरणासाठी (Authentication) कोणता प्रोटोकॉल वापरला जातो?',
            options: ['JSON Web Tokens (JWT)', 'FTP प्लेनटेक्स्ट', 'SMTP रिले', 'Telnet'],
            correct: 0
          },
          {
            q: 'React मध्ये API डेटा फेच करण्यासाठी कोणता हुक वापरला जातो?',
            options: ['useState', 'useEffect', 'useMemo', 'useContext'],
            correct: 1
          },
          {
            q: 'SQLite डेटाबेसमध्ये डेटा अपडेट करण्यासाठी कोणता कीवर्ड वापरला जातो?',
            options: ['UPDATE', 'ALTER_DATA', 'SET_ROW', 'INSERT_OVERWRITE'],
            correct: 0
          }
        ];
      } else if (lectureLang === 'hi') {
        return [
          {
            q: 'वेब एप्लिकेशन में सुरक्षित प्रमाणीकरण (Authentication) के लिए किसका उपयोग होता है?',
            options: ['JSON Web Tokens (JWT)', 'FTP प्लेनटेक्स्ट', 'SMTP रिले', 'Telnet'],
            correct: 0
          },
          {
            q: 'React में API फेचिंग जैसी साइड-इफेक्ट्स प्रबंधित करने के लिए किस हुक का उपयोग होता है?',
            options: ['useState', 'useEffect', 'useMemo', 'useContext'],
            correct: 1
          },
          {
            q: 'SQLite डेटाबेस टेबल में मौजूदा रिकॉर्ड अपडेट करने के लिए कौन सा कमांड प्रयोग होता है?',
            options: ['UPDATE', 'ALTER_DATA', 'SET_ROW', 'INSERT_OVERWRITE'],
            correct: 0
          }
        ];
      } else {
        return [
          {
            q: 'In modern full-stack web applications, which protocol is used for secure client-server authentication?',
            options: ['JSON Web Tokens (JWT)', 'FTP Plaintext', 'SMTP Relaying', 'Telnet'],
            correct: 0
          },
          {
            q: 'What hook in React is used to manage and trigger side effects like API fetching?',
            options: ['useState', 'useEffect', 'useMemo', 'useContext'],
            correct: 1
          },
          {
            q: 'Which SQLite keyword updates existing records in a database table safely?',
            options: ['UPDATE', 'ALTER_DATA', 'SET_ROW', 'INSERT_OVERWRITE'],
            correct: 0
          }
        ];
      }
    } else {
      if (lectureLang === 'mr') {
        return [
          {
            q: 'अचूक कृषी तंत्रज्ञानामध्ये स्वयंचलित सूक्ष्म सिंचनाचा मुख्य फायदा कोणता?',
            options: ['९०%+ पाण्याची बचत आणि खतांचे संवर्धन', 'जास्त मातीची धूप', 'जास्त मानवी श्रम', 'पूर परिस्थिती'],
            correct: 0
          },
          {
            q: 'पिकांच्या वाढीसाठी मातीची आम्लता किंवा क्षारता तपासण्यासाठी काय मोजले जाते?',
            options: ['pH पातळी', 'हवेचा दाब', 'सोलर लक्स', 'वाऱ्याची दिशा'],
            correct: 0
          },
          {
            q: 'ग्रामीण सूक्ष्म उद्योगांसाठी भारतात कोणती सरकारी योजना अनुदानित कर्ज उपलब्ध करून देते?',
            options: ['मुद्रा योजना (MUDRA)', 'USPS प्रोग्राम', 'SWIFT नेटवर्क', 'OFAC'],
            correct: 0
          }
        ];
      } else if (lectureLang === 'hi') {
        return [
          {
            q: 'सटीक कृषि में स्वचालित सूक्ष्म-सिंचाई प्रणाली का प्रमुख लाभ क्या है?',
            options: ['90%+ जल एवं पोषक तत्वों का संरक्षण', 'मिट्टी का अत्यधिक क्षरण', 'अधिक शारीरिक श्रम', 'अनियंत्रित बाढ़'],
            correct: 0
          },
          {
            q: 'फसलों के विकास के लिए मिट्टी की अम्लीयता या क्षारीयता मापने का पैमाना क्या है?',
            options: ['pH स्तर', 'वायुमंडलीय दबाव', 'सोलर लक्स', 'पवन दिशा'],
            correct: 0
          },
          {
            q: 'ग्रामीण सूक्ष्म-उद्यमों के लिए भारत में कौन सी सरकारी योजना रियायती ऋण देती है?',
            options: ['मुद्रा योजना (MUDRA Scheme)', 'USPS प्रोग्राम', 'SWIFT नेटवर्क', 'OFAC'],
            correct: 0
          }
        ];
      } else {
        return [
          {
            q: 'What is the primary benefit of automated micro-irrigation systems in precision agriculture?',
            options: ['90%+ Water efficiency & nutrient conservation', 'Higher soil erosion', 'Higher manual labor', 'Uncontrolled flooding'],
            correct: 0
          },
          {
            q: 'Which soil parameter indicates acidity or alkalinity for optimal crop growth?',
            options: ['pH Level', 'Barometric Pressure', 'Solar Lux', 'Wind Vector'],
            correct: 0
          },
          {
            q: 'Which government initiative offers subsidized micro-loans for rural micro-enterprises in India?',
            options: ['MUDRA Scheme', 'USPS Program', 'SWIFT Network', 'OFAC'],
            correct: 0
          }
        ];
      }
    }
  };

  const questions = getQuizQuestions();
  const lessonData = getTrilingualLesson();

  const handleQuizSubmit = async () => {
    let correctCount = 0;
    questions.forEach((q, idx) => {
      if (quizAnswers[idx] === q.correct) {
        correctCount += 1;
      }
    });

    const scorePct = Math.round((correctCount / questions.length) * 100);
    setQuizScore(scorePct);
    setQuizSubmitted(true);

    if (scorePct >= 66) {
      // Award 100% completion in database
      await updateProgress(100);
      setActiveTab('certificate');
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
        <h2 className="text-2xl font-bold text-slate-900 mb-3">Course Not Found</h2>
        <Link to="/courses" className="inline-block bg-slate-900 text-white font-bold px-6 py-3 rounded-xl">
          Back to Courses
        </Link>
      </div>
    );
  }

  const currentProgress = enrollment ? enrollment.progress : 0;
  const isCompleted = currentProgress === 100;
  const modulesList = Array.isArray(course.modules) && course.modules.length > 0 ? course.modules : ['Module 1: Fundamental Concepts', 'Module 2: Practical Implementation', 'Module 3: Troubleshooting & Capstone'];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8"
    >
      {/* Top Header & Breadcrumb */}
      <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 mb-1.5">
            <Link to="/courses" className="hover:text-green-600 transition-colors">{t('nav.courses')}</Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <span className="text-slate-700 font-bold">{course.title}</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <BookOpen className="h-6 w-6 text-green-600" /> {course.title}
          </h1>
          <p className="text-slate-500 text-xs mt-1">
            {t('courses.provider')}: <span className="font-semibold text-slate-700">{course.provider}</span> • {course.duration} ({t(`cat.${course.level?.toLowerCase()}`) || course.level})
          </p>
        </div>

        {/* Real Progress Metric */}
        <div className="flex items-center gap-4 w-full md:w-auto bg-slate-50 p-4 rounded-2xl border border-slate-100 shrink-0">
          <div className="w-36">
            <div className="flex justify-between text-xs font-bold mb-1">
              <span className="text-slate-600">{t('lecture.progress')}</span>
              <span className="text-green-600 font-extrabold">{currentProgress}%</span>
            </div>
            <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${currentProgress}%` }}
                className={`h-full ${isCompleted ? 'bg-green-500' : 'bg-gradient-to-r from-blue-500 to-green-500'}`}
              />
            </div>
          </div>
          
          <Link 
            to="/progress" 
            className="text-xs font-bold px-3 py-2 bg-white text-slate-700 border border-slate-200 rounded-xl hover:bg-slate-100 transition-colors shadow-sm whitespace-nowrap"
          >
            {t('lecture.dashboard')} →
          </Link>
        </div>
      </div>

      {/* Main Workspace Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Modules Sidebar */}
        <div className="lg:col-span-4 bg-white rounded-3xl p-6 shadow-sm border border-slate-100 space-y-4">
          <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
            <Layers className="h-4 w-4 text-green-600" /> {t('lecture.modules')} ({modulesList.length})
          </h3>

          <div className="space-y-2">
            {modulesList.map((mod: string, idx: number) => {
              const isCurrent = activeTab === 'lesson' && activeModuleIdx === idx;
              const isPast = idx < activeModuleIdx || (currentProgress > (idx * 20));

              return (
                <button
                  key={idx}
                  onClick={() => {
                    setActiveTab('lesson');
                    setActiveModuleIdx(idx);
                  }}
                  className={`w-full text-left p-3.5 rounded-2xl text-xs font-bold transition-all flex items-center justify-between gap-3 border cursor-pointer ${
                    isCurrent 
                      ? 'bg-green-600 text-white border-green-600 shadow-md shadow-green-600/20' 
                      : isPast
                      ? 'bg-green-50/60 text-green-900 border-green-100 hover:bg-green-100/60'
                      : 'bg-slate-50 text-slate-700 border-slate-100 hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-center gap-2.5 overflow-hidden">
                    <span className={`h-6 w-6 rounded-lg text-xs flex items-center justify-center shrink-0 font-black ${
                      isCurrent ? 'bg-white/20 text-white' : isPast ? 'bg-green-200 text-green-800' : 'bg-slate-200 text-slate-600'
                    }`}>
                      {isPast ? <Check className="h-3.5 w-3.5" /> : idx + 1}
                    </span>
                    <span className="truncate">{mod}</span>
                  </div>
                  {isCurrent && <PlayCircle className="h-4 w-4 shrink-0" />}
                </button>
              );
            })}
          </div>

          {/* Assessment & Certificate Tabs */}
          <div className="pt-4 border-t border-slate-100 space-y-2">
            <button
              onClick={() => setActiveTab('quiz')}
              className={`w-full text-left p-3.5 rounded-2xl text-xs font-bold transition-all flex items-center justify-between gap-3 border cursor-pointer ${
                activeTab === 'quiz'
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-600/20'
                  : 'bg-indigo-50/60 text-indigo-900 border-indigo-100 hover:bg-indigo-100/60'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <span className="h-6 w-6 rounded-lg bg-indigo-200 text-indigo-800 flex items-center justify-center shrink-0 font-black">
                  <HelpCircle className="h-3.5 w-3.5" />
                </span>
                <span>{t('lecture.quiz_title')}</span>
              </div>
              {quizSubmitted && <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-md">{quizScore}%</span>}
            </button>

            <button
              onClick={() => setActiveTab('certificate')}
              className={`w-full text-left p-3.5 rounded-2xl text-xs font-bold transition-all flex items-center justify-between gap-3 border cursor-pointer ${
                activeTab === 'certificate'
                  ? 'bg-amber-500 text-white border-amber-500 shadow-md shadow-amber-500/20'
                  : isCompleted
                  ? 'bg-amber-50/60 text-amber-900 border-amber-200 hover:bg-amber-100'
                  : 'bg-slate-50 text-slate-400 border-slate-100 opacity-80'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <span className="h-6 w-6 rounded-lg bg-amber-200 text-amber-800 flex items-center justify-center shrink-0 font-black">
                  <Award className="h-3.5 w-3.5" />
                </span>
                <span>{lectureLang === 'mr' ? 'अधिकृत प्रमाणपत्र' : lectureLang === 'hi' ? 'आधिकारिक प्रमाणपत्र' : 'Official Certificate'}</span>
              </div>
              {isCompleted && <span className="text-[10px] bg-green-500 text-white px-2 py-0.5 rounded-md">{lectureLang === 'mr' ? 'प्राप्त' : lectureLang === 'hi' ? 'अर्जित' : 'Earned'}</span>}
            </button>
          </div>
        </div>

        {/* Right Column: Main Content Area */}
        <div className="lg:col-span-8 bg-white rounded-3xl p-8 shadow-sm border border-slate-100 min-h-[500px] flex flex-col justify-between">
          {/* 1. LESSON CONTENT */}
          {activeTab === 'lesson' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-4 gap-3">
                <div>
                  <span className="text-xs font-black uppercase tracking-wider text-green-600">
                    {lectureLang === 'mr' ? `सत्र ${activeModuleIdx + 1} / ${modulesList.length}` : lectureLang === 'hi' ? `सत्र ${activeModuleIdx + 1} / ${modulesList.length}` : `Lesson ${activeModuleIdx + 1} of ${modulesList.length}`}
                  </span>
                  <h2 className="text-2xl font-extrabold text-slate-900 mt-1">
                    {lessonData.title}
                  </h2>
                </div>
                
                {/* In-Lecture Language Toggle */}
                <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200 shrink-0 self-start sm:self-auto">
                  <Globe className="h-4 w-4 text-slate-500 ml-1.5" />
                  <span className="text-[11px] font-bold text-slate-500 mr-1">{t('lecture.lang_select')}:</span>
                  {(['en', 'mr', 'hi'] as const).map((lang) => (
                    <button
                      key={lang}
                      onClick={() => setLectureLang(lang)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        lectureLang === lang
                          ? 'bg-green-600 text-white shadow-sm'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      {lang === 'en' ? 'English' : lang === 'mr' ? 'मराठी' : 'हिंदी'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Lesson Overview Box */}
              <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 space-y-4">
                <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
                  <Lightbulb className="h-5 w-5 text-amber-500" /> {lessonData.overviewLabel}:
                </div>
                <p className="text-slate-600 text-sm leading-relaxed">
                  {lessonData.desc}
                </p>

                {/* Practical Takeaways */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  {lessonData.tips.map((tip: string, i: number) => (
                    <div key={i} className="p-3 bg-white rounded-xl border border-slate-200/80 text-xs font-medium text-slate-700 flex items-start gap-2">
                      <Check className="h-4 w-4 text-green-600 mt-0.5 shrink-0" />
                      <span>{tip}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Downloadable Lecture Resources Section */}
              <div className="p-5 bg-gradient-to-r from-emerald-50/50 to-teal-50/50 rounded-2xl border border-emerald-100/80 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-800 flex items-center gap-1.5">
                    <BookMarked className="h-4 w-4 text-emerald-600" /> {lectureLang === 'mr' ? 'अभ्यास साहित्य डाउनलोड (ऑफलाइन सुविधा)' : lectureLang === 'hi' ? 'अध्ययन सामग्री डाउनलोड (ऑफलाइन सुविधा)' : 'Lecture Download Resources (Offline Access)'}
                  </span>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-md">
                    {lectureLang === 'mr' ? 'नोंदणीकृत विद्यार्थ्यांसाठी मोफत' : lectureLang === 'hi' ? 'नामांकित छात्रों के लिए निःशुल्क' : 'Free for Enrolled Students'}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
                  <button
                    onClick={() => handleDownloadResource('notes')}
                    className="p-3 bg-white hover:bg-emerald-50/80 border border-emerald-200 rounded-xl text-left transition-all shadow-sm flex items-center justify-between group cursor-pointer"
                  >
                    <div className="overflow-hidden">
                      <p className="text-xs font-bold text-slate-900 truncate">{t('lecture.download_pdf')}</p>
                      <p className="text-[10px] text-slate-400">PDF / Notes</p>
                    </div>
                    <Download className="h-4 w-4 text-emerald-600 group-hover:translate-y-0.5 transition-transform shrink-0" />
                  </button>

                  <button
                    onClick={() => handleDownloadResource('guide')}
                    className="p-3 bg-white hover:bg-emerald-50/80 border border-emerald-200 rounded-xl text-left transition-all shadow-sm flex items-center justify-between group cursor-pointer"
                  >
                    <div className="overflow-hidden">
                      <p className="text-xs font-bold text-slate-900 truncate">{t('lecture.download_guide')}</p>
                      <p className="text-[10px] text-slate-400">Lab Guide</p>
                    </div>
                    <Download className="h-4 w-4 text-emerald-600 group-hover:translate-y-0.5 transition-transform shrink-0" />
                  </button>

                  <button
                    onClick={() => handleDownloadResource('cheatsheet')}
                    className="p-3 bg-white hover:bg-emerald-50/80 border border-emerald-200 rounded-xl text-left transition-all shadow-sm flex items-center justify-between group cursor-pointer"
                  >
                    <div className="overflow-hidden">
                      <p className="text-xs font-bold text-slate-900 truncate">{t('lecture.download_cheatsheet')}</p>
                      <p className="text-[10px] text-slate-400">Cheatsheet</p>
                    </div>
                    <Download className="h-4 w-4 text-emerald-600 group-hover:translate-y-0.5 transition-transform shrink-0" />
                  </button>
                </div>
              </div>

              {/* Action Button: Next Lesson */}
              <div className="pt-6 border-t border-slate-100 flex justify-between items-center">
                <button
                  disabled={activeModuleIdx === 0}
                  onClick={() => setActiveModuleIdx(prev => Math.max(prev - 1, 0))}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-xs font-bold hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-1.5 cursor-pointer"
                >
                  <ArrowLeft className="h-4 w-4" /> {lectureLang === 'mr' ? 'मागील सत्र' : lectureLang === 'hi' ? 'पिछला सत्र' : 'Previous Lesson'}
                </button>

                <button
                  onClick={handleNextLesson}
                  disabled={updatingProgress}
                  className="px-6 py-3 rounded-xl bg-green-600 hover:bg-green-700 text-white text-xs font-bold shadow-lg shadow-green-600/20 transition-all flex items-center gap-2 cursor-pointer"
                >
                  <span>{activeModuleIdx + 1 === modulesList.length ? t('lecture.take_quiz') : t('lecture.complete_next')}</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}

          {/* 2. QUIZ ASSESSMENT */}
          {activeTab === 'quiz' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-4 gap-3">
                <div>
                  <span className="text-xs font-black uppercase tracking-wider text-indigo-600">
                    {lectureLang === 'mr' ? 'अभ्यासक्रम कौशल्य चाचणी' : lectureLang === 'hi' ? 'कौशल्य मूल्यांकन परीक्षा' : 'Course Competency Assessment'}
                  </span>
                  <h2 className="text-2xl font-extrabold text-slate-900 mt-1">
                    {t('lecture.quiz_title')}
                  </h2>
                  <p className="text-slate-500 text-xs mt-1">
                    {lectureLang === 'mr' ? 'प्रमाणपत्र अनलॉक करण्यासाठी खालील प्रश्नांची उत्तरे द्या.' : lectureLang === 'hi' ? 'प्रमाणपत्र प्राप्त करने के लिए प्रश्नों के सही उत्तर दें।' : 'Answer the questions below to verify skills and unlock your official certificate.'}
                  </p>
                </div>

                {/* Language Toggle in Quiz */}
                <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200 shrink-0 self-start sm:self-auto">
                  <Globe className="h-4 w-4 text-slate-500 ml-1.5" />
                  {(['en', 'mr', 'hi'] as const).map((lang) => (
                    <button
                      key={lang}
                      onClick={() => setLectureLang(lang)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        lectureLang === lang
                          ? 'bg-indigo-600 text-white shadow-sm'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      {lang === 'en' ? 'English' : lang === 'mr' ? 'मराठी' : 'हिंदी'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Questions List */}
              <div className="space-y-6">
                {questions.map((q, qIdx) => (
                  <div key={qIdx} className="p-5 bg-slate-50 rounded-2xl border border-slate-100 space-y-3">
                    <p className="text-sm font-bold text-slate-900">
                      {qIdx + 1}. {q.q}
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {q.options.map((opt, optIdx) => {
                        const isSelected = quizAnswers[qIdx] === optIdx;
                        return (
                          <button
                            key={optIdx}
                            onClick={() => setQuizAnswers({ ...quizAnswers, [qIdx]: optIdx })}
                            className={`p-3 rounded-xl text-left text-xs font-semibold transition-all border cursor-pointer ${
                              isSelected 
                                ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-600/20' 
                                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                            }`}
                          >
                            {opt}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>

              {/* Quiz Submit Button & Feedback */}
              <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-4">
                {quizSubmitted && (
                  <div className="text-xs font-bold text-slate-700 flex items-center gap-2">
                    <BarChart2 className="h-4 w-4 text-indigo-600" />
                    <span>{lectureLang === 'mr' ? 'तुमचा स्कोअर:' : lectureLang === 'hi' ? 'आपका स्कोर:' : 'Your Score:'} <strong className={quizScore >= 66 ? 'text-green-600' : 'text-red-600'}>{quizScore}%</strong></span>
                    {quizScore >= 66 ? (
                      <span className="text-green-600 font-extrabold">{lectureLang === 'mr' ? '(उत्तीर्ण - प्रमाणपत्र अनलॉक झाले!)' : lectureLang === 'hi' ? '(उत्तीर्ण - प्रमाणपत्र अनलॉक हो गया!)' : '(Passed - Certificate Unlocked!)'}</span>
                    ) : (
                      <span className="text-amber-600">{lectureLang === 'mr' ? '(उत्तीर्ण होण्यासाठी ६६% आवश्यक. पुन्हा प्रयत्न करा)' : lectureLang === 'hi' ? '(उत्तीर्ण के लिए 66% आवश्यक। पुनः प्रयास करें)' : '(Pass mark is 66%. Please review & retry)'}</span>
                    )}
                  </div>
                )}

                <button
                  onClick={handleQuizSubmit}
                  disabled={Object.keys(quizAnswers).length < questions.length}
                  className="w-full sm:w-auto px-8 py-3.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white font-bold text-xs rounded-xl shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <CheckCircle className="h-4 w-4" />
                  {quizSubmitted ? (lectureLang === 'mr' ? 'चाचणी पुन्हा द्या' : lectureLang === 'hi' ? 'पुनः परीक्षा दें' : 'Retake & Re-submit Quiz') : (lectureLang === 'mr' ? 'चाचणी सबमिट करा आणि कौशल्य पडताळा' : lectureLang === 'hi' ? 'प्रश्नोत्तरी सबमिट करें' : 'Submit Quiz & Verify Skills')}
                </button>
              </div>
            </div>
          )}

          {/* 3. CERTIFICATE SECTION */}
          {activeTab === 'certificate' && (
            <div className="text-center py-8 space-y-6">
              {isCompleted ? (
                <div className="space-y-6">
                  <div className="inline-flex p-4 bg-amber-100 text-amber-600 rounded-3xl mb-2 shadow-inner animate-bounce">
                    <Trophy className="h-16 w-16" />
                  </div>
                  <div>
                    <span className="text-xs font-black uppercase tracking-widest text-amber-600">
                      {lectureLang === 'mr' ? 'अभिनंदन!' : lectureLang === 'hi' ? 'बधाई हो!' : 'Congratulations!'}
                    </span>
                    <h2 className="text-3xl font-extrabold text-slate-900 mt-1">
                      {lectureLang === 'mr' ? 'अभ्यासक्रम यशस्विरीत्या पूर्ण!' : lectureLang === 'hi' ? 'पाठ्यक्रम सफलतापूर्वक पूर्ण हुआ!' : 'Certificate of Achievement Earned!'}
                    </h2>
                    <p className="text-slate-500 text-sm max-w-lg mx-auto mt-2">
                      {lectureLang === 'mr' ? `तुम्ही ${course.title} चे सर्व सत्र आणि प्रात्यक्षिक पूर्ण केले आहे. तुमचे प्रमाणपत्र सेव्ह झाले आहे.` : lectureLang === 'hi' ? `आपने ${course.title} के सभी पाठ और मूल्यांकन पूर्ण कर लिए हैं। आपका प्रमाणपत्र सहेज लिया गया है।` : `You have completed all lessons, modules, and practical assessments for ${course.title}. Your credential is saved in your official student profile.`}
                    </p>
                  </div>

                  {/* Certificate Summary Card */}
                  <div className="max-w-md mx-auto p-6 bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-200/80 rounded-3xl shadow-md text-left space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold uppercase text-amber-800">{lectureLang === 'mr' ? 'पडताळणी झालेले प्रमाणपत्र' : lectureLang === 'hi' ? 'सत्यापित प्रमाणपत्र' : 'Verified Credential'}</span>
                      <span className="text-xs font-mono font-bold text-slate-500">ID: RL-{course.id}-{Date.now().toString().slice(-4)}</span>
                    </div>
                    <h3 className="font-extrabold text-slate-900 text-lg leading-snug">{course.title}</h3>
                    <p className="text-xs text-slate-600">{t('cert.issued_to')}: <strong className="text-slate-900">{user?.name || 'Student'}</strong></p>
                    <p className="text-xs text-slate-600">{lectureLang === 'mr' ? 'जारीकर्ता:' : lectureLang === 'hi' ? 'जारीकर्ता:' : 'Issuer:'} <strong className="text-slate-900">{course.provider || 'RuralLearn Technical Hub'}</strong></p>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row justify-center gap-3 pt-4">
                    <Link
                      to="/certifications"
                      className="px-6 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-lg shadow-blue-600/30 transition-all flex items-center justify-center gap-2"
                    >
                      <Award className="h-4 w-4" /> {t('btn.view_cert')}
                    </Link>

                    <Link
                      to="/progress"
                      className="px-6 py-3.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
                    >
                      <BarChart2 className="h-4 w-4" /> {t('lecture.dashboard')}
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="py-12 space-y-4">
                  <div className="inline-flex p-4 bg-slate-100 text-slate-400 rounded-3xl">
                    <ShieldCheck className="h-12 w-12" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-800">{lectureLang === 'mr' ? 'प्रमाणपत्र लॉक आहे' : lectureLang === 'hi' ? 'प्रमाणपत्र लॉक है' : 'Certificate Locked'}</h3>
                  <p className="text-slate-500 text-sm max-w-md mx-auto">
                    {lectureLang === 'mr' ? 'अधिकृत प्रमाणपत्र अनलॉक करण्यासाठी सर्व सत्रे पूर्ण करा आणि परीक्षा उत्तीर्ण व्हा.' : lectureLang === 'hi' ? 'आधिकारिक प्रमाणपत्र प्राप्त करने हेतु सभी सत्र पूर्ण करें और परीक्षा उत्तीर्ण करें।' : 'Complete all syllabus lessons and pass the final assessment quiz to unlock your official verified certificate.'}
                  </p>
                  <button
                    onClick={() => setActiveTab('lesson')}
                    className="px-6 py-3 bg-green-600 text-white font-bold text-xs rounded-xl shadow-md cursor-pointer"
                  >
                    {lectureLang === 'mr' ? 'शिकणे सुरू ठेवा' : lectureLang === 'hi' ? 'सीखना जारी रखें' : 'Resume Lessons'} ({currentProgress}%)
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
