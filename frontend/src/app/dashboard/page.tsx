'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { apiRequest } from '@/lib/api';
import { EventItem, Venue, Registration, AgentRunLog } from '@/types';
import EventCard from '@/components/EventCard';
import { Calendar, Building, Ticket, Bot, ArrowRight } from 'lucide-react';

export default function DashboardPage() {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [venues, setVenues] = useState<Venue[]>([]);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [runs, setRuns] = useState<AgentRunLog[]>([]);

  useEffect(() => {
    apiRequest<EventItem[]>('/events').then(setEvents).catch(console.error);
    apiRequest<Venue[]>('/venues').then(setVenues).catch(console.error);
    apiRequest<Registration[]>('/registrations/me').then(setRegistrations).catch(() => {});
    apiRequest<AgentRunLog[]>('/observability/runs').then(setRuns).catch(() => {});
  }, []);

  const handleRegister = async (eventId: number) => {
    try {
      await apiRequest(`/events/${eventId}/register`, { method: 'POST' });
      alert('Pass registered successfully!');
      const updated = await apiRequest<EventItem[]>('/events');
      setEvents(updated);
      const myRegs = await apiRequest<Registration[]>('/registrations/me');
      setRegistrations(myRegs);
    } catch (err: any) {
      alert(err.message || 'Registration failed.');
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Event Operations Dashboard</h1>
        <p className="text-xs text-slate-500 mt-1">Autonomous orchestration metrics, live capacity, and active schedule.</p>
      </div>

      {/* Stats Counter Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase">
            <span>Active Events</span>
            <Calendar className="w-5 h-5 text-indigo-500" />
          </div>
          <div className="text-3xl font-bold text-slate-900 mt-2">{events.length}</div>
          <span className="text-xs text-emerald-600 font-medium">Published Sessions</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase">
            <span>Venues Configured</span>
            <Building className="w-5 h-5 text-violet-500" />
          </div>
          <div className="text-3xl font-bold text-slate-900 mt-2">{venues.length}</div>
          <span className="text-xs text-slate-500">Total Capacity: {venues.reduce((acc, v) => acc + v.capacity, 0)} pax</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase">
            <span>My Bookings</span>
            <Ticket className="w-5 h-5 text-amber-500" />
          </div>
          <div className="text-3xl font-bold text-slate-900 mt-2">{registrations.filter((r) => r.status === 'CONFIRMED').length}</div>
          <Link href="/registrations" className="text-xs text-indigo-600 font-medium hover:underline">
            View Passes &rarr;
          </Link>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase">
            <span>Agent Runs</span>
            <Bot className="w-5 h-5 text-pink-500" />
          </div>
          <div className="text-3xl font-bold text-slate-900 mt-2">{runs.length}</div>
          <span className="text-xs text-emerald-600 font-medium">LangGraph Workflows</span>
        </div>
      </div>

      {/* Featured Sessions */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-bold text-slate-900 text-lg">Upcoming Sessions</h2>
          <Link href="/events" className="text-xs font-semibold text-indigo-600 hover:underline flex items-center">
            View All <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {events.slice(0, 3).map((ev) => (
            <EventCard
              key={ev.id}
              event={ev}
              onRegister={handleRegister}
              isRegistered={registrations.some((r) => r.event_id === ev.id && r.status === 'CONFIRMED')}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
