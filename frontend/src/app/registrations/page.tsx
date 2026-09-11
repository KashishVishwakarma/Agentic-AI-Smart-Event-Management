'use client';
import { useEffect, useState } from 'react';
import { apiRequest } from '@/lib/api';
import { Registration } from '@/types';
import { Ticket, Calendar, Clock, XCircle } from 'lucide-react';

export default function RegistrationsPage() {
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);

  const loadRegistrations = async () => {
    setLoading(true);
    try {
      const data = await apiRequest<Registration[]>('/registrations/me');
      setRegistrations(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRegistrations();
  }, []);

  const handleCancel = async (eventId: number) => {
    if (!confirm('Are you sure you want to cancel this registration?')) return;
    try {
      await apiRequest(`/events/${eventId}/register`, { method: 'DELETE' });
      alert('Pass cancelled successfully.');
      loadRegistrations();
    } catch (err: any) {
      alert(err.message || 'Failed to cancel pass.');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">My Confirmed Passes</h1>
        <p className="text-xs text-slate-500 mt-1">View your registered workshop tickets and manage cancellations.</p>
      </div>

      <div className="space-y-4">
        {registrations.map((r) => (
          <div key={r.id} className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start sm:items-center space-x-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold shrink-0">
                <Ticket className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <div className="text-[11px] font-mono text-slate-400">Pass #{r.id}</div>
                <h3 className="font-bold text-slate-900 text-base">{r.event?.title || `Event #${r.event_id}`}</h3>
                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                  <span className="flex items-center"><Calendar className="w-3 h-3 mr-1" /> {r.event?.date}</span>
                  <span className="flex items-center"><Clock className="w-3 h-3 mr-1" /> {r.event?.time}</span>
                  <span className={`px-2 py-0.5 rounded-full font-semibold text-[10px] ${r.status === 'CONFIRMED' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-600 border border-red-200'}`}>
                    {r.status}
                  </span>
                </div>
              </div>
            </div>

            {r.status === 'CONFIRMED' && (
              <button
                onClick={() => handleCancel(r.event_id)}
                className="px-4 py-2 border border-red-200 text-red-600 hover:bg-red-50 rounded-xl text-xs font-semibold transition flex items-center justify-center self-end sm:self-center"
              >
                <XCircle className="w-3.5 h-3.5 mr-1" /> Cancel Pass
              </button>
            )}
          </div>
        ))}

        {!loading && registrations.length === 0 && (
          <div className="text-center py-12 bg-white rounded-2xl border border-slate-200 text-slate-400 text-xs">
            You do not have any registered event passes at this time.
          </div>
        )}
      </div>
    </div>
  );
}
