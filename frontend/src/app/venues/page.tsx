'use client';
import { useEffect, useState } from 'react';
import { apiRequest } from '@/lib/api';
import { Venue } from '@/types';
import { Building, MapPin, Users } from 'lucide-react';

export default function VenuesPage() {
  const [venues, setVenues] = useState<Venue[]>([]);

  useEffect(() => {
    apiRequest<Venue[]>('/venues').then(setVenues).catch(console.error);
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Approved Venues</h1>
        <p className="text-xs text-slate-500 mt-1">Auditoriums, breakout rooms, and innovation labs configured for scheduling.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {venues.map((v) => (
          <div key={v.id} className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
            <div className="w-10 h-10 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center font-bold">
              <Building className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-lg">{v.name}</h3>
              <p className="text-xs text-slate-500 flex items-center mt-1">
                <MapPin className="w-3.5 h-3.5 mr-1 text-slate-400" />
                {v.location}
              </p>
            </div>
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-slate-500 font-medium flex items-center">
                <Users className="w-3.5 h-3.5 mr-1 text-slate-400" /> Capacity:
              </span>
              <span className="font-mono font-bold text-slate-800">{v.capacity} pax</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
