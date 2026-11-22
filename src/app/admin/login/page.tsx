'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AlertCircle, ShieldCheck } from 'lucide-react';
import { Logo } from '@/components/brand/Logo';

export default function AdminLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const result = await response.json();
      if (!response.ok) {
        setError(result.error || 'Unable to sign in.');
        return;
      }

      router.replace('/admin');
      router.refresh();
    } catch {
      setError('Could not connect to the server. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-shrebian-bg text-white flex items-center justify-center p-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm rounded-2xl border border-shrebian-border bg-shrebian-surface p-6 sm:p-8 space-y-6 shadow-2xl"
      >
        <div className="flex flex-col items-center gap-4 text-center">
          <Logo size="md" />
          <div className="w-12 h-12 rounded-full bg-shrebian-red/10 text-shrebian-red flex items-center justify-center">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-black">Admin Sign In</h1>
            <p className="mt-1 text-xs text-shrebian-muted">Sign in to open the owner dashboard.</p>
          </div>
        </div>

        {error && (
          <div role="alert" className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-300 flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label htmlFor="admin-username" className="mb-1.5 block text-xs font-semibold text-gray-300">
              Username
            </label>
            <input
              id="admin-username"
              name="username"
              autoComplete="username"
              required
              value={username}
              onChange={event => setUsername(event.target.value)}
              className="w-full rounded-xl border border-shrebian-border bg-shrebian-card px-3.5 py-3 text-sm focus:border-shrebian-gold focus:outline-none"
            />
          </div>
          <div>
            <label htmlFor="admin-password" className="mb-1.5 block text-xs font-semibold text-gray-300">
              Password
            </label>
            <input
              id="admin-password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={event => setPassword(event.target.value)}
              className="w-full rounded-xl border border-shrebian-border bg-shrebian-card px-3.5 py-3 text-sm focus:border-shrebian-gold focus:outline-none"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-xl bg-shrebian-red py-3 text-sm font-bold text-white transition-colors hover:bg-shrebian-red-hover disabled:cursor-not-allowed disabled:opacity-50"
        >
          {submitting ? 'SIGNING IN...' : 'SIGN IN'}
        </button>
      </form>
    </main>
  );
}
