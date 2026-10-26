import React, { useState, useRef, useEffect } from 'react';
import { 
  Bot, 
  Send, 
  User, 
  Sparkles, 
  RefreshCw, 
  Copy, 
  Check, 
  Sliders, 
  Terminal, 
  Cpu, 
  ShieldCheck, 
  AlertCircle,
  HelpCircle,
  Zap,
  Layers,
  Flame
} from 'lucide-react';

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: string;
  modelUsed?: string;
}

export type ChatbotRole = 'general' | 'architect' | 'chaos' | 'novnc';

export const GeminiChatbot: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'init-1',
      role: 'model',
      text: "Hello! I am your Debian 13 (Trixie) Cloud Desktop Assistant powered by Gemini. I specialize in chroot isolation, TigerVNC (:1/5901), websockify, authenticated FastAPI gateways, and self-healing watchdog architecture. How can I assist you with your cloud desktop environment today?",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      modelUsed: 'gemini-3.8-flash'
    }
  ]);

  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedModel, setSelectedModel] = useState<'gemini-3.8-flash' | 'gemini-3.1-flash-lite' | 'gemini-4-argon'>('gemini-3.8-flash');
  const [selectedRole, setSelectedRole] = useState<ChatbotRole>('general');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSend = async (customPrompt?: string) => {
    const textToSend = customPrompt || input.trim();
    if (!textToSend || isLoading) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    if (!customPrompt) setInput('');
    setIsLoading(true);

    try {
      // Build conversation history payload
      const historyPayload = messages.map(m => ({
        role: m.role,
        text: m.text
      }));

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: textToSend,
          history: historyPayload,
          model: selectedModel,
          role: selectedRole
        })
      });

      const data = await res.json();

      if (res.ok && data.text) {
        const modelMsg: ChatMessage = {
          id: `model-${Date.now()}`,
          role: 'model',
          text: data.text,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          modelUsed: data.model || selectedModel
        };
        setMessages(prev => [...prev, modelMsg]);
      } else {
        const errorText = data.error || 'Failed to generate response.';
        const errorMsg: ChatMessage = {
          id: `error-${Date.now()}`,
          role: 'model',
          text: `⚠️ Gemini Notice: ${errorText}`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          modelUsed: selectedModel
        };
        setMessages(prev => [...prev, errorMsg]);
      }
    } catch (err: any) {
      setMessages(prev => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          role: 'model',
          text: `⚠️ Connection Error: Unable to reach Gemini backend endpoint (${err.message}). Verify your server connection.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          modelUsed: selectedModel
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const copyMessage = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleClearHistory = () => {
    setMessages([
      {
        id: `init-${Date.now()}`,
        role: 'model',
        text: "Conversation cleared. Ready for your next query on Debian 13 systems engineering, chroot configurations, or watchdog monitoring.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        modelUsed: selectedModel
      }
    ]);
  };

  const quickPrompts = [
    "Write an idempotent bash function to mount /proc, /sys, and verify real entropy devices",
    "Explain how the autonomous watchdog detects and restarts a dead Xtigervnc process",
    "How does the FastAPI gateway proxy WebSockets to websockify on port 6081?",
    "Why must we detect debian user UID dynamically instead of assuming UID=1000?",
    "How does PipeWire route audio through WebSockets to browser WebAudio API?"
  ];

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-2xl flex flex-col h-[740px] font-sans">
      {/* Top Header & Role Selector */}
      <div className="bg-slate-950 p-4 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-950/40 border border-purple-400/30">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-base font-bold text-white">Gemini Cloud Desktop Assistant</h2>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-purple-950/80 border border-purple-700/60 text-purple-300 flex items-center gap-1 font-semibold">
                <Sparkles className="w-2.5 h-2.5" />
                MULTI-TURN AI
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Specialized systems engineering chatbot with configurable roles & model tiers.
            </p>
          </div>
        </div>

        {/* Model & Role Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Model Selector */}
          <div className="flex items-center bg-slate-900 border border-slate-700 rounded-lg p-1 text-xs">
            <span className="text-slate-400 text-[10px] uppercase font-bold px-1.5 hidden sm:inline">Model:</span>
            <select
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value as any)}
              className="bg-transparent text-white font-mono text-xs outline-none cursor-pointer pr-1"
            >
              <option value="gemini-3.8-flash" className="bg-slate-900 text-white">gemini-3.8-flash (General)</option>
              <option value="gemini-3.1-flash-lite" className="bg-slate-900 text-white">gemini-3.1-flash-lite (Fast)</option>
              <option value="gemini-4-argon" className="bg-slate-900 text-white">gemini-4-argon (Complex)</option>
            </select>
          </div>

          {/* Role Persona Selector */}
          <div className="flex items-center bg-slate-900 border border-slate-700 rounded-lg p-1 text-xs">
            <span className="text-slate-400 text-[10px] uppercase font-bold px-1.5 hidden sm:inline">Role:</span>
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value as any)}
              className="bg-transparent text-white font-mono text-xs outline-none cursor-pointer pr-1"
            >
              <option value="general" className="bg-slate-900 text-white">🛠️ Systems Engineer</option>
              <option value="architect" className="bg-slate-900 text-white">🏗️ Chroot Architect</option>
              <option value="chaos" className="bg-slate-900 text-white">🛡️ Watchdog & SRE</option>
              <option value="novnc" className="bg-slate-900 text-white">🖥️ Remote Protocol Tuner</option>
            </select>
          </div>

          {/* Clear Button */}
          <button
            onClick={handleClearHistory}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white border border-slate-700 transition"
            title="Clear Chat Thread"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Role Banner Indicator */}
      <div className="bg-slate-950/60 border-b border-slate-800 px-4 py-2 text-xs flex items-center justify-between text-slate-400">
        <div className="flex items-center space-x-2">
          <span className="text-purple-400 font-semibold font-mono">Active System Instruction:</span>
          <span className="truncate max-w-xl text-slate-300">
            {selectedRole === 'general' && 'General Debian 13 systems engineering, idempotent bash, and service orchestration.'}
            {selectedRole === 'architect' && 'Virtualization, kernel device nodes, entropy devices, and dynamic UID security.'}
            {selectedRole === 'chaos' && 'Watchdog design, self-healing signals, process resurrection, and restart persistence.'}
            {selectedRole === 'novnc' && 'TigerVNC RFB protocol, WebSocket proxies, PipeWire audio streaming, and resolution adaptation.'}
          </span>
        </div>
        <div className="font-mono text-[10px] text-slate-500">
          {messages.length} messages
        </div>
      </div>

      {/* Messages Scrollable Thread */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-950/40 select-text">
        {messages.map((msg) => {
          const isUser = msg.role === 'user';
          return (
            <div
              key={msg.id}
              className={`flex items-start space-x-3 ${isUser ? 'flex-row-reverse space-x-reverse' : ''}`}
            >
              {/* Avatar */}
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 text-white shadow-md ${
                isUser
                  ? 'bg-indigo-600'
                  : 'bg-gradient-to-tr from-purple-600 to-pink-600'
              }`}>
                {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              {/* Message Bubble */}
              <div className={`max-w-[85%] rounded-2xl p-4 shadow-md text-xs leading-relaxed space-y-2 ${
                isUser
                  ? 'bg-indigo-600/30 border border-indigo-500/50 text-white'
                  : 'bg-slate-900 border border-slate-800 text-slate-200'
              }`}>
                <div className="flex items-center justify-between text-[11px] pb-1 border-b border-slate-800/60 text-slate-400 font-mono">
                  <span className="font-semibold text-slate-300">
                    {isUser ? 'You' : `Gemini Assistant (${msg.modelUsed || selectedModel})`}
                  </span>
                  <div className="flex items-center space-x-2">
                    <span>{msg.timestamp}</span>
                    {!isUser && (
                      <button
                        onClick={() => copyMessage(msg.text, msg.id)}
                        className="hover:text-white transition"
                        title="Copy message"
                      >
                        {copiedId === msg.id ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      </button>
                    )}
                  </div>
                </div>

                <div className="whitespace-pre-wrap font-sans text-xs">
                  {msg.text}
                </div>
              </div>
            </div>
          );
        })}

        {/* Loading Spinner Indicator */}
        {isLoading && (
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-purple-600 to-pink-600 flex items-center justify-center text-white shrink-0 animate-pulse">
              <Bot className="w-4 h-4" />
            </div>
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3.5 text-xs text-slate-300 flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-purple-400 animate-ping" />
              <span className="font-mono text-purple-300 font-medium">
                Gemini ({selectedModel}) is analyzing systems architecture...
              </span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Prompts Carousel */}
      <div className="bg-slate-950 px-4 py-2 border-t border-slate-800/80 overflow-x-auto">
        <div className="flex items-center space-x-2 text-[11px] whitespace-nowrap">
          <span className="text-slate-500 font-semibold flex items-center gap-1">
            <Zap className="w-3 h-3 text-amber-400" />
            Suggested:
          </span>
          {quickPrompts.map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(prompt)}
              disabled={isLoading}
              className="px-2.5 py-1 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700 transition truncate max-w-xs"
            >
              {prompt}
            </button>
          ))}
        </div>
      </div>

      {/* Input Composer */}
      <div className="bg-slate-950 p-4 border-t border-slate-800">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center space-x-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about Debian 13 chroot, TigerVNC, watchdog healing, or bash scripting..."
            disabled={isLoading}
            className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 outline-none focus:border-indigo-500 transition"
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className={`p-2.5 rounded-xl font-medium flex items-center justify-center transition shadow-md ${
              isLoading || !input.trim()
                ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-950/40 active:scale-95'
            }`}
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
        <div className="text-[10px] text-slate-500 mt-2 flex items-center justify-between">
          <span>Powered by @google/genai TypeScript SDK • Server-side API key isolation</span>
          <span className="font-mono">Models: gemini-4-argon | gemini-3.8-flash | gemini-3.1-flash-lite</span>
        </div>
      </div>
    </div>
  );
};
