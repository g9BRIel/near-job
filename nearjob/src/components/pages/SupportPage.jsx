import { useState } from 'react';
import { HelpCircle, Mail, Phone, MessageSquare, ChevronDown } from 'lucide-react';

const faqs = [
  {
    category: 'General',
    questions: [
      { q: 'How does the translation system work?', a: 'When you change your language in Settings, the whole platform syncs instantly to your local dialect using NearJob AI routing.' },
      { q: 'Can I hide my profile?', a: 'Yes, go to Settings -> Privacy and disable "Profile Visibility". You will stay hidden from searches.' },
    ]
  },
  {
    category: 'Jobs & Applications',
    questions: [
      { q: 'How do I know if my application was seen?', a: 'You will receive an automatic system notification in your Dashboard Feed whenever an employer views your application or downloads your CV.' },
      { q: 'Can I bookmark jobs for later?', a: 'Absolutely! Click the "Save" icon on any job card to add it to your Bookmarks tab.' }
    ]
  }
];

const SupportPage = ({ userType }) => {
  const [openFaq, setOpenFaq] = useState(null);

  const toggleFaq = (index) => {
    if (openFaq === index) setOpenFaq(null);
    else setOpenFaq(index);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20 animate-in fade-in zoom-in-95 duration-500">
      
      {/* Header Banner */}
      <div className="glass rounded-[2rem] p-10 flex flex-col items-center text-center relative overflow-hidden border border-white/10">
        <div className="absolute top-0 right-0 -m-10">
          <HelpCircle className="w-64 h-64 text-blue-500/10 rotate-12" />
        </div>
        <div className="w-20 h-20 bg-gradient-to-tr from-blue-500 to-purple-500 rounded-full flex items-center justify-center shadow-lg shadow-blue-500/20 mb-6 border-4 border-white/10">
          <HelpCircle className="w-10 h-10 text-white" />
        </div>
        <h1 className="text-3xl font-bold text-main mb-2 tracking-tight">NearJob Support Center</h1>
        <p className="text-muted max-w-lg leading-relaxed">
          Need help navigating the {userType === 'worker' ? 'job market' : 'talent pool'}? We are here 24/7 to assist you.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass p-6 rounded-2xl flex flex-col items-center text-center gap-3 hover:translate-y-[-5px] transition-transform cursor-pointer border border-white/5">
          <div className="p-4 bg-blue-500/10 rounded-2xl">
            <MessageSquare className="w-8 h-8 text-blue-500" />
          </div>
          <h3 className="font-bold text-main">Live Chat</h3>
          <p className="text-xs text-muted">Talk to an agent directly</p>
        </div>
        
        <div className="glass p-6 rounded-2xl flex flex-col items-center text-center gap-3 hover:translate-y-[-5px] transition-transform cursor-pointer border border-white/5">
          <div className="p-4 bg-purple-500/10 rounded-2xl">
            <Mail className="w-8 h-8 text-purple-500" />
          </div>
          <h3 className="font-bold text-main">Email Support</h3>
          <p className="text-xs text-muted">Averages 2h response</p>
        </div>
        
        <div className="glass p-6 rounded-2xl flex flex-col items-center text-center gap-3 hover:translate-y-[-5px] transition-transform cursor-pointer border border-white/5">
          <div className="p-4 bg-green-500/10 rounded-2xl">
            <Phone className="w-8 h-8 text-green-500" />
          </div>
          <h3 className="font-bold text-main">Hotline</h3>
          <p className="text-xs text-muted">Available Mon-Fri, 9am-5pm</p>
        </div>
      </div>

      <div className="space-y-6">
        <h2 className="text-xl font-bold text-main flex items-center gap-2">
          Frequently Asked Questions
        </h2>
        
        {faqs.map((group, gIdx) => (
          <div key={gIdx} className="space-y-4">
            <h3 className="text-sm font-bold text-blue-400 tracking-wider uppercase ml-2">{group.category}</h3>
            <div className="space-y-3">
              {group.questions.map((faq, idx) => {
                const uniqueIdx = `${gIdx}-${idx}`;
                const isOpen = openFaq === uniqueIdx;
                
                return (
                  <div 
                    key={idx} 
                    className={`glass rounded-2xl border transition-all duration-300 overflow-hidden cursor-pointer ${isOpen ? 'border-transparent shadow-[0_0_30px_rgba(59,130,246,0.15)] bg-blue-500/5' : 'border-white/5 hover:border-white/20'}`}
                    onClick={() => toggleFaq(uniqueIdx)}
                  >
                    <div className="p-5 flex items-center justify-between">
                      <h4 className={`font-semibold transition-colors ${isOpen ? 'text-blue-400' : 'text-main'}`}>{faq.q}</h4>
                      <ChevronDown className={`w-5 h-5 transition-transform duration-300 text-muted ${isOpen ? 'rotate-180 text-blue-400' : ''}`} />
                    </div>
                    <div 
                      className={`px-5 text-sm leading-relaxed text-muted transition-all duration-300 overflow-hidden ${isOpen ? 'max-h-40 pb-5 opacity-100' : 'max-h-0 opacity-0'}`}
                    >
                      {faq.a}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
      
    </div>
  );
};

export default SupportPage;
