import { useState, useEffect, useRef } from 'react';
import { ShieldAlert, AlertTriangle, Zap } from 'lucide-react';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const authHeaders = () => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${localStorage.getItem('token')}`,
});

/**
 * PardonNotification - SCARY WARNING VERSION
 * A high-intensity red warning UI that appears when a user is pardoned/warned.
 * Exit effect: Burning smoke/dust that drifts up and dissolves like a fading threat.
 */
export default function PardonNotification() {
  const [pardon, setPardon] = useState(null);
  const [phase, setPhase] = useState('hidden'); // hidden | enter | visible | smoke
  const timerRef = useRef(null);

  const fetchPardons = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/notifications`, { headers: authHeaders() });
      if (!res.ok) return;
      const all = await res.json();
      const pending = all.find(n => n.type === 'pardon' && !n.isRead);
      if (pending && !pardon) {
        setPardon(pending);
        setTimeout(() => setPhase('enter'), 50);
        setTimeout(() => setPhase('visible'), 400);
      }
    } catch { /* silent */ }
  };

  useEffect(() => {
    fetchPardons();
    const interval = setInterval(fetchPardons, 20000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleAgree = async () => {
    if (!pardon) return;
    
    try {
      await fetch(`${API_BASE}/api/notifications/${pardon.id}/read`, {
        method: 'PUT',
        headers: authHeaders(),
      });
      window.dispatchEvent(new CustomEvent('notification-read'));
    } catch (e) { console.error(e); }

    setPhase('smoke');
    
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      setPhase('hidden');
      setPardon(null);
    }, 1200);
  };

  if (!pardon || phase === 'hidden') return null;

  const isEntering = phase === 'enter';
  const isSmoke = phase === 'smoke';

  return (
    <>
      {/* Dark Red Overlay */}
      <div
        className="fixed inset-0 z-[9990] bg-black/95 backdrop-blur-2xl transition-all duration-700"
        style={{ 
          opacity: isEntering ? 0 : isSmoke ? 0 : 1,
          pointerEvents: isSmoke ? 'none' : 'auto'
        }}
      >
         {/* Red Scanlines */}
         <div className="absolute inset-0 opacity-[0.05] pointer-events-none bg-[linear-gradient(rgba(220,38,38,0.2)_2px,transparent_2px)] bg-[length:100%_4px]" />
      </div>

      <div className="fixed z-[9991] inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
        <div
          className="pointer-events-auto relative w-full max-w-md mx-4"
          style={{
            transform: isEntering
              ? 'translateY(200px) scale(0.8) skewX(-10deg)'
              : isSmoke
              ? 'translateY(-100vh) scale(2) rotateZ(15deg)' 
              : 'translateY(0) scale(1) skewX(0)',
            opacity: isEntering ? 0 : isSmoke ? 0 : 1,
            filter: isSmoke ? 'blur(80px) saturate(0) brightness(5)' : 'blur(0)',
            transition: isSmoke
              ? 'all 1.2s cubic-bezier(0.55, 0.055, 0.675, 0.19)' 
              : 'all 0.6s cubic-bezier(0.19, 1, 0.22, 1)',
          }}
        >
          {/* Intense Gloom */}
          <div className="absolute -inset-20 bg-red-600/30 rounded-full blur-[120px] animate-pulse pointer-events-none" />

          {/* THE WARNING CARD */}
          <div className="relative bg-[#080000] border-2 border-red-600 rounded-[2rem] overflow-hidden shadow-[0_0_100px_rgba(220,38,38,0.4)]">
            
            {/* Header: ULTRA CRITICAL WARNING */}
            <div className="bg-red-600 p-8 flex items-center gap-6 border-b-8 border-red-900">
              <div className="p-4 bg-black rounded-2xl shadow-[0_0_30px_rgba(0,0,0,1)] animate-pulse">
                <AlertTriangle className="w-10 h-10 text-red-600" />
              </div>
              <div className="flex-1">
                <h2 className="text-black font-black text-sm uppercase tracking-[0.5em] leading-none mb-1">Administrative Alert</h2>
                <p className="text-black/60 text-[10px] uppercase font-bold tracking-widest flex items-center gap-2">
                   <ShieldAlert className="w-4 h-4" /> LEVEL_CRITICAL_WARNING
                </p>
              </div>
            </div>

            {/* Body: Intense content */}
            <div className="p-10 space-y-10">
               <div className="space-y-4">
                 <div className="flex items-center gap-4">
                    <Zap className="w-6 h-6 text-red-500" />
                    <h3 className="text-4xl font-black text-red-600 tracking-tighter uppercase italic line-clamp-2">{pardon.title}</h3>
                 </div>
                 <div className="h-1.5 w-full bg-gradient-to-r from-red-600 via-red-900 to-transparent" />
               </div>
               
               <div className="bg-red-950/20 border-l-4 border-red-600 p-6 rounded-r-xl">
                  <p className="text-red-100/70 text-lg leading-relaxed font-bold font-mono selection:bg-red-600 selection:text-white">
                    {pardon.message}
                  </p>
               </div>

               <div className="pt-4">
                 <button
                   onClick={handleAgree}
                   className="w-full py-7 bg-red-600 text-white font-black rounded-2xl text-base uppercase tracking-[0.4em] hover:bg-red-500 active:scale-95 transition-all shadow-[0_0_50px_rgba(220,38,38,0.5)] flex items-center justify-center gap-4 group"
                 >
                   <CheckCircle className="w-6 h-6 group-hover:rotate-12 transition" />
                   Accept Conditions
                 </button>
               </div>
            </div>

            {/* Matrix Decorative Footer */}
            <div className="bg-red-900/10 px-10 py-6 flex justify-between items-center border-t border-red-900/30">
               <span className="text-[10px] font-mono font-black text-red-600/50 uppercase tracking-[0.3em]">REF_CODE: //ADM_WARN_INIT_V6</span>
               <div className="flex gap-2">
                  <div className="w-2 h-2 bg-red-600 rounded-full animate-ping" />
                  <div className="w-2 h-2 bg-red-800 rounded-full" />
               </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function CheckCircle(props) {
  return (
    <svg 
      {...props} 
      xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"
    >
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
      <polyline points="22 4 12 14.01 9 11.01"></polyline>
    </svg>
  );
}
