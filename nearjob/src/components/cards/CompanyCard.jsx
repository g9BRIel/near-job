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
    <div className="glass rounded-2xl p-6 card-hover nearby-card">
      <div className="flex items-center gap-4 mb-4">
        {isUrl ? (
          <img src={logo} alt="" className="w-12 h-12 rounded-xl object-cover shrink-0" />
        ) : (
          <div className="text-3xl">{logo || '🏢'}</div>
        )}
        <div className="flex-1 min-w-0">
          <h3 className="text-white font-semibold text-lg truncate">{company.name}</h3>
          <p className="text-gray-400 text-sm truncate">{company.industry}</p>
        </div>
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex justify-between text-sm gap-2">
          <span className="text-gray-400 shrink-0">Location</span>
          <span className="text-white text-right">{company.location}{company.distance ? ` · ${company.distance}` : ''}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-400">Size</span>
          <span className="text-white">{company.employees}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-400">Open jobs</span>
          <span className="text-blue-400 font-medium">
            {typeof company.openJobs === 'number' ? `${company.openJobs} positions` : company.openJobs}
          </span>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between pt-4 border-t border-white/10 gap-3">
        <div className="flex items-center gap-1 text-yellow-400">
          <Star className="w-4 h-4 fill-current" />
          <span className="text-sm font-medium">{company.rating}</span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowReport(true)}
            className="p-2 rounded-lg bg-white/5 border border-white/5 text-muted hover:text-red-400 hover:border-red-500/30 transition-all"
            title="Report this company"
          >
            <Flag className="w-4 h-4" />
          </button>
          <button
            onClick={toggleBookmark}
            className={`p-2 rounded-lg border transition-all ${saved ? 'bg-rose-500/10 border-rose-500/30 text-rose-500' : 'bg-white/5 border-white/5 text-muted hover:text-rose-400'}`}
            title="Save to bookmarks"
          >
            <Bookmark className={`w-4 h-4 ${saved ? 'fill-current' : ''}`} />
          </button>
          {onViewJobs ? (
            <button
              type="button"
              onClick={() => onViewJobs(company)}
              className="px-4 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 text-white text-sm font-medium hover:opacity-90 transition"
            >
              View Jobs
            </button>
          ) : null}
          {onContact ? (
            <button
              type="button"
              onClick={() => onContact(company)}
              className="px-4 py-2 rounded-lg border border-white/10 text-white text-sm font-medium hover:bg-white/10 transition"
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
