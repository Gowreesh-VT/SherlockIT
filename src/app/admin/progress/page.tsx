'use client';

import { useState, useMemo } from 'react';
import { mockTeams, mockWorlds, mockProgress } from '@/data/mockData';

export default function ProgressPage() {
  const [selectedTeam, setSelectedTeam] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'name' | 'progress' | 'active'>('progress');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const sortedTeams = useMemo(() => {
    return [...mockTeams].sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case 'name':
          comparison = a.teamName.localeCompare(b.teamName);
          break;
        case 'progress':
          comparison = a.completedWorlds.length - b.completedWorlds.length;
          break;
        case 'active':
          comparison = new Date(a.lastActive).getTime() - new Date(b.lastActive).getTime();
          break;
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });
  }, [sortBy, sortOrder]);

  const teamProgress = useMemo(() => {
    if (!selectedTeam) return [];
    return mockProgress.filter(p => p.teamId === selectedTeam);
  }, [selectedTeam]);

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getProgressPercentage = (completedWorlds: string[]) => {
    return (completedWorlds.length / mockWorlds.length) * 100;
  };

  const getTimeSince = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - new Date(date).getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  const totalAttempts = mockProgress.reduce((sum, p) => sum + p.attempts, 0);
  const avgAttemptsPerWorld = mockProgress.length > 0
    ? (totalAttempts / mockProgress.length).toFixed(1)
    : '0';
  const teamsCompletedAll = mockTeams.filter(t => t.completedWorlds.length === mockWorlds.length).length;

  return (
    <div className="space-y-8 animate-fade-in">
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
            <span className="text-2xl font-bold text-white">{mockTeams.length}</span>
          </div>
          <p className="text-slate-400 text-sm">Total Teams</p>
        </div>
        <div className="bg-slate-900 rounded-xl p-5 border border-slate-800">
          <div className="flex items-center justify-between mb-3">
            <div className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="text-2xl font-bold text-emerald-400">{teamsCompletedAll}</span>
          </div>
          <p className="text-slate-400 text-sm">Completed All</p>
        </div>
        <div className="bg-slate-900 rounded-xl p-5 border border-slate-800">
          <div className="flex items-center justify-between mb-3">
            <div className="w-2 h-2 rounded-full bg-violet-500" />
            <span className="text-2xl font-bold text-violet-400">{totalAttempts}</span>
          </div>
          <p className="text-slate-400 text-sm">Total Attempts</p>
        </div>
        <div className="bg-slate-900 rounded-xl p-5 border border-slate-800">
          <div className="flex items-center justify-between mb-3">
            <div className="w-2 h-2 rounded-full bg-amber-500" />
            <span className="text-2xl font-bold text-amber-400">{avgAttemptsPerWorld}</span>
          </div>
          <p className="text-slate-400 text-sm">Avg Attempts/World</p>
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
            {sortedTeams.map((team) => {
              const progress = getProgressPercentage(team.completedWorlds);
              return (
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
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                        <span className="text-slate-500 text-xs">
                          {team.completedWorlds.length}/{mockWorlds.length}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-slate-500 text-xs">{getTimeSince(team.lastActive)}</p>
                    </div>
                  </div>
                </div>
              );
            })}
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
                  const team = mockTeams.find(t => t.id === selectedTeam);
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
                          <p className="text-lg font-bold text-white">{team.completedWorlds.length}/{mockWorlds.length}</p>
                        </div>
                        <div className="p-3 bg-slate-800/50 rounded-lg">
                          <p className="text-slate-500 text-xs mb-1">Final</p>
                          <p className="text-lg font-bold text-white">{team.finalSubmitted ? 'Yes' : 'No'}</p>
                        </div>
                      </div>

                      <div>
                        <h4 className="text-slate-300 text-sm font-medium mb-3">Attempt History</h4>
                        <div className="space-y-2 max-h-64 overflow-y-auto">
                          {teamProgress.length > 0 ? (
                            teamProgress.map((progress, index) => (
                              <div
                                key={index}
                                className="p-3 bg-slate-800/50 rounded-lg"
                              >
                                <div className="flex items-center justify-between">
                                  <span className="text-slate-200 text-sm">{progress.worldTitle}</span>
                                  <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                  </svg>
                                </div>
                                <div className="flex items-center justify-between mt-1">
                                  <span className="text-slate-500 text-xs">{progress.attempts} attempts</span>
                                  <span className="text-slate-500 text-xs">
                                    {progress.completedAt && formatDate(progress.completedAt)}
                                  </span>
                                </div>
                              </div>
                            ))
                          ) : (
                            <p className="text-slate-500 text-sm text-center py-4">No attempts recorded</p>
                          )}
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

      {/* World Completion Heatmap */}
      <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-800">
          <h2 className="text-base font-semibold text-white">World Completion Matrix</h2>
        </div>
        <div className="p-6 overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr>
                <th className="text-left text-slate-500 text-sm font-medium p-2">Team</th>
                {mockWorlds.map((world) => (
                  <th key={world.id} className="text-center text-slate-500 text-sm font-medium p-2">
                    W{world.order}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {mockTeams.map((team) => (
                <tr key={team.id} className="border-t border-slate-800">
                  <td className="p-2 text-slate-300 text-sm font-medium">{team.teamName}</td>
                  {mockWorlds.map((world) => {
                    const isCompleted = team.completedWorlds.includes(world.id);
                    return (
                      <td key={world.id} className="p-2 text-center">
                        <span className={`inline-flex w-7 h-7 items-center justify-center rounded-md text-sm ${
                          isCompleted
                            ? 'bg-emerald-500/20 text-emerald-400'
                            : 'bg-slate-800 text-slate-600'
                        }`}>
                          {isCompleted ? (
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          ) : '—'}
                        </span>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
