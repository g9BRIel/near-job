import { useState, useEffect } from 'react';
import { 
  CheckCircle, Clock, TrendingUp, Users 
} from 'lucide-react';
import ChartBar from '../charts/ChartBar';
import SkillBar from '../charts/SkillBar';
import { API_BASE, authHeaders } from '../../utils/api';

const AnalyticsPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/users/global-analytics`, {
          headers: authHeaders()
        });
        if (res.ok) {
          const json = await res.json();
          setData(json.data);
        }
      } catch (err) {
        console.error('Failed to fetch analytics:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!data) return <div className="text-center p-10 text-muted">No analytics available yet.</div>;

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const maxTrend = Math.max(...data.monthlyTrends, 1);

  const platformStats = [
    { label: 'Total Matches', value: data.stats.totalMatches, icon: CheckCircle },
    { label: 'Avg. Response Time', value: data.stats.avgResponse, icon: Clock },
    { label: 'Success Rate', value: data.stats.successRate, icon: TrendingUp },
    { label: 'Active Users', value: data.stats.activeUsers, icon: Users },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass rounded-2xl p-6">
          <h3 className="text-white font-semibold mb-6 flex items-center justify-between">
            <span>Job Trends (Monthly Postings)</span>
            <span className="text-xs text-muted font-normal">Real Data</span>
          </h3>
          <div className="flex items-end gap-2 h-48">
            {data.monthlyTrends.map((val, i) => (
              <ChartBar 
                key={i} 
                height={(val / maxTrend) * 100} 
                label={months[i]} 
                active={i >= new Date().getMonth() - 2} 
              />
            ))}
          </div>
        </div>
        
        <div className="glass rounded-2xl p-6">
          <h3 className="text-white font-semibold mb-6 flex items-center justify-between">
            <span>Top Skills in Demand</span>
            <span className="text-xs text-muted font-normal">Aggregated from Workers</span>
          </h3>
          <div className="space-y-4">
            {data.topSkills.map((item, i) => (
              <SkillBar key={i} skill={item.skill} demand={item.demand} />
            ))}
          </div>
        </div>
      </div>

      <div className="glass rounded-2xl p-6">
        <h3 className="text-main font-semibold mb-6 flex items-center justify-between">
          <span>Platform Statistics</span>
          <span className="text-xs text-muted font-normal">Database Live Sync</span>
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {platformStats.map((stat, i) => (
            <div key={i} className="text-center p-4 rounded-xl bg-panel border border-main hover:border-blue-500/30 transition group">
              <div className="text-blue-400 mb-2 flex justify-center group-hover:scale-110 transition">
                <stat.icon className="w-6 h-6" />
              </div>
              <p className="text-2xl font-bold text-main mb-1">{stat.value}</p>
              <p className="text-muted text-sm">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;