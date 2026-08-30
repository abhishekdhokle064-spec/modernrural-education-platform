import express from 'express';
import cors from 'cors';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());

const JWT_SECRET = 'rurallearn_super_secret_key_2026'; // In production, use env var

// Database setup
let db;
async function setupDb() {
  db = await open({
    filename: path.join(__dirname, 'database.sqlite'),
    driver: sqlite3.Database
  });

  await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT DEFAULT 'Student',
      education TEXT,
      skills TEXT,
      interests TEXT,
      preference TEXT,
      career_goal TEXT,
      photo TEXT,
      branch TEXT,
      year TEXT,
      location TEXT,
      preferred_courses TEXT,
      resume TEXT
    )
  `);

  await db.exec(`
    CREATE TABLE IF NOT EXISTS enrollments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      course_id INTEGER,
      progress INTEGER DEFAULT 0,
      UNIQUE(user_id, course_id)
    )
  `);

  await db.exec(`
    CREATE TABLE IF NOT EXISTS bookings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      lab_id INTEGER,
      date TEXT,
      time_slot TEXT,
      status TEXT DEFAULT 'Pending'
    )
  `);

  await db.exec(`
    CREATE TABLE IF NOT EXISTS projects (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      title TEXT,
      description TEXT,
      status TEXT DEFAULT 'Assigned',
      file_url TEXT,
      feedback TEXT
    )
  `);

  await db.exec(`
    CREATE TABLE IF NOT EXISTS certificates (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      title TEXT,
      issuer TEXT,
      date TEXT
    )
  `);

  await db.exec(`
    CREATE TABLE IF NOT EXISTS internships (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      recruiter_id INTEGER,
      title TEXT,
      company TEXT,
      location TEXT,
      type TEXT,
      required_skills TEXT,
      description TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await db.exec(`
    CREATE TABLE IF NOT EXISTS applications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      internship_id INTEGER,
      status TEXT DEFAULT 'Pending',
      date TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await db.exec(`
    CREATE TABLE IF NOT EXISTS notifications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      message TEXT,
      read INTEGER DEFAULT 0,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);
  
  // Try to add column if it doesn't exist (for existing DBs)
  const columns = ['role', 'photo', 'branch', 'year', 'location', 'preferred_courses', 'resume'];
  for (const col of columns) {
    try {
      await db.exec(`ALTER TABLE users ADD COLUMN ${col} TEXT`);
    } catch (e) {
      // Column exists
    }
  }

  // Upgrade internships to full Opportunities system
  const oppColumns = ['eligibility', 'mode', 'compensation', 'deadline', 'category'];
  for (const col of oppColumns) {
    try {
      await db.exec(`ALTER TABLE internships ADD COLUMN ${col} TEXT`);
    } catch (e) {
      // Column might already exist
    }
  }

  // Create courses and labs tables
  await db.exec(`
    CREATE TABLE IF NOT EXISTS courses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT,
      category TEXT,
      duration TEXT,
      level TEXT,
      provider TEXT,
      description TEXT,
      rating REAL DEFAULT 4.8,
      modules TEXT,
      skills_gained TEXT,
      image TEXT,
      color TEXT
    )
  `);

  const courseColumns = ['provider', 'description', 'rating', 'modules', 'skills_gained'];
  for (const col of courseColumns) {
    try {
      await db.exec(`ALTER TABLE courses ADD COLUMN ${col} TEXT`);
    } catch (e) {}
  }

  await db.exec(`
    CREATE TABLE IF NOT EXISTS labs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT,
      type TEXT,
      location TEXT,
      capacity INTEGER,
      availableSlots INTEGER,
      facilities TEXT,
      timings TEXT,
      equipment TEXT,
      incharge TEXT,
      rules TEXT,
      icon TEXT,
      image TEXT,
      color TEXT
    )
  `);

  const labColumns = ['timings', 'equipment', 'incharge', 'rules'];
  for (const col of labColumns) {
    try {
      await db.exec(`ALTER TABLE labs ADD COLUMN ${col} TEXT`);
    } catch (e) {}
  }

  try {
    await db.exec(`ALTER TABLE bookings ADD COLUMN purpose TEXT`);
  } catch (e) {}

  // Ensure rich courses exist (Hardware + Software + Technology + Agriculture + Business)
  const courseCount = await db.get('SELECT COUNT(*) as c FROM courses');
  if (courseCount.c < 12) {
    await db.run('DELETE FROM courses');
    const comprehensiveCourses = [
      // Hardware
      [
        'Computer Assembly, Maintenance & Repair',
        'Hardware',
        '6 weeks',
        'Beginner',
        'K.B.P. Polytechnic Kopargaon',
        'Hands-on training in assembling PCs, diagnosing motherboard issues, power supply testing, BIOS configuration, and OS setup.',
        4.8,
        'PC Hardware Components Architecture|Motherboard & CPU Installation|Power Supplies & Thermal Management|BIOS/UEFI Configuration|Preventive Maintenance & Repair',
        'PC Assembly, Component Diagnosis, Soldering Basics, OS Installation',
        'https://images.unsplash.com/photo-1597872253359-f705a61a0d8e?auto=format&fit=crop&w=600&q=80',
        'from-slate-600 to-slate-800'
      ],
      [
        'IoT Hardware & Smart Sensor Deployment',
        'Hardware',
        '5 weeks',
        'Intermediate',
        'Sanjivani College of Engineering',
        'Learn to interface ESP32 and Arduino microcontrollers with agricultural and industrial sensors, solder custom boards, and transmit telemetry.',
        4.9,
        'Microcontroller Architecture (ESP32/Arduino)|Sensor Interfacing & ADC|Soldering & Custom PCB Prototyping|Wi-Fi & Bluetooth Telemetry|Field Deployment in Farms',
        'Arduino, ESP32, Circuit Design, Sensor Calibration, Soldering',
        'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=600&q=80',
        'from-amber-500 to-orange-600'
      ],
      [
        'Solar PV System Installation & Maintenance',
        'Hardware',
        '4 weeks',
        'Beginner',
        'Rural Skill Mission Maharashtra',
        'Master solar panel wiring, inverter sizing, battery charge controllers, off-grid storage, and fault-finding for rural households & farms.',
        4.7,
        'Solar Energy Basics & Photovoltaic Cell Physics|Panel Wiring & String Calculations|Battery Storage & Inverter Sizing|Safety, Earthing & Grid-Tie Systems|Troubleshooting & Maintenance',
        'Solar Panel Sizing, Inverter Setup, DC Wiring, Electrical Safety',
        'https://images.unsplash.com/photo-1509391365360-2e959784a276?auto=format&fit=crop&w=600&q=80',
        'from-yellow-500 to-amber-600'
      ],
      [
        'Agricultural Drone Assembly & Troubleshooting',
        'Hardware',
        '8 weeks',
        'Advanced',
        'AgriSense Drone Labs',
        'Build, wire, calibrate and repair autonomous spraying and crop-survey quadcopters with flight controllers and telemetry transceivers.',
        4.9,
        'Drone Aerodynamics & Frame Assembly|BLDC Motors & ESC Calibration|Flight Controller Wiring & ArduPilot|Payload Spraying Mechanism|Field Repair & Battery Care',
        'BLDC Motors, ESC Calibration, ArduPilot, Drone Wiring, Soldering',
        'https://images.unsplash.com/photo-1508614589041-895b88991e3e?auto=format&fit=crop&w=600&q=80',
        'from-teal-500 to-emerald-700'
      ],

      // Software
      [
        'Full-Stack Web Development (React & Node.js)',
        'Software',
        '10 weeks',
        'Intermediate',
        'RuralLearn Tech Academy',
        'Build production-ready full-stack applications with React, Tailwind CSS, Node.js, Express, and SQLite database storage.',
        4.9,
        'Modern JavaScript & TypeScript Fundamentals|Building UI with React & Tailwind CSS|REST API Development with Express|Database Modeling & SQLite|User Auth, JWT & Cloud Deployment',
        'React, TypeScript, Node.js, Express, SQLite, REST APIs',
        'https://images.unsplash.com/photo-1547658719-da2b51169166?auto=format&fit=crop&w=600&q=80',
        'from-indigo-500 to-purple-600'
      ],
      [
        'Python Programming for Data & Automation',
        'Software',
        '8 weeks',
        'Beginner',
        'Sanjivani COE Computer Dept',
        'Learn Python from scratch, automate repetitive spreadsheet tasks, process rural survey data, and write clean object-oriented code.',
        4.8,
        'Python Core Syntax & Control Flow|Data Structures & Functions|File Operations & Excel/CSV Automation|Introduction to Pandas & NumPy|Real-world Automation Capstone',
        'Python, Data Structures, Automation Scripts, File I/O, Pandas',
        'https://images.unsplash.com/photo-1526379095098-d400fd0bfce8?auto=format&fit=crop&w=600&q=80',
        'from-blue-500 to-indigo-600'
      ],
      [
        'Mobile App Creation with Flutter',
        'Software',
        '8 weeks',
        'Intermediate',
        'Pune Tech Hub',
        'Develop cross-platform Android and iOS mobile apps tailored for rural commerce, agriculture advisory, and education.',
        4.7,
        'Dart Programming Fundamentals|Flutter Widgets & Responsive Layouts|State Management (Provider/Riverpod)|Connecting to Backend REST APIs|Building and Publishing Android APKs',
        'Flutter, Dart, Mobile UI Design, REST APIs, State Management',
        'https://images.unsplash.com/photo-1551650975-87deedd944c3?auto=format&fit=crop&w=600&q=80',
        'from-sky-500 to-blue-600'
      ],
      [
        'Cloud Computing & Linux Server Administration',
        'Software',
        '6 weeks',
        'Intermediate',
        'RuralLearn Rural Cloud Initiative',
        'Master Linux command line, Docker containers, reverse proxies, and cloud hosting essentials to manage web applications.',
        4.8,
        'Linux Terminal & Bash Scripting|Web Server Setup (Nginx/Apache)|Docker Containerization Basics|Cloud Virtual Machines & Security|Continuous Integration & Deployments',
        'Linux, Bash, Docker, Nginx, Cloud Hosting, DevOps Basics',
        'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=600&q=80',
        'from-cyan-500 to-blue-600'
      ],

      // Technology
      [
        'Artificial Intelligence & Rural Data Analytics',
        'Technology',
        '8 weeks',
        'Intermediate',
        'Center for AI & Rural Innovation',
        'Apply machine learning models, computer vision for plant disease detection, and generative AI tools to solve practical rural challenges.',
        4.9,
        'Fundamentals of AI & Machine Learning|Computer Vision for Crop Disease Detection|Natural Language Processing in Regional Languages|Predictive Analytics for Weather & Yield|AI Ethics and Field Capstone Deployment',
        'Machine Learning, Computer Vision, Python, OpenCV, Regional NLP, Predictive Analytics',
        'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80',
        'from-blue-600 to-indigo-700'
      ],
      [
        'Cybersecurity Fundamentals & Digital Banking Safety',
        'Technology',
        '6 weeks',
        'Beginner',
        'Maharashtra Cyber Defense Cell',
        'Learn vital information security concepts, network defense, phishing prevention, secure digital transactions, and privacy protection.',
        4.8,
        'Introduction to Cyber Threats & Social Engineering|Network Security & Firewall Configurations|Securing Digital Payments & UPI Infrastructure|Identity Protection & Password Cryptography|Incident Response & Cyber Law Basics',
        'Network Security, Firewall Setup, Phishing Defense, Cryptography, Digital Safety',
        'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=600&q=80',
        'from-cyan-600 to-slate-800'
      ],
      [
        'GIS Mapping & Satellite Remote Sensing for Rural Planning',
        'Technology',
        '7 weeks',
        'Intermediate',
        'Indian Institute of Remote Sensing (Outreach)',
        'Master QGIS mapping, satellite imagery interpretation, watershed planning, and cadastral spatial mapping for village administration.',
        4.9,
        'Principles of Spatial Data & Coordinate Systems|QGIS Software Mastery & Vector/Raster Layers|Satellite Imagery Analysis & Vegetation Indices (NDVI)|Watershed Delineation & Groundwater Mapping|Field GPS Surveying & Map Publishing',
        'QGIS, Satellite Remote Sensing, NDVI Indices, Spatial Analysis, GPS Mapping',
        'https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&w=600&q=80',
        'from-emerald-600 to-teal-700'
      ],
      [
        'Renewable Energy Microgrid & Smart Grid Technology',
        'Technology',
        '6 weeks',
        'Intermediate',
        'K.B.P. Polytechnic Renewable Hub',
        'Design and monitor hybrid solar-wind microgrids, energy storage units, smart inverters, and IoT-based power distribution systems.',
        4.7,
        'Microgrid Architecture & Generation Sources|Smart Inverters & Power Quality Conditioning|Lithium-Ion Battery Storage & BMS Control|SCADA & IoT Power Monitoring Systems|Rural Village Microgrid Case Studies',
        'Microgrid Design, Smart Inverters, Battery Management Systems, IoT SCADA, Power Distribution',
        'https://images.unsplash.com/photo-1466611653911-95081537e5b7?auto=format&fit=crop&w=600&q=80',
        'from-amber-600 to-emerald-700'
      ],

      // Agriculture
      [
        'Modern Precision Agriculture Techniques',
        'Agriculture',
        '4 weeks',
        'Beginner',
        'Mahatma Phule Krishi Vidyapeeth',
        'Explore smart irrigation systems, crop health monitoring, soil sensor analysis, and sustainable farm management.',
        4.9,
        'Soil Science & Nutrient Management|Automated Micro-Irrigation|Weather Forecasting & Crop Planning|Pest Detection & Bio-management|Agri-Market Digital Platforms',
        'Drip Automation, Soil Analysis, Weather Forecasting, Crop Health',
        'https://images.unsplash.com/photo-1589923158776-cb4485d99fd6?auto=format&fit=crop&w=600&q=80',
        'from-emerald-500 to-green-600'
      ],

      // Business & Technology
      [
        'Financial Literacy & Rural Entrepreneurship',
        'Business',
        '3 weeks',
        'Beginner',
        'State Rural Livelihood Mission',
        'Understand government subsidies, digital payments, micro-loans, farm accounting, and small business planning.',
        4.8,
        'Financial Bookkeeping & Budgeting|Government Subsidy Schemes & MUDRA Loans|UPI & Cyber Safety for Business|Designing a Rural Enterprise Business Plan',
        'Accounting, Govt Schemes, Business Budgeting, Digital Banking',
        'https://images.unsplash.com/photo-1554415707-6e8cfc93fe23?auto=format&fit=crop&w=600&q=80',
        'from-orange-500 to-red-500'
      ]
    ];

    for (const c of comprehensiveCourses) {
      await db.run(
        'INSERT INTO courses (title, category, duration, level, provider, description, rating, modules, skills_gained, image, color) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        c
      );
    }
  }

  // Ensure rich labs exist
  const labCount = await db.get('SELECT COUNT(*) as c FROM labs');
  if (labCount.c < 5) {
    await db.run('DELETE FROM labs');
    const comprehensiveLabs = [
      [
        'Koprgaon Regional IT & Computer Center',
        'Computer Lab',
        'Main St, Near Bus Stand, Koprgaon',
        35,
        14,
        'High-speed Internet, Air Conditioned, HD Projector, Linux/Windows Dual Boot, UPS Backup',
        'Mon - Sat: 8:00 AM - 7:00 PM',
        '35x Dell Core i7 Desktop Workstations, Gigabit Switch, High-Speed Optical Fiber, 4K Smart Board',
        'Prof. S. R. Kulkarni (IT Dept)',
        'Valid student ID card required. Food and beverages strictly prohibited inside lab.',
        'Monitor',
        'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=800&q=80',
        'from-blue-500 to-cyan-500'
      ],
      [
        'Taluka Hardware & Electronics Workshop',
        'Hardware Lab',
        'Industrial Training Wing, Shirdi Road, Koprgaon',
        25,
        10,
        'Soldering Stations, Component Racks, Safety Goggles & Antistatic Mats, Diagnostic Benches',
        'Mon - Fri: 9:00 AM - 5:30 PM',
        '10x Digital Oscilloscopes, 25x Temperature-Controlled Soldering Stations, Multimeters, DC Power Supplies, Component Testing Kits, IC Programmers',
        'Er. Rajesh Deshmukh (Workshop Supdt)',
        'Wear closed footwear and antistatic wristbands during hardware disassembly.',
        'Cpu',
        'https://images.unsplash.com/photo-1581092160562-40aa08e78837?auto=format&fit=crop&w=800&q=80',
        'from-orange-500 to-amber-500'
      ],
      [
        'District Soil & Water Testing Center',
        'Agriculture Lab',
        'Agri Complex, Market Yard Road, Ahmednagar',
        20,
        8,
        'Chemical Safety Cabinets, Distilled Water Plant, Precision Balance, Digital Spectrophotometer',
        'Mon - Sat: 8:30 AM - 4:30 PM',
        'Digital pH Meters, Electrical Conductivity Meters, Spectrophotometer, Nitrogen Digestion Unit, Soil Moisture Sensors',
        'Dr. Anita Shinde (Senior Agronomist)',
        'Lab coat and safety glasses mandatory. Follow chemical handling protocol.',
        'FlaskConical',
        'https://images.unsplash.com/photo-1581093458791-9f3c3900df4b?auto=format&fit=crop&w=800&q=80',
        'from-emerald-500 to-green-600'
      ],
      [
        'IoT & Embedded Systems Makerspace',
        'Hardware Lab',
        'Innovation Hub, Sanjivani Campus, Koprgaon',
        20,
        6,
        '3D Printers, PCB Milling, IoT Sensor Kits, High-speed Wi-Fi, Microcontroller Programmers',
        'Mon - Sat: 9:00 AM - 8:00 PM',
        '3x Ender 3D Printers, 30x ESP32/Arduino Dev Kits, Raspberry Pi 4 Benches, Logic Analyzers, LoRaWAN Gateways',
        'Prof. Vivek Gaikwad',
        'Reserve 3D printing jobs 24 hours in advance. Log all sensor component checkouts.',
        'Cpu',
        'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=800&q=80',
        'from-purple-500 to-indigo-500'
      ],
      [
        'Advanced Software & Cloud Lab',
        'Computer Lab',
        'Tech Park Floor 3, Pune Sub-Center',
        40,
        18,
        'Dual-Monitor Setup, GPU Workstations, Cloud Server Access, Video Conferencing Booth',
        'Mon - Sun: 7:00 AM - 9:00 PM',
        '40x NVIDIA RTX Enabled Workstations, 1Gbps Dedicated Fiber, Private Cloud Cluster, VR Headsets',
        'Mahesh Wagh (Lab Admin)',
        'Keep noise levels minimum. Sign in using biometric or student token.',
        'Monitor',
        'https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=800&q=80',
        'from-cyan-500 to-blue-600'
      ]
    ];

    for (const l of comprehensiveLabs) {
      await db.run(
        'INSERT INTO labs (name, type, location, capacity, availableSlots, facilities, timings, equipment, incharge, rules, icon, image, color) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        l
      );
    }
  }
};

