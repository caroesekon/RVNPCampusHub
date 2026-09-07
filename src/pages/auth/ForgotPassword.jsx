import { useState } from 'react';
import { Link } from 'react-router-dom';
import { IoMail, IoArrowBack } from 'react-icons/io5';
import Logo from '../../components/ui/Logo.jsx';
import Button from '../../components/ui/Button.jsx';
import authApi from '../../api/authApi.js';
import { isValidEmail } from '../../utils/validators.js';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!isValidEmail(email)) {
      setError('Enter a valid email address');
      return;
    }

    setLoading(true);

    try {
      const response = await authApi.forgotPassword(email);

      if (response.data.success) {
        setSuccess(true);
      } else {
        setError(response.data.message || 'Failed to send reset link');
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to send reset link');
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
              Forgot Password
            </h1>
            <p className="text-text-secondary mt-1 text-sm">
              Enter your email to reset your password
            </p>
          </div>

          {success ? (
            <div className="text-center">
              <div className="p-4 rounded-lg bg-rvnp-green bg-opacity-10 border border-rvnp-green text-rvnp-green mb-4">
                <p className="font-medium">Password reset link sent!</p>
                <p className="text-sm mt-1">Check your email inbox</p>
              </div>
              <Link to="/login" className="inline-flex items-center gap-1 text-rvnp-green font-medium hover:underline">
                <IoArrowBack size={16} />
                Back to Login
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 rounded-lg bg-rvnp-red bg-opacity-10 border border-rvnp-red text-rvnp-red text-sm">
                  {error}
                </div>
              )}

              <div className="relative">
                <IoMail className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
                <input
                  type="email"
                  placeholder="Email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-lg bg-bg-secondary text-text-primary border border-border-color focus:outline-none focus:border-rvnp-green focus:ring-1 focus:ring-rvnp-green placeholder:text-text-muted"
                />
              </div>

              <Button type="submit" fullWidth loading={loading} className="py-3">
                Send Reset Link
              </Button>
            </form>
          )}

          <p className="text-center text-text-secondary text-sm mt-6">
            Remember your password?{' '}
            <Link to="/login" className="text-rvnp-green font-medium hover:underline">
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;