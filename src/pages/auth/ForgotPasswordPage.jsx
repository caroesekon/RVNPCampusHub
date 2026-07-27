import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { forgotPassword } from '@/api/auth';
import toast from 'react-hot-toast';

export const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return toast.error('Enter your email');
    setLoading(true);
    try {
      await forgotPassword(email);
      setSent(true);
      toast.success('Check your email for reset link');
    } catch (err) {
      toast.error(err.message || 'Failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-[390px] mx-auto min-h-screen bg-[var(--color-bg)] flex flex-col justify-center px-6">
      <div className="text-center mb-8">
        <span className="text-5xl mb-4 block">🔑</span>
        <h1 className="text-2xl font-black text-[var(--color-text)]">Reset Password</h1>
        <p className="text-sm text-[var(--color-text-secondary)] mt-2">Enter your email and we'll send you a reset link.</p>
      </div>

      {sent ? (
        <div className="text-center">
          <span className="text-4xl block mb-3">📧</span>
          <p className="text-[var(--color-text)] font-semibold">Email sent!</p>
          <p className="text-sm text-[var(--color-text-secondary)] mt-1">Check your inbox for the reset link.</p>
          <Link to="/login" className="text-[var(--color-primary)] font-semibold text-sm mt-4 block">Back to Login</Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Email" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="yourname@rvnp.ac.ke" />
          <Button type="submit" className="w-full" disabled={loading}>{loading ? 'Sending...' : 'Send Reset Link'}</Button>
          <Link to="/login" className="block text-center text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text)]">Back to Login</Link>
        </form>
      )}
    </div>
  );
};