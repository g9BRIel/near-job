import { useState, useEffect, useCallback } from 'react';
import JobCard from '../cards/JobCard';
import { Plus, X } from 'lucide-react';
import { API_BASE, authHeaders, normalizeJob, getTokenPayload } from '../../utils/api';

const emptyForm = {
  title: '',
  location: '',
  salary: '',
  type: 'Full-time',
  tags: '',
};

const MyJobsPage = ({ userData }) => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const companyId = userData?.id ?? getTokenPayload()?.id;

  const loadJobs = useCallback(async () => {
    if (!companyId) {
      setJobs([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/jobs?companyId=${companyId}`);
      const data = await res.json();
      const list = (Array.isArray(data) ? data : []).map(normalizeJob).filter(Boolean);
      setJobs(list);
    } catch (e) {
      console.error(e);
      setJobs([]);
    } finally {
      setLoading(false);
    }
  }, [companyId]);

  useEffect(() => {
    loadJobs();
  }, [loadJobs]);

  const updateField = (name, value) => setForm((f) => ({ ...f, [name]: value }));

  const handleCreateJob = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.location.trim()) {
      alert('Title and location are required.');
      return;
    }
    setSaving(true);
    try {
      const tags = form.tags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean);
      const res = await fetch(`${API_BASE}/api/jobs`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({
          title: form.title.trim(),
          location: form.location.trim(),
          salary: form.salary.trim() || 'Competitive',
          type: form.type || 'Full-time',
          tags,
          companyName: userData?.companyName || userData?.fullName || 'Company',
          logo: userData?.logo || '🏢',
        }),
      });
      const err = await res.json().catch(() => ({}));
      if (!res.ok) {
        alert(err.message || 'Could not create job');
        return;
      }
      setModalOpen(false);
      setForm(emptyForm);
      await loadJobs();
    } catch (e) {
      console.error(e);
      alert('Network error creating job');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-6 glass rounded-2xl mb-6 gap-4">
        <div>
          <h2 className="text-main text-2xl font-bold mb-2">My Active Jobs</h2>
          <p className="text-muted">Post roles and track applicants from the API.</p>
        </div>
        <button
          type="button"
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl text-white font-semibold hover:opacity-90 transition"
        >
          <Plus className="w-5 h-5" />
          Post New Job
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {loading ? (
          <p className="text-white col-span-full">Loading your jobs…</p>
        ) : jobs.length === 0 ? (
          <div className="col-span-full p-8 text-center glass rounded-2xl flex flex-col items-center">
            <h3 className="text-xl font-bold text-white mb-2">No active job listings</h3>
            <p className="text-gray-400 mb-6">Post your first job to appear for nearby workers.</p>
            <button
              type="button"
              onClick={() => setModalOpen(true)}
              className="flex items-center gap-2 px-6 py-3 border border-white/20 rounded-xl text-white hover:bg-white/5 transition"
            >
              <Plus className="w-5 h-5" />
              Create First Job
            </button>
          </div>
        ) : (
          jobs.map((job) => <JobCard key={job.id} job={job} showApply={false} />)
        )}
      </div>

      {modalOpen ? (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70">
          <div className="glass rounded-2xl max-w-lg w-full p-6 relative border border-white/10">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white"
              aria-label="Close"
            >
              <X className="w-6 h-6" />
            </button>
            <h3 className="text-xl font-bold text-white mb-4">New job posting</h3>
            <form onSubmit={handleCreateJob} className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Title</label>
                <input
                  required
                  value={form.title}
                  onChange={(e) => updateField('title', e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-2 px-3 text-white"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Location</label>
                <input
                  required
                  value={form.location}
                  onChange={(e) => updateField('location', e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-2 px-3 text-white"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Salary</label>
                <input
                  value={form.salary}
                  onChange={(e) => updateField('salary', e.target.value)}
                  placeholder="$80k – $100k"
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-2 px-3 text-white placeholder-gray-500"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Type</label>
                <select
                  value={form.type}
                  onChange={(e) => updateField('type', e.target.value)}
                  className="w-full bg-slate-800 border border-white/10 rounded-xl py-2 px-3 text-white"
                >
                  {['Full-time', 'Part-time', 'Contract', 'Internship'].map((t) => (
                    <option key={t} value={t} className="bg-slate-800">
                      {t}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Tags (comma separated)</label>
                <input
                  value={form.tags}
                  onChange={(e) => updateField('tags', e.target.value)}
                  placeholder="React, Remote, Senior"
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-2 px-3 text-white placeholder-gray-500"
                />
              </div>
              <button
                type="submit"
                disabled={saving}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold disabled:opacity-50"
              >
                {saving ? 'Publishing…' : 'Publish job'}
              </button>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default MyJobsPage;
