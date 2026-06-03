import { useState, useEffect } from 'react';
import {
  Briefcase, Users, TrendingUp,
  BarChart3, MapPin, Globe, FileText, 
  Activity, Star, Rocket, CheckCircle2, MessageSquare, ShieldCheck as ShieldCheck2
} from 'lucide-react';
import StatCard from '../cards/StatCard';
import ChartBar from '../charts/ChartBar';
import JobCard from '../cards/JobCard';
import WorkerCard from '../cards/WorkerCard';
import MapVisualization from '../map/MapVisualization';
import { JobCardSkeleton, WorkerCardSkeleton } from '../common/Skeleton';
import { API_BASE, normalizeJob, normalizeWorker, getTokenPayload, authHeaders } from '../../utils/api';
import { useLanguage } from '../../utils/LanguageContext';

// Global cache to prevent lagging on re-navigation
const dashboardCache = {
  data: null,
  timestamp: 0,
  userType: null
};

const Dashboard = ({ userType, userData, onNavigate, onContactCompany }) => {
  const { t } = useLanguage();
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    primary: '—',
    secondary: '—',
  });
  const [analytics, setAnalytics] = useState({
    weeklyStats: [0, 0, 0, 0, 0, 0, 0],
    label: 'Activity',
    total: 0
  });
  const [appCount, setAppCount] = useState(0);
  const [recentFeed, setRecentFeed] = useState([]);

  // Compute live profile health based on user dataset
  let profileHealth = 20; // Base rate
  const activeInsights = [];

  if (userData) {
    if (userType === 'worker') {
      if (userData.avatar) profileHealth += 20;
      else activeInsights.push({ type: 'warning', icon: <Star className="w-3.5 h-3.5 text-yellow-500" />, text: 'Add an avatar to get 3x more visibility.' });

      if (userData.bio && userData.bio.length > 5) profileHealth += 20;
      else activeInsights.push({ type: 'warning', icon: <FileText className="w-3.5 h-3.5 text-yellow-500" />, text: 'Write a bio to tell companies who you are.' });

      if (userData.skills && userData.skills.length > 0) profileHealth += 20;
      else activeInsights.push({ type: 'warning', icon: <Star className="w-3.5 h-3.5 text-yellow-500" />, text: 'Add your skills to match with local jobs.' });

      if (userData.cv) profileHealth += 20;
      else activeInsights.push({ type: 'warning', icon: <FileText className="w-3.5 h-3.5 text-yellow-500" />, text: 'Upload your CV to apply to jobs instantly.' });
    } else {
      if (userData.logo) profileHealth += 20;
      else activeInsights.push({ type: 'warning', icon: <Star className="w-3.5 h-3.5 text-yellow-500" />, text: 'Add a company logo to build trust.' });

      if (userData.about && userData.about.length > 5) profileHealth += 20;
      else activeInsights.push({ type: 'warning', icon: <FileText className="w-3.5 h-3.5 text-yellow-500" />, text: 'Fill out your about section to attract top talent.' });

      if (userData.industry) profileHealth += 20;
      else activeInsights.push({ type: 'warning', icon: <Star className="w-3.5 h-3.5 text-yellow-500" />, text: 'Specify your industry to find matching workers.' });

      if (userData.location) profileHealth += 20;
      else activeInsights.push({ type: 'warning', icon: <MapPin className="w-3.5 h-3.5 text-yellow-500" />, text: 'Add your location to appear in local searches.' });
    }
  }

  if (appCount > 0) {
    activeInsights.push({ 
      type: 'success', 
      icon: <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />,
      text: userType === 'worker' ? `Great job! You have ${appCount} active applications.` : `You received ${appCount} applications to review.` 
    });
  } else if (profileHealth >= 80) {
    activeInsights.push({ 
      type: 'success', 
      icon: <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />,
      text: `Your profile is highly optimized and visible.` 
    });
  }

  const displayInsights = activeInsights.slice(0, 2);

  useEffect(() => {
    const load = async () => {
      const now = Date.now();
      if (dashboardCache.data && dashboardCache.userType === userType && (now - dashboardCache.timestamp < 60000)) {
        const d = dashboardCache.data;
        setAppCount(d.appCount);
        setAnalytics(d.analytics);
        setCards(d.cards);
        setStats(d.stats);
        setRecentFeed(d.recentFeed);
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const [jobsRes, companiesRes, workersRes, analyticsRes, appsRes, notifRes] = await Promise.all([
          fetch(`${API_BASE}/api/jobs`),
          fetch(`${API_BASE}/api/users?userType=company`),
          fetch(`${API_BASE}/api/users?userType=worker`),
          fetch(`${API_BASE}/api/users/analytics`, {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
          }),
          fetch(`${API_BASE}/api/jobs/${userType === 'worker' ? 'my-applications' : 'company-applications'}`, {
            headers: authHeaders()
          }),
          fetch(`${API_BASE}/api/notifications`, {
            headers: authHeaders()
          })
        ]);
        const jobsRaw = await jobsRes.json();
        const companiesRaw = await companiesRes.json();
        const workersRaw = await workersRes.json();
        const analytRaw = await analyticsRes.json().catch(() => ({}));
        const appsRaw = await appsRes.json().catch(() => ({}));
        const notifRaw = await notifRes.json().catch(() => ({}));
        
        const jobList = jobsRaw?.data || jobsRaw || [];
        const companyList = companiesRaw?.data || companiesRaw || [];
        const workerList = workersRaw?.data || workersRaw || [];
        const analytData = analytRaw?.data || analytRaw || {};
        const appData = appsRaw?.data || appsRaw || [];
        const notifData = notifRaw?.data || notifRaw || [];
        const me = getTokenPayload();
        const myCompanyId = me?.id;

        let finalStats = { primary: '0', secondary: '0' };
        let finalCards = [];

        if (userType === 'worker') {
          finalCards = jobList.map(normalizeJob).filter(Boolean).slice(0, 3);
          finalStats = {
            primary: String(jobList.length),
            secondary: String(companyList.length),
          };
        } else {
          finalCards = workerList.map(normalizeWorker).filter(Boolean).slice(0, 3);
          const myJobCount = myCompanyId
            ? jobList.filter((j) => Number(j.companyId) === Number(myCompanyId)).length
            : jobList.length;
          finalStats = {
            primary: String(myJobCount),
            secondary: String(workerList.length),
          };
        }

        const cachePayload = {
          appCount: Array.isArray(appData) ? appData.length : 0,
          analytics: {
            weeklyStats: analytData.weeklyStats || [0, 0, 0, 0, 0, 0, 0],
            label: analytData.label || 'Activity',
            total: analytData.totalActivity || analytData.total || 0,
          },
          cards: finalCards,
          stats: finalStats,
          recentFeed: Array.isArray(notifData) ? notifData.slice(0, 5) : []
        };

        setAppCount(cachePayload.appCount);
        setAnalytics(cachePayload.analytics);
        setCards(cachePayload.cards);
        setStats(cachePayload.stats);
        setRecentFeed(cachePayload.recentFeed);

        dashboardCache.data = cachePayload;
        dashboardCache.timestamp = Date.now();
        dashboardCache.userType = userType;
      } catch (e) {
        console.error(e);
        setCards([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [userType]);

  return (
    <div className="space-y-6 pb-20">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={Briefcase}
          title={userType === 'worker' ? t.dashboard.stats.totalOpportunities : t.dashboard.stats.liveJobs}
          value={stats.primary}
          change={t.dashboard.stats.updatedLive}
          color="bg-blue-500"
        />
        <StatCard
          icon={Users}
          title={userType === 'worker' ? t.dashboard.stats.companies : t.dashboard.stats.activeTalent}
          value={stats.secondary}
          change={t.dashboard.stats.available}
          color="bg-purple-500"
        />
        <StatCard
          icon={FileText}
          title={userType === 'worker' ? t.dashboard.stats.myApplications : t.dashboard.stats.allApplicants}
          value={String(appCount)}
          change={t.dashboard.stats.newToday}
          color="bg-green-500"
        />
        <StatCard
          icon={TrendingUp}
          title={t.dashboard.stats.activityScore}
          value={String(analytics.total)}
          change={t.dashboard.stats.interactions}
          color="bg-pink-500"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 glass rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-main font-semibold flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-blue-400" /> {t.dashboard.sections.performance}
            </h3>
            <span className="text-xs text-muted">{t.dashboard.sections.momentum}</span>
          </div>
          <div className="flex items-end gap-2 h-40">
            {analytics.weeklyStats.map((val, i) => {
              const max = Math.max(...analytics.weeklyStats, 1);
              return (
                <ChartBar
                  key={i}
                  height={(val / max) * 100}
                  label={(() => {
                    const d = new Date();
                    d.setDate(d.getDate() - (6 - i));
                    return d.toLocaleDateString([], { weekday: 'short' });
                  })()}
                  active={i === 6}
                />
              );
            })}
          </div>
        </div>

        <div className="glass rounded-2xl p-6 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Rocket className="w-16 h-16 text-blue-500" />
          </div>
          <h3 className="text-main font-semibold mb-4 flex items-center gap-2">
            <Activity className="w-5 h-5 text-blue-400" /> {t.dashboard.sections.insights}
          </h3>
          <div className="space-y-4">
            <div className="p-3 rounded-xl bg-white/5 border border-white/5">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold text-blue-400 uppercase tracking-wider">{t.dashboard.insights.profileHealth}</span>
                <span className="text-xs text-main">{profileHealth}%</span>
              </div>
              <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-1000" 
                  style={{ width: `${profileHealth}%` }} 
                />
              </div>
            </div>
            
            <div className="space-y-2">
              {displayInsights.length === 0 ? (
                <p className="text-xs text-muted">{t.dashboard.insights.collecting}</p>
              ) : (
                displayInsights.map((insight, idx) => (
                  <div key={idx} className="flex items-start gap-3 p-2">
                    <div className={`p-1.5 rounded-lg ${insight.type === 'success' ? 'bg-green-500/20' : 'bg-yellow-500/20'}`}>
                      {insight.icon}
                    </div>
                    <p className="text-xs text-muted leading-relaxed">
                      {insight.text}
                    </p>
                  </div>
                ))
              )}
            </div>
            <button 
              onClick={() => onNavigate?.('edit')}
              className="w-full py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs font-bold text-main hover:bg-white/10 transition"
            >
              {t.dashboard.insights.optimize}
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <h3 className="text-main font-semibold mb-4 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-red-400" /> {t.dashboard.sections.matches}
          </h3>
          <div className="space-y-4">
            {loading ? (
              userType === 'worker' ? <JobCardSkeleton /> : <WorkerCardSkeleton />
            ) : cards.length === 0 ? (
              <p className="text-muted text-sm italic">{t.dashboard.insights.initializing}</p>
            ) : (
              cards.map((item) =>
                userType === 'worker' ? (
                  <JobCard key={item.id} job={item} showApply />
                ) : (
                  <WorkerCard key={item.id} worker={item} />
                )
              )
            )}
          </div>
        </div>

        <div>
           <h3 className="text-main font-semibold mb-4 flex items-center gap-2">
            <Activity className="w-5 h-5 text-purple-400" /> {t.dashboard.sections.actionFeed}
          </h3>
          <div className="glass rounded-2xl overflow-hidden border border-white/5">
            <div className="divide-y divide-white/5">
              {recentFeed.length === 0 ? (
                <div className="p-10 text-center text-sm text-muted">
                  <Activity className="w-8 h-8 mx-auto mb-2 opacity-20" />
                  {t.dashboard.insights.noActivity}
                </div>
              ) : (
                recentFeed.map((notif, i) => {
                  const Icon = notif.type === 'message' ? MessageSquare : 
                               notif.type === 'application' ? FileText :
                               notif.type === 'pardon' ? ShieldCheck2 :
                               notif.type === 'job' ? Briefcase : Activity;
                  
                  return (
                    <div key={notif.id || i} className="p-5 flex items-start gap-4 hover:bg-white/[0.03] transition-all group cursor-default">
                      <div className={`mt-1 p-2 rounded-xl border ${
                        notif.type === 'pardon' ? 'bg-amber-500/10 border-amber-500/20 text-amber-500' :
                        notif.type === 'message' ? 'bg-blue-500/10 border-blue-500/20 text-blue-500' :
                        notif.type === 'application' ? 'bg-purple-500/10 border-purple-500/20 text-purple-500' :
                        'bg-white/5 border-white/10 text-slate-400'
                      }`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <p className="text-xs font-black uppercase tracking-widest text-slate-500">
                            {notif.type || 'System'}
                          </p>
                          <span className="text-[10px] text-slate-600 font-bold whitespace-nowrap">
                            {notif.createdAt ? new Date(notif.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' }) : 'Delta'}
                          </span>
                        </div>
                        <p className="text-sm font-medium text-slate-200 leading-snug">
                          {notif.message || notif.content || 'Sector Alert'}
                        </p>
                      </div>
                      {!notif.isRead && (
                        <div className="mt-1 w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.8)]" />
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {userType === 'worker' && (
            <div className="mt-8">
              <h3 className="text-main font-semibold mb-4 flex items-center gap-2">
                <Globe className="w-5 h-5 text-emerald-400" /> {t.dashboard.sections.landscape}
              </h3>
              <MapVisualization onContact={onContactCompany} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
