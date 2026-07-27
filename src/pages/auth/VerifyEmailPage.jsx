import { useEffect, useState, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/Button';
import { verifyEmail, resendVerification } from '@/api/auth';
import toast from 'react-hot-toast';

export const VerifyEmailPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState('verifying');
  const [message, setMessage] = useState('');
  const verifiedRef = useRef(false);

  const token = searchParams.get('token');

  useEffect(() => {
    if (token && !verifiedRef.current) {
      verifiedRef.current = true;
      handleVerify(token);
    } else if (!token) {
      setStatus('no_token');
    }
  }, [token]);

  const handleVerify = async (token) => {
    try {
      await verifyEmail(token);
      setStatus('success');
      toast.success('Email verified! You can now login.');
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      setStatus('error');
      setMessage(err.message || 'Verification failed');
    }
  };

  const handleResend = async () => {
    try {
      await resendVerification();
      toast.success('Verification email sent!');
      setStatus('resent');
    } catch (err) {
      toast.error('Failed to resend verification email');
    }
  };

  return (
    <div className="max-w-[390px] mx-auto min-h-screen bg-[var(--color-bg)] flex flex-col justify-center px-6 text-center">
      {status === 'verifying' && (
        <>
          <div className="w-16 h-16 rounded-full bg-[var(--color-primary)]/10 flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl animate-pulse">⏳</span>
          </div>
          <h1 className="text-xl font-black text-[var(--color-text)]">Verifying your email...</h1>
          <p className="text-sm text-[var(--color-text-secondary)] mt-2">Please wait a moment.</p>
        </>
      )}

      {status === 'success' && (
        <>
          <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">✅</span>
          </div>
          <h1 className="text-xl font-black text-[var(--color-text)]">Email Verified!</h1>
          <p className="text-sm text-[var(--color-text-secondary)] mt-2">Your email has been verified successfully.</p>
          <p className="text-xs text-[var(--color-text-muted)] mt-1">Redirecting to login...</p>
          <Button className="mt-6" onClick={() => navigate('/login')}>Go to Login</Button>
        </>
      )}

      {status === 'error' && (
        <>
          <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">❌</span>
          </div>
          <h1 className="text-xl font-black text-[var(--color-text)]">Verification Failed</h1>
          <p className="text-sm text-[var(--color-text-secondary)] mt-2">{message}</p>
          <div className="space-y-2 mt-4">
            <Button className="w-full" onClick={handleResend}>Resend Verification Email</Button>
            <Button variant="outline" className="w-full" onClick={() => navigate('/profile')}>Back to Profile</Button>
          </div>
        </>
      )}

      {status === 'no_token' && (
        <>
          <div className="w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">📧</span>
          </div>
          <h1 className="text-xl font-black text-[var(--color-text)]">Check Your Email</h1>
          <p className="text-sm text-[var(--color-text-secondary)] mt-2">
            {user?.email ? (
              <>We sent a verification link to <strong>{user.email}</strong></>
            ) : (
              'We sent a verification link to your email.'
            )}
          </p>
          <p className="text-xs text-[var(--color-text-muted)] mt-1">Click the link in the email to verify your account.</p>
          <div className="space-y-2 mt-4">
            <Button className="w-full" onClick={handleResend}>Resend Email</Button>
            <Button variant="outline" className="w-full" onClick={() => navigate('/profile')}>Back to Profile</Button>
          </div>
        </>
      )}

      {status === 'resent' && (
        <>
          <div className="w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">📨</span>
          </div>
          <h1 className="text-xl font-black text-[var(--color-text)]">Email Sent!</h1>
          <p className="text-sm text-[var(--color-text-secondary)] mt-2">Check your inbox for the verification link.</p>
          <p className="text-xs text-[var(--color-text-muted)] mt-1">Didn't receive it? Check your spam folder.</p>
          <Button variant="outline" className="mt-4" onClick={() => navigate('/profile')}>Back to Profile</Button>
        </>
      )}
    </div>
  );
};