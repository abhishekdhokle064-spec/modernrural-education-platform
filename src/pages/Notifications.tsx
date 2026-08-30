import React, { useState, useEffect } from 'react';
import { Bell, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

export default function Notifications() {
  const { token, isAuthenticated } = useAuth();
  const [notifications, setNotifications] = useState<any[]>([]);

  useEffect(() => {
    if (isAuthenticated && token) {
      fetch('http://localhost:3001/api/notifications', {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setNotifications(data);
      })
      .catch(console.error);
    }
  }, [isAuthenticated, token]);

  if (!isAuthenticated) return <div className="p-20 text-center">Please log in.</div>;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto py-12 px-4 sm:px-6"
    >
      <div className="flex items-center gap-4 mb-8 bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
        <div className="bg-blue-100 text-blue-600 p-3 rounded-2xl">
          <Bell className="h-8 w-8" />
        </div>
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900">Notifications</h1>
          <p className="text-slate-500">Stay updated on your applications and courses.</p>
        </div>
      </div>

      <div className="space-y-4">
        {notifications.length === 0 ? (
          <p className="text-slate-500 text-center py-10 bg-white rounded-3xl border border-slate-100">No notifications yet.</p>
        ) : (
          notifications.map(n => (
            <div key={n.id} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-start gap-4 hover:shadow-md transition-shadow">
              <div className="bg-emerald-100 text-emerald-600 p-2 rounded-full mt-1">
                <CheckCircle className="h-5 w-5" />
              </div>
              <div>
                <p className="text-slate-900 font-medium">{n.message}</p>
                <p className="text-xs text-slate-400 mt-1">{new Date(n.created_at).toLocaleString()}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </motion.div>
  );
}
