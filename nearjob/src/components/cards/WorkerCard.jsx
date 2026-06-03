import { useState } from 'react';
import { MapPin, Clock, Star, Bookmark, Flag } from 'lucide-react';
import { API_BASE, authHeaders, logoKind } from '../../utils/api';
import ReportModal from '../common/ReportModal';

const WorkerCard = ({ worker, onContact }) => {
  const [saved, setSaved] = useState(worker.isSaved || false);
  const [showReport, setShowReport] = useState(false);
  const av = worker.avatar;
  const isUrl = typeof av === 'string' && logoKind(av) === 'url';

  const toggleBookmark = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Optimistic UI update
    setSaved(!saved);

    try {
      await fetch(`${API_BASE}/api/bookmarks/toggle`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ targetId: worker.id, targetType: 'worker' })
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
          <img src={av} alt="" className="w-14 h-14 rounded-full object-cover shrink-0" />
        ) : (
          <div className="text-4xl w-14 h-14 flex items-center justify-center rounded-full bg-white/5">
            {av || '👤'}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <h3 className="text-main font-semibold truncate">{worker.name}</h3>
          <p className="text-muted text-sm truncate">{worker.role}</p>
        </div>
        <div className={`px-3 py-1 rounded-full text-xs shrink-0 ${worker.available ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'}`}>
          {worker.available ? 'Available' : 'Busy'}
        </div>
      </div>

      <div className="flex items-center gap-2 text-muted text-sm mb-3">
        <MapPin className="w-4 h-4 shrink-0" />
        <span>{worker.location}</span>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        {(Array.isArray(worker.skills) ? worker.skills : []).map((skill, i) => (
          <span key={i} className="px-3 py-1 rounded-full text-xs bg-blue-500/20 text-blue-300 border border-blue-500/30">
            {skill}
          </span>
        ))}
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-main">
        <div className="flex items-center gap-4 text-sm text-muted">
          <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> {worker.experience}</span>
          <span className="flex items-center gap-1 text-yellow-500"><Star className="w-4 h-4 fill-current" /> {worker.rating}</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowReport(true)}
            className="p-2 rounded-lg bg-white/5 border border-white/5 text-muted hover:text-red-400 hover:border-red-500/30 transition-all"
            title="Report this user"
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
          {onContact ? (
            <button
              type="button"
              onClick={onContact}
              className="px-4 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 text-white text-sm font-medium hover:opacity-90 transition"
            >
              Contact
            </button>
          ) : null}
        </div>
      </div>

      {showReport && (
        <ReportModal 
          target={worker} 
          targetName={worker.name || 'Worker'} 
          onClose={() => setShowReport(false)} 
        />
      )}
    </div>
  );
};

export default WorkerCard;
