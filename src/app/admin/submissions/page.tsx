'use client';

import { useState, useMemo, useEffect } from 'react';
import { fetchSubmissions, fetchTeams, getAdminKey, setAdminKey } from '@/lib/adminApi';

interface Submission {
  id: string;
  teamId: string;
  teamName: string;
  leaderEmail: string;
  realWorld: string;
  villain: string;
  weapon: string;
  submittedAt: string;
  realWorldCorrect: boolean;
  villainCorrect: boolean;
  weaponCorrect: boolean;
  score: number;
  isWinner: boolean;
}

interface Winner {
  id: string;
  teamName: string;
  leaderEmail: string;
  submittedAt: string;
  score: number;
}

interface Team {
  id: string;
  teamName: string;
}

export default function SubmissionsPage() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [winners, setWinners] = useState<Winner[]>([]);
  const [hasCorrectAnswers, setHasCorrectAnswers] = useState(false);
  const [correctAnswers, setCorrectAnswers] = useState<{ realWorld: string; villain: string; weapon: string } | null>(null);
  const [finalAnswerOpen, setFinalAnswerOpen] = useState(false);
  const [toggling, setToggling] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showKeyModal, setShowKeyModal] = useState(false);
  const [keyInput, setKeyInput] = useState('');
  
  const [sortBy, setSortBy] = useState<'time' | 'team' | 'score'>('time');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    
    const [submissionsRes, teamsRes, statusRes] = await Promise.all([
      fetchSubmissions(),
      fetchTeams(),
      fetch('/api/admin/final-answer', { 
        headers: { 'x-admin-key': getAdminKey() || '' } 
      }).then(r => r.json()).catch(() => ({}))
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
      setWinners(submissionsRes.data.winners || []);
      setHasCorrectAnswers(submissionsRes.data.hasCorrectAnswers);
      setCorrectAnswers(submissionsRes.data.correctAnswers || null);
    }
    if (teamsRes.data) {
      setTeams(teamsRes.data.teams);
    }
    if (statusRes && typeof statusRes.finalAnswerOpen === 'boolean') {
      setFinalAnswerOpen(statusRes.finalAnswerOpen);
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

  const handleToggleSubmissions = async () => {
    setToggling(true);
    try {
      const res = await fetch('/api/admin/final-answer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-key': getAdminKey() || ''
        },
        body: JSON.stringify({ action: 'toggle' })
      });
      if (res.ok) {
        const data = await res.json();
        setFinalAnswerOpen(data.finalAnswerOpen);
      }
    } catch (err) {
      console.error('Failed to toggle submission status', err);
    }
    setToggling(false);
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
        case 'score':
          comparison = a.score - b.score;
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
    const headers = ['Team Name', 'Email', 'Real World', 'Villain', 'Weapon', 'Score', 'Winner', 'Submitted At'];
    const rows = submissions.map(s => [
      s.teamName,
      s.leaderEmail,
      s.realWorld,
      s.villain,
      s.weapon,
      `${s.score}/3`,
      s.isWinner ? 'YES' : 'NO',
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

  const CorrectBadge = ({ correct }: { correct: boolean }) => (
    hasCorrectAnswers ? (
      <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold ${
        correct ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'
      }`}>
        {correct ? '✓' : '✗'}
      </span>
    ) : null
  );

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

      {/* Winner Banner */}
      {winners.length > 0 && (
        <div className="relative rounded-xl overflow-hidden border-2 border-amber-500/50">
          <div className="absolute inset-0 bg-gradient-to-r from-amber-500/10 via-yellow-500/5 to-amber-500/10 animate-pulse" />
          <div className="relative p-6">
            <div className="text-center mb-4">
              <span className="text-4xl mb-2 block">🏆</span>
              <h2 className="text-2xl font-bold text-amber-400">
                {winners.length === 1 ? 'WINNER!' : `${winners.length} WINNERS!`}
              </h2>
              <p className="text-slate-400 text-sm mt-1">
                {winners.length === 1 ? 'This team solved the mystery!' : 'These teams solved the mystery!'}
              </p>
            </div>
            <div className="space-y-3">
              {winners.map((winner, idx) => (
                <div
                  key={winner.id}
                  className="flex items-center gap-4 p-4 bg-amber-500/10 backdrop-blur rounded-lg border border-amber-500/20"
                >
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-400 to-yellow-600 flex items-center justify-center text-slate-900 text-lg font-bold shadow-lg shadow-amber-500/30">
                    {idx + 1}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-amber-300">{winner.teamName}</h3>
                    <p className="text-slate-400 text-sm">{winner.leaderEmail}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-emerald-400 text-sm font-bold">3/3 Correct</span>
                    <p className="text-slate-500 text-xs">{formatDate(winner.submittedAt)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-xl font-semibold text-white tracking-tight">Final Submissions</h1>
          <p className="text-slate-500 text-sm mt-0.5">View all final answer submissions from teams</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleToggleSubmissions}
            disabled={toggling}
            className={`px-4 py-2 rounded-lg text-sm transition-all flex items-center gap-2 font-medium ${
              finalAnswerOpen 
                ? 'bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20' 
                : 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20'
            }`}
          >
            {toggling ? (
              <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
            ) : (
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {finalAnswerOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                )}
              </svg>
            )}
            {finalAnswerOpen ? 'Close Submissions' : 'Open Submissions'}
          </button>
          <button
            onClick={loadData}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-sm transition-all flex items-center gap-2"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh
          </button>
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
              {hasCorrectAnswers && <option value="score">Sort by Score</option>}
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
                  <th className="text-left text-slate-500 text-xs font-medium p-4 uppercase tracking-wider">Answer Summary</th>
                  {hasCorrectAnswers && (
                    <th className="text-left text-slate-500 text-xs font-medium p-4 uppercase tracking-wider">Score</th>
                  )}
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
                      className={`border-t border-slate-800 hover:bg-slate-800/30 transition-colors ${
                        submission.isWinner ? 'bg-amber-500/5' : ''
                      }`}
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
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                            submission.isWinner 
                              ? 'bg-gradient-to-br from-amber-400 to-yellow-600 text-slate-900 shadow-lg shadow-amber-500/30'
                              : 'bg-gradient-to-br from-amber-400 to-orange-500 text-slate-900'
                          }`}>
                            {submission.isWinner ? '🏆' : submission.teamName.charAt(0)}
                          </div>
                          <div>
                            <span className="text-slate-200 text-sm font-medium">{submission.teamName}</span>
                            {submission.isWinner && (
                              <span className="ml-2 px-1.5 py-0.5 bg-amber-500/20 text-amber-400 text-[10px] font-bold rounded uppercase">Winner</span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="p-4 text-sm max-w-xs">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-amber-400">{submission.realWorld}</span>
                          <CorrectBadge correct={submission.realWorldCorrect} />
                          <span className="text-slate-600">·</span>
                          <span className="text-rose-400">{submission.villain}</span>
                          <CorrectBadge correct={submission.villainCorrect} />
                          <span className="text-slate-600">·</span>
                          <span className="text-violet-400">{submission.weapon}</span>
                          <CorrectBadge correct={submission.weaponCorrect} />
                        </div>
                      </td>
                      {hasCorrectAnswers && (
                        <td className="p-4">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${
                            submission.score === 3
                              ? 'bg-emerald-500/20 text-emerald-400'
                              : submission.score >= 2
                              ? 'bg-amber-500/20 text-amber-400'
                              : submission.score === 1
                              ? 'bg-orange-500/20 text-orange-400'
                              : 'bg-red-500/20 text-red-400'
                          }`}>
                            {submission.score}/3
                          </span>
                        </td>
                      )}
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


      {/* Correct Answers Card */}
      {correctAnswers && (
        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-5 backdrop-blur-sm">
          <h3 className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-3 flex items-center gap-2">
            <svg className="w-4 h-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Current Correct Answers
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-slate-950/50 p-3 rounded-lg border border-slate-800/50">
              <span className="block text-slate-500 text-xs mb-1">Real World Location</span>
              <span className="text-amber-400 font-medium">{correctAnswers.realWorld}</span>
            </div>
            <div className="bg-slate-950/50 p-3 rounded-lg border border-slate-800/50">
              <span className="block text-slate-500 text-xs mb-1">Villain</span>
              <span className="text-rose-400 font-medium">{correctAnswers.villain}</span>
            </div>
            <div className="bg-slate-950/50 p-3 rounded-lg border border-slate-800/50">
              <span className="block text-slate-500 text-xs mb-1">Weapon</span>
              <span className="text-violet-400 font-medium">{correctAnswers.weapon}</span>
            </div>
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
                <div className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold ${
                  selectedSubmission.isWinner
                    ? 'bg-gradient-to-br from-amber-400 to-yellow-600 text-slate-900 shadow-lg shadow-amber-500/30'
                    : 'bg-gradient-to-br from-amber-400 to-orange-500 text-slate-900'
                }`}>
                  {selectedSubmission.isWinner ? '🏆' : selectedSubmission.teamName.charAt(0)}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">
                    {selectedSubmission.teamName}
                    {selectedSubmission.isWinner && (
                      <span className="ml-2 px-2 py-0.5 bg-amber-500/20 text-amber-400 text-xs font-bold rounded uppercase">Winner</span>
                    )}
                  </h3>
                  <p className="text-slate-500 text-sm">
                    Rank #{getSubmissionRank(selectedSubmission)} • {formatDate(selectedSubmission.submittedAt)}
                  </p>
                </div>
              </div>

              {hasCorrectAnswers && (
                <div className={`p-3 rounded-lg text-center font-bold text-sm ${
                  selectedSubmission.score === 3
                    ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                    : selectedSubmission.score >= 2
                    ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                    : 'bg-red-500/15 text-red-400 border border-red-500/30'
                }`}>
                  Score: {selectedSubmission.score}/3 — {
                    selectedSubmission.score === 3 ? 'All Correct! 🎉' :
                    selectedSubmission.score === 2 ? '2 Correct' :
                    selectedSubmission.score === 1 ? '1 Correct' : 'None Correct'
                  }
                </div>
              )}

              <div className="space-y-3">
                <div className="p-4 bg-slate-800/50 rounded-lg">
                  <p className="text-slate-500 text-xs mb-1">Contact Email</p>
                  <p className="text-white font-medium">{selectedSubmission.leaderEmail}</p>
                </div>
                <div className={`p-4 rounded-lg ${hasCorrectAnswers ? (selectedSubmission.realWorldCorrect ? 'bg-emerald-500/10 border border-emerald-500/20' : 'bg-red-500/10 border border-red-500/20') : 'bg-slate-800/50'}`}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded bg-blue-500/20 flex items-center justify-center">
                        <svg className="w-3.5 h-3.5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                      </div>
                      <p className="text-slate-500 text-xs font-semibold uppercase">Real World</p>
                    </div>
                    {hasCorrectAnswers && (
                      <span className={`text-xs font-bold ${selectedSubmission.realWorldCorrect ? 'text-emerald-400' : 'text-red-400'}`}>
                        {selectedSubmission.realWorldCorrect ? '✓ Correct' : '✗ Wrong'}
                      </span>
                    )}
                  </div>
                  <p className="text-amber-400 font-bold text-lg">{selectedSubmission.realWorld}</p>
                </div>
                <div className={`p-4 rounded-lg ${hasCorrectAnswers ? (selectedSubmission.villainCorrect ? 'bg-emerald-500/10 border border-emerald-500/20' : 'bg-red-500/10 border border-red-500/20') : 'bg-slate-800/50'}`}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded bg-rose-500/20 flex items-center justify-center">
                        <svg className="w-3.5 h-3.5 text-rose-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                      </div>
                      <p className="text-slate-500 text-xs font-semibold uppercase">Villain</p>
                    </div>
                    {hasCorrectAnswers && (
                      <span className={`text-xs font-bold ${selectedSubmission.villainCorrect ? 'text-emerald-400' : 'text-red-400'}`}>
                        {selectedSubmission.villainCorrect ? '✓ Correct' : '✗ Wrong'}
                      </span>
                    )}
                  </div>
                  <p className="text-rose-400 font-bold text-lg">{selectedSubmission.villain}</p>
                </div>
                <div className={`p-4 rounded-lg ${hasCorrectAnswers ? (selectedSubmission.weaponCorrect ? 'bg-emerald-500/10 border border-emerald-500/20' : 'bg-red-500/10 border border-red-500/20') : 'bg-slate-800/50'}`}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded bg-violet-500/20 flex items-center justify-center">
                        <svg className="w-3.5 h-3.5 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>
                      </div>
                      <p className="text-slate-500 text-xs font-semibold uppercase">Weapon</p>
                    </div>
                    {hasCorrectAnswers && (
                      <span className={`text-xs font-bold ${selectedSubmission.weaponCorrect ? 'text-emerald-400' : 'text-red-400'}`}>
                        {selectedSubmission.weaponCorrect ? '✓ Correct' : '✗ Wrong'}
                      </span>
                    )}
                  </div>
                  <p className="text-violet-400 font-bold text-lg">{selectedSubmission.weapon}</p>
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
