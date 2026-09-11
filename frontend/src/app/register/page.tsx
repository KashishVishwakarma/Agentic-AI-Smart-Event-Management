'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { apiRequest } from '@/lib/api';

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'USER' | 'ADMIN'>('USER');
  const [error, setError] = useState('');

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiRequest('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ name, email, password, role }),
      });
      alert('Registration successful! Please log in.');
      router.push('/login');
    } catch (err: any) {
      setError(err.message || 'Registration failed.');
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
      <div className="text-center space-y-1">
        <h2 className="text-2xl font-bold text-slate-900">Create Account</h2>
        <p className="text-xs text-slate-500">Join the Smart Event Management Platform.</p>
      </div>

      {error && <div className="p-3 text-xs bg-red-50 text-red-600 rounded-xl border border-red-200">{error}</div>}

      <form onSubmit={handleRegister} className="space-y-4">
        <div>
          <label className="text-xs font-semibold text-slate-700 block mb-1">Full Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2.5 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
            required
          />
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-700 block mb-1">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2.5 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
            required
          />
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-700 block mb-1">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3 py-2.5 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
            required
          />
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-700 block mb-1">Role</label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value as any)}
            className="w-full px-3 py-2.5 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
          >
            <option value="USER">Attendee (User)</option>
            <option value="ADMIN">Event Organizer (Admin)</option>
          </select>
        </div>

        <button
          type="submit"
          className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold shadow-md shadow-indigo-100 transition"
        >
          Register Account
        </button>
      </form>

      <p className="text-center text-xs text-slate-500">
        Already have an account?{' '}
        <Link href="/login" className="text-indigo-600 font-semibold hover:underline">
          Sign In
        </Link>
      </p>
    </div>
  );
}
