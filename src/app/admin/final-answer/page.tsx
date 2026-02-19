'use client';

import { useState, useEffect } from 'react';
import { fetchFinalAnswerStatus, toggleFinalAnswer, fetchSubmissions, fetchTeams, getAdminKey, setAdminKey } from '@/lib/adminApi';

export default function FinalAnswerPage() {
  const [isOpen, setIsOpen] = useState(false);
  const [autoOpenTime, setAutoOpenTime] = useState<string>('');
  const [isAutoEnabled, setIsAutoEnabled] = useState(false);
  const [countdown, setCountdown] = useState<string | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState<'open' | 'close' | null>(null);
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showKeyModal, setShowKeyModal] = useState(false);
  const [keyInput, setKeyInput] = useState('');
  
  const [teamsSubmitted, setTeamsSubmitted] = useState(0);
  const [totalTeams, setTotalTeams] = useState(0);
  const pendingTeams = totalTeams - teamsSubmitted;

  const loadData = async () => {
    setLoading(true);
    setError(null);
    
    const [statusRes, submissionsRes, teamsRes] = await Promise.all([
      fetchFinalAnswerStatus(),
      fetchSubmissions(),
      fetchTeams()
    ]);
    
    if (statusRes.error) {
      if (statusRes.error === 'No admin key configured. Please set it in settings.' || 
          statusRes.error === 'Invalid admin key') {
        setShowKeyModal(true);
      }
      setError(statusRes.error);
      setLoading(false);
      return;
    }
    
    if (statusRes.data) {
      setIsOpen(statusRes.data.finalAnswerOpen);
    }
    if (submissionsRes.data) {
      setTeamsSubmitted(submissionsRes.data.totalSubmissions);
    }
    if (teamsRes.data) {
      setTotalTeams(teamsRes.data.teams.length);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (!getAdminKey()) {
      setShowKeyModal(true);
      setLoading(false);
      return;
    }
    loadData();
  }, []);

  const handleSaveKey = () => {
    if (keyInput.trim()) {
      setAdminKey(keyInput.trim());
      setShowKeyModal(false);
      setKeyInput('');
      loadData();
    }
  };

  useEffect(() => {
    if (isAutoEnabled && autoOpenTime) {
      const interval = setInterval(async () => {
        const now = new Date();
        const target = new Date(autoOpenTime);
        const diff = target.getTime() - now.getTime();

        if (diff <= 0) {
          // Auto-open submissions via API
          const result = await toggleFinalAnswer('open');
          if (result.data) {
            setIsOpen(true);
          }
          setCountdown(null);
          setIsAutoEnabled(false);
          clearInterval(interval);
        } else {
          const hours = Math.floor(diff / (1000 * 60 * 60));
          const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
          const seconds = Math.floor((diff % (1000 * 60)) / 1000);
          setCountdown(`${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
        }
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [isAutoEnabled, autoOpenTime]);

  const handleToggle = () => {
    if (isOpen) {
      setShowConfirmModal('close');
    } else {
      setShowConfirmModal('open');
    }
  };

  const confirmToggle = async () => {
    setSaving(true);
    const action = isOpen ? 'close' : 'open';
    const result = await toggleFinalAnswer(action);
    
    if (result.error) {
      setError(result.error);
    } else {
      setIsOpen(!isOpen);
    }
    
    setSaving(false);
    setShowConfirmModal(null);
  };

  const setAutoOpen30Min = () => {
    const future = new Date(Date.now() + 30 * 60 * 1000);
    setAutoOpenTime(future.toISOString().slice(0, 16));
    setIsAutoEnabled(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Admin Key Modal */}
      {showKeyModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 rounded-xl border border-slate-700 w-full max-w-md p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Enter Admin Key</h2>
            <input
              type="password"
              value={keyInput}
              onChange={(e) => setKeyInput(e.target.value)}
              placeholder="Admin API Key"
              className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white focus:border-amber-500 mb-4"
            />
            <button
              onClick={handleSaveKey}
              className="w-full px-4 py-3 bg-amber-500 hover:bg-amber-400 text-slate-900 rounded-lg font-semibold transition-all"
            >
              Save Key
            </button>
          </div>
        </div>
      )}

      {/* Error Toast */}
      {error && !showKeyModal && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 flex items-center gap-3">
          <svg className="w-5 h-5 text-red-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="text-red-400 text-sm">{error}</span>
          <button onClick={loadData} className="ml-auto px-3 py-1 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded text-sm">
            Retry
          </button>
        </div>
      )}

      {/* Saving Overlay */}
      {saving && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-40">
          <div className="bg-slate-900 rounded-lg p-4 flex items-center gap-3">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-amber-500"></div>
            <span className="text-white">Updating...</span>
          </div>
        </div>
      )}

      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-white">Final Answer Control</h1>
        <p className="text-slate-400 mt-1">Manage when teams can submit their final mystery solution</p>
      </div>

      {/* Main Status Card */}
      <div className={`bg-slate-900 rounded-xl p-8 border-2 transition-all ${
        isOpen
          ? 'border-emerald-500/50'
          : 'border-red-500/30'
      }`}>
        <div className="flex items-center justify-between flex-wrap gap-6">
          <div className="flex items-center gap-5">
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${
              isOpen
                ? 'bg-emerald-500/20'
                : 'bg-red-500/10'
            }`}>
              {isOpen ? (
                <svg className="w-8 h-8 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
                </svg>
              ) : (
                <svg className="w-8 h-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              )}
            </div>
            <div>
              <h2 className="text-xl font-semibold text-white">
                Final Submissions {isOpen ? 'Open' : 'Closed'}
              </h2>
              <p className={`mt-1 text-sm ${isOpen ? 'text-emerald-400' : 'text-slate-500'}`}>
                {isOpen
                  ? 'Teams can now submit their final answers'
                  : 'Teams cannot submit final answers yet'
                }
              </p>
            </div>
          </div>
          <button
            onClick={handleToggle}
            className={`px-6 py-3 rounded-lg font-semibold transition-all flex items-center gap-2 ${
              isOpen
                ? 'bg-red-500 hover:bg-red-400 text-white'
                : 'bg-emerald-500 hover:bg-emerald-400 text-slate-900'
            }`}
          >
            {isOpen ? (
              <>
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                Close Submissions
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
                </svg>
                Open Submissions
              </>
            )}
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-900 rounded-xl p-5 border border-slate-800">
          <div className="flex items-center justify-between mb-3">
            <div className="w-2 h-2 rounded-full bg-blue-500" />
            <span className="text-2xl font-bold text-white">{totalTeams}</span>
          </div>
          <p className="text-slate-400 text-sm">Total Teams</p>
        </div>
        <div className="bg-slate-900 rounded-xl p-5 border border-slate-800">
          <div className="flex items-center justify-between mb-3">
            <div className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="text-2xl font-bold text-emerald-400">{teamsSubmitted}</span>
          </div>
          <p className="text-slate-400 text-sm">Submitted</p>
        </div>
        <div className="bg-slate-900 rounded-xl p-5 border border-slate-800">
          <div className="flex items-center justify-between mb-3">
            <div className="w-2 h-2 rounded-full bg-amber-500" />
            <span className="text-2xl font-bold text-amber-400">{pendingTeams}</span>
          </div>
          <p className="text-slate-400 text-sm">Pending</p>
        </div>
      </div>

      {/* Auto-Open Timer */}
      <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-800">
          <h2 className="text-base font-semibold text-white">Auto-Open Timer</h2>
          <p className="text-slate-500 text-sm mt-1">Schedule submissions to open automatically</p>
        </div>
        <div className="p-6">
          {countdown && (
            <div className="mb-6 p-4 bg-amber-500/10 rounded-lg border border-amber-500/20">
              <p className="text-slate-400 text-sm mb-2">Opening in:</p>
              <p className="text-3xl font-mono font-bold text-amber-400">
                {countdown}
              </p>
            </div>
          )}

          <div className="flex flex-wrap items-end gap-4">
            <div>
              <label className="block text-slate-400 text-sm mb-2">Open At</label>
              <input
                type="datetime-local"
                value={autoOpenTime}
                onChange={(e) => setAutoOpenTime(e.target.value)}
                className="px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white focus:border-amber-500"
              />
            </div>
            <button
              onClick={() => setIsAutoEnabled(true)}
              disabled={!autoOpenTime || isOpen}
              className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 disabled:bg-slate-800 disabled:text-slate-600 text-slate-300 rounded-lg transition-all disabled:cursor-not-allowed"
            >
              Set Timer
            </button>
            <button
              onClick={setAutoOpen30Min}
              disabled={isOpen}
              className="px-5 py-2.5 bg-amber-500/10 hover:bg-amber-500/20 disabled:bg-slate-800 text-amber-400 disabled:text-slate-600 rounded-lg transition-all disabled:cursor-not-allowed"
            >
              Open in 30 Minutes
            </button>
            {isAutoEnabled && (
              <button
                onClick={() => {
                  setIsAutoEnabled(false);
                  setCountdown(null);
                }}
                className="px-5 py-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg transition-all"
              >
                Cancel Timer
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Required Fields Info */}
      <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-800">
          <h2 className="text-base font-semibold text-white">Submission Fields</h2>
          <p className="text-slate-500 text-sm mt-1">Teams will need to provide these answers</p>
        </div>
        <div className="p-4 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-slate-800/50 rounded-lg">
            <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center mb-3">
              <svg className="w-5 h-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-sm font-semibold text-white mb-1">Real World</h3>
            <p className="text-slate-500 text-xs">The location where the crime took place</p>
          </div>
          <div className="p-4 bg-slate-800/50 rounded-lg">
            <div className="w-10 h-10 rounded-lg bg-rose-500/10 flex items-center justify-center mb-3">
              <svg className="w-5 h-5 text-rose-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <h3 className="text-sm font-semibold text-white mb-1">Villain</h3>
            <p className="text-slate-500 text-xs">The person responsible for the mystery</p>
          </div>
          <div className="p-4 bg-slate-800/50 rounded-lg">
            <div className="w-10 h-10 rounded-lg bg-violet-500/10 flex items-center justify-center mb-3">
              <svg className="w-5 h-5 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
              </svg>
            </div>
            <h3 className="text-sm font-semibold text-white mb-1">Weapon</h3>
            <p className="text-slate-500 text-xs">The tool or method used in the crime</p>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 rounded-xl border border-slate-700 w-full max-w-md animate-fade-in">
            <div className="p-6">
              <div className="text-center">
                <div className={`w-14 h-14 mx-auto rounded-2xl flex items-center justify-center mb-4 ${
                  showConfirmModal === 'open'
                    ? 'bg-emerald-500/20'
                    : 'bg-red-500/10'
                }`}>
                  {showConfirmModal === 'open' ? (
                    <svg className="w-7 h-7 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
                    </svg>
                  ) : (
                    <svg className="w-7 h-7 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  )}
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">
                  {showConfirmModal === 'open'
                    ? 'Open Final Submissions?'
                    : 'Close Final Submissions?'
                  }
                </h3>
                <p className="text-slate-400 text-sm">
                  {showConfirmModal === 'open'
                    ? 'All teams will be able to submit their final answer. This action can be reversed.'
                    : 'Teams will no longer be able to submit. Existing submissions are preserved.'
                  }
                </p>
              </div>
            </div>
            <div className="p-4 border-t border-slate-800 flex justify-center gap-3">
              <button
                onClick={() => setShowConfirmModal(null)}
                className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-all"
              >
                Cancel
              </button>
              <button
                onClick={confirmToggle}
                className={`px-5 py-2 font-medium rounded-lg transition-all ${
                  showConfirmModal === 'open'
                    ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-900'
                    : 'bg-red-500 hover:bg-red-400 text-white'
                }`}
              >
                {showConfirmModal === 'open' ? 'Yes, Open' : 'Yes, Close'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