setupDb();

// Middleware to verify token
const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: 'No token provided' });

  const token = authHeader.split(' ')[1];
  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) return res.status(401).json({ error: 'Invalid token' });
    req.userId = decoded.id;
    next();
  });
};

// Role-Based Authorization Middleware
const requireRole = (roles) => {
  return async (req, res, next) => {
    try {
      const user = await db.get('SELECT id, role FROM users WHERE id = ?', [req.userId]);
      if (!user) return res.status(401).json({ error: 'User not found' });
      if (!roles.includes(user.role) && user.role !== 'Admin') {
        return res.status(403).json({ error: `Access denied. Requires one of: ${roles.join(', ')}` });
      }
      req.userRole = user.role;
      next();
    } catch (err) {
      res.status(500).json({ error: 'Authorization error' });
    }
  };
};

// Register
app.post('/api/register', async (req, res) => {
  const { name, email, password, role } = req.body;
  if (!name || !email || !password) return res.status(400).json({ error: 'All fields are required' });

  const userRole = role || 'Student';

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await db.run(
      'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
      [name, email, hashedPassword, userRole]
    );
    const token = jwt.sign({ id: result.lastID }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: result.lastID, name, email, role: userRole } });
  } catch (error) {
    if (error.message.includes('UNIQUE constraint failed')) {
      return res.status(400).json({ error: 'Email already exists' });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Login
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email and password required' });

  try {
    const user = await db.get('SELECT * FROM users WHERE email = ?', [email]);
    if (!user) return res.status(400).json({ error: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ error: 'Invalid credentials' });

    const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: '7d' });
    
    // Remove password before sending
    const { password: _, ...userWithoutPassword } = user;
    res.json({ token, user: userWithoutPassword });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get Profile
app.get('/api/profile', authenticate, async (req, res) => {
  try {
    const user = await db.get('SELECT id, name, email, role, education, skills, interests, preference, career_goal, photo, branch, year, location, preferred_courses, resume FROM users WHERE id = ?', [req.userId]);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update Profile
app.put('/api/profile', authenticate, async (req, res) => {
  const { name, education, skills, interests, preference, career_goal, photo, branch, year, location, preferred_courses, resume } = req.body;
  
  try {
    await db.run(
      'UPDATE users SET name = ?, education = ?, skills = ?, interests = ?, preference = ?, career_goal = ?, photo = ?, branch = ?, year = ?, location = ?, preferred_courses = ?, resume = ? WHERE id = ?',
      [name, education, skills, interests, preference, career_goal, photo, branch, year, location, preferred_courses, resume, req.userId]
    );
    const updatedUser = await db.get('SELECT id, name, email, role, education, skills, interests, preference, career_goal, photo, branch, year, location, preferred_courses, resume FROM users WHERE id = ?', [req.userId]);
    res.json(updatedUser);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get Enrollments
app.get('/api/enrollments', authenticate, async (req, res) => {
  try {
    const enrollments = await db.all(`
      SELECT e.id, e.course_id, e.progress, c.title, c.category, c.duration, c.level, c.image, c.provider
      FROM enrollments e
      LEFT JOIN courses c ON e.course_id = c.id
      WHERE e.user_id = ?
    `, [req.userId]);
    res.json(enrollments);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Enroll in a Course
app.post('/api/enrollments', authenticate, async (req, res) => {
  const { course_id } = req.body;
  if (!course_id) return res.status(400).json({ error: 'Course ID is required' });

  try {
    const existing = await db.get('SELECT * FROM enrollments WHERE user_id = ? AND course_id = ?', [req.userId, course_id]);
    if (existing) {
      return res.json({ success: true, enrollment: existing });
    }
    const result = await db.run('INSERT INTO enrollments (user_id, course_id, progress) VALUES (?, ?, 0)', [req.userId, course_id]);
    const course = await db.get('SELECT title FROM courses WHERE id = ?', [course_id]);
    
    // Create enrollment notification
    await db.run('INSERT INTO notifications (user_id, message) VALUES (?, ?)', [
      req.userId, 
      `You successfully enrolled in ${course ? course.title : 'Course #' + course_id}`
    ]);

    res.json({ success: true, enrollment: { id: result.lastID, course_id, progress: 0 } });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update Progress (accepts either enrollment id or course_id)
app.put('/api/enrollments/:id', authenticate, async (req, res) => {
  const { progress } = req.body;
  const targetId = req.params.id;
  
  try {
    // Check if targetId matches enrollment id or course_id
    let enrollment = await db.get('SELECT * FROM enrollments WHERE id = ? AND user_id = ?', [targetId, req.userId]);
    if (!enrollment) {
      enrollment = await db.get('SELECT * FROM enrollments WHERE course_id = ? AND user_id = ?', [targetId, req.userId]);
    }
    if (!enrollment) {
      return res.status(404).json({ error: 'Enrollment not found' });
    }

    await db.run('UPDATE enrollments SET progress = ? WHERE id = ?', [progress, enrollment.id]);
    
    // If progress reaches 100%, automatically grant Certificate & Notification
    if (progress >= 100) {
      const course = await db.get('SELECT title, provider FROM courses WHERE id = ?', [enrollment.course_id]);
      const courseTitle = course ? course.title : 'Rural Technical Skills';
      const issuer = course && course.provider ? course.provider : 'RuralLearn Academy';
      
      const existingCert = await db.get('SELECT * FROM certificates WHERE user_id = ? AND title = ?', [req.userId, courseTitle]);
      if (!existingCert) {
        const today = new Date().toISOString().split('T')[0];
        await db.run(
          'INSERT INTO certificates (user_id, title, issuer, date) VALUES (?, ?, ?, ?)',
          [req.userId, courseTitle, issuer, today]
        );
        await db.run(
          'INSERT INTO notifications (user_id, message) VALUES (?, ?)',
          [req.userId, `🎉 Congratulations! You completed ${courseTitle} and earned your Certificate.`]
        );
      }
    }

    res.json({ success: true, course_id: enrollment.course_id, progress });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get Bookings (with joined Lab details)
app.get('/api/bookings', authenticate, async (req, res) => {
  try {
    const bookings = await db.all(`
      SELECT b.id, b.lab_id, b.date, b.time_slot, b.purpose, b.status,
             l.name as lab_name, l.location as lab_location, l.type as lab_type, l.image as lab_image
      FROM bookings b
      LEFT JOIN labs l ON b.lab_id = l.id
      WHERE b.user_id = ?
      ORDER BY b.id DESC
    `, [req.userId]);
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Book a Lab / Resource
app.post('/api/bookings', authenticate, async (req, res) => {
  const { lab_id, date, time_slot, purpose } = req.body;
  if (!lab_id || !date || !time_slot) return res.status(400).json({ error: 'Lab, date and time slot are required' });

  try {
    const existing = await db.get(
      'SELECT id FROM bookings WHERE user_id = ? AND lab_id = ? AND date = ? AND time_slot = ? AND status != "Cancelled"',
      [req.userId, lab_id, date, time_slot]
    );
    if (existing) {
      return res.status(400).json({ error: 'You already have an active booking for this lab and time slot' });
    }

    const result = await db.run(
      'INSERT INTO bookings (user_id, lab_id, date, time_slot, purpose, status) VALUES (?, ?, ?, ?, ?, ?)',
      [req.userId, lab_id, date, time_slot, purpose || 'Practical Session / Project Work', 'Confirmed']
    );

    const lab = await db.get('SELECT name FROM labs WHERE id = ?', [lab_id]);

    // Send notification
    await db.run(
      'INSERT INTO notifications (user_id, message) VALUES (?, ?)',
      [req.userId, `Booking confirmed for ${lab ? lab.name : 'Lab #' + lab_id} on ${date} (${time_slot})`]
    );

    res.json({
      success: true,
      booking: {
        id: result.lastID,
        lab_id,
        date,
        time_slot,
        purpose: purpose || 'Practical Session / Project Work',
        status: 'Confirmed',
        lab_name: lab ? lab.name : ''
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Cancel a Booking
app.delete('/api/bookings/:id', authenticate, async (req, res) => {
  try {
    const booking = await db.get('SELECT b.*, l.name as lab_name FROM bookings b LEFT JOIN labs l ON b.lab_id = l.id WHERE b.id = ? AND b.user_id = ?', [req.params.id, req.userId]);
    if (!booking) return res.status(404).json({ error: 'Booking not found' });

    await db.run('DELETE FROM bookings WHERE id = ?', [req.params.id]);
    await db.run('INSERT INTO notifications (user_id, message) VALUES (?, ?)', [
      req.userId,
      `Your booking for ${booking.lab_name || 'Lab'} on ${booking.date} has been cancelled.`
    ]);

    res.json({ success: true, message: 'Booking cancelled successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Projects API
app.get('/api/projects', authenticate, async (req, res) => {
  try {
    let projects = await db.all('SELECT * FROM projects WHERE user_id = ?', [req.userId]);
    
    // Auto-assign mock projects if none exist
    if (projects.length === 0) {
      await db.run('INSERT INTO projects (user_id, title, description, status) VALUES (?, ?, ?, ?)', [req.userId, 'Build a Weather App', 'Create a React app fetching data from a Weather API', 'Assigned']);
      await db.run('INSERT INTO projects (user_id, title, description, status) VALUES (?, ?, ?, ?)', [req.userId, 'Smart Irrigation System', 'IoT project using Arduino to monitor soil moisture', 'Assigned']);
      projects = await db.all('SELECT * FROM projects WHERE user_id = ?', [req.userId]);
    }
    res.json(projects);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.put('/api/projects/:id', authenticate, async (req, res) => {
  const { status, file_url } = req.body;
  try {
    await db.run('UPDATE projects SET status = ?, file_url = ? WHERE id = ? AND user_id = ?', [status, file_url, req.params.id, req.userId]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Certificates API
app.get('/api/certificates', authenticate, async (req, res) => {
  try {
    const certs = await db.all('SELECT * FROM certificates WHERE user_id = ?', [req.userId]);
    res.json(certs);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/certificates', authenticate, async (req, res) => {
  const { title, issuer } = req.body;
  const date = new Date().toISOString().split('T')[0];
  try {
    const result = await db.run('INSERT INTO certificates (user_id, title, issuer, date) VALUES (?, ?, ?, ?)', [req.userId, title, issuer, date]);
    res.json({ success: true, certificate: { id: result.lastID, title, issuer, date } });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Internships & Opportunities API
app.get('/api/internships', async (req, res) => {
  try {
    let internships = await db.all('SELECT * FROM internships ORDER BY created_at DESC');
    if (internships.length === 0) {
      await db.run(
        'INSERT INTO internships (recruiter_id, title, company, location, type, required_skills, description, eligibility, mode, compensation, deadline, category) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', 
        [1, 'Frontend Developer Intern', 'TechCrop', 'Pune', 'Internship', 'React, TypeScript, CSS', 'Build UI for agritech dashboard.', '3rd or 4th Year B.Tech', 'Remote', '₹15,000/month', '2026-12-01', 'Internships']
      );
      await db.run(
        'INSERT INTO internships (recruiter_id, title, company, location, type, required_skills, description, eligibility, mode, compensation, deadline, category) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', 
        [1, 'Agritech Research Project', 'AgriSense', 'Ahmednagar', 'Part-time', 'IoT, Sensors', 'Data collection project.', 'Open to all', 'On-site', 'Funded Project', '2026-11-15', 'Projects']
      );
      internships = await db.all('SELECT * FROM internships ORDER BY created_at DESC');
    }
    res.json(internships);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/internships', authenticate, async (req, res) => {
  const { title, company, location, type, required_skills, description, eligibility, mode, compensation, deadline, category } = req.body;
  try {
    const result = await db.run(
      'INSERT INTO internships (recruiter_id, title, company, location, type, required_skills, description, eligibility, mode, compensation, deadline, category) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [req.userId, title, company, location, type, required_skills, description, eligibility, mode, compensation, deadline, category || 'Internships']
    );
    res.json({ success: true, id: result.lastID });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Applications API
app.get('/api/applications', authenticate, async (req, res) => {
  try {
    const user = await db.get('SELECT role FROM users WHERE id = ?', [req.userId]);
    if (user && user.role === 'Recruiter') {
      const applications = await db.all(`
        SELECT a.id, a.user_id, a.internship_id, a.status, a.date, 
               u.name as student_name, u.email as student_email, u.skills as student_skills, u.resume as student_resume,
               i.title as internship_title, i.company, i.category
        FROM applications a
        JOIN users u ON a.user_id = u.id
        JOIN internships i ON a.internship_id = i.id
        WHERE i.recruiter_id = ?
        ORDER BY a.date DESC
      `, [req.userId]);
      return res.json(applications);
    }

    const applications = await db.all(`
      SELECT a.id, a.internship_id, a.status, a.date,
             i.title, i.company, i.location, i.type, i.compensation, i.mode, i.category
      FROM applications a
      JOIN internships i ON a.internship_id = i.id
      WHERE a.user_id = ?
      ORDER BY a.date DESC
    `, [req.userId]);
    res.json(applications);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/applications', authenticate, async (req, res) => {
  const { internship_id } = req.body;
  try {
    const existing = await db.get('SELECT * FROM applications WHERE user_id = ? AND internship_id = ?', [req.userId, internship_id]);
    if (existing) return res.status(400).json({ error: 'Already applied for this opportunity' });

    const result = await db.run('INSERT INTO applications (user_id, internship_id, status) VALUES (?, ?, ?)', [req.userId, internship_id, 'Applied']);
    
    const internship = await db.get('SELECT title, recruiter_id FROM internships WHERE id = ?', [internship_id]);
    const user = await db.get('SELECT name FROM users WHERE id = ?', [req.userId]);

    // Notify recruiter if available
    if (internship && internship.recruiter_id) {
      await db.run('INSERT INTO notifications (user_id, message) VALUES (?, ?)', [
        internship.recruiter_id,
        `${user ? user.name : 'A student'} applied for ${internship.title}`
      ]);
    }
    
    // Notify student
    await db.run('INSERT INTO notifications (user_id, message) VALUES (?, ?)', [
      req.userId,
      `You successfully applied for ${internship ? internship.title : 'Opportunity'}`
    ]);

    res.json({ success: true, application_id: result.lastID });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.put('/api/applications/:id', authenticate, async (req, res) => {
  const { status } = req.body;
  try {
    await db.run('UPDATE applications SET status = ? WHERE id = ?', [status, req.params.id]);
    const appRecord = await db.get('SELECT user_id, internship_id FROM applications WHERE id = ?', [req.params.id]);
    const internship = await db.get('SELECT title FROM internships WHERE id = ?', [appRecord.internship_id]);
    
    // Notify student
    await db.run('INSERT INTO notifications (user_id, message) VALUES (?, ?)', [appRecord.user_id, `Your application for ${internship.title} status updated to: ${status}`]);
    
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Notifications API
app.get('/api/notifications', authenticate, async (req, res) => {
  try {
    const notifications = await db.all('SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC', [req.userId]);
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Courses API
app.get('/api/courses', async (req, res) => {
  try {
    const courses = await db.all('SELECT * FROM courses');
    const mapped = courses.map(c => ({
      ...c,
      modules: c.modules ? c.modules.split('|') : [],
      skills_gained: c.skills_gained ? c.skills_gained.split(', ') : []
    }));
    res.json(mapped);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/courses/:id', async (req, res) => {
  try {
    const course = await db.get('SELECT * FROM courses WHERE id = ?', [req.params.id]);
    if (!course) return res.status(404).json({ error: 'Course not found' });
    res.json({
      ...course,
      modules: course.modules ? course.modules.split('|') : [],
      skills_gained: course.skills_gained ? course.skills_gained.split(', ') : []
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Labs API
app.get('/api/labs', async (req, res) => {
  try {
    const labs = await db.all('SELECT * FROM labs');
    const mapped = labs.map(l => ({
      ...l,
      facilities: l.facilities ? l.facilities.split(', ') : [],
      equipment_list: l.equipment ? l.equipment.split(', ') : []
    }));
    res.json(mapped);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/labs/:id', async (req, res) => {
  try {
    const lab = await db.get('SELECT * FROM labs WHERE id = ?', [req.params.id]);
    if (!lab) return res.status(404).json({ error: 'Lab not found' });
    res.json({
      ...lab,
      facilities: lab.facilities ? lab.facilities.split(', ') : [],
      equipment_list: lab.equipment ? lab.equipment.split(', ') : []
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Role-Based Protected APIs

// Admin: User & Role Management
app.get('/api/admin/users', authenticate, requireRole(['Admin']), async (req, res) => {
  try {
    const users = await db.all('SELECT id, name, email, role, education, location, skills FROM users ORDER BY id DESC');
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

app.put('/api/admin/users/:id/role', authenticate, requireRole(['Admin']), async (req, res) => {
  const { role } = req.body;
  if (!['Student', 'Trainer', 'Recruiter', 'Admin'].includes(role)) {
    return res.status(400).json({ error: 'Invalid role specified' });
  }
  try {
    await db.run('UPDATE users SET role = ? WHERE id = ?', [role, req.params.id]);
    res.json({ success: true, message: `User role updated to ${role}` });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update user role' });
  }
});

// Admin: System Aggregate Stats
app.get('/api/admin/stats', authenticate, requireRole(['Admin']), async (req, res) => {
  try {
    const studentCount = await db.get("SELECT COUNT(*) as c FROM users WHERE role = 'Student'");
    const trainerCount = await db.get("SELECT COUNT(*) as c FROM users WHERE role = 'Trainer'");
    const recruiterCount = await db.get("SELECT COUNT(*) as c FROM users WHERE role = 'Recruiter'");
    const courseCount = await db.get('SELECT COUNT(*) as c FROM courses');
    const labCount = await db.get('SELECT COUNT(*) as c FROM labs');
    const enrollmentCount = await db.get('SELECT COUNT(*) as c FROM enrollments');
    const bookingCount = await db.get('SELECT COUNT(*) as c FROM bookings');
    const applicationCount = await db.get('SELECT COUNT(*) as c FROM applications');

    res.json({
      students: studentCount.c,
      trainers: trainerCount.c,
      recruiters: recruiterCount.c,
      courses: courseCount.c,
      labs: labCount.c,
      enrollments: enrollmentCount.c,
      bookings: bookingCount.c,
      applications: applicationCount.c
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch admin stats' });
  }
});

// Trainer: Student Enrollments and Progress Overview
app.get('/api/trainer/students', authenticate, requireRole(['Trainer', 'Admin']), async (req, res) => {
  try {
    const students = await db.all(`
      SELECT e.id as enrollment_id, e.progress, u.id as user_id, u.name as student_name, u.email as student_email, c.id as course_id, c.title as course_title, c.category
      FROM enrollments e
      JOIN users u ON e.user_id = u.id
      JOIN courses c ON e.course_id = c.id
      ORDER BY e.id DESC
    `);
    res.json(students);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch trainer students' });
  }
});

// Recruiter: Candidate Applications Overview
app.get('/api/recruiter/applicants', authenticate, requireRole(['Recruiter', 'Admin']), async (req, res) => {
  try {
    const applicants = await db.all(`
      SELECT a.id as application_id, a.status, a.date, u.id as user_id, u.name as candidate_name, u.email as candidate_email, u.skills, u.education, i.id as internship_id, i.title as job_title, i.company, i.type, i.location
      FROM applications a
      JOIN users u ON a.user_id = u.id
      JOIN internships i ON a.internship_id = i.id
      ORDER BY a.id DESC
    `);
    res.json(applicants);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch recruiter applicants' });
  }
});

const PORT = process.env.PORT || 3001;
if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`Backend server running on http://localhost:${PORT}`);
  });
}

export default app;
