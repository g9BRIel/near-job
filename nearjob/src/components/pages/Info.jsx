import React, { Component } from 'react';
import { 
  X, MapPin, Briefcase, Search, UserCheck, 
  MessageSquare, Star, Shield, Zap, Globe, 
  TrendingUp, Bell, Filter, Award, Users 
} from 'lucide-react';

class Info extends Component {
  render() {
    const { onClose } = this.props;

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <div className="glass rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-white/10 sticky top-0 bg-slate-900/95 backdrop-blur rounded-t-2xl z-10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-xl">
                N
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">How to Use NearJob</h2>
                <p className="text-gray-400 text-sm">Your complete guide to finding work nearby</p>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-lg transition"
            >
              <X className="w-6 h-6 text-gray-400" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Welcome */}
            <div className="glass rounded-xl p-6 text-center">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white mx-auto mb-4">
                <Globe className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Welcome to NearJob!</h3>
              <p className="text-gray-400 text-sm">
                NearJob connects workers with companies based on location. 
                Find opportunities within walking distance or short commute.
              </p>
            </div>

            {/* For Workers */}
            <div className="glass rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-400" />
                For Workers
              </h3>
              <div className="space-y-4 text-gray-300 text-sm">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 text-sm font-bold flex-shrink-0">1</div>
                  <div>
                    <p className="text-white font-medium mb-1">Create Your Profile</p>
                    <p>Sign up as a worker and fill in your personal info, skills, experience, and desired job title. A complete profile gets more views!</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 text-sm font-bold flex-shrink-0">2</div>
                  <div>
                    <p className="text-white font-medium mb-1">Browse Nearby Jobs</p>
                    <p>Go to <strong>"Find Jobs"</strong> to see all opportunities. Use the <Filter className="w-3 h-3 inline" /> filters to narrow by type, salary, or skills.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 text-sm font-bold flex-shrink-0">3</div>
                  <div>
                    <p className="text-white font-medium mb-1">Check the Map</p>
                    <p>Use the <strong>"Nearby"</strong> tab to see jobs on the map. Click any dot to see details and distance from your location.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 text-sm font-bold flex-shrink-0">4</div>
                  <div>
                    <p className="text-white font-medium mb-1">Apply Instantly</p>
                    <p>Click <strong>"Apply Now"</strong> on any job card. Your profile goes straight to the employer. Track applications in your dashboard.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 text-sm font-bold flex-shrink-0">5</div>
                  <div>
                    <p className="text-white font-medium mb-1">Chat with Employers</p>
                    <p>Use <strong>"Messages"</strong> to talk directly with companies. Schedule interviews, ask questions, and get offers.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* For Companies */}
            <div className="glass rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-purple-400" />
                For Companies
              </h3>
              <div className="space-y-4 text-gray-300 text-sm">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400 text-sm font-bold flex-shrink-0">1</div>
                  <div>
                    <p className="text-white font-medium mb-1">Register Your Company</p>
                    <p>Sign up as a company. Add your office location, industry, company size, and website. Verification builds trust!</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400 text-sm font-bold flex-shrink-0">2</div>
                  <div>
                    <p className="text-white font-medium mb-1">Post Job Openings</p>
                    <p>Go to <strong>"My Jobs"</strong> to create listings. Add title, salary, location, requirements, and tags for better matching.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400 text-sm font-bold flex-shrink-0">3</div>
                  <div>
                    <p className="text-white font-medium mb-1">Find Local Talent</p>
                    <p>Browse <strong>"Applicants"</strong> or use the map to find workers near you. Filter by skills, experience, and availability.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400 text-sm font-bold flex-shrink-0">4</div>
                  <div>
                    <p className="text-white font-medium mb-1">Review & Contact</p>
                    <p>View worker profiles, ratings, and skills. Click <strong>"Contact"</strong> to start a conversation and schedule interviews.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400 text-sm font-bold flex-shrink-0">5</div>
                  <div>
                    <p className="text-white font-medium mb-1">Hire & Rate</p>
                    <p>Make offers through Messages. After working together, rate each other to build community trust.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Dashboard Features */}
            <div className="glass rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-green-400" />
                Dashboard Features
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-start gap-3 p-3 rounded-lg bg-white/5">
                  <MapPin className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-white font-medium text-sm">Live Map</p>
                    <p className="text-gray-400 text-xs">See jobs/workers in real-time on an interactive map</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 rounded-lg bg-white/5">
                  <Search className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-white font-medium text-sm">Smart Search</p>
                    <p className="text-gray-400 text-xs">Filter by skills, salary, distance, and job type</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 rounded-lg bg-white/5">
                  <Bell className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-white font-medium text-sm">Notifications</p>
                    <p className="text-gray-400 text-xs">Get alerts for new matches and messages</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 rounded-lg bg-white/5">
                  <Star className="w-5 h-5 text-orange-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-white font-medium text-sm">Ratings</p>
                    <p className="text-gray-400 text-xs">Rate and review companies and workers</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 rounded-lg bg-white/5">
                  <MessageSquare className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-white font-medium text-sm">Messaging</p>
                    <p className="text-gray-400 text-xs">Chat directly with employers or candidates</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 rounded-lg bg-white/5">
                  <Shield className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-white font-medium text-sm">Verified Profiles</p>
                    <p className="text-gray-400 text-xs">All accounts are vetted for safety</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Analytics */}
            <div className="glass rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Zap className="w-5 h-5 text-yellow-400" />
                Analytics & Insights
              </h3>
              <p className="text-gray-400 text-sm mb-3">
                The <strong>"Analytics"</strong> tab shows your activity stats:
              </p>
              <ul className="space-y-2 text-gray-300 text-sm list-disc list-inside">
                <li>Weekly and monthly application trends</li>
                <li>Top skills in demand in your area</li>
                <li>Profile views and engagement metrics</li>
                <li>Response rates and success statistics</li>
              </ul>
            </div>

            {/* Pro Tips */}
            <div className="glass rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Award className="w-5 h-5 text-pink-400" />
                Pro Tips for Success
              </h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 rounded-lg bg-gradient-to-r from-blue-600/20 to-transparent border-l-2 border-blue-500">
                  <UserCheck className="w-5 h-5 text-blue-400" />
                  <p className="text-gray-300 text-sm">Keep your profile 100% complete for better visibility</p>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-gradient-to-r from-purple-600/20 to-transparent border-l-2 border-purple-500">
                  <MapPin className="w-5 h-5 text-purple-400" />
                  <p className="text-gray-300 text-sm">Enable location services for accurate nearby matching</p>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-gradient-to-r from-green-600/20 to-transparent border-l-2 border-green-500">
                  <MessageSquare className="w-5 h-5 text-green-400" />
                  <p className="text-gray-300 text-sm">Reply to messages quickly — fast responses get better results</p>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-gradient-to-r from-yellow-600/20 to-transparent border-l-2 border-yellow-500">
                  <Star className="w-5 h-5 text-yellow-400" />
                  <p className="text-gray-300 text-sm">Ask for reviews after completing work — ratings boost trust</p>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-gradient-to-r from-pink-600/20 to-transparent border-l-2 border-pink-500">
                  <Bell className="w-5 h-5 text-pink-400" />
                  <p className="text-gray-300 text-sm">Set up job alerts to get notified of new opportunities instantly</p>
                </div>
              </div>
            </div>

            {/* FAQ */}
            <div className="glass rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">❓ Frequently Asked Questions</h3>
              <div className="space-y-4 text-sm">
                <div>
                  <p className="text-white font-medium mb-1">Is NearJob free to use?</p>
                  <p className="text-gray-400">Yes! Basic features are completely free. Premium features for boosting visibility are coming soon.</p>
                </div>
                <div>
                  <p className="text-white font-medium mb-1">How does location matching work?</p>
                  <p className="text-gray-400">We use your registered location to show jobs/workers within your preferred radius. You can adjust this in Settings.</p>
                </div>
                <div>
                  <p className="text-white font-medium mb-1">Can I change my account type?</p>
                  <p className="text-gray-400">Currently, account types are fixed at registration. Contact support if you need to switch.</p>
                </div>
                <div>
                  <p className="text-white font-medium mb-1">Is my data safe?</p>
                  <p className="text-gray-400">Absolutely. We use encryption and never share your personal info with third parties.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-white/10 sticky bottom-0 bg-slate-900/95 backdrop-blur rounded-b-2xl">
            <button 
              onClick={onClose}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium hover:opacity-90 transition"
            >
              Got it! Let's Get Started 🚀
            </button>
          </div>
        </div>
      </div>
    );
  }
}

export default Info;