'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { apiRequest, setAuthToken } from '@/lib/api';
import { Lock, Mail } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('user@eventagent.io');
  const [password, setPassword] = useState('user123');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const data = await apiRequest<{ access_token: string; user: any }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      setAuthToken(data.access_token);
      localStorage.setItem('user', JSON.stringify(data.user));
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Login failed.');
    } finally {
      setLoading(false);
    }
  };

  const fillQuickAccount = (role: 'USER' | 'ADMIN') => {
    if (role === 'USER') {
      setEmail('user@eventagent.io');
      setPassword('user123');
    } else {
      setEmail('admin@eventagent.io');
      setPassword('admin123');
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
      <div className="text-center space-y-1">
        <h2 className="text-2xl font-bold text-slate-900">Sign In</h2>
        <p className="text-xs text-slate-500">Access your event passes or admin console.</p>
      </div>

      {error && <div className="p-3 text-xs bg-red-50 text-red-600 rounded-xl border border-red-200">{error}</div>}

      <form onSubmit={handleLogin} className="space-y-4">
        <div>
          <label className="text-xs font-semibold text-slate-700 block mb-1">Email</label>
          <div className="relative">
            <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-9 pr-3 py-2.5 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
              required
            />
          </div>
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-700 block mb-1">Password</label>
          <div className="relative">
            <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-9 pr-3 py-2.5 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
              required
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold shadow-md shadow-indigo-100 transition"
        >
          {loading ? 'Authenticating...' : 'Sign In'}
        </button>
      </form>

      <div className="pt-2 border-t border-slate-100">
        <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-2 text-center">
          Quick Fill Demo Accounts
        </span>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => fillQuickAccount('USER')}
            className="py-1.5 px-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-xs font-medium text-slate-700"
          >
            👤 Attendee User
          </button>
          <button
            type="button"
            onClick={() => fillQuickAccount('ADMIN')}
            className="py-1.5 px-2 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-lg text-xs font-medium text-indigo-700"
          >
            🛡️ Admin User
          </button>
        </div>
      </div>

      <p className="text-center text-xs text-slate-500">
        Don&apos;t have an account?{' '}
        <Link href="/register" className="text-indigo-600 font-semibold hover:underline">
          Register here
        </Link>
      </p>
    </div>
  );
}
