export const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000';

export const authHeaders = (json = true) => {
  const token = localStorage.getItem('token');
  const headers = {};
  if (json) headers['Content-Type'] = 'application/json';
  if (token) headers.Authorization = `Bearer ${token}`;
  return headers;
};

export function getTokenPayload() {
  const token = localStorage.getItem('token');
  if (!token) return null;
  try {
    return JSON.parse(atob(token.split('.')[1]));
  } catch {
    return null;
  }
}

/**
 * Restore session.
 * Returns:
 *   - profile object  → valid token, server responded with user data
 *   - null            → token is invalid / expired (401/403)
 *   - { networkError: true } → backend unreachable / server error (keep user in)
 */
export async function fetchCurrentProfile() {
  const token = localStorage.getItem('token');
  if (!token) return null;
  try {
    const res = await fetch(`${API_BASE}/api/users/me`, {
      headers: authHeaders(false),
    });
    // Explicitly invalid token → wipe it
    if (res.status === 401 || res.status === 403) return null;
    // Other server/network issues → keep the user logged in
    if (!res.ok) return { networkError: true };
    return res.json();
  } catch {
    // Network offline or backend down → keep the user logged in
    return { networkError: true };
  }
}

/** Update profile data: returns updated profile JSON or null on fail. */
export async function updateCurrentProfile(data) {
  try {
    const res = await fetch(`${API_BASE}/api/users/me`, {
      method: 'PUT',
      headers: authHeaders(true),
      body: JSON.stringify(data),
    });
    if (!res.ok) return null;
    return res.json();
  } catch (err) {
    console.error(err);
    return null;
  }
}

/** Settings Management */
export async function fetchSettings() {
  try {
    const res = await fetch(`${API_BASE}/api/settings`, {
      headers: authHeaders(),
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export async function updateSettings(settings) {
  try {
    const res = await fetch(`${API_BASE}/api/settings`, {
      method: 'PUT',
      headers: authHeaders(true),
      body: JSON.stringify(settings),
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export async function changePassword(currentPassword, newPassword) {
  try {
    const res = await fetch(`${API_BASE}/api/auth/change-password`, {
      method: 'POST',
      headers: authHeaders(true),
      body: JSON.stringify({ currentPassword, newPassword }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to change password');
    return data;
  } catch (err) {
    throw err;
  }
}

export async function getNotifications() {
  try {
    const res = await fetch(`${API_BASE}/api/notifications`, {
      headers: authHeaders(),
    });
    if (!res.ok) return [];
    const json = await res.json();
    return json.data || [];
  } catch (err) {
    console.error(err);
    return [];
  }
}

export async function markNotificationAsRead(id) {
  try {
    const res = await fetch(`${API_BASE}/api/notifications/${id}/read`, {
      method: 'PUT',
      headers: authHeaders(),
    });
    return res.ok;
  } catch (err) {
    console.error(err);
    return false;
  }
}

export function formatRelativeTime(iso) {
  if (!iso) return 'Recently';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return 'Recently';
  const s = Math.floor((Date.now() - d.getTime()) / 1000);
  if (s < 60) return 'Just now';
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  if (s < 604800) return `${Math.floor(s / 86400)}d ago`;
  return d.toLocaleDateString();
}

function parseTags(tags) {
  if (Array.isArray(tags)) return tags.filter(Boolean);
  if (typeof tags === 'string') {
    try {
      const parsed = JSON.parse(tags);
      return Array.isArray(parsed) ? parsed.filter(Boolean) : [];
    } catch {
      return tags.split(',').map((t) => t.trim()).filter(Boolean);
    }
  }
  return [];
}

export function normalizeJob(raw) {
  if (!raw) return null;
  const j = typeof raw.toJSON === 'function' ? raw.toJSON() : { ...raw };
  const companyUser = j.companyUser || {};
  const fromEmployerProfile =
    (companyUser.companyName && String(companyUser.companyName).trim()) || '';
  const fromJobRow = (j.companyName && String(j.companyName).trim()) || '';
  // Prefer live User.companyName so Find Jobs matches Companies directory
  const company = fromEmployerProfile || fromJobRow || 'Company';
  // Prefer live company profile picture over the one saved in the job row
  let logo = companyUser.logo || j.logo || '💼';
  // Allow http links AND base64 strings
  const isBase64 = typeof logo === 'string' && logo.startsWith('data:');
  const isUrl = typeof logo === 'string' && logo.startsWith('http');
  if (typeof logo === 'string' && logo.length > 8 && !isUrl && !isBase64) {
    logo = '💼';
  }
  const tags = parseTags(j.tags);
  return {
    id: j.id,
    title: j.title || 'Untitled role',
    company,
    location: j.location || '—',
    salary: j.salary || 'Competitive',
    type: j.type || 'Full-time',
    posted: formatRelativeTime(j.createdAt),
    logo,
    tags: tags.length ? tags : ['General'],
    rating: j.rating ?? 4.5,
    applicants: j.applicants ?? 0,
    companyId: j.companyId ?? companyUser.id,
    createdAt: j.createdAt,
  };
}

export function normalizeWorker(raw) {
  if (!raw) return null;
  const w = typeof raw.toJSON === 'function' ? raw.toJSON() : { ...raw };
  const skills = parseTags(w.skills);
  const name = w.fullName || w.name || w.email || 'Worker';
  const initial = String(name).charAt(0).toUpperCase();
  let avatar = w.avatar || initial;
  // Allow http links AND base64 strings
  const isBase64 = typeof avatar === 'string' && avatar.startsWith('data:');
  const isUrl = typeof avatar === 'string' && avatar.startsWith('http');
  if (typeof avatar === 'string' && avatar.length > 4 && !isUrl && !isBase64) {
    avatar = initial;
  }
  const exp = w.experience;
  const experienceLabel =
    exp === undefined || exp === null || exp === ''
      ? '—'
      : String(exp).includes('yr')
        ? String(exp)
        : `${exp} yrs exp`;

  return {
    id: w.id,
    name,
    role: w.jobTitle || w.role || 'Professional',
    location: w.location || '—',
    skills: skills.length ? skills : ['Open to roles'],
    experience: experienceLabel,
    rating: w.rating ?? 4.8,
    available: true,
    avatar,
  };
}

export function normalizeCompany(raw) {
  if (!raw) return null;
  const c = typeof raw.toJSON === 'function' ? raw.toJSON() : { ...raw };
  const name = c.companyName || c.name || 'Company';
  let logo = c.logo || '🏢';
  // Allow http links AND base64 strings
  const isBase64 = typeof logo === 'string' && logo.startsWith('data:');
  const isUrl = typeof logo === 'string' && logo.startsWith('http');
  if (typeof logo === 'string' && logo.length > 8 && !isUrl && !isBase64) {
    logo = '🏢';
  }
  return {
    id: c.id,
    name,
    industry: c.industry || 'Business',
    location: c.location || '—',
    distance: c.distance || 'Nearby',
    employees: c.companySize || '—',
    openJobs: c.openJobs != null ? c.openJobs : '—',
    rating: c.rating ?? 4.7,
    logo,
  };
}

/** @returns {'url' | 'emoji'} */
export function logoKind(logo) {
  if (!logo) return 'emoji';
  const s = String(logo);
  if (s.startsWith('http') || s.startsWith('data:')) return 'url';
  return 'emoji';
}
