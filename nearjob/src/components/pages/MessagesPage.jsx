import { useState, useEffect, useRef, useCallback } from 'react';
import { Search, Send, MoreVertical, ArrowLeft, CheckCheck } from 'lucide-react';
import { API_BASE, authHeaders, getTokenPayload } from '../../utils/api';

const MessagesPage = ({ chatTarget, onConsumedChatTarget }) => {
  const [selectedChat, setSelectedChat] = useState(null);
  const [messageText, setMessageText] = useState('');
  const [sendError, setSendError] = useState('');
  const [conversations, setConversations] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const currentUserIdRef = useRef(null);
  const scrollRef = useRef(null);

  const statusCache = useRef(new Map());

  const fetchUserOnlineStatus = useCallback(async (userId, userType) => {
    const cacheKey = `${userType}-${userId}`;
    const now = Date.now();
    
    // Cache status for 15 seconds to prevent rapid redundant fetches
    if (statusCache.current.has(cacheKey)) {
      const entry = statusCache.current.get(cacheKey);
      if (now - entry.timestamp < 15000) return entry.data;
    }

    try {
      const res = await fetch(`${API_BASE}/api/users/status?userId=${userId}&userType=${userType}`);
      if (!res.ok) return null;
      const data = await res.json();
      statusCache.current.set(cacheKey, { timestamp: now, data });
      return data;
    } catch (err) {
      console.error('Failed to fetch online status:', err);
      return null;
    }
  }, []);

  const formatConversationRow = useCallback(async (conv, uid, myUserType) => {
    const isWorker = myUserType === 'worker';
    const other = isWorker ? conv.Company : conv.Worker;
    const otherUserType = isWorker ? 'company' : 'worker';
    const name = isWorker
      ? (other?.companyName || other?.email || 'Company')
      : (other?.fullName || other?.email || 'Worker');
    const lastMsg =
      conv.messages && conv.messages.length > 0 ? conv.messages[0].text : 'Start a conversation';

    const blockedByMe = conv.blockedByMe;
    const blockedByThem = conv.blockedByThem || conv.otherIsBanned;

    let online = false;
    if (!blockedByMe && !blockedByThem && !conv.otherIsBanned) {
      const statusData = await fetchUserOnlineStatus(other?.id, otherUserType);
      online = statusData?.isOnline || false;
    }

    return {
      id: conv.id,
      otherUserId: other?.id,
      otherUserType,
      name,
      avatar: String(name).charAt(0).toUpperCase(),
      lastMessage: lastMsg,
      time: new Date(conv.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      unread: conv.unreadCount || 0,
      online,
      blockedByMe,
      blockedByThem,
      messages: [],
    };
  }, [fetchUserOnlineStatus]);

  const fetchConversations = useCallback(async () => {
    const payload = getTokenPayload();
    const uid = payload?.id ?? null;
    const myUserType = payload?.userType;
    currentUserIdRef.current = uid;
    if (!uid || !myUserType) return;

    try {
      const res = await fetch(`${API_BASE}/api/chats`, {
        headers: authHeaders(false),
      });
      if (!res.ok) return;

      const data = await res.json();
      const items = data.data || data;
      const formatted = await Promise.all(
        (Array.isArray(items) ? items : []).map((conv) =>
          formatConversationRow(conv, uid, myUserType)
        )
      );
      setConversations(formatted);
    } catch (err) {
      console.error('Error fetching conversations', err);
    }
  }, [formatConversationRow]);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  // Sync virtual selectedChat with real conversation if it appears in the list
  useEffect(() => {
    if (selectedChat && selectedChat.id === null) {
      const match = conversations.find(c => 
        Number(c.otherUserId) === Number(selectedChat.otherUserId) && 
        c.otherUserType === selectedChat.otherUserType
      );
      if (match) {
        setSelectedChat(match);
      }
    }
  }, [conversations, selectedChat]);

  useEffect(() => {
    if (!chatTarget?.id) return;

    // Check if we already have a conversation with this user
    const existing = conversations.find(c => 
      Number(c.otherUserId) === Number(chatTarget.id) && 
      c.otherUserType === chatTarget.userType
    );

    if (existing) {
      setSelectedChat(existing);
      onConsumedChatTarget?.();
      return;
    }

    const initChat = async () => {
      const statusData = await fetchUserOnlineStatus(chatTarget.id, chatTarget.userType);
      const online = statusData?.isOnline || false;

      setSelectedChat({
        id: null,
        otherUserId: chatTarget.id,
        otherUserType: chatTarget.userType,
        name: chatTarget.name || 'User',
        avatar: String(chatTarget.name || 'U').charAt(0).toUpperCase(),
        messages: [],
        online,
      });
    };

    initChat();
    onConsumedChatTarget?.();
  }, [chatTarget, onConsumedChatTarget, fetchUserOnlineStatus, conversations]);

  const loadChatMessages = useCallback(async (convId) => {
    if (!convId) return;
    const uid = getTokenPayload()?.id ?? null;
    currentUserIdRef.current = uid;
    try {
      const res = await fetch(`${API_BASE}/api/chats/${convId}/messages`, {
        headers: authHeaders(false),
      });
      if (!res.ok) return;

      const data = await res.json();
      const items = data.data || data;
      const me = getTokenPayload();
      const formattedMsgs = (Array.isArray(items) ? items : []).map((m) => ({
        id: m.id,
        sender:
          m.senderId === me?.id && m.senderUserType === me?.userType ? 'me' : 'them',
        text: m.text,
        time: new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }));

      setSelectedChat((prev) => {
        if (!prev || prev.id !== convId) return prev;
        return { ...prev, messages: formattedMsgs };
      });
    } catch (err) {
      console.error(err);
    }
  }, []);

  useEffect(() => {
    const convId = selectedChat?.id;
    if (!convId) return undefined;
    loadChatMessages(convId);
    
    // Increased interval slightly and added visibility check to save CPU
    const t = setInterval(() => {
      if (document.visibilityState === 'visible') {
        loadChatMessages(convId);
      }
    }, 6000); 

    return () => clearInterval(t);
  }, [selectedChat?.id, loadChatMessages]);

  useEffect(() => {
    const t = setInterval(() => {
      if (document.visibilityState === 'visible') {
        fetchConversations();
      }
    }, 15000); // 15s instead of 10s to reduce background noise
    return () => clearInterval(t);
  }, [fetchConversations]);

  useEffect(() => {
    if (!selectedChat?.otherUserId) return;

    const updateStatus = async () => {
      const statusData = await fetchUserOnlineStatus(selectedChat.otherUserId, selectedChat.otherUserType);
      if (statusData?.isOnline !== undefined) {
        setSelectedChat((prev) => {
          if (!prev) return prev;
          return { ...prev, online: statusData.isOnline };
        });
      }
    };

    updateStatus();
    const statusInterval = setInterval(updateStatus, 30000); // Update every 30 seconds
    return () => clearInterval(statusInterval);
  }, [selectedChat?.otherUserId, selectedChat?.otherUserType, fetchUserOnlineStatus]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [selectedChat?.messages]);

  const handleSelectChat = (conv) => {
    setSelectedChat(conv);
    setMenuOpen(false);
    loadChatMessages(conv.id);
  };

  const handleToggleBlock = async () => {
    if (!selectedChat?.otherUserId) return;
    const isBlocking = !selectedChat.blockedByMe;
    const endpoint = isBlocking ? '/api/users/block' : '/api/users/unblock';
    
    try {
      const res = await fetch(`${API_BASE}${endpoint}`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({
          blockedId: selectedChat.otherUserId,
          blockedType: selectedChat.otherUserType
        })
      });
      if (res.ok) {
        // Updated logic: Stay in the chat but update the blocked status locally
        setSelectedChat(prev => ({
          ...prev,
          blockedByMe: isBlocking
        }));
        
        // Refresh the list in the background
        fetchConversations();
        setMenuOpen(false);
      }
    } catch (err) {
      console.error('Failed to toggle block:', err);
    }
  };

  const handleSend = async () => {
    if (!messageText.trim() || !selectedChat || !selectedChat.otherUserId) {
      return;
    }

    setSendError('');
    const payload = getTokenPayload();
    const receiverType = selectedChat.otherUserType || (payload?.userType === 'worker' ? 'company' : 'worker');

    try {
      const res = await fetch(`${API_BASE}/api/chats`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({
          receiverId: parseInt(selectedChat.otherUserId, 10),
          receiverType,
          text: messageText.trim(),
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        const errMsg = err.message
          || (err.errors && err.errors[0]?.msg)
          || 'Could not send message';
        setSendError(errMsg);
        return;
      }

      const sentMsg = await res.json();
      const newMsgFormatted = {
        id: sentMsg.id,
        sender: 'me',
        text: sentMsg.text,
        time: new Date(sentMsg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        senderUserType: payload?.userType,
      };

      const convId = sentMsg.conversationId || selectedChat.id;

      setSelectedChat((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          id: convId,
          messages: [...prev.messages, newMsgFormatted],
        };
      });

      setMessageText('');
      setSendError('');
      await fetchConversations();
    } catch (err) {
      console.error('Failed to send message', err);
      setSendError('Network error — please try again.');
    }
  };

  const filteredConversations = conversations.filter((conv) =>
    conv.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (selectedChat) {
    return (
      <div className="glass rounded-2xl h-[calc(100vh-140px)] flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setSelectedChat(null)}
              className="p-2 hover:bg-white/10 rounded-lg transition"
              title="Back to conversations"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white text-xl font-bold">
              {(selectedChat.blockedByMe || selectedChat.blockedByThem) ? '👤' : selectedChat.avatar}
            </div>
            <div>
              <h3 className="text-main font-semibold">
                {selectedChat.blockedByThem ? 'NearJob User' : selectedChat.name}
              </h3>
              {!(selectedChat.blockedByMe || selectedChat.blockedByThem) ? (
                <div className="flex items-center gap-1">
                  <div className={`w-2 h-2 rounded-full ${selectedChat.online ? 'bg-green-500' : 'bg-gray-500'}`} />
                  <span className="text-xs text-muted">{selectedChat.online ? 'Online' : 'Offline'}</span>
                </div>
              ) : (
                <span className="text-xs text-red-400 font-medium">Blocked</span>
              )}
            </div>
          </div>
            <div className="relative">
              <button 
                type="button" 
                onClick={() => setMenuOpen(!menuOpen)}
                className={`p-2 hover:bg-white/10 rounded-lg transition ${menuOpen ? 'bg-white/10' : ''}`}
              >
                <MoreVertical className="w-5 h-5" />
              </button>
              
              {menuOpen && (
                <div className="absolute right-0 mt-2 w-48 glass border-main rounded-xl shadow-2xl z-50 overflow-hidden">
                  <button
                    onClick={handleToggleBlock}
                    className="w-full px-4 py-3 text-left text-sm hover:bg-white/5 transition text-red-500 font-semibold flex items-center gap-2"
                  >
                    {selectedChat.blockedByMe ? 'Unblock User' : 'Block User'}
                  </button>
                  <button
                    onClick={() => setMenuOpen(false)}
                    className="w-full px-4 py-3 text-left text-sm hover:bg-white/5 transition text-gray-400"
                  >
                    Close
                  </button>
                </div>
              )}
            </div>
          </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth" ref={scrollRef}>
          {selectedChat.messages.length === 0 && !selectedChat.blockedByMe && !selectedChat.blockedByThem && (
             <div className="flex flex-col items-center justify-center h-full opacity-50 space-y-4">
                <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center text-4xl">💬</div>
                <p className="text-sm">Say hello to {selectedChat.name}!</p>
             </div>
          )}
          {selectedChat.messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-[70%] rounded-2xl px-4 py-3 ${
                  msg.sender === 'me'
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                    : 'glass border-main text-main'
                }`}
              >
                <p>{msg.text}</p>
                <div className={`flex items-center gap-1 mt-1 ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}`}>
                  <span className="text-xs opacity-70">{msg.time}</span>
                  {msg.sender === 'me' ? <CheckCheck className="w-3 h-3 opacity-70" /> : null}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="p-4 border-t border-white/10">
          {(selectedChat.blockedByMe || selectedChat.blockedByThem) ? (
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-center">
              <p className="text-red-200 text-sm mb-3 font-medium">
                {selectedChat.blockedByMe 
                  ? "You blocked this account. You can't message them or see their updates." 
                  : "This account has blocked you. Communication is restricted."}
              </p>
              {selectedChat.blockedByMe && (
                <button 
                  onClick={handleToggleBlock}
                  className="px-6 py-2 rounded-full bg-red-600 text-white text-xs font-bold hover:bg-red-700 transition"
                >
                  Unblock
                </button>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <input
                type="text"
                value={messageText}
                onChange={(e) => { setMessageText(e.target.value); setSendError(''); }}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Type a message..."
                className="flex-1 bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
              />
              <button
                type="button"
                onClick={handleSend}
                className="p-3 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:opacity-90 transition"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          )}
          {sendError && (
            <p className="mt-2 text-xs text-red-400 px-1">{sendError}</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="glass rounded-2xl h-[calc(100vh-140px)] flex flex-col">
      <div className="p-6 border-b border-main">
        <h2 className="text-2xl font-bold text-main mb-4">Messages</h2>
        <div className="relative">
          <Search className="absolute left-4 top-3.5 w-5 h-5 text-muted" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search conversations..."
            className="w-full bg-main border border-main rounded-xl py-3 pl-12 pr-4 text-main placeholder-gray-500 focus:outline-none focus:border-blue-500"
          />
        </div>
      </div>

      <div
        className="flex-1 overflow-y-auto w-full p-2 h-full flex items-center justify-center text-gray-400 text-center"
        style={{ display: conversations.length === 0 ? 'flex' : 'none' }}
      >
        <p>
          No active conversations yet.
          <br />
          Use <strong className="text-gray-300">Contact</strong> on a worker card to start one.
        </p>
      </div>

      <div className="flex-1 overflow-y-auto" style={{ display: conversations.length > 0 ? 'block' : 'none' }}>
        {filteredConversations.map((conv) => (
          <button
            key={`${conv.id}-${conv.otherUserId}`}
            type="button"
            onClick={() => handleSelectChat(conv)}
            className="w-full flex items-center gap-4 p-4 hover:bg-white/5 transition border-b border-white/5 text-left"
          >
            <div className="relative">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xl font-bold">
                {(conv.blockedByMe || conv.blockedByThem) ? '👤' : conv.avatar}
              </div>
              {conv.online && !(conv.blockedByMe || conv.blockedByThem) ? (
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-slate-900" />
              ) : null}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <h4 className="text-main font-medium truncate">
                  {conv.blockedByThem ? 'NearJob User' : conv.name}
                </h4>
                <span className="text-xs text-muted">{conv.time}</span>
              </div>
              <p className="text-sm text-muted truncate">
                {(conv.blockedByMe || conv.blockedByThem) ? (
                  <span className="text-red-400/50 italic">Communication restricted</span>
                ) : conv.lastMessage}
              </p>
            </div>
            {conv.unread > 0 ? (
              <span className="bg-blue-600 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0">
                {conv.unread}
              </span>
            ) : null}
          </button>
        ))}
      </div>
    </div>
  );
};

export default MessagesPage;
