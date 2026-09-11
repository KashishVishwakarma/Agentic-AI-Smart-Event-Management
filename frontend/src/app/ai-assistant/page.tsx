'use client';
import { useState } from 'react';
import { apiRequest } from '@/lib/api';
import { ChatResponse } from '@/types';
import TracePanel from '@/components/TracePanel';
import { Bot, Send, Trash2, Sparkles } from 'lucide-react';

interface Message {
  sender: 'user' | 'ai';
  text: string;
}

export default function AiAssistantPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      sender: 'ai',
      text: 'Hello! I am your **Agentic AI Smart Event Assistant**.\n\nYou can ask me to discover events, book passes, check venue conflicts, or answer questions from our policy documents.',
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [latestTrace, setLatestTrace] = useState<ChatResponse | null>(null);

  const sendMessage = async (promptText?: string) => {
    const textToSend = promptText || input.trim();
    if (!textToSend || loading) return;

    setMessages((prev) => [...prev, { sender: 'user', text: textToSend }]);
    if (!promptText) setInput('');
    setLoading(true);

    try {
      const data = await apiRequest<ChatResponse>('/chat', {
        method: 'POST',
        body: JSON.stringify({ message: textToSend }),
      });
      setMessages((prev) => [...prev, { sender: 'ai', text: data.final_response }]);
      setLatestTrace(data);
    } catch (err: any) {
      setMessages((prev) => [...prev, { sender: 'ai', text: `⚠️ Error: ${err.message || 'Failed to contact agent.'}` }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[750px]">
      {/* Chat Pane */}
      <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col h-full">
        <div className="border-b border-slate-200 pb-3 mb-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-bold">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-slate-800 text-sm">Autonomous Event Agent</h2>
              <span className="text-[11px] text-emerald-600 font-medium flex items-center">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5 animate-pulse" /> LangGraph Orchestrator Active
              </span>
            </div>
          </div>
          <button onClick={() => setMessages([])} className="text-xs text-slate-400 hover:text-slate-600 p-2">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>

        {/* Message Thread */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-2 text-sm">
          {messages.map((m, idx) => (
            <div key={idx} className={`flex items-start space-x-3 ${m.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                  m.sender === 'user' ? 'bg-slate-800 text-white' : 'bg-indigo-600 text-white'
                }`}
              >
                {m.sender === 'user' ? 'U' : <Bot className="w-4 h-4" />}
              </div>
              <div
                className={`p-4 rounded-2xl max-w-lg leading-relaxed whitespace-pre-wrap text-xs sm:text-sm ${
                  m.sender === 'user' ? 'bg-indigo-600 text-white rounded-tr-none' : 'bg-slate-50 border border-slate-200 text-slate-700 rounded-tl-none'
                }`}
              >
                {m.text}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex items-center space-x-2 text-xs text-slate-400 italic">
              <Sparkles className="w-3.5 h-3.5 animate-spin text-indigo-500" /> Agent is reasoning and executing tools...
            </div>
          )}
        </div>

        {/* Suggested Quick Prompts */}
        <div className="pt-3 flex flex-wrap gap-2">
          <button
            onClick={() => sendMessage('Find an AI workshop this weekend')}
            className="text-[11px] bg-slate-50 hover:bg-slate-100 text-slate-600 px-2.5 py-1 rounded-lg border border-slate-200"
          >
            🔍 Find AI workshop
          </button>
          <button
            onClick={() => sendMessage('Find an AI workshop and register me')}
            className="text-[11px] bg-indigo-50 hover:bg-indigo-100 text-indigo-700 px-2.5 py-1 rounded-lg border border-indigo-200"
          >
            ⚡ Multi-step: Find & Register
          </button>
          <button
            onClick={() => sendMessage('What is the cancellation policy?')}
            className="text-[11px] bg-purple-50 hover:bg-purple-100 text-purple-700 px-2.5 py-1 rounded-lg border border-purple-200"
          >
            📜 Policy RAG
          </button>
        </div>

        {/* Input Form */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            sendMessage();
          }}
          className="pt-3 border-t border-slate-200 mt-3 flex items-center space-x-2"
        >
          <input
            type="text"
            placeholder="Type instructions (e.g. 'Register me for event 1')..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-1 px-4 py-3 bg-slate-50 border border-slate-300 rounded-2xl text-xs sm:text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
          />
          <button
            type="submit"
            disabled={loading}
            className="px-5 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-semibold shadow-md shadow-indigo-100 transition"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>

      {/* Real-Time Agent Execution Trace */}
      <div className="h-full">
        <TracePanel
          runId={latestTrace?.run_id}
          intent={latestTrace?.detected_intent}
          latency={latestTrace?.latency_ms}
          traces={latestTrace?.tool_traces || []}
        />
      </div>
    </div>
  );
}
