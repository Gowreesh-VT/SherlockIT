'use client';

import { useState, useEffect } from 'react';
import { sendAnnouncement, getAdminKey, adminFetch } from '@/lib/adminApi';

interface Announcement {
  _id: string;
  message: string;
  createdAt: string;
}

export default function AnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<number | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch existing announcements
  useEffect(() => {
    async function loadAnnouncements() {
      if (!getAdminKey()) {
        setLoading(false);
        return;
      }
      const res = await adminFetch<{ announcements: Announcement[] }>('/api/announcements');
      if (res.data) {
        setAnnouncements(res.data.announcements || []);
      }
      setLoading(false);
    }
    loadAnnouncements();
  }, []);

  const templates = [
    { icon: 'unlock', label: 'World Unlocked', text: 'Congratulations! A new world has been unlocked!' },
    { icon: 'clock', label: 'Time Warning', text: 'Only 30 minutes remaining! Final answer submission is now open.' },
    { icon: 'hint', label: 'Give Hint', text: 'Hint: Pay attention to the details in the storyline.' },
    { icon: 'end', label: 'Event Ended', text: 'The event has ended! Thank you all for participating!' },
    { icon: 'start', label: 'Game Start', text: 'The game has begun! Good luck to all teams!' },
    { icon: 'break', label: 'Break Time', text: 'Taking a 10-minute break. The game will resume shortly.' },
  ];

  const handleSend = async () => {
    if (selectedTemplate === null) return;
    
    setIsSending(true);
    setError(null);

    const res = await sendAnnouncement(templates[selectedTemplate].text);
    
    if (res.error) {
      setError(res.error);
      setIsSending(false);
      return;
    }

    const newAnnouncement: Announcement = {
      _id: `a${Date.now()}`,
      message: templates[selectedTemplate].text,
      createdAt: new Date().toISOString(),
    };

    setAnnouncements([newAnnouncement, ...announcements]);
    setIsSending(false);
    setSelectedTemplate(null);
    setShowSuccess(true);

    setTimeout(() => setShowSuccess(false), 3000);
  };

  const handleDelete = (id: string) => {
    setAnnouncements(announcements.filter(a => a._id !== id));
  };

  const formatDate = (date: string) => {      
    return new Date(date).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getIcon = (icon: string) => {
    switch (icon) {
      case 'unlock':
        return <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />;
      case 'clock':
        return <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />;
      case 'hint':
        return <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />;
      case 'end':
        return <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" />;
      case 'start':
        return <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />;
      case 'break':
        return <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />;
      default:
        return <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />;
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-white tracking-tight">Announcements</h1>
        <p className="text-slate-400 mt-1">Send quick messages to all teams</p>
      </div>

      {/* Success Toast */}
      {showSuccess && (
        <div className="fixed top-6 right-6 bg-emerald-500 text-white px-5 py-3 rounded-lg shadow-lg flex items-center gap-3 animate-slide-in z-50">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <span className="font-medium">Announcement sent!</span>
        </div>
      )}

      {/* Quick Templates */}
      <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-800">
          <h2 className="text-base font-semibold text-white">Select Announcement</h2>
          <p className="text-slate-500 text-sm mt-1">Choose a template to send</p>
        </div>
        <div className="p-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {templates.map((template, index) => (
            <button
              key={index}
              onClick={() => setSelectedTemplate(index)}
              disabled={isSending}
              className={`flex flex-col p-4 rounded-xl transition-all text-left group border ${
                selectedTemplate === index
                  ? 'bg-amber-500/10 border-amber-500/50'
                  : 'bg-slate-800/50 hover:bg-slate-800 border-transparent hover:border-slate-700'
              } disabled:opacity-50`}
            >
              <div className="flex items-center gap-3 mb-2">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                  selectedTemplate === index ? 'bg-amber-500/20' : 'bg-amber-500/10 group-hover:bg-amber-500/20'
                }`}>
                  <svg className="w-5 h-5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    {getIcon(template.icon)}
                  </svg>
                </div>
                <span className="text-white font-medium text-sm">{template.label}</span>
                {selectedTemplate === index && (
                  <svg className="w-4 h-4 text-amber-500 ml-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>
              <p className="text-slate-500 text-sm leading-relaxed">{template.text}</p>
            </button>
          ))}
        </div>
        
        {/* Send Button */}
        <div className="px-6 py-4 border-t border-slate-800 flex items-center justify-between">
          <div className="text-sm">
            {selectedTemplate !== null ? (
              <span className="text-slate-400">
                Selected: <span className="text-amber-400 font-medium">{templates[selectedTemplate].label}</span>
              </span>
            ) : (
              <span className="text-slate-500">No template selected</span>
            )}
          </div>
          <button
            onClick={handleSend}
            disabled={selectedTemplate === null || isSending}
            className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 disabled:bg-slate-700 disabled:text-slate-500 text-slate-900 font-semibold rounded-lg transition-all disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isSending ? (
              <>
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Sending...
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
                Send to All Teams
              </>
            )}
          </button>
        </div>
      </div>

      {/* Announcements List */}
      <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <h2 className="text-base font-semibold text-white">Previous Announcements</h2>
          <span className="text-slate-500 text-sm">{announcements.length} total</span>
        </div>

        {announcements.length === 0 ? (
          <div className="text-center py-16 text-slate-500">
            <svg className="w-12 h-12 mx-auto mb-4 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
            <p>No announcements yet</p>
            <p className="text-sm mt-1">Send your first one above!</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-800">
            {announcements.map((announcement) => (
              <div
                key={announcement._id}
                className="group px-6 py-4 flex items-start gap-4 hover:bg-slate-800/30 transition-colors"
              >
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shrink-0">
                  <svg className="w-5 h-5 text-slate-900" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-slate-200">{announcement.message}</p>
                  <p className="text-slate-500 text-sm mt-1">{formatDate(announcement.createdAt)}</p>
                </div>
                <button
                  onClick={() => handleDelete(announcement._id)}
                  className="opacity-0 group-hover:opacity-100 p-2 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                  title="Delete announcement"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
