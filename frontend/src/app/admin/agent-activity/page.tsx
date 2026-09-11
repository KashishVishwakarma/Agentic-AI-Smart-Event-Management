'use client';
import { useEffect, useState } from 'react';
import { apiRequest } from '@/lib/api';
import { AgentRunLog } from '@/types';
import { Shield, RotateCw } from 'lucide-react';

export default function AgentActivityPage() {
  const [runs, setRuns] = useState<AgentRunLog[]>([]);
  const [loading, setLoading] = useState(true);

  const loadRuns = async () => {
    setLoading(true);
    try {
      const data = await apiRequest<AgentRunLog[]>('/observability/runs');
      setRuns(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRuns();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center">
            <Shield className="w-6 h-6 text-indigo-600 mr-2" /> Agent Observability Audit
          </h1>
          <p className="text-xs text-slate-500 mt-1">Audit trail of all agent runs, tool invocation pipelines, latency, and status.</p>
        </div>
        <button
          onClick={loadRuns}
          className="px-3 py-2 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl text-xs font-semibold text-slate-700 flex items-center shadow-sm"
        >
          <RotateCw className="w-3.5 h-3.5 mr-1" /> Refresh
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-left text-xs text-slate-600">
          <thead className="bg-slate-50 text-slate-500 uppercase font-semibold border-b border-slate-200">
            <tr>
              <th className="p-4">Run ID</th>
              <th className="p-4">Prompt</th>
              <th className="p-4">Detected Intent</th>
              <th className="p-4">Tools Executed</th>
              <th className="p-4">Latency</th>
              <th className="p-4">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {runs.map((r) => (
              <tr key={r.id} className="hover:bg-slate-50 transition">
                <td className="p-4 font-mono font-semibold text-indigo-600">{r.run_id}</td>
                <td className="p-4 font-medium text-slate-800 max-w-xs truncate">{r.user_prompt}</td>
                <td className="p-4">
                  <span className="px-2 py-0.5 bg-slate-100 rounded text-slate-700 font-mono text-[10px]">
                    {r.detected_intent || 'UNKNOWN'}
                  </span>
                </td>
                <td className="p-4 font-mono text-slate-500 text-[11px] max-w-xs truncate">{r.tools_called || '[]'}</td>
                <td className="p-4 font-mono font-semibold text-slate-700">{r.latency_ms} ms</td>
                <td className="p-4">
                  <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 font-semibold rounded text-[10px]">
                    {r.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!loading && runs.length === 0 && (
          <div className="text-center py-10 text-slate-400 text-xs">No agent runs recorded yet.</div>
        )}
      </div>
    </div>
  );
}
