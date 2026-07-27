import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { deleteAccount } from '@/api/users';
import { deactivateAccount } from '@/api/settings';
import { useAuth } from '@/context/AuthContext';
import toast from 'react-hot-toast';

export const DangerZone = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
    toast.success('Logged out');
  };

  const handleDeactivate = async () => {
    if (!confirm('Deactivate your account? You can reactivate by logging in again.')) return;
    await deactivateAccount();
    toast.success('Account deactivated');
    logout();
    navigate('/login');
  };

  const handleDelete = async () => {
    if (!confirm('Permanently delete your account? This cannot be undone!')) return;
    await deleteAccount();
    toast.success('Account deleted');
    logout();
    navigate('/login');
  };

  return (
    <div className="card border-l-[var(--color-accent)]">
      <h3 className="font-bold text-[var(--color-accent)] mb-3">🚨 Danger Zone</h3>
      <div className="space-y-2">
        <Button variant="outline" size="sm" onClick={handleLogout}>Logout</Button>
        <Button variant="outline" size="sm" onClick={handleDeactivate}>Deactivate Account</Button>
        <Button variant="accent" size="sm" onClick={handleDelete}>Delete Account Permanently</Button>
      </div>
    </div>
  );
};