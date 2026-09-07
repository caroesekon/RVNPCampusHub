import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { IoCamera, IoChevronForward } from 'react-icons/io5';
import Layout from '../components/layout/Layout.jsx';
import Button from '../components/ui/Button.jsx';
import Input from '../components/ui/Input.jsx';
import Avatar from '../components/ui/Avatar.jsx';
import CoverPhoto from '../components/ui/CoverPhoto.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import userApi from '../api/userApi.js';
import uploadApi from '../api/uploadApi.js';
import storage from '../utils/storage.js';

const Settings = () => {
  const navigate = useNavigate();
  const { user: authUser, refreshUser, logout } = useAuth();
  const avatarInputRef = useRef(null);

  const [user, setUser] = useState(authUser || storage.getUser());

  const [form, setForm] = useState({
    fullName: user?.fullName || '',
    bio: user?.bio || '',
    course: user?.course || '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const storedUser = storage.getUser();
    if (storedUser) {
      setUser(storedUser);
      setForm({
        fullName: storedUser.fullName || '',
        bio: storedUser.bio || '',
        course: storedUser.course || '',
      });
    }
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await userApi.updateProfile(form);

      if (response.data.success) {
        const updatedUser = await refreshUser();

        if (updatedUser) {
          setUser(updatedUser);
          setSuccess('Profile updated successfully');
        }
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Update failed');
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarClick = () => {
    avatarInputRef.current?.click();
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await uploadApi.uploadSingle(file);

      if (response.data.success) {
        const avatarUrl = response.data.data.url;

        await userApi.updateProfile({ avatarUrl });
        const updatedUser = await refreshUser();

        if (updatedUser) {
          setUser(updatedUser);
          setSuccess('Profile picture updated');
        }
      }
    } catch (error) {
      setError('Profile picture upload failed');
    } finally {
      setLoading(false);
      e.target.value = '';
    }
  };

  const handleCoverUpload = async (file) => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await uploadApi.uploadSingle(file);

      if (response.data.success) {
        const coverUrl = response.data.data.url;

        await userApi.updateProfile({ coverUrl });
        const updatedUser = await refreshUser();

        if (updatedUser) {
          setUser(updatedUser);
          setSuccess('Cover photo updated');
        }
      }
    } catch (error) {
      setError('Cover photo upload failed');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <Layout>
      <div className="w-full space-y-4">
        <h1 className="text-2xl font-heading font-bold text-text-primary">
          Settings
        </h1>

        <div className="bg-bg-primary border border-border-color rounded-xl overflow-hidden">
          <CoverPhoto
            src={user?.coverUrl}
            editable
            onImageSelect={handleCoverUpload}
          />

          <div className="p-4 sm:p-6">
            <div className="relative -mt-14 sm:-mt-16 mb-4 z-10">
              <div
                className="inline-block rounded-full border-4 border-bg-primary cursor-pointer relative"
                onClick={handleAvatarClick}
              >
                <Avatar
                  src={user?.avatarUrl}
                  name={user?.fullName}
                  size="xl"
                />

                <span className="absolute bottom-1 right-1 p-2 rounded-full bg-bg-tertiary border border-border-color text-text-secondary shadow-lg">
                  <IoCamera size={16} />
                </span>
              </div>

              <input
                ref={avatarInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarUpload}
              />
            </div>

            <p className="text-xs text-text-muted mb-4">
              Click on the profile picture to change it
            </p>

            <div className="space-y-4">
              {error && (
                <div className="p-3 rounded-lg bg-rvnp-red bg-opacity-10 border border-rvnp-red text-rvnp-red text-sm">
                  {error}
                </div>
              )}

              {success && (
                <div className="p-3 rounded-lg bg-rvnp-green bg-opacity-10 border border-rvnp-green text-rvnp-green text-sm">
                  {success}
                </div>
              )}

              <Input
                label="Full Name"
                name="fullName"
                value={form.fullName}
                onChange={handleChange}
              />

              <Input
                label="Bio"
                name="bio"
                value={form.bio}
                onChange={handleChange}
                placeholder="Tell us about yourself"
              />

              <Input
                label="Course"
                name="course"
                value={form.course}
                onChange={handleChange}
              />

              <div className="flex gap-2 pt-4">
                <Button onClick={handleSave} loading={loading}>
                  Save Changes
                </Button>
                <Button variant="outline" onClick={() => navigate(-1)}>
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>

        <Link
          to="/privacy"
          className="flex items-center justify-between p-4 bg-bg-primary border border-border-color rounded-xl hover:bg-bg-secondary transition-all"
        >
          <div>
            <h3 className="font-medium text-text-primary">Privacy Settings</h3>
            <p className="text-xs text-text-muted mt-0.5">
              Control who can see your content and interact with you
            </p>
          </div>
          <IoChevronForward size={20} className="text-text-muted shrink-0" />
        </Link>

        <div className="p-4 bg-bg-primary border border-rvnp-red rounded-xl">
          <h3 className="text-lg font-heading font-semibold text-text-primary mb-2">
            Danger Zone
          </h3>
          <Button variant="danger" onClick={handleLogout}>
            Logout
          </Button>
        </div>
      </div>
    </Layout>
  );
};

export default Settings;