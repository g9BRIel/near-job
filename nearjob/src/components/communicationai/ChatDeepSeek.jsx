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
        className="fixed bottom-6 right-6 bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-full shadow-xl transition z-50"
      >
        <Bot size={28} />
      </button>

      {isOpen && (
        <div className="fixed bottom-24 right-6 w-[360px] h-[520px] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden border z-50">
          <div className="bg-blue-600 text-white p-4 flex justify-between items-center shrink-0">
            <div className="flex items-center gap-2">
              <Bot size={20} />
              <h2 className="font-semibold">NearJob AI</h2>
            </div>
            <button onClick={() => setIsOpen(false)}>
              <X size={20} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`max-w-[80%] px-3 py-2 rounded-2xl text-sm ${
                  msg.sender === "user"
                    ? "ml-auto bg-blue-600 text-white"
                    : "bg-white border shadow-sm text-gray-800"
                }`}
              >
                {msg.text}
              </div>
            ))}

            {loading && (
              <div className="bg-white border text-gray-500 px-3 py-2 rounded-2xl text-sm w-fit">
                typing...
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Suggestions */}
          {!loading && messages.length < 3 && (
            <div className="p-3 bg-white border-t flex flex-wrap gap-2">
              {suggestions.map((s, i) => (
                <button
                  key={i}
                  onClick={() => handleSuggestionClick(s)}
                  className="text-xs px-3 py-1.5 rounded-full border border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100 transition"
                >
                  {s}
                </button>
              ))}
            </div>
          )}

          <div className="p-3 border-t flex gap-2 bg-white shrink-0">
            <input
              type="text"
              value={message}
              placeholder="Ask about jobs, CVs, or cities..."
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              className="flex-1 border rounded-xl px-3 py-2 outline-none focus:border-blue-500 text-black text-sm"
            />
            <button
              id="ai-send-btn"
              onClick={handleSend}
              className="bg-blue-600 text-white px-4 rounded-xl hover:bg-blue-700 transition"
            >
              <Send size={18} />
            </button>
          </div>
        </div>
      )}
    </>
  );
}