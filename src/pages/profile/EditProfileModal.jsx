import { useState, useRef } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Avatar } from '@/components/ui/Avatar';
import { updateProfile, uploadAvatar, uploadCoverPhoto, removeCoverPhoto } from '@/api/users';
import { DEPARTMENTS, HOSTELS } from '@/utils/constants';
import toast from 'react-hot-toast';

const CAMPUSES = [
  { value: 'main', label: 'Main Campus' },
  { value: 'kericho_town', label: 'Kericho Town Campus' },
  { value: 'kureisoi', label: 'Kureisoi Campus' },
  { value: 'nakuru_town', label: 'Nakuru Town Campus' },
  { value: 'alumni', label: 'Alumni' },
  { value: 'guest', label: 'Guest' },
];

export const EditProfileModal = ({ isOpen, onClose, user, onUpdate }) => {
  const [form, setForm] = useState({
    firstName: user.firstName || '',
    lastName: user.lastName || '',
    bio: user.bio || '',
    campus: user.campus || 'main',
    department: user.department || '',
    hostel: user.hostel || '',
  });
  const [avatarPreview, setAvatarPreview] = useState(user.avatar);
  const [coverPreview, setCoverPreview] = useState(user.coverPhoto);
  const [saving, setSaving] = useState(false);
  const avatarInputRef = useRef(null);
  const coverInputRef = useRef(null);

  const showDepartment = !['alumni', 'guest'].includes(form.campus);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => {
      const updated = { ...prev, [name]: value };
      if (name === 'campus' && ['alumni', 'guest'].includes(value)) updated.department = '';
      return updated;
    });
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('avatar', file);
    try {
      const res = await uploadAvatar(formData);
      setAvatarPreview(res.data.user.avatar);
      toast.success('Profile photo updated');
      onUpdate();
    } catch {
      toast.error('Upload failed');
    }
  };

  const handleAvatarRemove = async () => {
    try {
      await updateProfile({ avatar: '' });
      setAvatarPreview(null);
      toast.success('Profile photo removed');
      onUpdate();
    } catch {
      toast.error('Failed to remove photo');
    }
  };

  const handleCoverUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('cover', file);
    try {
      const res = await uploadCoverPhoto(formData);
      setCoverPreview(res.data.user.coverPhoto);
      toast.success('Cover photo updated');
      onUpdate();
    } catch {
      toast.error('Upload failed');
    }
  };

  const handleCoverRemove = async () => {
    try {
      await removeCoverPhoto();
      setCoverPreview(null);
      toast.success('Cover photo removed');
      onUpdate();
    } catch {
      toast.error('Failed');
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateProfile(form);
      onUpdate();
      toast.success('Profile updated');
      onClose();
    } catch (err) {
      toast.error(err.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Profile" size="lg">
      <div className="space-y-5">
        {/* Cover Photo */}
        <div>
          <label className="block text-sm font-semibold mb-2 text-[var(--color-text-secondary)]">
            Cover Photo
          </label>
          <div
            className="h-32 rounded-xl bg-[var(--color-bg)] flex items-center justify-center relative overflow-hidden cursor-pointer border-2 border-dashed border-[var(--color-border)] hover:border-[var(--color-primary)] transition-colors"
            onClick={() => coverInputRef.current?.click()}
          >
            {coverPreview ? (
              <img src={coverPreview} alt="Cover" className="w-full h-full object-cover" />
            ) : (
              <div className="text-center text-[var(--color-text-muted)]">
                <span className="text-3xl block mb-1">🖼️</span>
                <span className="text-xs">Click to add cover photo</span>
              </div>
            )}
            <input
              ref={coverInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleCoverUpload}
            />
          </div>
          {coverPreview && (
            <button
              onClick={handleCoverRemove}
              className="text-xs text-[var(--color-accent)] mt-1.5 hover:underline"
            >
              Remove cover photo
            </button>
          )}
        </div>

        {/* Profile Photo */}
        <div>
          <label className="block text-sm font-semibold mb-3 text-[var(--color-text-secondary)]">
            Profile Photo
          </label>
          <div className="flex items-center gap-4">
            <Avatar src={avatarPreview} name={form.firstName} size="xl" />
            <div className="flex flex-col gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => avatarInputRef.current?.click()}
              >
                📷 Upload Photo
              </Button>
              {avatarPreview && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleAvatarRemove}
                  className="text-[var(--color-accent)]"
                >
                  ✕ Remove Photo
                </Button>
              )}
              <input
                ref={avatarInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarUpload}
              />
            </div>
          </div>
        </div>

        {/* Divider */}
        <hr className="border-[var(--color-border)]" />

        {/* Name */}
        <div className="grid grid-cols-2 gap-3">
          <Input
            label="First Name"
            name="firstName"
            value={form.firstName}
            onChange={handleChange}
            placeholder="Davis"
          />
          <Input
            label="Last Name"
            name="lastName"
            value={form.lastName}
            onChange={handleChange}
            placeholder="Okoth"
          />
        </div>

        {/* Bio */}
        <div>
          <label className="block text-sm font-semibold mb-1.5 text-[var(--color-text-secondary)]">
            Bio
          </label>
          <textarea
            name="bio"
            value={form.bio}
            onChange={handleChange}
            maxLength={300}
            rows={3}
            placeholder="Tell us about yourself..."
            className="input resize-none"
          />
          <p className="text-xs text-[var(--color-text-muted)] mt-1 text-right">
            {form.bio?.length || 0}/300
          </p>
        </div>

        {/* Campus */}
        <div>
          <label className="block text-sm font-semibold mb-1.5 text-[var(--color-text-secondary)]">
            Campus
          </label>
          <select
            name="campus"
            value={form.campus}
            onChange={handleChange}
            className="input"
          >
            {CAMPUSES.map(c => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>
        </div>

        {/* Department */}
        {showDepartment && (
          <div>
            <label className="block text-sm font-semibold mb-1.5 text-[var(--color-text-secondary)]">
              Department
            </label>
            <select
              name="department"
              value={form.department}
              onChange={handleChange}
              className="input"
            >
              <option value="">Select Department</option>
              {DEPARTMENTS.map(d => (
                <option key={d.value} value={d.value}>{d.label}</option>
              ))}
            </select>
          </div>
        )}

        {/* Hostel */}
        <div>
          <label className="block text-sm font-semibold mb-1.5 text-[var(--color-text-secondary)]">
            Hostel
          </label>
          <select
            name="hostel"
            value={form.hostel}
            onChange={handleChange}
            className="input"
          >
            {HOSTELS.map(h => (
              <option key={h.value} value={h.value}>{h.label}</option>
            ))}
          </select>
        </div>

        {/* Save Button */}
        <Button
          onClick={handleSave}
          disabled={saving}
          className="w-full"
        >
          {saving ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>
    </Modal>
  );
};