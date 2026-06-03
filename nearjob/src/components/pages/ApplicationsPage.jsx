import { useState, useEffect, useCallback } from 'react';
import { 
  CheckCircle, XCircle, Clock, FileText, Download, 
  MessageSquare, User, Briefcase, MapPin, Search
} from 'lucide-react';
import { API_BASE, authHeaders } from '../../utils/api';
import StarRating from '../common/StarRating';

const ApplicationsPage = ({ userType, onNavigate }) => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, pending, accepted, rejected
  const [searchTerm, setSearchTerm] = useState('');

  const fetchApplications = useCallback(async () => {
    setLoading(true);
    try {
      const endpoint = userType === 'worker' 
        ? `${API_BASE}/api/jobs/my-applications`
        : `${API_BASE}/api/jobs/company-applications`;
      
      const res = await fetch(endpoint, { headers: authHeaders() });
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      setApplications(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setApplications([]);
    } finally {
      setLoading(false);
    }
  }, [userType]);

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  const handleUpdateStatus = async (appId, newStatus) => {
    try {
      const res = await fetch(`${API_BASE}/api/jobs/applications/${appId}/status`, {
        method: 'PUT',
        headers: authHeaders(),
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        setApplications(prev => prev.map(app => 
          app.id === appId ? { ...app, status: newStatus } : app
        ));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const filteredApps = applications.filter(app => {
    if (filter !== 'all' && app.status !== filter) return false;
    
    if (userType === 'worker') {
      const searchMatch = app.job?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          app.job?.companyUser?.companyName?.toLowerCase().includes(searchTerm.toLowerCase());
      return searchMatch;
    } else {
      const searchMatch = app.worker?.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          app.job?.title?.toLowerCase().includes(searchTerm.toLowerCase());
      return searchMatch;
    }
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case 'accepted': 
        return <span className="flex items-center gap-1 text-green-400 bg-green-400/10 px-3 py-1 rounded-full text-xs font-medium"><CheckCircle className="w-3 h-3" /> Accepted</span>;
      case 'rejected':
        return <span className="flex items-center gap-1 text-red-400 bg-red-400/10 px-3 py-1 rounded-full text-xs font-medium"><XCircle className="w-3 h-3" /> Rejected</span>;
      default:
        return <span className="flex items-center gap-1 text-amber-400 bg-amber-400/10 px-3 py-1 rounded-full text-xs font-medium"><Clock className="w-3 h-3" /> Pending</span>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="glass rounded-2xl p-6">
        <h2 className="text-2xl font-bold text-white mb-2">
          {userType === 'worker' ? 'My Job Applications' : 'Job Applications Received'}
        </h2>
        <p className="text-gray-400 mb-6">
          {userType === 'worker' 
            ? 'Track the status of roles you have applied for.' 
            : 'Review candidates who applied for your listings.'}
        </p>

        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="text"
              placeholder={userType === 'worker' ? "Search jobs or companies..." : "Search candidates or positions..."}
              className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white outline-none focus:border-blue-500/50 transition"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-2 p-1 bg-white/5 rounded-xl border border-white/10">
            {['all', 'pending', 'accepted', 'rejected'].map(t => (
              <button
                key={t}
                onClick={() => setFilter(t)}
                className={`px-4 py-1.5 rounded-lg text-sm capitalize transition ${filter === t ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'text-gray-400 hover:text-white'}`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-40 bg-white/5 animate-pulse rounded-2xl" />
            ))}
          </div>
        ) : filteredApps.length === 0 ? (
          <div className="py-12 text-center text-gray-400">
            <FileText className="w-12 h-12 mx-auto mb-4 opacity-20" />
            <p>No applications found matching your criteria.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {filteredApps.map(app => (
              <div key={app.id} className="glass rounded-2xl p-6 border border-white/5 hover:border-white/10 transition">
                <div className="flex flex-col md:flex-row justify-between gap-6">
                  {/* Left Side: Info */}
                  <div className="flex gap-4">
                    {userType === 'worker' ? (
                      <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0 flex items-center justify-center bg-blue-600/20 text-2xl">
                        {app.job?.logo && (app.job.logo.startsWith('http') || app.job.logo.startsWith('data:')) ? (
                          <img src={app.job.logo} alt="" className="w-full h-full object-cover" />
                        ) : (
                          app.job?.logo || '🏢'
                        )}
                      </div>
                    ) : (
                      <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0">
                        {app.worker?.avatar ? (
                          <img src={app.worker.avatar} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full bg-purple-600/20 flex items-center justify-center text-xl text-purple-400">
                            {app.worker?.fullName?.charAt(0) || <User className="w-6 h-6" />}
                          </div>
                        )}
                      </div>
                    )}
                    <div>
                      <h3 className="text-lg font-bold text-white mb-1">
                        {userType === 'worker' ? app.job?.title : app.worker?.fullName}
                      </h3>
                      <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-sm text-gray-400">
                        <span className="flex items-center gap-1">
                          {userType === 'worker' 
                            ? <><Briefcase className="w-3.5 h-3.5" /> {app.job?.companyUser?.companyName}</>
                            : <><Briefcase className="w-3.5 h-3.5" /> {app.job?.title}</>}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5" /> 
                          {userType === 'worker' ? app.job?.location : app.worker?.location}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" /> 
                          Applied {new Date(app.createdAt || app.appliedAt).toLocaleDateString()}
                        </span>
                      </div>
                      
                      {userType === 'company' && Array.isArray(app.worker?.skills) && app.worker.skills.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-3">
                          {app.worker.skills.slice(0, 5).map((skill, si) => (
                            <span key={si} className="text-[10px] px-2 py-0.5 rounded-full bg-blue-400/10 text-blue-400 border border-blue-400/20">
                              {skill}
                            </span>
                          ))}
                          {app.worker.skills.length > 5 && <span className="text-[10px] text-gray-500">+{app.worker.skills.length - 5} more</span>}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right Side: Status/Actions */}
                  <div className="flex flex-col items-end gap-3 self-center sm:self-start md:self-center">
                    {getStatusBadge(app.status)}
                    
                    <div className="flex gap-2">
                    {userType === 'company' && (
                      <>
                        <button 
                          onClick={() => handleUpdateStatus(app.id, 'accepted')}
                          disabled={app.status === 'accepted'}
                          className="p-2 rounded-lg bg-green-500/10 text-green-400 hover:bg-green-500/20 transition disabled:opacity-30"
                          title="Accept Applicant"
                        >
                          <CheckCircle className="w-5 h-5" />
                        </button>
                        <button 
                          onClick={() => handleUpdateStatus(app.id, 'rejected')}
                          disabled={app.status === 'rejected'}
                          className="p-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition disabled:opacity-30"
                          title="Reject Applicant"
                        >
                          <XCircle className="w-5 h-5" />
                        </button>
                      </>
                    )}
                    
                    {userType === 'company' && (app.worker?.cv || app.resume) && (
                      <a 
                        href={app.worker?.cv || app.resume}
                        target="_blank"
                        rel="noreferrer"
                        className="p-2 rounded-lg bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 transition"
                        title="Download CV"
                      >
                        <Download className="w-5 h-5" />
                      </a>
                    )}
                    
                    <button 
                      onClick={() => onNavigate?.('messages', { 
                        id: userType === 'worker' ? app.job?.companyId : app.worker?.id, 
                        name: userType === 'worker' ? app.job?.companyUser?.companyName : app.worker?.fullName,
                        type: userType === 'worker' ? 'company' : 'worker'
                      })}
                      className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-gray-300 hover:bg-white/10 transition text-sm"
                    >
                      <MessageSquare className="w-4 h-4" /> {userType === 'company' ? 'Chat' : 'Contact'}
                    </button>
                    </div>

                    {userType === 'worker' && (
                      <div className="mt-2 border-t border-white/5 pt-2 flex items-center justify-between">
                         <span className="text-[10px] text-gray-500 uppercase tracking-tighter font-bold">Experience Feedback:</span>
                         <StarRating 
                           toId={app.job?.companyId} 
                           toType="company" 
                         />
                      </div>
                    )}
                  </div>
                </div>
                
                {app.coverLetter?.trim() && (
                  <div className="mt-4 pt-4 border-t border-white/5">
                    <p className="text-xs text-gray-500 uppercase tracking-widest mb-2 font-bold">
                      Your Cover Letter
                    </p>
                    <p className="text-sm text-gray-300 italic whitespace-pre-wrap">
                      &ldquo;{app.coverLetter}&rdquo;
                    </p>
                  </div>
                )}
                {userType === 'company' && app.worker?.bio && !app.worker.bio.startsWith('data:') && app.worker.bio.trim() && (
                  <div className="mt-4 pt-4 border-t border-white/5">
                    <p className="text-xs text-gray-500 uppercase tracking-widest mb-2 font-bold">
                      Candidate Bio
                    </p>
                    <p className="text-sm text-gray-300 italic whitespace-pre-wrap">
                      &ldquo;{app.worker.bio}&rdquo;
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ApplicationsPage;
