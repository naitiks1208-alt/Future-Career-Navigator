
import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Sparkles } from 'lucide-react';
import { generateMentorResponse } from '../services/geminiService';
import { ChatMessage } from '../types';

const MentorChat: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      role: 'model',
      text: "Hi there! I'm your AI Career Mentor. I can help you choose streams, explore careers, or give advice on skills. What's on your mind today?",
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    // Prepare history for API
    const history = messages.map(m => ({ role: m.role, text: m.text }));
    
    const responseText = await generateMentorResponse(history, userMsg.text);

    const botMsg: ChatMessage = {
      id: (Date.now() + 1).toString(),
      role: 'model',
      text: responseText || "Sorry, I couldn't process that.",
      timestamp: new Date()
    };

    setMessages(prev => [...prev, botMsg]);
    setIsLoading(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-900 rounded-3xl shadow-2xl border border-slate-800 overflow-hidden relative">
      {/* Background Glow */}
      <div className="absolute top-0 left-0 w-full h-full bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-5 pointer-events-none"></div>

      {/* Header */}
      <div className="bg-slate-900/80 backdrop-blur-md p-4 border-b border-slate-800 flex items-center gap-4 sticky top-0 z-10">
        <div className="bg-indigo-600 p-2.5 rounded-xl shadow-[0_0_15px_rgba(79,70,229,0.4)]">
          <Bot className="w-6 h-6 text-white" />
        </div>
        <div>
          <h2 className="font-bold text-lg text-white">AI Mentor</h2>
          <p className="text-indigo-300 text-xs font-medium">Online • Ready to assist</p>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6 bg-slate-950 scrollbar-thin scrollbar-thumb-slate-800">
        {messages.map((msg) => (
          <div 
            key={msg.id} 
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`
              max-w-[85%] lg:max-w-[70%] rounded-2xl p-4 shadow-sm relative group
              ${msg.role === 'user' 
                ? 'bg-indigo-600 text-white rounded-br-sm shadow-[0_4px_15px_rgba(79,70,229,0.3)]' 
                : 'bg-slate-800 text-slate-200 border border-slate-700 rounded-bl-sm'}
            `}>
              {msg.role === 'model' && (
                <div className="flex items-center gap-2 mb-2 border-b border-slate-700 pb-2">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase">FutureNav Mentor</span>
                </div>
              )}
              <div className="whitespace-pre-wrap leading-relaxed text-sm md:text-base">
                {msg.text}
              </div>
              <div className={`text-[10px] mt-2 text-right font-medium opacity-70 ${msg.role === 'user' ? 'text-indigo-200' : 'text-slate-500'}`}>
                {msg.timestamp.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
              </div>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-slate-800 p-4 rounded-2xl rounded-bl-sm border border-slate-700 flex gap-2 items-center">
              <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce delay-75"></div>
              <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce delay-150"></div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-slate-900 border-t border-slate-800">
        <div className="flex items-center gap-3 bg-slate-800 rounded-2xl p-2 px-4 focus-within:ring-2 focus-within:ring-indigo-500 focus-within:bg-slate-800 transition-all border border-slate-700">
          <input 
            type="text"
            className="flex-1 bg-transparent border-none focus:outline-none text-white placeholder-slate-500 py-3"
            placeholder="Ask anything... e.g., 'What subject do I need for Architecture?'"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isLoading}
          />
          <button 
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="p-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-lg shadow-indigo-900/20"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default MentorChat;
