import Link from 'next/link';
import { Calendar, Clock, MapPin, Users } from 'lucide-react';
import { EventItem } from '@/types';

interface Props {
  event: EventItem;
  onRegister?: (id: number) => void;
  isRegistered?: boolean;
}

export default function EventCard({ event, onRegister, isRegistered }: Props) {
  const isFull = (event.available_seats ?? 0) <= 0;

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between text-xs mb-3">
          <span className="px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 font-semibold border border-indigo-100 flex items-center">
            <MapPin className="w-3 h-3 mr-1" />
            {event.venue?.name || 'Main Campus'}
          </span>
          <span className={`font-mono text-xs font-semibold ${isFull ? 'text-red-500' : 'text-emerald-600'}`}>
            <Users className="w-3 h-3 inline mr-1" />
            {event.available_seats} / {event.capacity} seats left
          </span>
        </div>

        <Link href={`/events/${event.id}`}>
          <h3 className="font-bold text-slate-900 text-lg hover:text-indigo-600 transition leading-snug">
            {event.title}
          </h3>
        </Link>
        <p className="text-xs text-slate-500 mt-2 line-clamp-2 leading-relaxed">
          {event.description || 'Hands-on practical session with subject matter experts.'}
        </p>

        <div className="mt-4 pt-3 border-t border-slate-100 grid grid-cols-2 gap-2 text-xs text-slate-500">
          <div className="flex items-center">
            <Calendar className="w-3.5 h-3.5 mr-1.5 text-indigo-500" />
            {event.date}
          </div>
          <div className="flex items-center">
            <Clock className="w-3.5 h-3.5 mr-1.5 text-indigo-500" />
            {event.time}
          </div>
        </div>
      </div>

      <div className="mt-5">
        {isRegistered ? (
          <button disabled className="w-full py-2.5 bg-emerald-50 text-emerald-700 rounded-xl text-xs font-semibold border border-emerald-200 cursor-not-allowed">
            ✓ Confirmed
          </button>
        ) : (
          <button
            onClick={() => onRegister && onRegister(event.id)}
            disabled={isFull}
            className={`w-full py-2.5 rounded-xl text-xs font-semibold shadow-sm transition ${
              isFull
                ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-100'
            }`}
          >
            {isFull ? 'Sold Out' : 'Register Pass'}
          </button>
        )}
      </div>
    </div>
  );
}
