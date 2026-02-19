// Helper for admin API calls
// The admin key is stored in localStorage for client-side usage

const ADMIN_KEY_STORAGE = 'admin_api_key';

export function getAdminKey(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(ADMIN_KEY_STORAGE);
}

export function setAdminKey(key: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(ADMIN_KEY_STORAGE, key);
}

export function clearAdminKey(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(ADMIN_KEY_STORAGE);
}

export async function adminFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<{ data?: T; error?: string }> {
  const adminKey = getAdminKey();
  
  if (!adminKey) {
    return { error: 'No admin key configured. Please set it in settings.' };
  }

  try {
    const res = await fetch(endpoint, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'x-admin-key': adminKey,
        ...options.headers,
      },
    });

    if (res.status === 401) {
      return { error: 'Invalid admin key' };
    }

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      return { error: data.error || 'Request failed' };
    }

    const data = await res.json();
    return { data };
  } catch {
    return { error: 'Network error' };
  }
}

// API functions
export async function fetchStats() {
  return adminFetch<{
    totalTeams: number;
    activeTeams: number;
    totalWorlds: number;
    unlockedWorlds: number;
    totalAnnouncements: number;
    finalSubmissions: number;
  }>('/api/admin/stats');
}

export async function fetchTeams() {
  return adminFetch<{
    teams: Array<{
      id: string;
      teamName: string;
      leaderEmail: string;
      membersCount: number;
      completedWorldsCount: number;
      totalWorlds: number;
      progress: number;
      finalSubmitted: boolean;
      lastActive: string;
    }>;
    totalWorlds: number;
  }>('/api/admin/teams');
}

export async function fetchWorlds() {
  return adminFetch<{
    worlds: Array<{
      id: string;
      title: string;
      story: string;
      question: string;
      answer: string;
      order: number;
      isLocked: boolean;
    }>;
  }>('/api/admin/worlds');
}

export async function updateWorld(id: string, updates: Record<string, unknown>) {
  return adminFetch(`/api/admin/worlds/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(updates),
  });
}

export async function bulkWorldAction(action: 'lock-all' | 'unlock-all') {
  return adminFetch('/api/admin/worlds', {
    method: 'PATCH',
    body: JSON.stringify({ action }),
  });
}

export async function fetchFinalAnswerStatus() {
  return adminFetch<{
    finalAnswerOpen: boolean;
    finalAnswerStartTime: string | null;
  }>('/api/admin/final-answer');
}

export async function toggleFinalAnswer(action: 'open' | 'close' | 'toggle') {
  return adminFetch('/api/admin/final-answer', {
    method: 'POST',
    body: JSON.stringify({ action }),
  });
}

export async function fetchProgress() {
  return adminFetch<{
    summary: {
      totalTeams: number;
      teamsCompleted100: number;
      teamsOver50: number;
      teamsStarted: number;
      averageProgress: number;
    };
    teams: Array<{
      id: string;
      teamName: string;
      completedCount: number;
      totalWorlds: number;
      progressPercent: number;
      finalSubmitted: boolean;
      lastActive: string;
    }>;
  }>('/api/admin/progress');
}

export async function fetchSubmissions() {
  return adminFetch<{
    submissions: Array<{
      id: string;
      teamId: string;
      teamName: string;
      leaderEmail: string;
      answer: string;
      submittedAt: string;
    }>;
    totalSubmissions: number;
  }>('/api/admin/submissions');
}

export async function sendAnnouncement(message?: string, templateId?: string) {
  return adminFetch('/api/admin/announcement', {
    method: 'POST',
    body: JSON.stringify({ message, templateId }),
  });
}
