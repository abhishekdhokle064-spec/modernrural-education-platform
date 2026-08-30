import React, { useState, useEffect } from 'react';
import { MapPin, Calendar, Clock, Monitor, FlaskConical, Cpu, Users, ArrowRight, CheckCircle, Search, Filter, Sparkles, X, Info, ShieldCheck, Wrench, Trash2 } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Labs() {
  const { t, language } = useLanguage();
  const { user, token, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [labs, setLabs] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [filterType, setFilterType] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLab, setSelectedLab] = useState<any>(null);
  const [bookingLabId, setBookingLabId] = useState<number | null>(null);
  const [date, setDate] = useState('');
  const [timeSlot, setTimeSlot] = useState('');
  const [purpose, setPurpose] = useState('');
  const [loading, setLoading] = useState(true);
  const [feedbackMsg, setFeedbackMsg] = useState('');

  const labTypes = [
    { key: 'All', label: t('cat.all') },
    { key: 'Computer Lab', label: language === 'mr' ? 'संगणक लॅब' : language === 'hi' ? 'कंप्यूटर लैब' : 'Computer Lab' },
    { key: 'Hardware Lab', label: language === 'mr' ? 'हार्डवेअर लॅब' : language === 'hi' ? 'हार्डवेयर लैब' : 'Hardware Lab' },
    { key: 'Agriculture Lab', label: language === 'mr' ? 'कृषी व मृदा लॅब' : language === 'hi' ? 'कृषि एवं मृदा लैब' : 'Agriculture Lab' }
  ];

  const timeSlots = ["08:30 AM - 10:30 AM", "11:00 AM - 01:00 PM", "02:00 PM - 04:00 PM", "04:30 PM - 06:30 PM"];

  useEffect(() => {
    fetchLabs();
    if (isAuthenticated && token) {
      fetchBookings();
    }
  }, [isAuthenticated, token]);

  const fetchLabs = () => {
    setLoading(true);
    fetch('http://localhost:3001/api/labs')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setLabs(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  };

  const fetchBookings = () => {
    fetch('http://localhost:3001/api/bookings', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setBookings(data);
      })
      .catch(console.error);
  };

  const handleBook = async (labId: number, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();

    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    
    if (bookingLabId === labId) {
      if (!date || !timeSlot) {
        alert(language === 'mr' ? 'कृपया तारीख आणि वेळेचा स्लॉट दोन्ही निवडा.' : language === 'hi' ? 'कृपया दिनांक और समय स्लॉट दोनों चुनें।' : 'Please choose both a date and a time slot.');
        return;
      }
      try {
        const res = await fetch('http://localhost:3001/api/bookings', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ 
            lab_id: labId, 
            date, 
            time_slot: timeSlot,
            purpose: purpose || 'Practical Session / Project Work'
          })
        });
        const data = await res.json();
        if (res.ok) {
          setBookings([data.booking, ...bookings]);
          setBookingLabId(null);
          setDate('');
          setTimeSlot('');
          setPurpose('');
          setFeedbackMsg(`🎉 ${t('labs.booked_success')}`);
          setTimeout(() => setFeedbackMsg(''), 4000);
        } else {
          alert(data.error || 'Failed to book slot');
        }
      } catch (err) {
        console.error('Failed to book', err);
      }
    } else {
      setBookingLabId(labId);
    }
  };

  const handleCancelBooking = async (bookingId: number) => {
    const confirmMsg = language === 'mr' ? 'तुम्हाला हे लॅब बुकिंग रद्द करायचे आहे का?' : language === 'hi' ? 'क्या आप यह लैब बुकिंग रद्द करना चाहते हैं?' : 'Are you sure you want to cancel this lab booking?';
    if (!confirm(confirmMsg)) return;

    try {
      const res = await fetch(`http://localhost:3001/api/bookings/${bookingId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setBookings(bookings.filter(b => b.id !== bookingId));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const getLabIcon = (iconName: string) => {
    if (iconName === 'Cpu') return Cpu;
    if (iconName === 'FlaskConical') return FlaskConical;
    return Monitor;
  };

  const filteredLabs = labs.filter(lab => {
    const matchesSearch = 
      lab.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lab.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (lab.equipment && lab.equipment.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (Array.isArray(lab.facilities) && lab.facilities.some((f: string) => f.toLowerCase().includes(searchTerm.toLowerCase())));

    const matchesType = filterType === 'All' || lab.type.toLowerCase().includes(filterType.toLowerCase());

    return matchesSearch && matchesType;
  });

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8"
    >
      {/* Top Banner */}
      <div className="mb-10 bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 rounded-3xl p-8 sm:p-10 text-white shadow-2xl relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-72 h-72 bg-emerald-500 rounded-full mix-blend-overlay filter blur-3xl opacity-40 animate-pulse"></div>
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md text-emerald-400 text-xs font-bold uppercase tracking-wider mb-4 border border-white/10">
            <Sparkles className="h-3.5 w-3.5" /> {language === 'mr' ? 'प्रात्यक्षिक लॅब व कार्यशाळा' : language === 'hi' ? 'प्रायोगिक लैब एवं कार्यशालाएँ' : 'High-Tech Regional Labs & Workshops'}
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight mb-3">
            {t('labs.title')}
          </h1>
          <p className="text-slate-300 text-base sm:text-lg">
            {t('labs.subtitle')}
          </p>
        </div>

        {/* Live Stat Badges */}
        <div className="relative z-10 flex flex-row md:flex-col gap-3 shrink-0">
          <div className="bg-white/10 backdrop-blur-md px-5 py-3 rounded-2xl border border-white/10 text-center md:text-left">
            <span className="text-2xl font-black text-white">{labs.length}</span>
            <span className="block text-xs font-medium text-slate-300">{t('stats.labs')}</span>
          </div>
          <div className="bg-white/10 backdrop-blur-md px-5 py-3 rounded-2xl border border-white/10 text-center md:text-left">
            <span className="text-2xl font-black text-emerald-400">{bookings.length}</span>
            <span className="block text-xs font-medium text-slate-300">{t('progress.lab_bookings')}</span>
          </div>
        </div>
      </div>

      {/* Success Feedback Alert */}
      <AnimatePresence>
        {feedbackMsg && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mb-6 p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl flex items-center gap-3 font-bold shadow-md"
          >
            <CheckCircle className="h-5 w-5 text-emerald-600" />
            <span>{feedbackMsg}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Active Bookings Bar (if any) */}
      {bookings.length > 0 && (
        <div className="mb-8 p-6 bg-emerald-50/70 border border-emerald-200 rounded-3xl shadow-sm">
          <h3 className="text-sm font-extrabold uppercase tracking-wider text-emerald-900 mb-3 flex items-center gap-2">
            <Clock className="h-4 w-4 text-emerald-600" /> {t('progress.lab_bookings')} ({bookings.length})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {bookings.map(b => (
              <div key={b.id} className="bg-white p-4 rounded-2xl border border-emerald-100 shadow-sm flex items-center justify-between gap-3">
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">{b.lab_name || `Lab #${b.lab_id}`}</h4>
                  <p className="text-xs text-slate-500">{b.date} • {b.time_slot}</p>
                  <span className="inline-block mt-1 text-[10px] font-extrabold px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-md">
                    {b.status || (language === 'mr' ? 'निश्चित केले' : language === 'hi' ? 'आरक्षित' : 'Confirmed')}
                  </span>
                </div>
                <button
                  onClick={() => handleCancelBooking(b.id)}
                  title={t('btn.cancel')}
                  className="p-2 text-rose-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Search & Filter Toolbar */}
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 mb-8 space-y-4">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="relative w-full md:w-96 group">
            <input
              type="text"
              placeholder={t('cat.search_labs')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200/80 rounded-2xl focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all shadow-inner text-sm"
            />
            <Search className="absolute left-4 top-3.5 h-5 w-5 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            <span className="text-xs font-bold uppercase text-slate-400 mr-1 flex items-center gap-1">
              <Filter className="h-3.5 w-3.5" /> {t('cat.categories')}:
            </span>
            {labTypes.map(type => (
              <button
                key={type.key}
                onClick={() => setFilterType(type.key)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  filterType === type.key
                    ? 'bg-slate-900 text-white shadow-md'
                    : 'bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                {type.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Labs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <AnimatePresence>
          {filteredLabs.map((lab, index) => {
            const Icon = getLabIcon(lab.icon);
            const isBooking = bookingLabId === lab.id;
            const userBooking = bookings.find(b => b.lab_id === lab.id && b.status !== 'Cancelled');

            return (
              <motion.div 
                key={lab.id} 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: index * 0.05 }}
                whileHover={!isBooking ? { y: -6 } : {}}
                onClick={() => setSelectedLab(lab)}
                className="bg-white rounded-3xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col border border-slate-100 group cursor-pointer relative"
              >
                {/* Lab Image Banner */}
                <div className="relative overflow-hidden h-52">
                  <div className={`absolute inset-0 bg-gradient-to-t ${lab.color || 'from-slate-900'} opacity-50 mix-blend-multiply z-10`} />
                  <img 
                    src={lab.image} 
                    alt={lab.name} 
                    className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500" 
                  />
                  <div className="absolute top-4 left-4 z-20">
                    <span className="bg-white/90 backdrop-blur-md text-slate-900 text-xs px-3.5 py-1.5 rounded-full font-extrabold flex items-center gap-1.5 shadow-md">
                      <Icon className="h-3.5 w-3.5 text-emerald-600" /> {lab.type}
                    </span>
                  </div>

                  {lab.timings && (
                    <div className="absolute bottom-3 left-4 right-4 z-20">
                      <span className="bg-black/50 backdrop-blur-sm text-white text-[11px] font-semibold px-2.5 py-1 rounded-md flex items-center gap-1">
                        <Clock className="h-3 w-3 text-amber-300" /> {lab.timings}
                      </span>
                    </div>
                  )}
                </div>
                
                {/* Lab Content */}
                <div className="p-6 flex-grow flex flex-col justify-between">
                  <div>
                    <h3 className="text-xl font-extrabold text-slate-900 mb-2 group-hover:text-emerald-600 transition-colors leading-snug">
                      {lab.name}
                    </h3>
                    <p className="text-slate-500 text-xs flex items-center gap-1.5 mb-4 font-medium">
                      <MapPin className="h-3.5 w-3.5 text-rose-500 shrink-0" /> {lab.location}
                    </p>
                    
                    {/* Facilities Tags */}
                    {Array.isArray(lab.facilities) && lab.facilities.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-5">
                        {lab.facilities.slice(0, 3).map((fac: string, i: number) => (
                          <span key={i} className="text-[11px] font-semibold bg-slate-100 text-slate-600 px-2.5 py-1 rounded-md">
                            {fac.trim()}
                          </span>
                        ))}
                        {lab.facilities.length > 3 && (
                          <span className="text-[11px] font-bold text-slate-400 px-1 py-1">
                            +{lab.facilities.length - 3} {language === 'mr' ? 'इतर' : language === 'hi' ? 'अन्य' : 'more'}
                          </span>
                        )}
                      </div>
                    )}
                    
                    {/* Capacity & Availability Metrics */}
                    <div className="grid grid-cols-2 gap-3 mb-5">
                      <div className="bg-slate-50 p-3 rounded-2xl text-center border border-slate-100">
                        <div className="flex justify-center mb-0.5">
                          <Users className="h-4 w-4 text-slate-400" />
                        </div>
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{t('labs.capacity')}</div>
                        <div className="font-extrabold text-slate-900 text-base">{lab.capacity} {language === 'mr' ? 'जागा' : language === 'hi' ? 'सीटें' : 'Seats'}</div>
                      </div>
                      <div className="bg-emerald-50/70 p-3 rounded-2xl text-center border border-emerald-100">
                        <div className="flex justify-center mb-0.5">
                          <Clock className="h-4 w-4 text-emerald-500" />
                        </div>
                        <div className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">{t('labs.available_slots')}</div>
                        <div className="font-extrabold text-emerald-700 text-base">{lab.availableSlots} {language === 'mr' ? 'उपलब्ध' : language === 'hi' ? 'खुले' : 'Open'}</div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Inline Booking Form */}
                  <AnimatePresence>
                    {isBooking && (
                      <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        onClick={(e) => e.stopPropagation()}
                        className="mb-4 p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3"
                      >
                        <div className="flex justify-between items-center">
                          <span className="text-xs font-bold text-slate-900 uppercase">{t('labs.booking_title')}</span>
                          <button onClick={() => setBookingLabId(null)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-slate-400 uppercase">{t('labs.select_date')}</label>
                          <input 
                            type="date" 
                            value={date} 
                            onChange={(e) => setDate(e.target.value)} 
                            min={new Date().toISOString().split('T')[0]} 
                            className="w-full mt-1 p-2 bg-white border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 outline-none" 
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-slate-400 uppercase">{t('labs.select_time')}</label>
                          <select 
                            value={timeSlot} 
                            onChange={(e) => setTimeSlot(e.target.value)} 
                            className="w-full mt-1 p-2 bg-white border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 outline-none"
                          >
                            <option value="">-- {t('labs.select_time')} --</option>
                            {timeSlots.map(slot => <option key={slot} value={slot}>{slot}</option>)}
                          </select>
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-slate-400 uppercase">{t('labs.purpose')}</label>
                          <input 
                            type="text" 
                            placeholder={language === 'mr' ? 'उदा. सोल्डरिंग प्रात्यक्षिक, आयओटी प्रोजेक्ट' : language === 'hi' ? 'उदा. सोल्डरिंग अभ्यास, आईओटी प्रोजेक्ट' : 'e.g. Soldering practice, IoT project'} 
                            value={purpose} 
                            onChange={(e) => setPurpose(e.target.value)} 
                            className="w-full mt-1 p-2 bg-white border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 outline-none" 
                          />
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Actions */}
                  <div className="space-y-2 pt-2 border-t border-slate-100">
                    <div className="flex gap-2">
                      <button
                        onClick={(e) => { e.stopPropagation(); setSelectedLab(lab); }}
                        className="flex-1 bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold py-2.5 px-3 rounded-xl text-xs transition-colors border border-slate-200/70 text-center cursor-pointer"
                      >
                        {language === 'mr' ? 'तपशील पहा' : language === 'hi' ? 'विवरण देखें' : 'Lab Details'}
                      </button>

                      {userBooking ? (
                        <div className="flex-1 bg-emerald-100 text-emerald-800 font-bold py-2.5 px-3 rounded-xl text-xs flex items-center justify-center gap-1.5">
                          <CheckCircle className="h-3.5 w-3.5" /> {language === 'mr' ? 'बुक झाले' : language === 'hi' ? 'आरक्षित' : 'Booked'} ({userBooking.date})
                        </div>
                      ) : (
                        <button 
                          onClick={(e) => handleBook(lab.id, e)}
                          className="flex-1 bg-slate-900 hover:bg-emerald-600 text-white font-bold py-2.5 px-3 rounded-xl text-xs transition-colors flex items-center justify-center gap-1.5 shadow-md shadow-slate-900/10 cursor-pointer"
                        >
                          {isBooking ? t('labs.confirm_booking') : t('btn.book_slot')} {isBooking ? <CheckCircle className="h-3.5 w-3.5" /> : <ArrowRight className="h-3.5 w-3.5" />}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {filteredLabs.length === 0 && !loading && (
        <div className="text-center py-20 bg-white rounded-3xl border border-slate-100 mt-8">
          <Search className="h-8 w-8 text-slate-400 mx-auto mb-3" />
          <h3 className="text-xl font-bold text-slate-900 mb-1">
            {language === 'mr' ? 'कोणतीही लॅब सापडली नाही' : language === 'hi' ? 'कोई लैब नहीं मिली' : 'No matching labs found'}
          </h3>
          <p className="text-slate-500 text-sm">
            {language === 'mr' ? 'कृपया शोध निकष बदला किंवा सर्व लॅब्स पर्याय निवडा.' : language === 'hi' ? 'कृपया खोज मापदंड बदलें या सभी लैब चुनें।' : 'Try broadening your search or choosing All lab types.'}
          </p>
        </div>
      )}

      {/* Lab Details Modal */}
      <AnimatePresence>
        {selectedLab && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedLab(null)}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl shadow-2xl overflow-hidden max-w-3xl w-full relative flex flex-col max-h-[90vh]"
            >
              {/* Close Button */}
              <button 
                onClick={() => setSelectedLab(null)}
                className="absolute top-4 right-4 z-20 p-2 bg-black/40 hover:bg-black/60 rounded-full text-white transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>

              {/* Modal Hero Header */}
              <div className="relative h-48 sm:h-56 bg-slate-900 overflow-hidden shrink-0">
                <img 
                  src={selectedLab.image} 
                  alt={selectedLab.name} 
                  className="w-full h-full object-cover opacity-50"
                />
                <div className={`absolute inset-0 bg-gradient-to-t ${selectedLab.color || 'from-slate-900'} opacity-80 mix-blend-multiply`} />
                <div className="absolute inset-0 p-6 sm:p-8 flex flex-col justify-end text-white">
                  <div className="flex flex-wrap gap-2 mb-2">
                    <span className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-bold uppercase tracking-wider">
                      {selectedLab.type}
                    </span>
                    <span className="px-3 py-1 bg-emerald-500/80 backdrop-blur-md rounded-full text-xs font-bold uppercase tracking-wider">
                      {selectedLab.availableSlots} {language === 'mr' ? 'स्लॉट उपलब्ध' : language === 'hi' ? 'स्लॉट उपलब्ध' : 'Slots Open'}
                    </span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white leading-tight">
                    {selectedLab.name}
                  </h2>
                  <p className="text-slate-300 text-xs sm:text-sm mt-1 flex items-center gap-1.5 font-medium">
                    <MapPin className="h-4 w-4 text-rose-400" /> {selectedLab.location}
                  </p>
                </div>
              </div>

              {/* Modal Body */}
              <div className="p-6 sm:p-8 overflow-y-auto space-y-6">
                {/* Timings & In-charge */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1 flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5 text-emerald-600" /> {t('labs.timings')}
                    </span>
                    <p className="text-sm font-extrabold text-slate-800">{selectedLab.timings || 'Mon - Sat: 9:00 AM - 6:00 PM'}</p>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1 flex items-center gap-1">
                      <ShieldCheck className="h-3.5 w-3.5 text-indigo-600" /> {t('labs.incharge')}
                    </span>
                    <p className="text-sm font-extrabold text-slate-800">{selectedLab.incharge || 'Department Head'}</p>
                  </div>
                </div>

                {/* Available Equipment Inventory */}
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2.5 flex items-center gap-1.5">
                    <Wrench className="h-4 w-4 text-amber-500" /> {t('labs.equipment')}
                  </h4>
                  <div className="p-4 bg-amber-50/50 rounded-2xl border border-amber-100 text-slate-800 text-sm leading-relaxed">
                    {selectedLab.equipment || 'High-end desktop PCs, soldering stations, multimeters, oscilloscopes, and testing kits.'}
                  </div>
                </div>

                {/* Facilities List */}
                {Array.isArray(selectedLab.facilities) && selectedLab.facilities.length > 0 && (
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2.5">{t('labs.facilities')}</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedLab.facilities.map((fac: string, i: number) => (
                        <span key={i} className="text-xs font-semibold bg-slate-100 text-slate-700 px-3 py-1.5 rounded-xl">
                          {fac.trim()}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Safety Rules */}
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
                    <Info className="h-4 w-4 text-blue-500" /> {t('labs.rules')}
                  </h4>
                  <p className="text-xs text-slate-600 bg-slate-50 p-3.5 rounded-xl border border-slate-100 leading-relaxed">
                    {selectedLab.rules || 'Valid student ID card required. Follow standard laboratory safety procedures and register component checkouts.'}
                  </p>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="p-4 sm:px-8 bg-slate-50 border-t border-slate-100 flex justify-end">
                <button
                  onClick={() => {
                    const id = selectedLab.id;
                    setSelectedLab(null);
                    setBookingLabId(id);
                  }}
                  className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 px-6 rounded-xl text-sm transition-colors flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 cursor-pointer"
                >
                  <Clock className="h-4 w-4" /> {t('btn.book_slot')}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
