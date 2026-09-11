import { ToolTrace } from '@/types';
import { Cpu, CheckCircle2, Clock } from 'lucide-react';

interface Props {
  runId?: string;
  intent?: string;
  latency?: number;
  traces: ToolTrace[];
}

export default function TracePanel({ runId, intent, latency, traces }: Props) {
  return (
    <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col h-full">
      <div className="border-b border-slate-200 pb-3 mb-4 flex items-center justify-between">
        <h3 className="font-bold text-slate-800 text-sm flex items-center">
          <Cpu className="w-4 h-4 text-indigo-600 mr-2" />
          LangGraph Agent Trace
        </h3>
        {latency !== undefined && (
          <span className="text-xs font-mono text-slate-500 flex items-center">
            <Clock className="w-3 h-3 mr-1" />
            {latency} ms
          </span>
        )}
      </div>

      <div className="flex-1 overflow-y-auto space-y-3 text-xs">
        {runId ? (
          <>
            <div className="p-3 bg-indigo-50/80 border border-indigo-100 rounded-2xl">
              <div className="font-semibold text-indigo-950">Run ID: <span className="font-mono text-indigo-600">{runId}</span></div>
              <div className="text-indigo-800 mt-1">Detected Intent: <span className="font-mono font-bold">{intent || 'GENERAL_CHAT'}</span></div>
            </div>

            {traces && traces.length > 0 ? (
              <div className="space-y-2 mt-3">
                <div className="font-semibold text-slate-600">Tool Execution Pipeline ({traces.length}):</div>
                {traces.map((trace, idx) => (
                  <div key={idx} className="p-3 bg-slate-50 border border-slate-200 rounded-xl font-mono text-[11px] space-y-1">
                    <div className="flex items-center justify-between text-violet-700 font-bold">
                      <span>[{idx + 1}] {trace.tool_name}()</span>
                      <span className="text-emerald-600 flex items-center text-[10px]">
                        <CheckCircle2 className="w-3 h-3 mr-1" /> SUCCESS
                      </span>
                    </div>
                    <div className="text-slate-500">Input: {JSON.stringify(trace.tool_input)}</div>
                    <div className="text-slate-800 bg-white p-2 rounded border border-slate-200 max-h-24 overflow-y-auto">
                      {JSON.stringify(trace.tool_output, null, 2)}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-slate-400 italic text-center py-4">Direct conversational response (no tools invoked).</div>
            )}
          </>
        ) : (
          <div className="p-6 bg-slate-50 rounded-2xl text-slate-400 text-center text-xs leading-relaxed">
            Send an instruction in the chat pane to observe the LangGraph router, tool selection, parameter validation, and RAG retrieval chunks in real time.
          </div>
        )}
      </div>
    </div>
  );
}
