'use client';
import { useEffect, useState } from 'react';
import { apiRequest } from '@/lib/api';
import { EventItem, Registration } from '@/types';
import EventCard from '@/components/EventCard';
import { Search } from 'lucide-react';

export default function EventsDirectoryPage() {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [search, setSearch] = useState('');

  const loadData = async () => {
    try {
      const data = await apiRequest<EventItem[]>(`/events${search ? `?query=${encodeURIComponent(search)}` : ''}`);
      setEvents(data);
      const myRegs = await apiRequest<Registration[]>('/registrations/me').catch(() => []);
      setRegistrations(myRegs);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadData();
  }, [search]);

  const handleRegister = async (id: number) => {
    try {
      await apiRequest(`/events/${id}/register`, { method: 'POST' });
      alert('Registered successfully!');
      loadData();
    } catch (err: any) {
      alert(err.message || 'Registration failed.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Event Catalog</h1>
          <p className="text-xs text-slate-500 mt-1">Discover, filter, and register for technical workshops and masterclasses.</p>
        </div>
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search topic or speaker..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 outline-none"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {events.map((ev) => (
          <EventCard
            key={ev.id}
            event={ev}
            onRegister={handleRegister}
            isRegistered={registrations.some((r) => r.event_id === ev.id && r.status === 'CONFIRMED')}
          />
        ))}
        {events.length === 0 && (
          <div className="col-span-3 text-center py-12 text-slate-400 text-xs">
            No events found matching your search.
          </div>
        )}
      </div>
    </div>
  );
}
