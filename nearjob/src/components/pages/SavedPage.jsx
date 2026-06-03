import React, { useState, useEffect } from 'react';
import { Bookmark, FolderHeart, ArrowRight, LayoutGrid, List } from 'lucide-react';
import { API_BASE, authHeaders, normalizeJob, normalizeWorker, normalizeCompany } from '../../utils/api';
import JobCard from '../cards/JobCard';
import WorkerCard from '../cards/WorkerCard';
import CompanyCard from '../cards/CompanyCard';
import { JobCardSkeleton } from '../common/Skeleton';

const SavedPage = ({ userType, onNavigate }) => {
  const [viewMode, setViewMode] = useState('grid');
  const [savedItems, setSavedItems] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchBookmarks = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/bookmarks`, {
          headers: authHeaders()
        });
        const data = await res.json();
        if (res.ok && Array.isArray(data)) {
          setSavedItems(data);
        }
      } catch (e) {
        console.error('Failed to fetch bookmarks:', e);
      } finally {
        setLoading(false);
      }
    };
    fetchBookmarks();
  }, []);

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in zoom-in-95 duration-500 pb-20">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 glass p-8 rounded-[2rem] border border-white/5">
        <div className="flex items-center gap-5">
           <div className="w-16 h-16 bg-gradient-to-tr from-pink-500 to-rose-500 rounded-2xl flex items-center justify-center shadow-lg shadow-rose-500/20 text-white transform -rotate-6">
             <Bookmark className="w-8 h-8 fill-current" />
           </div>
           <div>
              <h1 className="text-3xl font-bold text-main tracking-tight flex items-center gap-3">
                 Your Bookmarks
              </h1>
              <p className="text-muted mt-1 font-medium">
                 {userType === 'worker' ? 'Jobs and companies you have saved.' : 'Talent profiles you have shortlisted.'}
              </p>
           </div>
        </div>
        
        <div className="flex items-center gap-2 bg-black/20 p-1.5 rounded-xl border border-white/5">
           <button 
             onClick={() => setViewMode('grid')}
             className={`p-2.5 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-white/10 text-main shadow-md' : 'text-muted hover:text-main'}`}
           >
             <LayoutGrid className="w-4 h-4" />
           </button>
           <button 
             onClick={() => setViewMode('list')}
             className={`p-2.5 rounded-lg transition-all ${viewMode === 'list' ? 'bg-white/10 text-main shadow-md' : 'text-muted hover:text-main'}`}
           >
             <List className="w-4 h-4" />
           </button>
        </div>
      </div>

      {loading ? (
        <div className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
           <JobCardSkeleton />
           <JobCardSkeleton />
           <JobCardSkeleton />
        </div>
      ) : savedItems.length === 0 ? (
        <div className="glass rounded-[2rem] p-16 flex flex-col items-center justify-center text-center border-dashed border-2 border-white/10 bg-white/[0.02]">
           <div className="w-24 h-24 bg-rose-500/10 rounded-full flex items-center justify-center mb-6">
              <FolderHeart className="w-12 h-12 text-rose-500/50" />
           </div>
           <h3 className="text-xl font-bold text-main mb-2">No bookmarks yet</h3>
           <p className="text-muted max-w-md mx-auto mb-8 leading-relaxed">
             {userType === 'worker' 
               ? "You haven't saved any jobs or companies yet. When browsing the platform, click the bookmark icon to save an item here."
               : "You haven't shortlisted any candidates yet. When viewing talent profiles, click the save button to keep track of them."}
           </p>
           <button 
             onClick={() => onNavigate?.(userType === 'worker' ? 'jobs' : 'workers')}
             className="px-8 py-3 rounded-xl bg-white/5 border border-white/10 text-main font-bold hover:bg-white/10 transition-all flex items-center gap-2 group shadow-xl shadow-black/20"
           >
             Browse {userType === 'worker' ? 'Jobs' : 'Talent'}
             <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
           </button>
        </div>
      ) : (
        <div className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
           {savedItems.map((bm) => {
             if (bm.targetType === 'job' && bm.job) {
               return <JobCard key={`bm-${bm.id}`} job={{ ...normalizeJob(bm.job), isSaved: true }} showApply={true} />;
             }
             if (bm.targetType === 'worker' && bm.worker) {
               return <WorkerCard key={`bm-${bm.id}`} worker={{ ...normalizeWorker(bm.worker), isSaved: true }} />;
             }
             if (bm.targetType === 'company' && bm.company) {
               return <CompanyCard key={`bm-${bm.id}`} company={{ ...normalizeCompany(bm.company), isSaved: true }} />;
             }
             return null;
           })}
        </div>
      )}
    </div>
  );
};

export default SavedPage;
