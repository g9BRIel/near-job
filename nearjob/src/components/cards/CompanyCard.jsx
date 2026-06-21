import { useState } from 'react';
import { Star, Bookmark, Flag } from 'lucide-react';
import { API_BASE, authHeaders, logoKind } from '../../utils/api';
import ReportModal from '../common/ReportModal';

const CompanyCard = ({ company, onViewJobs, onContact }) => {
  const [saved, setSaved] = useState(company.isSaved || false);
  const [showReport, setShowReport] = useState(false);
  const logo = company.logo;
  const isUrl = logoKind(logo) === 'url';

  const toggleBookmark = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Optimistic UI update
    setSaved(!saved);

    try {
      await fetch(`${API_BASE}/api/bookmarks/toggle`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ targetId: company.id, targetType: 'company' })
      });
    } catch (err) {
      // Revert on fail
      console.error('Failed to toggle bookmark', err);
      setSaved(saved);
    }
  };

  return (
    <div className="glass rounded-lg sm:rounded-xl md:rounded-2xl p-3 sm:p-4 md:p-6 card-hover nearby-card">
      <div className="flex items-center gap-2 sm:gap-3 md:gap-4 mb-3 sm:mb-4">
        {isUrl ? (
          <img src={logo} alt="" className="w-10 sm:w-12 h-10 sm:h-12 rounded-lg sm:rounded-xl object-cover shrink-0" />
        ) : (
          <div className="text-2xl sm:text-3xl">{logo || '🏢'}</div>
        )}
        <div className="flex-1 min-w-0">
          <h3 className="text-white font-semibold text-base sm:text-lg truncate">{company.name}</h3>
          <p className="text-gray-400 text-xs sm:text-sm truncate">{company.industry}</p>
        </div>
      </div>

      <div className="space-y-1.5 sm:space-y-2 mb-3 sm:mb-4">
        <div className="flex justify-between text-[11px] sm:text-sm gap-2">
          <span className="text-gray-400 shrink-0">Location</span>
          <span className="text-white text-right">{company.location}{company.distance ? ` · ${company.distance}` : ''}</span>
        </div>
        <div className="flex justify-between text-[11px] sm:text-sm">
          <span className="text-gray-400">Size</span>
          <span className="text-white">{company.employees}</span>
        </div>
        <div className="flex justify-between text-[11px] sm:text-sm">
          <span className="text-gray-400">Open jobs</span>
          <span className="text-blue-400 font-medium">
            {typeof company.openJobs === 'number' ? `${company.openJobs}` : company.openJobs}
          </span>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between pt-3 sm:pt-4 border-t border-white/10 gap-2 sm:gap-3">
        <div className="flex items-center gap-1 text-yellow-400">
          <Star className="w-3 sm:w-4 h-3 sm:h-4 fill-current" />
          <span className="text-xs sm:text-sm font-medium">{company.rating}</span>
        </div>
        <div className="flex items-center gap-1.5 sm:gap-2 md:gap-3 w-full sm:w-auto justify-end">
          <button
            onClick={() => setShowReport(true)}
            className="p-1.5 sm:p-2 rounded-lg bg-white/5 border border-white/5 text-muted hover:text-red-400 hover:border-red-500/30 transition-all touch-target"
            title="Report this company"
          >
            <Flag className="w-3.5 sm:w-4 h-3.5 sm:h-4" />
          </button>
          <button
            onClick={toggleBookmark}
            className={`p-1.5 sm:p-2 rounded-lg border transition-all touch-target ${saved ? 'bg-rose-500/10 border-rose-500/30 text-rose-500' : 'bg-white/5 border-white/5 text-muted hover:text-rose-400'}`}
            title="Save to bookmarks"
          >
            <Bookmark className={`w-3.5 sm:w-4 h-3.5 sm:h-4 ${saved ? 'fill-current' : ''}`} />
          </button>
          {onViewJobs ? (
            <button
              type="button"
              onClick={() => onViewJobs(company)}
              className="flex-1 sm:flex-none px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 text-white text-xs sm:text-sm font-medium hover:opacity-90 transition touch-target btn-mobile"
            >
              <span className="hidden sm:inline">View Jobs</span>
              <span className="inline sm:hidden">Jobs</span>
            </button>
          ) : null}
          {onContact ? (
            <button
              type="button"
              onClick={() => onContact(company)}
              className="flex-1 sm:flex-none px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg border border-white/10 text-white text-xs sm:text-sm font-medium hover:bg-white/10 transition touch-target btn-mobile"
            >
              Contact
            </button>
          ) : null}
        </div>
      </div>

      {showReport && (
        <ReportModal 
          target={company} 
          targetName={company.name || 'Company'} 
          onClose={() => setShowReport(false)} 
        />
      )}
    </div>
  );
};

export default CompanyCard;
