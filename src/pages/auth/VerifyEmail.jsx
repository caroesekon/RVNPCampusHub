import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { IoShieldCheckmark, IoRefresh } from 'react-icons/io5';
import Logo from '../../components/ui/Logo.jsx';
import Button from '../../components/ui/Button.jsx';
import authApi from '../../api/authApi.js';
import { isValidOtp } from '../../utils/validators.js';

const VerifyEmail = () => {
  const navigate = useNavigate();

  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => {
        setResendCooldown(resendCooldown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const handleVerify = async (e) => {
    e.preventDefault();
    setError('');

    if (!isValidOtp(otp)) {
      setError('Enter a valid 6-digit code');
      return;
    }

    setLoading(true);

    try {
      const response = await authApi.verifyEmail(otp);

      if (response.data.success) {
        setSuccess(true);
        setTimeout(() => navigate('/login'), 2000);
      } else {
        setError(response.data.message || 'Verification failed');
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResendLoading(true);
    setError('');

    try {
      const response = await authApi.resendOtp();

      if (response.data.success) {
        setResendCooldown(30);
      } else {
        setError(response.data.message || 'Failed to resend OTP');
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to resend OTP');
    } finally {
      setResendLoading(false);
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
              <IoShieldCheckmark size={28} className="text-rvnp-green" />
            </div>
            <h1 className="text-2xl font-heading font-bold text-text-primary mt-4">
              Verify Email
            </h1>
            <p className="text-text-secondary mt-1 text-sm text-center">
              Enter the 6-digit code sent to your email and phone
            </p>
          </div>

          {success ? (
            <div className="text-center">
              <div className="p-4 rounded-lg bg-rvnp-green bg-opacity-10 border border-rvnp-green text-rvnp-green mb-4">
                <p className="font-medium">Email verified successfully!</p>
                <p className="text-sm mt-1">Redirecting to login...</p>
              </div>
            </div>
          ) : (
            <form onSubmit={handleVerify} className="space-y-4">
              {error && (
                <div className="p-3 rounded-lg bg-rvnp-red bg-opacity-10 border border-rvnp-red text-rvnp-red text-sm">
                  {error}
                </div>
              )}

              <input
                type="text"
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ''))}
                placeholder="000000"
                className="w-full text-center text-3xl tracking-[0.5em] py-4 rounded-lg bg-bg-secondary text-text-primary border-2 border-rvnp-green focus:outline-none"
              />

              <Button type="submit" fullWidth loading={loading} className="py-3">
                Verify
              </Button>

              <div className="text-center">
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={resendCooldown > 0 || resendLoading}
                  className="inline-flex items-center gap-1 text-sm text-rvnp-green hover:underline disabled:opacity-50"
                >
                  <IoRefresh size={14} />
                  {resendCooldown > 0
                    ? `Resend in ${resendCooldown}s`
                    : resendLoading
                    ? 'Sending...'
                    : 'Resend OTP'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;