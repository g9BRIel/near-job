import { useState, useEffect, useMemo } from 'react';
import WorkerCard from '../cards/WorkerCard';
import { WorkerCardSkeleton } from '../common/Skeleton';
import { API_BASE, normalizeWorker, authHeaders } from '../../utils/api';

const WorkersPage = ({ onContactWorker }) => {
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Memoize normalization to avoid lagging on theme change or re-renders
  const normalizedWorkers = useMemo(() => {
    return workers.map(w => normalizeWorker(w)).filter(Boolean);
  }, [workers]);

  useEffect(() => {
    const fetchWorkers = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/users?userType=worker`, { headers: authHeaders() });
        const data = await res.json();
        const workerList = data.data || data || [];
        setWorkers(Array.isArray(workerList) ? workerList : []);
      } catch (err) {
        console.error(err);
        setWorkers([]);
      } finally {
        setLoading(false);
      }
    };
    fetchWorkers();
  }, []);

  return (
    <div className="space-y-6">
      <div className="p-6 glass rounded-2xl mb-6">
        <h2 className="text-2xl font-bold text-white mb-2">Talent Pool</h2>
        <p className="text-gray-400">Browse workers and start a conversation — <strong className="text-gray-300">Contact</strong> opens Messages.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {loading ? (
          <>
            <WorkerCardSkeleton />
            <WorkerCardSkeleton />
            <WorkerCardSkeleton />
            <WorkerCardSkeleton />
          </>
        ) : normalizedWorkers.length === 0 ? (
          <p className="text-muted col-span-full">No workers found yet.</p>
        ) : (
          normalizedWorkers.map((worker) => (
            <WorkerCard
              key={worker.id}
              worker={worker}
              onContact={onContactWorker ? () => onContactWorker(worker) : undefined}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default WorkersPage;
