import Link from 'next/link';
import { Bot, Sparkles, Calendar, ShieldCheck, Ticket, ArrowRight } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="space-y-12">
      {/* Hero Banner */}
      <section className="bg-gradient-to-br from-indigo-950 via-indigo-900 to-purple-950 rounded-3xl p-8 sm:p-12 text-white shadow-xl relative overflow-hidden">
        <div className="max-w-3xl space-y-4 relative z-10">
          <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-400/30">
            <Sparkles className="w-3.5 h-3.5 mr-1.5" /> Next-Generation Event Operations
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight">
            Autonomous Agentic AI Event Management
          </h1>
          <p className="text-indigo-200 text-sm sm:text-base leading-relaxed">
            Manage conferences, check venue conflicts, and issue tickets through traditional web workflows or natural-language instructions powered by LangGraph and grounded RAG knowledge.
          </p>
          <div className="pt-4 flex flex-wrap gap-3">
            <Link href="/ai-assistant" className="px-6 py-3 bg-white text-indigo-950 rounded-xl font-bold shadow-md hover:bg-indigo-50 transition flex items-center">
              <Bot className="w-4 h-4 mr-2" /> Launch AI Assistant <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
            <Link href="/events" className="px-6 py-3 bg-indigo-800/80 hover:bg-indigo-800 text-white rounded-xl font-semibold border border-indigo-700 transition">
              Browse Events
            </Link>
          </div>
        </div>
      </section>

      {/* Feature Highlights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
            <Bot className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-slate-900 text-base">Multi-Step Agent Actions</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Compound instructions like <em>"Find an AI workshop this weekend and register me"</em> autonomously execute search, availability checks, and seat reservation.
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-slate-900 text-base">Grounded Policy RAG</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Indexed organizational policies, cancellation rules, and FAQs guarantee grounded, hallucination-free answers with source citations.
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <Ticket className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-slate-900 text-base">Real-Time Seat & Venue Verification</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Strict capacity validation, double-booking prevention, and instant seat releases upon cancellation ensure robust event governance.
          </p>
        </div>
      </div>
    </div>
  );
}
