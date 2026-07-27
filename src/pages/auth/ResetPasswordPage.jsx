import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { resetPassword } from '@/api/auth';
import toast from 'react-hot-toast';

export const ResetPasswordPage = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!password || password.length < 6) return toast.error('Password must be at least 6 characters');
    setLoading(true);
    try {
      await resetPassword(token, password);
      toast.success('Password reset! Please login.');
      navigate('/login');
    } catch (err) {
      toast.error(err.message || 'Reset failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-[390px] mx-auto min-h-screen bg-[var(--color-bg)] flex flex-col justify-center px-6">
      <div className="text-center mb-8">
        <span className="text-5xl mb-4 block">🔐</span>
        <h1 className="text-2xl font-black text-[var(--color-text)]">New Password</h1>
        <p className="text-sm text-[var(--color-text-secondary)] mt-2">Enter your new password.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input label="New Password" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Min 6 characters" />
        <Button type="submit" className="w-full" disabled={loading}>{loading ? 'Resetting...' : 'Reset Password'}</Button>
      </form>
    </div>
  );
};