import { useState } from 'react';

export default function RegisterForm() {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const name = formData.get('name') as string;
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });

      if (res.ok) {
        window.location.href = '/';
      } else {
        const data = await res.json();
        setError(data.error || 'Gagal mendaftar');
      }
    } catch {
      setError('Terjadi kesalahan');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-danger/10 text-danger text-sm p-3 rounded-md">
          {error}
        </div>
      )}
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-fg mb-1">
          Nama
        </label>
        <input
          type="text"
          id="name"
          name="name"
          required
          className="w-full px-4 py-2 rounded-md border border-border bg-surface text-fg placeholder:text-fg-muted focus:outline-none focus:ring-2 focus:ring-primary"
          placeholder="Nama lengkap"
        />
      </div>
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-fg mb-1">
          Email
        </label>
        <input
          type="email"
          id="email"
          name="email"
          required
          className="w-full px-4 py-2 rounded-md border border-border bg-surface text-fg placeholder:text-fg-muted focus:outline-none focus:ring-2 focus:ring-primary"
          placeholder="nama@email.com"
        />
      </div>
      <div>
        <label htmlFor="password" className="block text-sm font-medium text-fg mb-1">
          Password
        </label>
        <input
          type="password"
          id="password"
          name="password"
          required
          minLength={6}
          className="w-full px-4 py-2 rounded-md border border-border bg-surface text-fg placeholder:text-fg-muted focus:outline-none focus:ring-2 focus:ring-primary"
          placeholder="Minimal 6 karakter"
        />
      </div>
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-primary hover:bg-primary-hover text-fg font-semibold py-3 rounded-md transition-colors disabled:opacity-50"
      >
        {loading ? 'Mendaftar...' : 'Daftar'}
      </button>
    </form>
  );
}
