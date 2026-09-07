import { Routes, Route } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute.jsx';
import PublicRoute from './PublicRoute.jsx';

import Login from '../pages/auth/Login.jsx';
import Register from '../pages/auth/Register.jsx';
import ForgotPassword from '../pages/auth/ForgotPassword.jsx';
import ResetPassword from '../pages/auth/ResetPassword.jsx';
import VerifyEmail from '../pages/auth/VerifyEmail.jsx';

import Feed from '../pages/Feed.jsx';
import Reels from '../pages/Reels.jsx';
import UploadReel from '../pages/UploadReel.jsx';
import Messages from '../pages/Messages.jsx';
import Chat from '../pages/Chat.jsx';
import Notifications from '../pages/Notifications.jsx';
import Profile from '../pages/Profile.jsx';
import Groups from '../pages/Groups.jsx';
import GroupDetails from '../pages/GroupDetails.jsx';
import Events from '../pages/Events.jsx';
import Marketplace from '../pages/Marketplace.jsx';
import Campus from '../pages/Campus.jsx';
import Search from '../pages/Search.jsx';
import Settings from '../pages/Settings.jsx';
import PrivacySettings from '../pages/PrivacySettings.jsx';
import Stories from '../pages/Stories.jsx';
import CreateStory from '../pages/CreateStory.jsx';
import Followers from '../pages/Followers.jsx';
import Friends from '../pages/Friends.jsx';
import HashtagPage from '../pages/HashtagPage.jsx';
import Leaderboard from '../pages/Leaderboard.jsx';
import Badges from '../pages/Badges.jsx';
import NotFound from '../pages/NotFound.jsx';

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
      <Route path="/forgot-password" element={<PublicRoute><ForgotPassword /></PublicRoute>} />
      <Route path="/reset-password" element={<PublicRoute><ResetPassword /></PublicRoute>} />
      <Route path="/verify-email" element={<ProtectedRoute><VerifyEmail /></ProtectedRoute>} />

      <Route path="/" element={<ProtectedRoute><Feed /></ProtectedRoute>} />
      <Route path="/feed" element={<ProtectedRoute><Feed /></ProtectedRoute>} />
      <Route path="/reels" element={<ProtectedRoute><Reels /></ProtectedRoute>} />
      <Route path="/reels/upload" element={<ProtectedRoute><UploadReel /></ProtectedRoute>} />
      <Route path="/messages" element={<ProtectedRoute><Messages /></ProtectedRoute>} />
      <Route path="/messages/:conversationId" element={<ProtectedRoute><Chat /></ProtectedRoute>} />
      <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
      <Route path="/profile/:id" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
      <Route path="/groups" element={<ProtectedRoute><Groups /></ProtectedRoute>} />
      <Route path="/groups/:id" element={<ProtectedRoute><GroupDetails /></ProtectedRoute>} />
      <Route path="/events" element={<ProtectedRoute><Events /></ProtectedRoute>} />
      <Route path="/marketplace" element={<ProtectedRoute><Marketplace /></ProtectedRoute>} />
      <Route path="/campus/:id" element={<ProtectedRoute><Campus /></ProtectedRoute>} />
      <Route path="/search" element={<ProtectedRoute><Search /></ProtectedRoute>} />
      <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
      <Route path="/privacy" element={<ProtectedRoute><PrivacySettings /></ProtectedRoute>} />
      <Route path="/stories/:userId" element={<ProtectedRoute><Stories /></ProtectedRoute>} />
      <Route path="/stories/create" element={<ProtectedRoute><CreateStory /></ProtectedRoute>} />
      <Route path="/followers" element={<ProtectedRoute><Followers /></ProtectedRoute>} />
      <Route path="/friends" element={<ProtectedRoute><Friends /></ProtectedRoute>} />
      <Route path="/hashtags/:name" element={<ProtectedRoute><HashtagPage /></ProtectedRoute>} />
      <Route path="/leaderboard" element={<ProtectedRoute><Leaderboard /></ProtectedRoute>} />
      <Route path="/badges" element={<ProtectedRoute><Badges /></ProtectedRoute>} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;