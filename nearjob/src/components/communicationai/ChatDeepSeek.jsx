import { useState, useRef, useEffect } from "react";
import { Bot, Send, X } from "lucide-react";
import { API_BASE } from "../../utils/api";

export default function AiAssistant({ userType }) {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const [messages, setMessages] = useState([
    {
      sender: "ai",
      text: "Hello 👋 I'm NearJob AI Assistant. How can I help you today?",
    },
  ]);

  const messagesEndRef = useRef(null);

  const suggestions = userType === 'worker' ? [
    "Help me build my CV",
    "Which nearby cities have the most jobs?"
  ] : [
    "How to attract top talent?",
    "Review my job descriptions"
  ];

  const handleSuggestionClick = (text) => {
    setMessage(text);
    // Auto send suggestion after a short delay
    setTimeout(() => {
      document.getElementById('ai-send-btn')?.click();
    }, 100);
  };

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!message.trim()) return;

    const userMessage = {
      sender: "user",
      text: message,
    };

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setMessage("");
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/api/ai/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ messages: updatedMessages.slice(-10) }) 
      });
      
      const data = await res.json();
      
      if (res.ok) {
        setMessages((prev) => [...prev, { sender: "ai", text: data.text }]);
      } else {
        setMessages((prev) => [...prev, { sender: "ai", text: `Error: ${data.message || 'System unavailable'}` }]);
      }
    } catch (err) {
      console.error(err);
      setMessages((prev) => [...prev, { sender: "ai", text: "Network error connecting to AI server." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 bg-indigo-600 hover:bg-indigo-700 text-white p-4 rounded-full shadow-2xl transition z-50 premium-shadow active:scale-95"
      >
        <Bot size={28} />
      </button>

      {isOpen && (
        <div className="fixed bottom-24 right-6 left-6 sm:left-auto sm:w-[380px] h-[520px] max-h-[calc(100dvh-120px)] bg-white dark:bg-slate-900 rounded-[2rem] shadow-2xl flex flex-col overflow-hidden border border-slate-200 dark:border-white/10 z-[100] animate-in slide-in-from-bottom-4 duration-300">
          <div className="premium-gradient text-white p-5 flex justify-between items-center shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center backdrop-blur-md">
                <Bot size={20} />
              </div>
              <h2 className="font-bold tracking-tight">NearJob Assistant</h2>
            </div>
            <button onClick={() => setIsOpen(false)} className="hover:rotate-90 transition-transform">
              <X size={20} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-slate-50 dark:bg-slate-950/50">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`max-w-[85%] px-4 py-3 rounded-2xl text-sm font-medium ${
                  msg.sender === "user"
                    ? "ml-auto bg-indigo-600 text-white shadow-lg shadow-indigo-500/20"
                    : "bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/5 shadow-sm text-slate-800 dark:text-slate-100"
                }`}
              >
                {msg.text}
              </div>
            ))}

            {loading && (
              <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/5 text-slate-400 dark:text-slate-500 px-4 py-2 rounded-2xl text-sm w-fit animate-pulse">
                Thinking...
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          <div className="p-4 border-t border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 shrink-0">
            {/* Suggestions */}
            {!loading && messages.length < 3 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {suggestions.map((s, i) => (
                  <button
                    key={i}
                    onClick={() => handleSuggestionClick(s)}
                    className="text-[10px] uppercase tracking-widest font-black px-3 py-1.5 rounded-full border border-indigo-500/10 bg-indigo-500/5 text-indigo-500 hover:bg-indigo-500/10 transition-colors"
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}

            <div className="flex gap-2">
              <input
                type="text"
                value={message}
                placeholder="Message assistant..."
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                className="flex-1 bg-slate-100 dark:bg-slate-800 border-none rounded-xl px-4 py-2.5 outline-none focus:ring-2 ring-indigo-500/30 text-slate-900 dark:text-white text-sm transition-all"
              />
              <button
                id="ai-send-btn"
                onClick={handleSend}
                className="bg-indigo-600 text-white px-4 rounded-xl hover:bg-indigo-700 transition premium-shadow"
              >
                <Send size={18} />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}