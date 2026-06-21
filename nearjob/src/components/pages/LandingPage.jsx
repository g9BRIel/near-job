import { useState, useRef, useCallback } from 'react';
import { MapPin, Zap, Award } from 'lucide-react';
import { mockJobs, landingFeatures } from '../../data/mockData';
import { AdminLoginModal, AdminDashboard } from '../admin/AdminSystem';

const scrollToId = (id) => () => {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
};

const LandingPage = ({ onEnter }) => {
  const [showAdminDoor, setShowAdminDoor] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
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
    <div className="min-h-screen bg-[#0f172a] selection:bg-indigo-500/30 selection:text-indigo-200">
      {/* Background Orbs for WOW factor */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-600/20 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/20 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

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

                <nav className="fixed top-0 left-0 right-0 z-[100] backdrop-blur-md bg-slate-900/40 border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          {/* Logo */}
          <div
            className="flex items-center gap-3 cursor-pointer select-none group"
            onClick={handleLogoClick}
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 p-[2px]">
              <div className="w-full h-full bg-slate-900 rounded-[10px] flex items-center justify-center">
                <img src="/mynearjoblogo.png" alt="Logo" className="w-6 h-6 object-contain" />
              </div>
            </div>
            <span className="text-white font-black text-xl tracking-tight">Near<span className="text-indigo-400">Job</span></span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex gap-8 items-center">
            <button type="button" onClick={scrollToId('nearjob-audience-workers')} className="text-sm font-medium text-gray-400 hover:text-white transition">
              For Workers
            </button>
            <button type="button" onClick={scrollToId('nearjob-audience-companies')} className="text-sm font-medium text-gray-400 hover:text-white transition">
              For Companies
            </button>
            <div className="w-px h-4 bg-white/10" />
            <button
              onClick={onEnter}
              className="px-5 py-2.5 rounded-full bg-white text-slate-900 text-sm font-bold hover:bg-gray-100 transition shadow-[0_0_20px_rgba(255,255,255,0.1)]"
            >
              Get Started
            </button>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            className="lg:hidden text-white p-2 rounded-xl hover:bg-white/5 transition"
            onClick={() => setShowMobileMenu(!showMobileMenu)}
          >
            {showMobileMenu ? (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            ) : (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
            )}
          </button>
        </div>

        {/* Mobile Navigation Overlay */}
        {showMobileMenu && (
          <div className="lg:hidden fixed inset-0 bg-slate-900/98 backdrop-blur-2xl z-40 flex flex-col items-center justify-center p-8 gap-8 animate-in fade-in zoom-in duration-300">
            <button onClick={() => { scrollToId('nearjob-audience-workers')(); setShowMobileMenu(false); }} className="text-3xl text-white font-bold">For Workers</button>
            <button onClick={() => { scrollToId('nearjob-audience-companies')(); setShowMobileMenu(false); }} className="text-3xl text-white font-bold">For Companies</button>
            <button
              onClick={() => { onEnter(); setShowMobileMenu(false); }}
              className="w-full py-5 rounded-2xl premium-gradient text-white font-black text-xl premium-shadow"
            >
              Get Started
            </button>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="relative z-10 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-bold uppercase tracking-widest mb-6">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
              </span>
              Now Live in Your Neighborhood
            </div>
            <h1 className="text-5xl md:text-7xl font-black text-white mb-8 leading-[1.1] tracking-tight">
              Hyper-Local <br/>
              <span className="gradient-text">Job Matching</span>
            </h1>
            <p className="text-lg md:text-xl text-gray-400 mb-10 leading-relaxed max-w-xl mx-auto lg:mx-0">
              NearJob connects the brightest talent with the best local companies within a 5-mile radius. Fast, proximity-based, and zero friction.
            </p>
            <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start">
              <button
                onClick={onEnter}
                className="w-full sm:w-auto px-8 py-4 rounded-2xl premium-gradient text-white font-bold text-lg premium-shadow active:scale-95 transition"
              >
                Find Jobs Near Me
              </button>
              <button
                onClick={onEnter}
                className="w-full sm:w-auto px-8 py-4 rounded-2xl glass-morphism text-white font-bold text-lg hover:bg-white/10 active:scale-95 transition"
              >
                Post a Job
              </button>
            </div>

            {/* Premium Stats */}
            <div className="mt-16 pt-8 border-t border-white/5 grid grid-cols-3 gap-8">
              <div>
                <p className="text-3xl font-black text-white">12.5k</p>
                <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mt-1">Live Posts</p>
              </div>
              <div>
                <p className="text-3xl font-black text-white">400+</p>
                  <img src="/mynearjoblogo.png" alt="Logo" className="w-5 h-5 object-contain" />
              </div>
              <div>
                <p className="text-3xl font-black text-white">98%</p>
                <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mt-1">Match Rate</p>
              </div>
            </div>
          </div>

          {/* Hero Card Preview - WOW Desktop Visual */}
          <div className="hidden lg:block relative">
            <div className="absolute inset-0 bg-indigo-500/30 blur-[100px] rounded-full animate-float" />
            <div className="relative glass-morphism rounded-[2.5rem] p-10 rotate-3 hover:rotate-0 transition-transform duration-700">
              <div className="space-y-4">
                {mockJobs.slice(0, 3).map((job, idx) => (
                  <div key={job.id} className="bg-slate-900/60 backdrop-blur-md rounded-3xl p-5 border border-white/5 flex items-center gap-5 translate-x-4 hover:translate-x-0 transition-transform" style={{ transitionDelay: `${idx * 100}ms` }}>
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-500/20 to-purple-500/20 flex items-center justify-center text-3xl shadow-inner">
                      {job.logo}
                    </div>
                    <div className="flex-1">
                      <h4 className="text-white font-black">{job.title}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        <MapPin className="w-3 h-3 text-indigo-400" />
                        <span className="text-gray-400 text-xs font-medium">{job.location}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-indigo-400 text-sm font-bold">{job.salary}</span>
                      <p className="text-[10px] text-gray-500 font-bold uppercase mt-1">Nearby</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-8 flex items-center justify-between">
                <div className="flex -space-x-3">
                  {[1, 2, 3, 4].map(i => (
                    <div key={i} className="w-10 h-10 rounded-full border-2 border-slate-900 bg-slate-800 flex items-center justify-center text-[10px] text-white font-bold overflow-hidden">
                      <img src={`https://i.pravatar.cc/100?u=${i}`} alt="Avatar" />
                    </div>
                  ))}
                  <div className="w-10 h-10 rounded-full border-2 border-slate-900 bg-slate-800 flex items-center justify-center text-[10px] text-white font-bold">+2k</div>
                </div>
                <div className="px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-black uppercase tracking-widest">
                  Live Stream Active
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Audience Section */}
      <section className="py-20 bg-slate-900/30">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-8">
          <div id="nearjob-audience-workers" className="relative group overflow-hidden glass-morphism rounded-[2.5rem] p-10 md:p-12 scroll-mt-32">
            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
              <Zap className="w-32 h-32 text-indigo-400" />
            </div>
            <h2 className="text-3xl font-black text-white mb-6">Elevate Your Career</h2>
            <p className="text-gray-400 mb-8 leading-relaxed text-lg">
              Unlock personalized job matches based on your skills, proximity, and preferences. Get hired faster with our direct employer chat.
            </p>
            <ul className="space-y-3 mb-10">
              {['Hyper-local matching', 'Instant chat with CEOs', 'One-tap applications'].map(item => (
                <li key={item} className="flex items-center gap-3 text-sm text-gray-300 font-medium">
                  <div className="w-5 h-5 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400 text-xs">✓</div>
                  {item}
                </li>
              ))}
            </ul>
            <button
              onClick={onEnter}
              className="w-full py-4 rounded-2xl bg-white text-slate-900 font-bold hover:bg-gray-100 transition shadow-xl"
            >
              Sign Up as Worker
            </button>
          </div>

          <div id="nearjob-audience-companies" className="relative group overflow-hidden bg-gradient-to-br from-indigo-600 to-purple-700 rounded-[2.5rem] p-10 md:p-12 text-white scroll-mt-32 shadow-2xl">
            <div className="absolute top-0 right-0 p-8 opacity-10">
              <Award className="w-32 h-32 text-white" />
            </div>
            <h2 className="text-3xl font-black mb-6">Find Local Talent</h2>
            <p className="text-indigo-100 mb-8 leading-relaxed text-lg">
              Reach thousands of qualified workers in your city. Post jobs, manage applications, and hire in days, not weeks.
            </p>
            <ul className="space-y-3 mb-10">
              {['Proximity-based talent search', 'AI-powered candidate screening', 'Full application management'].map(item => (
                <li key={item} className="flex items-center gap-3 text-sm text-indigo-100 font-medium">
                  <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-white text-xs">✓</div>
                  {item}
                </li>
              ))}
            </ul>
            <button
              onClick={onEnter}
              className="w-full py-4 rounded-2xl bg-slate-900 text-white font-bold hover:bg-slate-800 transition shadow-xl"
            >
              Join as Employer
            </button>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="nearjob-features" className="py-32 scroll-mt-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-20">
            <h2 className="text-4xl md:text-5xl font-black text-white mb-6">Built for the <span className="text-indigo-400">Future</span></h2>
            <p className="text-gray-400 text-lg">We leveraged cutting-edge tech to solve the oldest problem: finding work where you live.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {landingFeatures.map((feature, i) => (
              <div key={i} className="glass-morphism rounded-3xl p-10 hover:translate-y-[-8px] transition-all group">
                <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-8 group-hover:scale-110 transition-transform">
                  {i === 0 ? <MapPin className="w-6 h-6" /> : i === 1 ? <Zap className="w-6 h-6" /> : <Award className="w-6 h-6" />}
                </div>
                <h3 className="text-xl font-bold text-white mb-4">{feature.title}</h3>
                <p className="text-gray-500 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="max-w-5xl mx-auto px-6">
          <div className="relative overflow-hidden rounded-[3rem] p-12 md:p-20 text-center premium-gradient premium-shadow">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10 pointer-events-none" />
            <h2 className="text-4xl md:text-6xl font-black text-white mb-8">Ready to start?</h2>
            <p className="text-white/80 text-xl mb-12 max-w-2xl mx-auto font-medium">
              Join 50,000+ users finding work and hiring candidates locally every single day.
            </p>
            <button
              onClick={onEnter}
              className="px-12 py-5 rounded-2xl bg-white text-slate-900 font-black text-xl hover:scale-105 active:scale-95 transition-all shadow-2xl"
            >
              Get Started Now
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex items-center gap-3 cursor-pointer" onClick={handleLogoClick}>
              <div className="w-8 h-8 rounded-lg bg-indigo-500 flex items-center justify-center">
              <img src="/mynearjoblogo.png" alt="Logo" className="w-5 h-5 object-contain" />
            </div>
            <span className="text-white font-bold text-lg">NearJob</span>
          </div>
          <div className="flex gap-8 text-sm font-medium text-gray-500">
            <button type="button" onClick={() => {}} className="hover:text-white transition">Privacy</button>
            <button type="button" onClick={() => {}} className="hover:text-white transition">Terms</button>
            <button type="button" onClick={() => {}} className="hover:text-white transition">Contact</button>
          </div>
          <p className="text-gray-500 text-sm">© 2024 NearJob. Premium Experience.</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;