import { useState } from 'react';
import { MapPin, DollarSign, Briefcase, Star, CheckCircle, Bookmark, Flag } from 'lucide-react';
import { API_BASE, authHeaders, logoKind } from '../../utils/api';
import ReportModal from '../common/ReportModal';

const JobCard = ({ job, showApply = true }) => {
  const [applied, setApplied] = useState(job.isApplied || false);
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(job.isSaved || false);
  const [showReport, setShowReport] = useState(false);

  const toggleBookmark = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Optimistic UI update
    setSaved(!saved);

    try {
      await fetch(`${API_BASE}/api/bookmarks/toggle`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ targetId: job.id, targetType: 'job' })
      });
    } catch (err) {
      // Revert on fail
      console.error('Failed to toggle bookmark', err);
      setSaved(saved);
    }
  };

  const handleApply = async (e) => {
    e?.preventDefault();
    if (!showApply || applied || busy || !job?.id) return;
    
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Sign in to apply.');
      return;
    }

    setBusy(true);
    try {
      const res = await fetch(`${API_BASE}/api/jobs/${job.id}/apply`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ coverLetter: '' })
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        setApplied(true);
      } else {
        alert(data.message || 'Could not submit application');
      }
    } catch (e) {
      console.error(e);
      alert('Network error — is the API running?');
    } finally {
      setBusy(false);
    }
  };

  const logo = job.logo;
  const isUrl = logoKind(logo) === 'url';

  return (
    <>
      <div className="glass rounded-lg sm:rounded-xl md:rounded-2xl p-3 sm:p-4 md:p-6 card-hover nearby-card">
        <div className="flex items-start justify-between mb-2 sm:mb-3 md:mb-4">
          <div className="flex items-center gap-2 sm:gap-3">
            {isUrl ? (
              <img src={logo} alt="" className="w-10 sm:w-12 h-10 sm:h-12 rounded-lg sm:rounded-xl object-cover shrink-0" />
            ) : (
              <div className="text-2xl sm:text-3xl">{logo || '💼'}</div>
            )}
            <div>
              <h3 className="text-main font-semibold text-base sm:text-lg">{job.title}</h3>
              <p className="text-muted text-xs sm:text-sm">{job.companyName || job.company}</p>
            </div>
          </div>
          <span className="text-green-400 text-[10px] sm:text-xs font-medium">{job.posted}</span>
        </div>

        <div className="flex items-center gap-2 text-muted text-xs sm:text-sm mb-2 sm:mb-3">
          <MapPin className="w-3 sm:w-4 h-3 sm:h-4 shrink-0" />
          <span>{job.location}</span>
        </div>

        <div className="flex items-center gap-2 sm:gap-4 text-[11px] sm:text-sm mb-3 sm:mb-4">
          <span className="text-purple-400 font-medium flex items-center gap-1">
            <DollarSign className="w-3 sm:w-4 h-3 sm:h-4" /> {job.salary}
          </span>
          <span className="text-blue-400 flex items-center gap-1">
            <Briefcase className="w-3 sm:w-4 h-3 sm:h-4" /> {job.type}
          </span>
        </div>

        <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-3 sm:mb-4">
          {(job.tags || []).map((tag, i) => (
            <span key={i} className="px-2 py-0.5 sm:px-3 sm:py-1 rounded-full text-[9px] sm:text-xs bg-panel text-muted border border-main">
              {tag}
            </span>
          ))}
        </div>

        <div className="flex items-center justify-between pt-3 sm:pt-4 border-t border-main">
          <div className="flex items-center gap-0.5 text-yellow-500">
            <Star className="w-3 sm:w-4 h-3 sm:h-4 fill-current" />
            <span className="text-xs sm:text-sm font-medium text-main">{job.rating}</span>
            <span className="text-muted text-[9px] sm:text-xs">({job.applicants})</span>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2 md:gap-3 w-full justify-end">
            <button
              onClick={() => setShowReport(true)}
              className="p-1.5 sm:p-2 md:p-3 rounded-lg sm:rounded-xl bg-white/5 border border-white/5 text-muted hover:text-red-400 hover:border-red-500/20 hover:bg-red-500/5 transition-all touch-target"
              title="Report this job"
            >
              <Flag className="w-3.5 sm:w-4 md:w-5 h-3.5 sm:h-4 md:h-5" />
            </button>
            <button
              onClick={toggleBookmark}
              className={`p-1.5 sm:p-2 md:p-3 rounded-lg sm:rounded-xl border transition-all duration-300 touch-target ${saved ? 'bg-rose-500/10 border-rose-500/30 text-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.15)]' : 'bg-white/5 border-white/5 text-muted hover:text-rose-400 hover:border-rose-500/20 hover:bg-rose-500/5'}`}
              title="Save to Bookmarks"
            >
              <Bookmark className={`w-3.5 sm:w-4 md:w-5 h-3.5 sm:h-4 md:h-5 ${saved ? 'fill-current' : ''}`} />
            </button>
            {showApply ? (
              <button
                type="button"
                onClick={handleApply}
                disabled={applied || busy}
                className={`flex-1 sm:flex-none px-3 sm:px-6 py-1.5 sm:py-2.5 md:py-3 rounded-lg sm:rounded-xl text-[11px] sm:text-sm font-bold transition-all duration-300 touch-target btn-mobile ${applied ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-600/20 active:scale-95'} disabled:opacity-70`}
              >
                {applied ? (
                  <span className="flex items-center justify-center gap-1 sm:gap-2 font-bold"><CheckCircle className="w-3 sm:w-4 h-3 sm:h-4" /> <span className="hidden sm:inline">Applied</span></span>
                ) : busy ? (
                  '...'
                ) : (
                  <span className="hidden sm:inline">Apply Now</span>
                )}
              </button>
            ) : null}
          </div>
        </div>
      </div>

      {showReport && (
        <ReportModal 
          target={job} 
          targetName={job.title || 'Job Listing'} 
          onClose={() => setShowReport(false)} 
        />
      )}
    </>
  );
};

export default JobCard;
