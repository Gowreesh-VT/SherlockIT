'use client';

import { useState, useMemo, useEffect } from 'react';
import { fetchSubmissions, fetchTeams, getAdminKey, setAdminKey } from '@/lib/adminApi';

interface Submission {
  id: string;
  teamId: string;
  teamName: string;
  leaderEmail: string;
  answer: string;
  submittedAt: string;
}

interface Team {
  id: string;
  teamName: string;
}

export default function SubmissionsPage() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showKeyModal, setShowKeyModal] = useState(false);
  const [keyInput, setKeyInput] = useState('');
  
  const [sortBy, setSortBy] = useState<'time' | 'team'>('time');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    
    const [submissionsRes, teamsRes] = await Promise.all([
      fetchSubmissions(),
      fetchTeams()
    ]);
    
    if (submissionsRes.error) {
      if (submissionsRes.error === 'No admin key configured. Please set it in settings.' || 
          submissionsRes.error === 'Invalid admin key') {
        setShowKeyModal(true);
      }
      setError(submissionsRes.error);
      setLoading(false);
      return;
    }
    
    if (submissionsRes.data) {
      setSubmissions(submissionsRes.data.submissions);
    }
    if (teamsRes.data) {
      setTeams(teamsRes.data.teams);
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

  const sortedSubmissions = useMemo(() => {
    return [...submissions].sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case 'time':
          comparison = new Date(a.submittedAt).getTime() - new Date(b.submittedAt).getTime();
          break;
        case 'team':
          comparison = a.teamName.localeCompare(b.teamName);
          break;
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });
  }, [submissions, sortBy, sortOrder]);

  const teamsSubmitted = submissions.length;
  const totalTeams = teams.length;
  const pendingTeams = totalTeams - teamsSubmitted;

  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  const exportToCSV = () => {
    const headers = ['Team Name', 'Email', 'Answer', 'Submitted At'];
    const rows = submissions.map(s => [
      s.teamName,
      s.leaderEmail,
      s.answer,
      new Date(s.submittedAt).toISOString(),
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(',')),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sherlockit-submissions-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getSubmissionRank = (submission: Submission) => {
    const sorted = [...submissions].sort(
      (a, b) => new Date(a.submittedAt).getTime() - new Date(b.submittedAt).getTime()
    );
    return sorted.findIndex(s => s.id === submission.id) + 1;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
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

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-xl font-semibold text-white tracking-tight">Final Submissions</h1>
          <p className="text-slate-500 text-sm mt-0.5">View all final answer submissions from teams</p>
        </div>
        <button
          onClick={exportToCSV}
          disabled={submissions.length === 0}
          className="px-4 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 disabled:bg-slate-800 text-emerald-400 disabled:text-slate-600 rounded-lg text-sm transition-all flex items-center gap-2 disabled:cursor-not-allowed"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Export CSV
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-slate-900/80 rounded-lg p-4 border border-slate-800/80">
          <div className="flex items-center justify-between mb-2">
            <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
            <span className="text-xl font-bold text-white">{totalTeams}</span>
          </div>
          <p className="text-slate-500 text-xs">Total Teams</p>
        </div>
        <div className="bg-slate-900/80 rounded-lg p-4 border border-slate-800/80">
          <div className="flex items-center justify-between mb-2">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span className="text-xl font-bold text-emerald-400">{teamsSubmitted}</span>
          </div>
          <p className="text-slate-500 text-xs">Submitted</p>
        </div>
        <div className="bg-slate-900/80 rounded-lg p-4 border border-slate-800/80">
          <div className="flex items-center justify-between mb-2">
            <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            <span className="text-xl font-bold text-amber-400">{pendingTeams}</span>
          </div>
          <p className="text-slate-500 text-xs">Pending</p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="bg-slate-900/80 rounded-lg p-4 border border-slate-800/80">
        <div className="flex items-center justify-between mb-2">
          <span className="text-slate-500 text-xs">Submission Progress</span>
          <span className="text-white text-sm font-medium">{totalTeams > 0 ? Math.round((teamsSubmitted / totalTeams) * 100) : 0}%</span>
        </div>
        <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-emerald-500 rounded-full transition-all duration-500"
            style={{ width: `${totalTeams > 0 ? (teamsSubmitted / totalTeams) * 100 : 0}%` }}
          />
        </div>
      </div>

      {/* Submissions Table */}
      <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <h2 className="text-base font-semibold text-white">All Submissions</h2>
          <div className="flex items-center gap-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
              className="px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-slate-300 text-sm focus:border-amber-500"
            >
              <option value="time">Sort by Time</option>
              <option value="team">Sort by Team</option>
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

        {submissions.length === 0 ? (
          <div className="text-center py-16 text-slate-500">
            <svg className="w-12 h-12 mx-auto mb-4 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
            <p className="text-base">No submissions yet</p>
            <p className="text-sm mt-1">Final answer submissions will appear here</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-800/50">
                <tr>
                  <th className="text-left text-slate-500 text-xs font-medium p-4 uppercase tracking-wider">#</th>
                  <th className="text-left text-slate-500 text-xs font-medium p-4 uppercase tracking-wider">Team</th>
                  <th className="text-left text-slate-500 text-xs font-medium p-4 uppercase tracking-wider">Email</th>
                  <th className="text-left text-slate-500 text-xs font-medium p-4 uppercase tracking-wider">Answer</th>
                  <th className="text-left text-slate-500 text-xs font-medium p-4 uppercase tracking-wider">Submitted</th>
                  <th className="text-left text-slate-500 text-xs font-medium p-4 uppercase tracking-wider"></th>
                </tr>
              </thead>
              <tbody>
                {sortedSubmissions.map((submission) => {
                  const rank = getSubmissionRank(submission);
                  return (
                    <tr
                      key={submission.id}
                      className="border-t border-slate-800 hover:bg-slate-800/30 transition-colors"
                    >
                      <td className="p-4">
                        <span className={`inline-flex w-7 h-7 items-center justify-center rounded-md text-xs font-bold ${
                          rank === 1
                            ? 'bg-amber-500/20 text-amber-400'
                            : rank === 2
                            ? 'bg-slate-400/20 text-slate-300'
                            : rank === 3
                            ? 'bg-orange-500/20 text-orange-400'
                            : 'bg-slate-800 text-slate-400'
                        }`}>
                          {rank}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-slate-900 text-xs font-bold">
                            {submission.teamName.charAt(0)}
                          </div>
                          <span className="text-slate-200 text-sm font-medium">{submission.teamName}</span>
                        </div>
                      </td>
                      <td className="p-4 text-slate-400 text-sm">{submission.leaderEmail}</td>
                      <td className="p-4 text-slate-300 text-sm max-w-xs truncate">{submission.answer}</td>
                      <td className="p-4 text-slate-500 text-xs">{formatDate(submission.submittedAt)}</td>
                      <td className="p-4">
                        <button
                          onClick={() => setSelectedSubmission(submission)}
                          className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs transition-all"
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pending Teams */}
      {pendingTeams > 0 && (
        <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-800">
            <h2 className="text-base font-semibold text-white">Teams Yet to Submit</h2>
            <p className="text-slate-500 text-sm mt-1">{pendingTeams} teams pending</p>
          </div>
          <div className="p-4 flex flex-wrap gap-2">
            {teams
              .filter(team => !submissions.some(s => s.teamId === team.id))
              .map(team => (
                <span
                  key={team.id}
                  className="px-3 py-1.5 bg-amber-500/10 text-amber-400 rounded-lg text-sm"
                >
                  {team.teamName}
                </span>
              ))}
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {selectedSubmission && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 rounded-xl border border-slate-700 w-full max-w-lg animate-fade-in">
            <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
              <h2 className="text-base font-semibold text-white">Submission Details</h2>
              <button
                onClick={() => setSelectedSubmission(null)}
                className="p-1.5 text-slate-500 hover:text-white hover:bg-slate-800 rounded-lg transition-all"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-4 pb-4 border-b border-slate-800">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-slate-900 text-lg font-bold">
                  {selectedSubmission.teamName.charAt(0)}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">{selectedSubmission.teamName}</h3>
                  <p className="text-slate-500 text-sm">
                    Rank #{getSubmissionRank(selectedSubmission)} • {formatDate(selectedSubmission.submittedAt)}
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="p-4 bg-slate-800/50 rounded-lg">
                  <p className="text-slate-500 text-xs mb-1">Contact Email</p>
                  <p className="text-white font-medium">{selectedSubmission.leaderEmail}</p>
                </div>
                <div className="p-4 bg-slate-800/50 rounded-lg">
                  <p className="text-slate-500 text-xs mb-1">Final Answer</p>
                  <p className="text-white font-medium whitespace-pre-wrap">{selectedSubmission.answer}</p>
                </div>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => setSelectedSubmission(null)}
                className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-900 font-medium rounded-lg transition-all"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
