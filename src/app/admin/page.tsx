'use client';

import { useState, useEffect } from 'react';
import { mockTeams, mockWorlds, mockAnnouncements, mockFinalSubmissions } from '@/data/mockData';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalTeams: 0,
    activeTeams: 0,
    totalWorlds: 0,
    unlockedWorlds: 0,
    totalAnnouncements: 0,
    finalSubmissions: 0,
  });

  useEffect(() => {
    setStats({
      totalTeams: mockTeams.length,
      activeTeams: mockTeams.filter(t => t.completedWorlds.length > 0).length,
      totalWorlds: mockWorlds.length,
      unlockedWorlds: mockWorlds.filter(w => !w.isLocked).length,
      totalAnnouncements: mockAnnouncements.length,
      finalSubmissions: mockFinalSubmissions.length,
    });
  }, []);

  const statCards = [
    { label: 'Total Teams', value: stats.totalTeams, color: 'bg-blue-500' },
    { label: 'Active Teams', value: stats.activeTeams, color: 'bg-emerald-500' },
    { label: 'Worlds Unlocked', value: `${stats.unlockedWorlds}/${stats.totalWorlds}`, color: 'bg-amber-500' },
    { label: 'Announcements', value: stats.totalAnnouncements, color: 'bg-violet-500' },
    { label: 'Final Submissions', value: stats.finalSubmissions, color: 'bg-rose-500' },
  ];

  const recentActivity = [
    { team: 'The Sleuths', action: 'Submitted final answer', time: '5 min ago', type: 'success' },
    { team: 'Mystery Solvers', action: 'Completed World 3', time: '15 min ago', type: 'complete' },
    { team: 'The Detectives', action: 'Completed World 2', time: '30 min ago', type: 'complete' },
    { team: 'Enigma Squad', action: 'Started World 4', time: '45 min ago', type: 'start' },
    { team: 'Code Breakers', action: 'Logged in', time: '1 hour ago', type: 'login' },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-white tracking-tight">Dashboard</h1>
        <p className="text-slate-400 mt-1">Overview of the SherlockIT 2.0 event</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {statCards.map((stat, index) => (
          <div
            key={index}
            className="bg-slate-900 rounded-xl p-5 border border-slate-800 hover:border-slate-700 transition-colors"
          >
            <div className="flex items-center justify-between mb-3">
              <div className={`w-2 h-2 rounded-full ${stat.color}`} />
              <span className="text-2xl font-bold text-white">
                {stat.value}
              </span>
            </div>
            <p className="text-slate-400 text-sm">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Quick Actions & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quick Actions */}
        <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-800">
            <h2 className="text-base font-semibold text-white">Quick Actions</h2>
          </div>
          <div className="p-4 grid grid-cols-2 gap-3">
            <button className="flex items-center gap-3 p-4 bg-slate-800/50 hover:bg-slate-800 rounded-lg transition-all group">
              <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center group-hover:bg-amber-500/20 transition-colors">
                <svg className="w-4 h-4 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
                </svg>
              </div>
              <span className="text-slate-300 text-sm font-medium">Send Announcement</span>
            </button>
            <button className="flex items-center gap-3 p-4 bg-slate-800/50 hover:bg-slate-800 rounded-lg transition-all group">
              <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center group-hover:bg-emerald-500/20 transition-colors">
                <svg className="w-5 h-5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
                </svg>
              </div>
              <span className="text-slate-300 text-sm font-medium">Unlock World</span>
            </button>
            <button className="flex items-center gap-3 p-4 bg-slate-800/50 hover:bg-slate-800 rounded-lg transition-all group">
              <div className="w-10 h-10 rounded-lg bg-rose-500/10 flex items-center justify-center group-hover:bg-rose-500/20 transition-colors">
                <svg className="w-5 h-5 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" />
                </svg>
              </div>
              <span className="text-slate-300 text-sm font-medium">Open Final Answer</span>
            </button>
            <button className="flex items-center gap-3 p-4 bg-slate-800/50 hover:bg-slate-800 rounded-lg transition-all group">
              <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center group-hover:bg-blue-500/20 transition-colors">
                <svg className="w-5 h-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <span className="text-slate-300 text-sm font-medium">Export Data</span>
            </button>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-800">
            <h2 className="text-base font-semibold text-white">Recent Activity</h2>
          </div>
          <div className="divide-y divide-slate-800">
            {recentActivity.map((activity, index) => (
              <div
                key={index}
                className="px-6 py-4 flex items-center gap-4 hover:bg-slate-800/30 transition-colors"
              >
                <div className={`w-2 h-2 rounded-full ${
                  activity.type === 'success' ? 'bg-emerald-500' :
                  activity.type === 'complete' ? 'bg-amber-500' :
                  activity.type === 'start' ? 'bg-blue-500' : 'bg-slate-500'
                }`} />
                <div className="flex-1 min-w-0">
                  <p className="text-slate-200 text-sm font-medium truncate">{activity.team}</p>
                  <p className="text-slate-500 text-sm truncate">{activity.action}</p>
                </div>
                <span className="text-slate-500 text-xs whitespace-nowrap">{activity.time}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Team Progress Overview */}
      <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-800">
          <h2 className="text-base font-semibold text-white">Team Progress</h2>
        </div>
        <div className="p-5 space-y-4">
          {mockTeams.slice(0, 5).map((team) => {
            const progress = (team.completedWorlds.length / mockWorlds.length) * 100;
            return (
              <div key={team.id} className="flex items-center gap-4">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-slate-900 text-xs font-bold shrink-0">
                  {team.teamName.charAt(0)}
                </div>
                <div className="w-32 text-slate-200 text-sm font-medium truncate">{team.teamName}</div>
                <div className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-amber-500 rounded-full transition-all duration-500"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <div className="w-14 text-right">
                  <span className="text-slate-400 text-sm">{team.completedWorlds.length}/{mockWorlds.length}</span>
                </div>
                <div className="w-20">
                  {team.finalSubmitted ? (
                    <span className="px-2.5 py-1 bg-emerald-500/10 text-emerald-400 text-xs rounded-full font-medium">Done</span>
                  ) : (
                    <span className="px-2.5 py-1 bg-slate-800 text-slate-500 text-xs rounded-full font-medium">Pending</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
