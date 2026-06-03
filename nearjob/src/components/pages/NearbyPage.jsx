import { useState, useEffect } from 'react';
import MapVisualization from '../map/MapVisualization';
import NearbyItem from '../cards/NearbyItem';
import { API_BASE, normalizeJob } from '../../utils/api';

const NearbyPage = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/jobs`);
        const data = await res.json();
        const list = (Array.isArray(data) ? data : []).map(normalizeJob).filter(Boolean).slice(0, 8);
        setJobs(list);
      } catch (e) {
        console.error(e);
        setJobs([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <MapVisualization />
        </div>
        <div className="space-y-4">
          <h3 className="text-white font-semibold mb-2">Closest listings</h3>
          {loading ? (
            <p className="text-gray-400 text-sm">Loading nearby jobs…</p>
          ) : jobs.length === 0 ? (
            <p className="text-gray-400 text-sm">No jobs in the database yet.</p>
          ) : (
            jobs.map((job) => <NearbyItem key={job.id} job={job} />)
          )}
        </div>
      </div>
    </div>
  );
};

export default NearbyPage;
