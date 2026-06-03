import { useState, useRef, useCallback } from 'react';
import { MapPin, Zap, Award } from 'lucide-react';
import { mockJobs, landingFeatures } from '../../data/mockData';
import { AdminLoginModal, AdminDashboard } from '../admin/AdminSystem';

const scrollToId = (id) => () => {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
};

const LandingPage = ({ onEnter }) => {
  const [showAdminDoor, setShowAdminDoor] = useState(false);
  const [adminData, setAdminData] = useState(() => {
    try {
      const stored = localStorage.getItem('admin_data');
      const token = localStorage.getItem('admin_token');
      if (stored && token) return JSON.parse(stored);
    } catch {}
    return null;
  });

  // Secret trigger: click logo 7 times within 4 seconds
  const clickCount = useRef(0);
  const resetTimer = useRef(null);

  const handleLogoClick = useCallback(() => {
    clickCount.current += 1;
    if (resetTimer.current) clearTimeout(resetTimer.current);
    resetTimer.current = setTimeout(() => { clickCount.current = 0; }, 4000);

    if (clickCount.current >= 7) {
      clickCount.current = 0;
      clearTimeout(resetTimer.current);
      setShowAdminDoor(true);
    }
  }, []);

  // If admin is logged in, show the dashboard full-screen
  if (adminData) {
    return (
      <AdminDashboard
        adminData={adminData}
        onLogout={() => {
          localStorage.removeItem('admin_token');
          localStorage.removeItem('admin_data');
          setAdminData(null);
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Secret door modal */}
      {showAdminDoor && (
        <AdminLoginModal
          onSuccess={(admin) => {
            setAdminData(admin);
            setShowAdminDoor(false);
          }}
          onClose={() => setShowAdminDoor(false)}
        />
      )}

      {/* Navigation */}
      <nav className="flex items-center justify-between px-8 py-6">
        {/* Logo — secret trigger (click 7x fast) */}
        <div
          className="flex items-center gap-3 cursor-pointer select-none"
          onClick={handleLogoClick}
          title="NearJob"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-xl">
            N
          </div>
          <span className="text-white font-bold text-2xl">NearJob</span>
        </div>
        <div className="flex gap-6">
          <button type="button" onClick={scrollToId('nearjob-audience-workers')} className="text-gray-300 hover:text-white transition">
            For Workers
          </button>
          <button type="button" onClick={scrollToId('nearjob-audience-companies')} className="text-gray-300 hover:text-white transition">
            For Companies
          </button>
          <button
            onClick={onEnter}
            className="px-6 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium hover:opacity-90 transition"
          >
            Get Started
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="container mx-auto px-8 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <h1 className="text-6xl font-bold text-white mb-6 leading-tight">
              Find Your Next <span className="gradient-text">Opportunity</span> Just Around the Corner
            </h1>
            <p className="text-xl text-gray-300 mb-8 leading-relaxed">
              Connect with top companies and talented professionals in your neighborhood.
              NearJob uses location intelligence to match the perfect opportunities with the right people.
            </p>
            <div className="flex gap-4">
              <button
                onClick={onEnter}
                className="px-8 py-4 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold text-lg hover:opacity-90 transition shadow-lg shadow-purple-500/25"
              >
                Find Jobs Near Me
              </button>
              <button
                onClick={onEnter}
                className="px-8 py-4 rounded-xl glass text-white font-semibold text-lg hover:bg-white/10 transition"
              >
                I'm Hiring
              </button>
            </div>

            {/* Stats */}
            <div className="mt-12 flex items-center gap-8">
              <div>
                <p className="text-3xl font-bold text-white">12K+</p>
                <p className="text-gray-400">Active Jobs</p>
              </div>
              <div className="w-px h-12 bg-white/20" />
              <div>
                <p className="text-3xl font-bold text-white">8K+</p>
                <p className="text-gray-400">Workers</p>
              </div>
              <div className="w-px h-12 bg-white/20" />
              <div>
                <p className="text-3xl font-bold text-white">340+</p>
                <p className="text-gray-400">Companies</p>
              </div>
            </div>
          </div>

          {/* Hero Card Preview */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-3xl blur-3xl opacity-30 animate-float" />
            <div className="relative glass rounded-3xl p-8 animate-float">
              <div className="space-y-4">
                {mockJobs.slice(0, 3).map((job) => (
                  <div key={job.id} className="bg-white/10 rounded-xl p-4 flex items-center gap-4">
                    <div className="text-3xl">{job.logo}</div>
                    <div className="flex-1">
                      <h4 className="text-white font-medium">{job.title}</h4>
                      <p className="text-gray-400 text-sm">{job.location}</p>
                    </div>
                    <span className="text-green-400 text-sm">{job.salary}</span>
                  </div>
                ))}
              </div>
              <div className="mt-6 flex items-center justify-between text-sm text-gray-400">
                <span>Live updates every 5 minutes</span>
                <span className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full" /> Online
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Audience */}
      <div className="container mx-auto px-8 py-16 grid grid-cols-1 md:grid-cols-2 gap-8">
        <div id="nearjob-audience-workers" className="glass rounded-2xl p-8 scroll-mt-24">
          <h2 className="text-2xl font-bold text-white mb-3">For workers</h2>
          <p className="text-gray-400 mb-6">
            Discover nearby roles, filter by skills, apply in one tap, and message employers when you are ready.
          </p>
          <button
            type="button"
            onClick={onEnter}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium hover:opacity-90 transition"
          >
            Create worker account
          </button>
        </div>
        <div id="nearjob-audience-companies" className="glass rounded-2xl p-8 scroll-mt-24">
          <h2 className="text-2xl font-bold text-white mb-3">For companies</h2>
          <p className="text-gray-400 mb-6">
            Publish jobs to the API, browse the talent pool, and start conversations with candidates.
          </p>
          <button
            type="button"
            onClick={onEnter}
            className="px-6 py-3 rounded-xl border border-white/20 text-white font-medium hover:bg-white/5 transition"
          >
            Create company account
          </button>
        </div>
      </div>

      {/* Features Section */}
      <div id="nearjob-features" className="container mx-auto px-8 py-20 scroll-mt-24">
        <h2 className="text-3xl font-bold text-white text-center mb-12">Why Choose NearJob?</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { icon: MapPin, title: landingFeatures[0].title, desc: landingFeatures[0].desc },
            { icon: Zap,    title: landingFeatures[1].title, desc: landingFeatures[1].desc },
            { icon: Award,  title: landingFeatures[2].title, desc: landingFeatures[2].desc },
          ].map((feature, i) => (
            <div key={i} className="glass rounded-2xl p-8 text-center card-hover">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white mx-auto mb-6">
                <feature.icon className="w-8 h-8" />
              </div>
              <h3 className="text-white font-semibold text-xl mb-3">{feature.title}</h3>
              <p className="text-gray-400">{feature.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* CTA Section */}
      <div className="container mx-auto px-8 py-20">
        <div className="glass rounded-3xl p-12 text-center">
          <h2 className="text-4xl font-bold text-white mb-4">Ready to Get Started?</h2>
          <p className="text-gray-400 text-lg mb-8 max-w-2xl mx-auto">
            Join thousands of workers and companies already using NearJob to find the perfect match.
          </p>
          <button
            onClick={onEnter}
            className="px-10 py-4 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold text-lg hover:opacity-90 transition shadow-lg shadow-purple-500/25"
          >
            Get Started Now
          </button>
        </div>
      </div>

      {/* Footer */}
      <footer className="container mx-auto px-8 py-8 border-t border-white/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3" onClick={handleLogoClick} style={{ cursor: 'default' }}>
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold">N</div>
            <span className="text-white font-bold">NearJob</span>
          </div>
          <p className="text-gray-500 text-sm">© 2024 NearJob. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;