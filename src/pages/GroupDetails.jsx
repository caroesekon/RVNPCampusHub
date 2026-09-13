import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  IoArrowBack,
  IoPeople,
  IoLogOut,
  IoLogIn,
  IoAdd,
  IoSettings,
  IoImage,
  IoClose,
} from 'react-icons/io5';
import Layout from '../components/layout/Layout.jsx';
import Spinner from '../components/ui/Spinner.jsx';
import Avatar from '../components/ui/Avatar.jsx';
import Button from '../components/ui/Button.jsx';
import Modal from '../components/ui/Modal.jsx';
import Input from '../components/ui/Input.jsx';
import Dropdown from '../components/ui/Dropdown.jsx';
import MentionTextarea from '../components/mentions/MentionTextarea.jsx';
import groupApi from '../api/groupApi.js';
import uploadApi from '../api/uploadApi.js';
import { useAuth } from '../context/AuthContext.jsx';

const GroupDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [group, setGroup] = useState(null);
  const [members, setMembers] = useState([]);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('posts');
  const [isMember, setIsMember] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showPostComposer, setShowPostComposer] = useState(false);
  const [postText, setPostText] = useState('');
  const [postImages, setPostImages] = useState([]);
  const [postImageFiles, setPostImageFiles] = useState([]);
  const [posting, setPosting] = useState(false);

  const [showSettings, setShowSettings] = useState(false);
  const [settingsForm, setSettingsForm] = useState({ name: '', description: '', category: 'General', privacy: 'PUBLIC' });
  const [savingSettings, setSavingSettings] = useState(false);
  const [error, setError] = useState('');

  const avatarInputRef = useRef(null);

  const isGuest = user?.role === 'GUEST';

  useEffect(() => {
    fetchGroup();
    fetchMembers();
    fetchPosts();
  }, [id]);

  const fetchGroup = async () => {
    try {
      const response = await groupApi.getGroupById(id);
      if (response.data.success) {
        setGroup(response.data.data);
        setIsMember(response.data.data.isMember || false);
        setIsAdmin(response.data.data.creator?.id === user?.id || response.data.data.createdBy === user?.id);
        setSettingsForm({
          name: response.data.data.name || '',
          description: response.data.data.description || '',
          category: response.data.data.category || 'General',
          privacy: response.data.data.privacy || 'PUBLIC',
        });
      }
    } catch {
      // Silent
    } finally {
      setLoading(false);
    }
  };

  const fetchMembers = async () => {
    try {
      const response = await groupApi.getGroupMembers(id);
      if (response.data.success) setMembers(response.data.data.members || []);
    } catch {
      // Silent
    }
  };

  const fetchPosts = async () => {
    try {
      const response = await groupApi.getGroupPosts(id);
      if (response.data.success) setPosts(response.data.data.posts || []);
    } catch {
      // Silent
    }
  };

  const handleJoin = async () => {
    if (isGuest) return;
    try {
      await groupApi.joinGroup(id);
      setIsMember(true);
      fetchGroup();
      fetchMembers();
    } catch {
      // Silent
    }
  };

  const handleLeave = async () => {
    try {
      await groupApi.leaveGroup(id);
      setIsMember(false);
      fetchGroup();
      fetchMembers();
    } catch {
      // Silent
    }
  };

  const handlePostImageSelect = (e) => {
    const files = Array.from(e.target.files);
    files.forEach((file) => {
      const imageUrl = URL.createObjectURL(file);
      setPostImages((prev) => [...prev, imageUrl]);
      setPostImageFiles((prev) => [...prev, file]);
    });
    e.target.value = '';
  };

  const removePostImage = (index) => {
    setPostImages((prev) => prev.filter((_, i) => i !== index));
    setPostImageFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handlePost = async () => {
    if (!postText.trim() && postImageFiles.length === 0) return;
    setPosting(true);
    setError('');
    try {
      let uploadedImages = [];
      if (postImageFiles.length > 0) {
        const uploadResponse = await uploadApi.uploadMultiple(postImageFiles);
        if (uploadResponse.data.success) {
          uploadedImages = uploadResponse.data.data.map((img) => img.url);
        }
      }
      const response = await groupApi.createGroupPost(id, { text: postText.trim(), images: uploadedImages });
      if (response.data.success) {
        setPostText('');
        setPostImages([]);
        setPostImageFiles([]);
        setShowPostComposer(false);
        fetchPosts();
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Post failed');
    } finally {
      setPosting(false);
    }
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const response = await uploadApi.uploadSingle(file);
      if (response.data.success) {
        await groupApi.updateGroup(id, { avatarUrl: response.data.data.url });
        fetchGroup();
      }
    } catch {
      // Silent
    }
  };

  const handleSaveSettings = async () => {
    setSavingSettings(true);
    setError('');
    try {
      const response = await groupApi.updateGroup(id, settingsForm);
      if (response.data.success) {
        setShowSettings(false);
        fetchGroup();
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to save');
    } finally {
      setSavingSettings(false);
    }
  };

  const categoryOptions = [
    { value: 'General', label: 'General' },
    { value: 'Academics', label: 'Academics' },
    { value: 'Sports', label: 'Sports' },
    { value: 'Tech', label: 'Tech' },
    { value: 'Arts', label: 'Arts' },
    { value: 'Business', label: 'Business' },
    { value: 'Social', label: 'Social' },
  ];

  const privacyOptions = [
    { value: 'PUBLIC', label: 'Public' },
    { value: 'PRIVATE', label: 'Private' },
    { value: 'CAMPUS_ONLY', label: 'Campus Only' },
  ];

  if (loading) {
    return <Layout><div className="flex justify-center py-20"><Spinner size="lg" /></div></Layout>;
  }

  return (
    <Layout>
      <div className="w-full">
        <div className="flex items-center justify-between mb-4 gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <button onClick={() => navigate('/groups')} className="p-2 rounded-lg hover:bg-bg-secondary text-text-secondary shrink-0">
              <IoArrowBack size={20} />
            </button>
            <div className="flex items-center gap-2 min-w-0">
              <Avatar src={group?.avatarUrl} name={group?.name} size="sm" />
              <h1 className="text-xl sm:text-2xl font-heading font-bold text-text-primary truncate">{group?.name}</h1>
            </div>
          </div>
          {isAdmin && (
            <button onClick={() => setShowSettings(true)} className="p-2 rounded-lg hover:bg-bg-secondary text-text-secondary shrink-0" title="Group Settings">
              <IoSettings size={20} />
            </button>
          )}
        </div>

        <div className="bg-bg-primary border border-border-color rounded-xl p-4 mb-4">
          {group?.description && <p className="text-text-secondary">{group.description}</p>}
          <div className="flex items-center gap-4 mt-3 text-sm text-text-muted flex-wrap">
            <span>{group?._count?.members || 0} members</span>
            <span>{group?._count?.posts || 0} posts</span>
            <span className="px-2 py-0.5 rounded bg-bg-secondary">{group?.category || 'General'}</span>
            {group?.privacy && group.privacy !== 'PUBLIC' && (
              <span className="px-2 py-0.5 rounded bg-bg-secondary">🔒 {group.privacy}</span>
            )}
            {group?.campus && <span>📍 {group.campus.name}</span>}
          </div>
          {!isGuest && (
            <div className="mt-4">
              {isMember ? (
                !isAdmin && (
                  <Button variant="secondary" size="sm" onClick={handleLeave}>
                    <IoLogOut className="inline mr-1" size={16} /> Leave Group
                  </Button>
                )
              ) : (
                <Button size="sm" onClick={handleJoin}>
                  <IoLogIn className="inline mr-1" size={16} /> Join Group
                </Button>
              )}
            </div>
          )}
        </div>

        <div className="flex gap-2 mb-4 border-b border-border-color">
          <button onClick={() => setActiveTab('posts')} className={`px-4 py-2 font-medium text-sm border-b-2 -mb-px ${activeTab === 'posts' ? 'border-rvnp-green text-rvnp-green' : 'border-transparent text-text-muted'}`}>
            Posts
          </button>
          <button onClick={() => setActiveTab('members')} className={`px-4 py-2 font-medium text-sm border-b-2 -mb-px ${activeTab === 'members' ? 'border-rvnp-green text-rvnp-green' : 'border-transparent text-text-muted'}`}>
            Members ({members.length})
          </button>
        </div>

        {activeTab === 'posts' ? (
          <div className="space-y-3">
            {isMember && !isGuest && (
              <Button size="sm" onClick={() => setShowPostComposer(true)}>
                <IoAdd className="inline mr-1" size={16} /> Post in Group
              </Button>
            )}
            {posts.length === 0 ? (
              <p className="text-center text-text-muted py-8">No posts yet</p>
            ) : (
              posts.map((post) => (
                <div key={post.id} className="p-4 rounded-xl border border-border-color bg-bg-primary">
                  <div className="flex items-center gap-2 mb-2">
                    <Avatar src={post.user?.avatarUrl} name={post.user?.fullName} size="sm" />
                    <span className="font-medium text-text-primary text-sm">{post.user?.fullName}</span>
                  </div>
                  {post.content?.text && <p className="text-text-primary text-sm mb-2">{post.content.text}</p>}
                  {post.content?.images && post.content.images.length > 0 && (
                    <div className={`grid gap-2 ${post.content.images.length > 1 ? 'grid-cols-2' : 'grid-cols-1'}`}>
                      {post.content.images.map((image, index) => (
                        <img key={index} src={image} alt={`Post ${index + 1}`} className="w-full rounded-lg object-cover max-h-56" />
                      ))}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        ) : (
          <div className="space-y-1">
            {members.map((member) => (
              <button key={member.id} onClick={() => navigate(`/profile/${member.user?.id}`)} className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-bg-secondary transition-all">
                <Avatar src={member.user?.avatarUrl} name={member.user?.fullName} size="sm" />
                <div>
                  <span className="font-medium text-text-primary">{member.user?.fullName}</span>
                  {member.role === 'ADMIN' && <span className="text-xs text-rvnp-green ml-2">Admin</span>}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      <Modal isOpen={showPostComposer} onClose={() => setShowPostComposer(false)} title="Post in Group" size="md">
        <div className="space-y-3">
          {error && (
            <div className="p-3 rounded-lg bg-rvnp-red bg-opacity-10 border border-rvnp-red text-rvnp-red text-sm">{error}</div>
          )}

          <MentionTextarea
            value={postText}
            onChange={setPostText}
            placeholder="Share something with the group..."
            rows={3}
            className="w-full bg-bg-secondary text-text-primary rounded-lg p-3 resize-none focus:outline-none placeholder:text-text-muted"
          />

          {postImages.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {postImages.map((image, index) => (
                <div key={index} className="relative">
                  <img src={image} alt="Upload" className="h-16 w-16 object-cover rounded-lg" />
                  <button onClick={() => removePostImage(index)} className="absolute -top-2 -right-2 p-1 rounded-full bg-bg-tertiary text-text-secondary">
                    <IoClose size={12} />
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="flex items-center justify-between">
            <label className="p-2 rounded-lg hover:bg-bg-secondary text-text-muted cursor-pointer">
              <IoImage size={20} />
              <input type="file" accept="image/*" multiple className="hidden" onChange={handlePostImageSelect} />
            </label>
            <Button size="sm" onClick={handlePost} loading={posting}>Post</Button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={showSettings} onClose={() => setShowSettings(false)} title="Group Settings" size="md">
        <div className="space-y-4">
          {error && (
            <div className="p-3 rounded-lg bg-rvnp-red bg-opacity-10 border border-rvnp-red text-rvnp-red text-sm">{error}</div>
          )}

          <div className="flex items-center gap-3">
            <div onClick={() => avatarInputRef.current?.click()} className="cursor-pointer relative">
              <Avatar src={group?.avatarUrl} name={group?.name} size="xl" />
              <span className="absolute bottom-0 right-0 p-1 rounded-full bg-rvnp-green text-rvnp-white">
                <IoImage size={12} />
              </span>
            </div>
            <div>
              <p className="text-sm font-medium text-text-primary">Group Photo</p>
              <p className="text-xs text-text-muted">Click to change</p>
            </div>
            <input ref={avatarInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
          </div>

          <Input label="Group Name" value={settingsForm.name} onChange={(e) => setSettingsForm({ ...settingsForm, name: e.target.value })} />
          <Input label="Description" value={settingsForm.description} onChange={(e) => setSettingsForm({ ...settingsForm, description: e.target.value })} />
          <Dropdown label="Category" options={categoryOptions} value={settingsForm.category} onChange={(value) => setSettingsForm({ ...settingsForm, category: value })} />
          <Dropdown label="Privacy" options={privacyOptions} value={settingsForm.privacy} onChange={(value) => setSettingsForm({ ...settingsForm, privacy: value })} />

          <Button fullWidth onClick={handleSaveSettings} loading={savingSettings}>Save Changes</Button>
        </div>
      </Modal>
    </Layout>
  );
};

export default GroupDetails;