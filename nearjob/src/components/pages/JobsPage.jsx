import { useState, useEffect, useMemo } from 'react';
import { Search, Filter } from 'lucide-react';
import JobCard from '../cards/JobCard';
import WorkerCard from '../cards/WorkerCard';
import { filterTags } from '../../data/mockData';
import { JobCardSkeleton, WorkerCardSkeleton } from '../common/Skeleton';
import { API_BASE, normalizeJob, normalizeWorker, authHeaders } from '../../utils/api';

const JobsPage = ({ userType, companyFilter, onClearCompanyFilter }) => {
  const [rawData, setRawData] = useState([]);
  const [employerAccounts, setEmployerAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeTags, setActiveTags] = useState(() => new Set());
  const [filterOpen, setFilterOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        if (userType === 'worker') {
          const [jobsRes, companiesRes] = await Promise.all([
            fetch(`${API_BASE}/api/jobs`, { headers: authHeaders() }),
            fetch(`${API_BASE}/api/users?userType=company`, { headers: authHeaders() }),
          ]);
          const jobsJson = await jobsRes.json();
          const companiesJson = await companiesRes.json();
          const jobsList = jobsJson.data || jobsJson || [];
          const companiesList = companiesJson.data || companiesJson || [];
          setRawData(Array.isArray(jobsList) ? jobsList : []);
          setEmployerAccounts(Array.isArray(companiesList) ? companiesList : []);
        } else {
          const res = await fetch(`${API_BASE}/api/users?userType=worker`, { headers: authHeaders() });
          const result = await res.json();
          const workerList = result.data || result || [];
          setRawData(Array.isArray(workerList) ? workerList : []);
          setEmployerAccounts([]);
        }
      } catch (err) {
        console.error(err);
        setRawData([]);
        setEmployerAccounts([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [userType]);

  useEffect(() => {
    if (companyFilter?.name) {
      setSearch(companyFilter.name);
    }
  }, [companyFilter?.id, companyFilter?.name]);

  const jobs = useMemo(
    () => (userType === 'worker' ? rawData.map(normalizeJob).filter(Boolean) : []),
    [rawData, userType]
  );

  const workers = useMemo(
    () => (userType === 'company' ? rawData.map(normalizeWorker).filter(Boolean) : []),
    [rawData, userType]
  );

  const employerIdsMatchingQuery = useMemo(() => {
    if (userType !== 'worker') return new Set();
    const q = search.trim().toLowerCase();
    if (!q) return new Set();
    const ids = new Set();
    employerAccounts.forEach((u) => {
      const name = String(u.companyName || '').toLowerCase();
      const email = String(u.email || '').toLowerCase();
      if (name.includes(q) || email.includes(q)) ids.add(Number(u.id));
    });
    return ids;
  }, [userType, search, employerAccounts]);

  const filteredJobs = useMemo(() => {
    let list = jobs;
    const q = search.trim().toLowerCase();

    if (q) {
      list = list.filter((j) => {
        const byText =
          j.title.toLowerCase().includes(q) ||
          j.company.toLowerCase().includes(q) ||
          j.location.toLowerCase().includes(q) ||
          (j.tags || []).some((t) => t.toLowerCase().includes(q));
        const byEmployerId =
          j.companyId != null && employerIdsMatchingQuery.has(Number(j.companyId));
        return byText || byEmployerId;
      });
    }

    if (companyFilter?.id) {
      list = list.filter((j) => Number(j.companyId) === Number(companyFilter.id));
    }

    // Tag chips are easy to leave on; they AND together and hide everything. While typing a search, tags are ignored.
    const applyTags = activeTags.size > 0 && !q;
    if (applyTags) {
      list = list.filter((j) =>
        [...activeTags].every(
          (tag) =>
            (j.tags || []).some((t) => t.toLowerCase() === tag.toLowerCase()) ||
            j.type.toLowerCase() === tag.toLowerCase()
        )
      );
    }
    return list;
  }, [jobs, search, activeTags, companyFilter, employerIdsMatchingQuery]);

  const employersMatchingButNoJobs = useMemo(() => {
    if (userType !== 'worker') return [];
    const q = search.trim().toLowerCase();
    if (!q || companyFilter?.id) return [];
    const jobCompanyIds = new Set(jobs.map((j) => Number(j.companyId)).filter(Boolean));
    return employerAccounts.filter((u) => {
      if (!employerIdsMatchingQuery.has(Number(u.id))) return false;
      return !jobCompanyIds.has(Number(u.id));
    });
  }, [
    userType,
    search,
    companyFilter,
    employerAccounts,
    employerIdsMatchingQuery,
    jobs,
  ]);

  const filteredWorkers = useMemo(() => {
    let list = workers;
    const q = search.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (w) =>
          w.name.toLowerCase().includes(q) ||
          w.role.toLowerCase().includes(q) ||
          w.location.toLowerCase().includes(q) ||
          (w.skills || []).some((s) => s.toLowerCase().includes(q))
      );
    }
    const applyTags = activeTags.size > 0 && !q;
    if (applyTags) {
      list = list.filter((w) =>
        [...activeTags].every(
          (tag) =>
            (w.skills || []).some((s) => s.toLowerCase().includes(tag.toLowerCase())) ||
            w.role.toLowerCase().includes(tag.toLowerCase())
        )
      );
    }
    return list;
  }, [workers, search, activeTags]);

  const toggleTag = (tag) => {
    setActiveTags((prev) => {
      const next = new Set(prev);
      if (next.has(tag)) next.delete(tag);
      else next.add(tag);
      return next;
    });
  };

  const handleSearchChange = (e) => {
    const v = e.target.value;
    if (companyFilter && onClearCompanyFilter) {
      onClearCompanyFilter();
    }
    setSearch(v);
  };

  const runSearch = () => {
    setFilterOpen(false);
  };

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="glass rounded-lg sm:rounded-xl md:rounded-2xl p-3 sm:p-4 md:p-6">
        <div className="flex flex-col gap-2.5 sm:gap-3 md:gap-4 mb-4 sm:mb-6">
          <div className="flex-1 relative">
            <input
              type="text"
              value={search}
              onChange={handleSearchChange}
              onKeyDown={(e) => e.key === 'Enter' && runSearch()}
              placeholder={userType === 'worker' ? 'Search jobs, companies…' : 'Search candidates…'}
              className="w-full bg-white/5 border border-white/10 rounded-lg sm:rounded-xl py-2.5 sm:py-3 md:py-3 pl-10 sm:pl-12 pr-3 sm:pr-4 text-xs sm:text-sm text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 input-mobile"
            />
            <Search className="absolute left-3 sm:left-4 top-2.5 sm:top-3.5 w-4 sm:w-5 h-4 sm:h-5 text-gray-400" />
          </div>
          <div className="flex gap-2 md:gap-3">
            <button
              type="button"
              onClick={() => setFilterOpen((v) => !v)}
              className={`flex-1 sm:flex-none px-3 sm:px-4 md:px-6 py-2.5 sm:py-3 rounded-lg sm:rounded-xl border border-white/10 text-white flex items-center justify-center gap-1 sm:gap-2 text-xs sm:text-sm transition touch-target ${
                filterOpen || activeTags.size ? 'bg-blue-600/30 border-blue-500/50' : 'bg-white/5 hover:bg-white/10'
              }`}
            >
              <Filter className="w-4 sm:w-5 h-4 sm:h-5" /> <span className="hidden sm:inline text-xs">Filters</span> {activeTags.size ? `(${activeTags.size})` : ''}
            </button>
            <button
              type="button"
              onClick={runSearch}
              className="flex-1 sm:flex-none px-3 sm:px-6 py-2.5 sm:py-3 rounded-lg sm:rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white text-xs sm:text-sm font-medium hover:opacity-90 transition touch-target btn-mobile"
            >
              {userType === 'worker' ? 'Search' : 'Find'}
            </button>
          </div>
        </div>

        {companyFilter?.name && userType === 'worker' ? (
          <div className="flex items-center gap-2 mb-4 text-sm text-gray-300">
            <span>
              Showing jobs from <span className="text-white font-medium">{companyFilter.name}</span>
            </span>
            {onClearCompanyFilter ? (
              <button
                type="button"
                onClick={() => {
                  onClearCompanyFilter();
                  setSearch('');
                }}
                className="text-blue-400 hover:text-blue-300"
              >
                Clear
              </button>
            ) : null}
          </div>
        ) : null}

        {filterOpen || activeTags.size > 0 ? (
          <p className="text-gray-500 text-xs mb-2">
            {userType === 'worker'
              ? 'Tags apply only when the search box is empty (so they do not hide employer searches). Tags combine with AND.'
              : 'Tags apply only when the search box is empty. Tags combine with AND.'}
          </p>
        ) : null}

        <div className="flex flex-wrap gap-1.5 sm:gap-2">
          {(userType === 'worker' ? filterTags : ['React', 'Python', 'Design', 'Remote', 'Senior']).map((tag) => {
            const on = activeTags.has(tag);
            return (
              <button
                key={tag}
                type="button"
                onClick={() => toggleTag(tag)}
                className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-[11px] sm:text-sm border transition touch-target ${
                  on
                    ? 'bg-blue-600/40 text-white border-blue-500/60'
                    : 'bg-white/5 text-gray-300 border-white/10 hover:bg-white/10 hover:border-blue-500/50'
                }`}
              >
                {tag}
              </button>
            );
          })}
        </div>
      </div>

      {employersMatchingButNoJobs.length > 0 ? (
        <div className="rounded-2xl border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
          These employers match your search but have no job posts yet:{' '}
          <span className="font-medium text-white">
            {employersMatchingButNoJobs.map((u) => u.companyName || u.email).join(', ')}
          </span>
        </div>
      ) : null}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
        {loading ? (
          <>
            {[...Array(6)].map((_, i) => (
              userType === 'worker' ? <JobCardSkeleton key={i} /> : <WorkerCardSkeleton key={i} />
            ))}
          </>
        ) : userType === 'worker' ? (
          filteredJobs.length === 0 ? (
            <p className="text-gray-400 col-span-full text-center py-10">
              No job posts match. Try clearing filters, emptying the search box to use tag filters only, or search by
              employer name.
            </p>
          ) : (
            filteredJobs.map((job) => <JobCard key={job.id} job={job} showApply />)
          )
        ) : filteredWorkers.length === 0 ? (
          <p className="text-gray-400 col-span-full text-center py-10">No results match your search.</p>
        ) : (
          filteredWorkers.map((worker) => <WorkerCard key={worker.id} worker={worker} />)
        )}
      </div>
    </div>
  );
};

export default JobsPage;
