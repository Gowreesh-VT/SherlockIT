'use client';

import { useState, useEffect } from 'react';
import { fetchWorlds, updateWorld, bulkWorldAction, getAdminKey } from '@/lib/adminApi';

interface WorldData {
  id: string;
  title: string;
  story: string;
  question: string;
  answer: string;
  order: number;
  isLocked: boolean;
}

export default function WorldsPage() {
  const [worlds, setWorlds] = useState<WorldData[]>([]);
  const [editingWorld, setEditingWorld] = useState<WorldData | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function loadWorlds() {
    if (!getAdminKey()) {
      setError('Admin key not configured');
      setLoading(false);
      return;
    }

    const res = await fetchWorlds();
    if (res.error) {
      setError(res.error);
    } else if (res.data) {
      setWorlds(res.data.worlds);
    }
    setLoading(false);
  }

  useEffect(() => {
    loadWorlds();
  }, []);

  const toggleLock = async (worldId: string, currentlyLocked: boolean) => {
    setSaving(true);
    const res = await updateWorld(worldId, { isLocked: !currentlyLocked });
    if (res.error) {
      setError(res.error);
    } else {
      setWorlds(worlds.map(w => w.id === worldId ? { ...w, isLocked: !currentlyLocked } : w));
    }
    setSaving(false);
  };

  const unlockAll = async () => {
    setSaving(true);
    const res = await bulkWorldAction('unlock-all');
    if (res.error) {
      setError(res.error);
    } else {
      setWorlds(worlds.map(w => ({ ...w, isLocked: false })));
    }
    setSaving(false);
  };

  const lockAll = async () => {
    setSaving(true);
    const res = await bulkWorldAction('lock-all');
    if (res.error) {
      setError(res.error);
    } else {
      setWorlds(worlds.map(w => ({ ...w, isLocked: true })));
    }
    setSaving(false);
  };

  const handleEdit = (world: WorldData) => {
    setEditingWorld({ ...world });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!editingWorld) return;
    setSaving(true);
    const res = await updateWorld(editingWorld.id, {
      title: editingWorld.title,
      story: editingWorld.story,
      question: editingWorld.question,
      answer: editingWorld.answer,
      order: editingWorld.order,
    });
    if (res.error) {
      setError(res.error);
    } else {
      setWorlds(worlds.map(w => w.id === editingWorld.id ? editingWorld : w));
      setShowModal(false);
      setEditingWorld(null);
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center gap-3 text-slate-400">
          <svg className="w-6 h-6 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <span>Loading worlds...</span>
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

      {/* Saving Overlay */}
      {saving && (
        <div className="fixed inset-0 bg-slate-950/50 flex items-center justify-center z-40">
          <div className="flex items-center gap-3 text-white">
            <svg className="w-6 h-6 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            <span>Saving...</span>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-white">World Management</h1>
          <p className="text-slate-400 mt-1">Lock, unlock, and configure puzzle worlds</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={lockAll}
            className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg transition-all flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            Lock All
          </button>
          <button
            onClick={unlockAll}
            className="px-4 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 rounded-lg transition-all flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
            </svg>
            Unlock All
          </button>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-6 text-sm">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
          <span className="text-slate-400">Unlocked</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-red-500"></span>
          <span className="text-slate-400">Locked</span>
        </div>
      </div>

      {/* Worlds Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {worlds.sort((a, b) => a.order - b.order).map((world) => (
          <div
            key={world.id}
            className={`bg-slate-900 rounded-xl p-5 border transition-all ${
              world.isLocked
                ? 'border-red-500/30 hover:border-red-500/50'
                : 'border-emerald-500/30 hover:border-emerald-500/50'
            }`}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-sm font-bold ${
                  world.isLocked
                    ? 'bg-red-500/10 text-red-400'
                    : 'bg-emerald-500/10 text-emerald-400'
                }`}>
                  {world.order}
                </div>
                <div>
                  <h3 className="text-base font-semibold text-white">{world.title}</h3>
                  <p className="text-xs text-slate-500">World #{world.order}</p>
                </div>
              </div>
              <span className={`px-2.5 py-1 rounded-md text-xs font-medium flex items-center gap-1.5 ${
                world.isLocked
                  ? 'bg-red-500/10 text-red-400'
                  : 'bg-emerald-500/10 text-emerald-400'
              }`}>
                {world.isLocked ? (
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                ) : (
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
                  </svg>
                )}
                {world.isLocked ? 'Locked' : 'Unlocked'}
              </span>
            </div>

            <div className="space-y-3 mb-4">
              <div>
                <p className="text-slate-500 text-xs uppercase tracking-wider mb-1">Story Preview</p>
                <p className="text-slate-300 text-sm line-clamp-2">{world.story}</p>
              </div>
              <div>
                <p className="text-slate-500 text-xs uppercase tracking-wider mb-1">Question</p>
                <p className="text-slate-300 text-sm">{world.question}</p>
              </div>
              <div>
                <p className="text-slate-500 text-xs uppercase tracking-wider mb-1">Answer</p>
                <p className="text-amber-400 text-sm font-mono bg-amber-500/10 px-2 py-1 rounded inline-block">
                  {world.answer}
                </p>
              </div>
            </div>

            <div className="flex gap-2 pt-4 border-t border-slate-800">
              <button
                onClick={() => toggleLock(world.id, world.isLocked)}
                disabled={saving}
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 disabled:opacity-50 ${
                  world.isLocked
                    ? 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400'
                    : 'bg-red-500/10 hover:bg-red-500/20 text-red-400'
                }`}
              >
                {world.isLocked ? (
                  <>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
                    </svg>
                    Unlock
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    Lock
                  </>
                )}
              </button>
              <button
                onClick={() => handleEdit(world)}
                className="flex-1 py-2 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Edit
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Edit Modal */}
      {showModal && editingWorld && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 rounded-xl border border-slate-700 w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-fade-in">
            <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
              <h2 className="text-base font-semibold text-white">Edit World: {editingWorld.title}</h2>
              <button
                onClick={() => {
                  setShowModal(false);
                  setEditingWorld(null);
                }}
                className="p-1.5 text-slate-500 hover:text-white hover:bg-slate-800 rounded-lg transition-all"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-slate-400 text-sm mb-2">Title</label>
                <input
                  type="text"
                  value={editingWorld.title}
                  onChange={(e) => setEditingWorld({ ...editingWorld, title: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white focus:border-amber-500 focus:outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-slate-400 text-sm mb-2">Order</label>
                <input
                  type="number"
                  value={editingWorld.order}
                  onChange={(e) => setEditingWorld({ ...editingWorld, order: parseInt(e.target.value) })}
                  className="w-24 px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white focus:border-amber-500 focus:outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-slate-400 text-sm mb-2">Story</label>
                <textarea
                  value={editingWorld.story}
                  onChange={(e) => setEditingWorld({ ...editingWorld, story: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white focus:border-amber-500 focus:outline-none transition-all resize-none"
                />
              </div>
              <div>
                <label className="block text-slate-400 text-sm mb-2">Question</label>
                <textarea
                  value={editingWorld.question}
                  onChange={(e) => setEditingWorld({ ...editingWorld, question: e.target.value })}
                  rows={2}
                  className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white focus:border-amber-500 focus:outline-none transition-all resize-none"
                />
              </div>
              <div>
                <label className="block text-slate-400 text-sm mb-2">Answer (case-insensitive)</label>
                <input
                  type="text"
                  value={editingWorld.answer}
                  onChange={(e) => setEditingWorld({ ...editingWorld, answer: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white focus:border-amber-500 focus:outline-none transition-all font-mono"
                />
              </div>
            </div>
            <div className="px-6 py-4 border-t border-slate-800 flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowModal(false);
                  setEditingWorld(null);
                }}
                className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-900 font-medium rounded-lg transition-all"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
