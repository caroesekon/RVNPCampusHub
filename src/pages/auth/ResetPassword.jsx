import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { IoLockClosed, IoEye, IoEyeOff, IoKey } from 'react-icons/io5';
import Logo from '../../components/ui/Logo.jsx';
import Button from '../../components/ui/Button.jsx';
import authApi from '../../api/authApi.js';
import { isValidPassword } from '../../utils/validators.js';

const ResetPassword = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [form, setForm] = useState({
    newPassword: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const token = searchParams.get('token');
  const userId = searchParams.get('userId');

  const validate = () => {
    const newErrors = {};

    if (!isValidPassword(form.newPassword)) {
      newErrors.newPassword = 'Password must be at least 8 characters';
    }

    if (form.newPassword !== form.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError('');

    if (!token || !userId) {
      setApiError('Invalid reset link');
      return;
    }

    if (!validate()) return;

    setLoading(true);

    try {
      const response = await authApi.resetPassword({
        token,
        userId,
        newPassword: form.newPassword,
      });

      if (response.data.success) {
        navigate('/login');
      } else {
        setApiError(response.data.message || 'Failed to reset password');
      }
    } catch (error) {
      setApiError(error.response?.data?.message || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg-primary flex items-center justify-center px-4 py-8 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-72 h-72 bg-rvnp-green opacity-5 rounded-full translate-x-1/3 -translate-y-1/3" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-rvnp-red opacity-5 rounded-full -translate-x-1/3 translate-y-1/3" />

      <div className="w-full max-w-md relative">
        <div className="bg-bg-primary border-2 border-rvnp-green rounded-2xl shadow-2xl p-6 sm:p-8">
          <div className="flex flex-col items-center mb-6">
            <div className="p-3 rounded-full bg-rvnp-green bg-opacity-10">
              <IoKey size={28} className="text-rvnp-green" />
            </div>
            <h1 className="text-2xl font-heading font-bold text-text-primary mt-4">
              Reset Password
            </h1>
            <p className="text-text-secondary mt-1 text-sm">
              Enter your new password
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {apiError && (
              <div className="p-3 rounded-lg bg-rvnp-red bg-opacity-10 border border-rvnp-red text-rvnp-red text-sm">
                {apiError}
              </div>
            )}

            <div className="relative">
              <IoLockClosed className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="New Password"
                value={form.newPassword}
                onChange={(e) => setForm({ ...form, newPassword: e.target.value })}
                className="w-full pl-10 pr-12 py-3 rounded-lg bg-bg-secondary text-text-primary border border-border-color focus:outline-none focus:border-rvnp-green placeholder:text-text-muted"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted"
              >
                {showPassword ? <IoEyeOff size={18} /> : <IoEye size={18} />}
              </button>
              {errors.newPassword && <p className="text-xs text-rvnp-red mt-1">{errors.newPassword}</p>}
            </div>

            <div className="relative">
              <IoLockClosed className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Confirm Password"
                value={form.confirmPassword}
                onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                className="w-full pl-10 pr-12 py-3 rounded-lg bg-bg-secondary text-text-primary border border-border-color focus:outline-none focus:border-rvnp-green placeholder:text-text-muted"
              />
              {errors.confirmPassword && <p className="text-xs text-rvnp-red mt-1">{errors.confirmPassword}</p>}
            </div>

            <Button type="submit" fullWidth loading={loading} className="py-3">
              Reset Password
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;