import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useSettings } from '@/context/SettingsContext';
import { Button } from '@/components/ui/Button';
import toast from 'react-hot-toast';

export const LoginPage = () => {
  const { login } = useAuth();
  const { settings } = useSettings();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) return toast.error('Fill all fields');
    setLoading(true);
    try {
      await login(email, password);
      toast.success('Welcome back!');
      navigate('/');
    } catch (err) {
      toast.error(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-[390px] mx-auto min-h-screen bg-[var(--color-bg)] flex flex-col justify-center px-6">
      <div className="text-center mb-8">
        <div className="w-16 h-16 rounded-2xl bg-[var(--color-primary)] flex items-center justify-center mx-auto mb-4">
          <span className="text-white font-black text-2xl">RV</span>
        </div>
        <h1 className="text-2xl font-black text-[var(--color-text)]">{settings.systemName}</h1>
        <p className="text-sm text-[var(--color-text-secondary)] mt-1">{settings.tagline}</p>
        <p className="text-xs text-[var(--color-text-muted)] mt-1">from HDM</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-semibold mb-1 text-[var(--color-text-secondary)]">Email</label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="davis@rvnp.ac.ke"
            className="w-full px-4 py-3 rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text)] text-sm placeholder:text-[var(--color-text-muted)]/30 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold mb-1 text-[var(--color-text-secondary)]">Password</label>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full px-4 py-3 rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text)] text-sm placeholder:text-[var(--color-text-muted)]/30 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
          />
        </div>

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? 'Logging in...' : 'Login'}
        </Button>
      </form>

      <div className="text-center mt-4 space-y-2">
        <Link to="/forgot-password" className="text-sm text-[var(--color-primary)] font-semibold hover:underline">Forgot password?</Link>
      </div>

      <div className="text-center mt-6">
        <p className="text-sm text-[var(--color-text-secondary)]">
          Don't have an account?{' '}
          <Link to="/register" className="text-[var(--color-primary)] font-semibold hover:underline">Register</Link>
        </p>
      </div>
    </div>
  );
};