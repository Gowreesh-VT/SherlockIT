'use client';

import { useState, useEffect, useMemo } from 'react';
import { fetchProgress, getAdminKey } from '@/lib/adminApi';

interface TeamProgress {
  id: string;
  teamName: string;
  completedCount: number;
  totalWorlds: number;
  progressPercent: number;
  finalSubmitted: boolean;
  lastActive: string;
}

interface ProgressSummary {
  totalTeams: number;
  teamsCompleted100: number;
  teamsOver50: number;
  teamsStarted: number;
  averageProgress: number;
}

export default function ProgressPage() {
  const [teams, setTeams] = useState<TeamProgress[]>([]);
  const [summary, setSummary] = useState<ProgressSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTeam, setSelectedTeam] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'name' | 'progress' | 'active'>('progress');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  useEffect(() => {
    async function loadProgress() {
      if (!getAdminKey()) {
        setError('Admin key not configured');
        setLoading(false);
        return;
      }

      const res = await fetchProgress();
      if (res.error) {
        setError(res.error);
      } else if (res.data) {
        setTeams(res.data.teams);
        setSummary(res.data.summary);
      }
      setLoading(false);
    }
    loadProgress();
  }, []);

  const sortedTeams = useMemo(() => {
    return [...teams].sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case 'name':
          comparison = a.teamName.localeCompare(b.teamName);
          break;
        case 'progress':
          comparison = a.progressPercent - b.progressPercent;
          break;
        case 'active':
          comparison = new Date(a.lastActive).getTime() - new Date(b.lastActive).getTime();
          break;
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });
  }, [teams, sortBy, sortOrder]);

  const getTimeSince = (date: string) => {
    const now = new Date();
    const diff = now.getTime() - new Date(date).getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center gap-3 text-slate-400">
          <svg className="w-6 h-6 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <span>Loading progress...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Error Toast */}
      {error && (
        <div className="fixed bottom-6 right-6 bg-red-500/90 text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-3 z-50">
          <span className="text-sm">{error}</span>
          <button onClick={() => setError(null)} className="text-white/70 hover:text-white">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-white">Progress Tracking</h1>
        <p className="text-slate-400 mt-1">Monitor team progress and performance in real-time</p>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-slate-900 rounded-xl p-5 border border-slate-800">
          <div className="flex items-center justify-between mb-3">
            <div className="w-2 h-2 rounded-full bg-blue-500" />
            <span className="text-2xl font-bold text-white">{summary?.totalTeams || 0}</span>
          </div>
          <p className="text-slate-400 text-sm">Total Teams</p>
        </div>
        <div className="bg-slate-900 rounded-xl p-5 border border-slate-800">
          <div className="flex items-center justify-between mb-3">
            <div className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="text-2xl font-bold text-emerald-400">{summary?.teamsCompleted100 || 0}</span>
          </div>
          <p className="text-slate-400 text-sm">Completed All</p>
        </div>
        <div className="bg-slate-900 rounded-xl p-5 border border-slate-800">
          <div className="flex items-center justify-between mb-3">
            <div className="w-2 h-2 rounded-full bg-violet-500" />
            <span className="text-2xl font-bold text-violet-400">{summary?.teamsStarted || 0}</span>
          </div>
          <p className="text-slate-400 text-sm">Teams Started</p>
        </div>
        <div className="bg-slate-900 rounded-xl p-5 border border-slate-800">
          <div className="flex items-center justify-between mb-3">
            <div className="w-2 h-2 rounded-full bg-amber-500" />
            <span className="text-2xl font-bold text-amber-400">{summary?.averageProgress || 0}%</span>
          </div>
          <p className="text-slate-400 text-sm">Avg Progress</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Teams List */}
        <div className="lg:col-span-2 bg-slate-900 rounded-xl border border-slate-800 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
            <h2 className="text-base font-semibold text-white">All Teams</h2>
            <div className="flex items-center gap-2">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                className="px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-slate-300 text-sm focus:border-amber-500"
              >
                <option value="progress">Sort by Progress</option>
                <option value="name">Sort by Name</option>
                <option value="active">Sort by Last Active</option>
              </select>
              <button
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                className="p-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-300 hover:bg-slate-700 transition-all"
              >
                {sortOrder === 'asc' ? (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                )}
              </button>
            </div>
          </div>
          <div className="divide-y divide-slate-800">
            {sortedTeams.map((team) => (
              <div
                key={team.id}
                onClick={() => setSelectedTeam(team.id === selectedTeam ? null : team.id)}
                className={`px-6 py-4 cursor-pointer transition-all ${
                  selectedTeam === team.id
                    ? 'bg-amber-500/5 border-l-2 border-amber-500'
                    : 'hover:bg-slate-800/50'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-slate-900 font-bold text-sm shrink-0">
                      {team.teamName.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="text-slate-200 font-medium text-sm truncate">{team.teamName}</h3>
                        {team.finalSubmitted && (
                          <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 text-xs rounded font-medium">
                            Done
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 mt-2">
                        <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden max-w-[200px]">
                          <div
                            className="h-full bg-amber-500 rounded-full transition-all"
                            style={{ width: `${team.progressPercent}%` }}
                          />
                        </div>
                        <span className="text-slate-500 text-xs">
                          {team.completedCount}/{team.totalWorlds}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-slate-500 text-xs">{getTimeSince(team.lastActive)}</p>
                    </div>
                  </div>
                </div>
            ))}
          </div>
        </div>

        {/* Team Details */}
        <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-800">
            <h2 className="text-base font-semibold text-white">Team Details</h2>
          </div>
          <div className="p-4">
            {selectedTeam ? (
              <>
                {(() => {
                  const team = teams.find(t => t.id === selectedTeam);
                  if (!team) return null;
                  return (
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-slate-900 text-lg font-bold">
                          {team.teamName.charAt(0)}
                        </div>
                        <div>
                          <h3 className="text-base font-semibold text-white">{team.teamName}</h3>
                          <p className="text-slate-500 text-sm">Active {getTimeSince(team.lastActive)}</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="p-3 bg-slate-800/50 rounded-lg">
                          <p className="text-slate-500 text-xs mb-1">Worlds</p>
                          <p className="text-lg font-bold text-white">{team.completedCount}/{team.totalWorlds}</p>
                        </div>
                        <div className="p-3 bg-slate-800/50 rounded-lg">
                          <p className="text-slate-500 text-xs mb-1">Final</p>
                          <p className="text-lg font-bold text-white">{team.finalSubmitted ? 'Yes' : 'No'}</p>
                        </div>
                      </div>

                      <div className="p-3 bg-slate-800/50 rounded-lg">
                        <p className="text-slate-500 text-xs mb-1">Progress</p>
                        <div className="flex items-center gap-3 mt-2">
                          <div className="flex-1 h-2 bg-slate-700 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-amber-500 rounded-full transition-all"
                              style={{ width: `${team.progressPercent}%` }}
                            />
                          </div>
                          <span className="text-white font-bold">{team.progressPercent}%</span>
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </>
            ) : (
              <div className="text-center py-12 text-slate-500">
                <svg className="w-12 h-12 mx-auto mb-4 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                <p className="text-sm">Select a team to view details</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
