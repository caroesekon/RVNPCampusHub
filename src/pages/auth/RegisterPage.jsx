import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useSettings } from '@/context/SettingsContext';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { DEPARTMENTS } from '@/utils/constants';
import toast from 'react-hot-toast';

const CAMPUSES = [
  { value: 'main', label: 'Main Campus' },
  { value: 'kericho_town', label: 'Kericho Town Campus' },
  { value: 'kureisoi', label: 'Kureisoi Campus' },
  { value: 'nakuru_town', label: 'Nakuru Town Campus' },
  { value: 'alumni', label: 'Alumni' },
  { value: 'guest', label: 'Guest' },
];

export const RegisterPage = () => {
  const { register } = useAuth();
  const { settings, isFeatureEnabled } = useSettings();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    firstName: '', lastName: '', email: '', password: '',
    campus: 'main', department: '',
  });
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [loading, setLoading] = useState(false);

  const showDepartment = !['alumni', 'guest'].includes(form.campus);
  const registrationOpen = isFeatureEnabled('userRegistration');

  if (!registrationOpen) {
    return (
      <div className="max-w-[390px] mx-auto min-h-screen bg-[var(--color-bg)] flex flex-col justify-center px-6 text-center">
        <span className="text-5xl mb-4">🔒</span>
        <h2 className="text-xl font-bold text-[var(--color-text)]">Registration Closed</h2>
        <p className="text-sm text-[var(--color-text-secondary)] mt-2">Registration is currently disabled. Check back later.</p>
        <Link to="/login" className="text-[var(--color-primary)] font-semibold text-sm mt-4 block">Back to Login</Link>
      </div>
    );
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => {
      const updated = { ...prev, [name]: value };
      if (name === 'campus' && ['alumni', 'guest'].includes(value)) updated.department = '';
      return updated;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.firstName || !form.lastName || !form.email || !form.password) return toast.error('Fill all required fields');
    if (form.password.length < 6) return toast.error('Password must be at least 6 characters');
    if (!acceptedTerms) return toast.error('You must accept the Terms of Service and Privacy Policy');

    setLoading(true);
    try {
      await register(form);
      toast.success('Account created! Please login.');
      navigate('/login');
    } catch (err) {
      toast.error(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-[390px] mx-auto min-h-screen bg-[var(--color-bg)] flex flex-col justify-center px-6 py-8">
      <div className="text-center mb-6">
        <div className="w-14 h-14 rounded-2xl bg-[var(--color-primary)] flex items-center justify-center mx-auto mb-3">
          <span className="text-white font-black text-xl">RV</span>
        </div>
        <h1 className="text-xl font-black text-[var(--color-text)]">Join {settings.systemName}</h1>
        <p className="text-xs text-[var(--color-text-muted)] mt-1">from HDM</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
         <Input label="First Name" name="firstName" value={form.firstName} onChange={handleChange} placeholder="Davis" />
<Input label="Last Name" name="lastName" value={form.lastName} onChange={handleChange} placeholder="Okoth" />
        </div>
        <Input label="Email" name="email" type="email" value={form.email} onChange={handleChange} placeholder="davis@rvnp.ac.ke" />
        <Input label="Password" name="password" type="password" value={form.password} onChange={handleChange} placeholder="Min 6 characters" />

        <div>
          <label className="block text-sm font-semibold mb-1 text-[var(--color-text-secondary)]">Campus</label>
          <select name="campus" value={form.campus} onChange={handleChange} className="input">
            {CAMPUSES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
          </select>
        </div>

        {showDepartment && (
          <div>
            <label className="block text-sm font-semibold mb-1 text-[var(--color-text-secondary)]">Department</label>
            <select name="department" value={form.department} onChange={handleChange} className="input">
              <option value="">Select Department</option>
              {DEPARTMENTS.map(d => <option key={d.value} value={d.value}>{d.label}</option>)}
            </select>
          </div>
        )}

        {/* Legal Checkbox */}
        <div className="flex items-start gap-2 pt-2">
          <input
            type="checkbox"
            id="terms"
            checked={acceptedTerms}
            onChange={(e) => setAcceptedTerms(e.target.checked)}
            className="mt-1 w-4 h-4 rounded border-[var(--color-border)] text-[var(--color-primary)] focus:ring-[var(--color-primary)]"
          />
          <label htmlFor="terms" className="text-xs text-[var(--color-text-secondary)] leading-relaxed">
            I agree to the{' '}
            <Link to="/legal/terms" target="_blank" className="text-[var(--color-primary)] font-semibold hover:underline">Terms of Service</Link>
            {' '}and{' '}
            <Link to="/legal/privacy" target="_blank" className="text-[var(--color-primary)] font-semibold hover:underline">Privacy Policy</Link>
          </label>
        </div>

        <Button type="submit" className="w-full" disabled={loading || !acceptedTerms}>
          {loading ? 'Creating...' : 'Create Account'}
        </Button>
      </form>

      <div className="text-center mt-4">
        <p className="text-sm text-[var(--color-text-secondary)]">
          Already have an account?{' '}
          <Link to="/login" className="text-[var(--color-primary)] font-semibold hover:underline">Login</Link>
        </p>
      </div>
    </div>
  );
};