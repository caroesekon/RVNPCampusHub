import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { IoMail, IoLockClosed, IoEye, IoEyeOff, IoLogIn } from 'react-icons/io5';
import Logo from '../../components/ui/Logo.jsx';
import Button from '../../components/ui/Button.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { isValidEmail, isRequired } from '../../utils/validators.js';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const validate = () => {
    const newErrors = {};
    if (!isValidEmail(form.email)) newErrors.email = 'Enter a valid email address';
    if (!isRequired(form.password)) newErrors.password = 'Password is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError('');
    if (!validate()) return;

    setLoading(true);
    try {
      const response = await login(form.email, form.password);
      if (response.success) {
        navigate('/feed');
      } else {
        setApiError(response.message || 'Login failed');
      }
    } catch (error) {
      setApiError(error.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg-primary flex items-center justify-center px-4 py-8 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-72 h-72 bg-rvnp-green opacity-5 rounded-full -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-rvnp-green opacity-5 rounded-full translate-x-1/2 translate-y-1/2" />

      <div className="w-full max-w-md relative">
        <div className="bg-bg-primary border-2 border-rvnp-green rounded-2xl shadow-2xl p-6 sm:p-8">
          <div className="flex flex-col items-center mb-6">
            <div className="p-3 rounded-full bg-rvnp-green bg-opacity-10">
              <Logo size="lg" showText={false} />
            </div>
            <h1 className="text-2xl font-heading font-bold text-text-primary mt-4">
              Welcome Back
            </h1>
            <p className="text-text-secondary mt-1 text-sm">
              Login to your account
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {apiError && (
              <div className="p-3 rounded-lg bg-rvnp-red bg-opacity-10 border border-rvnp-red text-rvnp-red text-sm">
                {apiError}
              </div>
            )}

            <div className="relative">
              <IoMail className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
              <input
                type="email"
                placeholder="Email address"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full pl-10 pr-4 py-3 rounded-lg bg-bg-secondary text-text-primary border border-border-color focus:outline-none focus:border-rvnp-green focus:ring-1 focus:ring-rvnp-green placeholder:text-text-muted"
              />
              {errors.email && <p className="text-xs text-rvnp-red mt-1">{errors.email}</p>}
            </div>

            <div className="relative">
              <IoLockClosed className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="w-full pl-10 pr-12 py-3 rounded-lg bg-bg-secondary text-text-primary border border-border-color focus:outline-none focus:border-rvnp-green focus:ring-1 focus:ring-rvnp-green placeholder:text-text-muted"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary"
              >
                {showPassword ? <IoEyeOff size={18} /> : <IoEye size={18} />}
              </button>
              {errors.password && <p className="text-xs text-rvnp-red mt-1">{errors.password}</p>}
            </div>

            <div className="flex justify-end">
              <Link to="/forgot-password" className="text-sm text-rvnp-green hover:underline">
                Forgot Password?
              </Link>
            </div>

            <Button type="submit" fullWidth loading={loading} className="py-3">
              <IoLogIn className="inline mr-1" size={18} />
              Login
            </Button>
          </form>

          <p className="text-center text-text-secondary text-sm mt-6">
            Don't have an account?{' '}
            <Link to="/register" className="text-rvnp-green font-medium hover:underline">
              Create Account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;