import React from 'react';
import { X, ShieldAlert, User, Unlink } from 'lucide-react';

const BlockedUsersModal = ({ isOpen, onClose, blockedUsers, onUnblock, loading }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md transition-all duration-300">
      <div className="glass rounded-[2rem] w-full max-w-lg overflow-hidden flex flex-col border-red-500/10 shadow-[0_0_50px_rgba(239,68,68,0.1)]">
        {/* Header */}
        <div className="p-6 border-b border-white/10 flex items-center justify-between bg-red-500/5">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-500/20 rounded-xl">
              <ShieldAlert className="w-6 h-6 text-red-500" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">Blocked Accounts</h3>
              <p className="text-xs text-gray-400">Manage users you have restricted</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition">
            <X className="w-6 h-6 text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 max-h-[60vh] custom-scrollbar">
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-16 w-full bg-white/5 animate-pulse rounded-2xl" />
              ))}
            </div>
          ) : blockedUsers.length === 0 ? (
            <div className="py-12 text-center">
              <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4 border border-white/10">
                <User className="w-8 h-8 text-gray-600 opacity-20" />
              </div>
              <p className="text-gray-500 font-medium">Your block list is empty</p>
            </div>
          ) : (
            <div className="space-y-3">
              {blockedUsers.map((u) => (
                <div 
                  key={`${u.type}-${u.id}`} 
                  className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center text-white font-bold text-lg shadow-inner group-hover:from-red-600 group-hover:to-red-700 transition-all duration-500">
                      {u.profile?.fullName?.charAt(0) || u.profile?.companyName?.charAt(0) || '?'}
                    </div>
                    <div>
                      <p className="text-white font-semibold">{u.profile?.fullName || u.profile?.companyName || 'Unknown User'}</p>
                      <p className="text-gray-500 text-xs capitalize flex items-center gap-1">
                        <span className={`w-1.5 h-1.5 rounded-full ${u.type === 'worker' ? 'bg-blue-400' : 'bg-purple-400'}`} />
                        {u.type} account
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => onUnblock(u.id, u.type)}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-500/10 text-red-400 text-sm font-bold hover:bg-red-500 hover:text-white transition-all shadow-lg shadow-red-500/0 hover:shadow-red-500/20"
                  >
                    <Unlink className="w-4 h-4" />
                    Unblock
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="p-6 bg-black/40 border-t border-white/10">
          <p className="text-[10px] text-gray-500 text-center uppercase tracking-widest leading-relaxed">
            Unblocking will restore visibility searchability and messaging between both accounts.
          </p>
        </div>
      </div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 5px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
        }
      `}</style>
    </div>
  );
};

export default BlockedUsersModal;
