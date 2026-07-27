import { Routes, Route } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { LoginPage } from '@/pages/auth/LoginPage';
import { RegisterPage } from '@/pages/auth/RegisterPage';
import { ForgotPasswordPage } from '@/pages/auth/ForgotPasswordPage';
import { ResetPasswordPage } from '@/pages/auth/ResetPasswordPage';
import { VerifyEmailPage } from '@/pages/auth/VerifyEmailPage';
import { ProfilePage } from '@/pages/profile/ProfilePage';
import { VerificationPage } from '@/pages/profile/VerificationPage';
import { FeedPage } from '@/pages/posts/FeedPage';
import { PostDetailPage } from '@/pages/posts/PostDetailPage';
import { EditPostPage } from '@/pages/posts/EditPostPage';
import { ChatsPage } from '@/pages/chats/ChatsPage';
import { ChatWindow } from '@/pages/chats/ChatWindow';
import { AIChatPage } from '@/pages/chats/AIChatPage';
import { ExplorePage } from '@/pages/explore/ExplorePage';
import { NotificationsPage } from '@/pages/notifications/NotificationsPage';
import { StoriesPage } from '@/pages/stories/StoriesPage';
import { FollowersPage } from '@/pages/friends/FollowersPage';
import { LeaderboardPage } from '@/pages/leaderboard/LeaderboardPage';
import { TermsPage } from '@/pages/legal/TermsPage';
import { PrivacyPage } from '@/pages/legal/PrivacyPage';
import { GuidelinesPage } from '@/pages/legal/GuidelinesPage';
import { MarketplacePolicyPage } from '@/pages/legal/MarketplacePolicyPage';
import { SubscriptionsPage } from '@/pages/subscriptions/SubscriptionsPage';
import { SupportPage } from '@/pages/support/SupportPage';
import { TicketDetailPage } from '@/pages/support/TicketDetailPage';
import { MarketPage } from '@/pages/market/MarketPage';
import { ListingDetailPage } from '@/pages/market/ListingDetailPage';
import { CreateListingPage } from '@/pages/market/CreateListingPage';
import { GroupsPage } from '@/pages/groups/GroupsPage';
import { GroupDetailPage } from '@/pages/groups/GroupDetailPage';
import { CreateGroupPage } from '@/pages/groups/CreateGroupPage';

export const AppRoutes = () => {
  return (
    <Routes>
      {/* Auth — No Layout */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
      <Route path="/verify-email" element={<VerifyEmailPage />} />

      {/* Legal — No Layout */}
      <Route path="/legal/terms" element={<TermsPage />} />
      <Route path="/legal/privacy" element={<PrivacyPage />} />
      <Route path="/legal/guidelines" element={<GuidelinesPage />} />
      <Route path="/legal/marketplace" element={<MarketplacePolicyPage />} />

      {/* Main App — With Layout */}
      <Route element={<AppLayout />}>
        <Route path="/" element={<FeedPage />} />
        <Route path="/posts" element={<FeedPage />} />
        <Route path="/post/:id" element={<PostDetailPage />} />
        <Route path="/edit-post/:id" element={<EditPostPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/profile/:userId" element={<ProfilePage />} />
        <Route path="/verification" element={<VerificationPage />} />
        <Route path="/chats" element={<ChatsPage />} />
        <Route path="/chats/:chatId" element={<ChatWindow />} />
        <Route path="/ai-chat" element={<AIChatPage />} />
        <Route path="/explore" element={<ExplorePage />} />
        <Route path="/notifications" element={<NotificationsPage />} />
        <Route path="/stories" element={<StoriesPage />} />
        <Route path="/friends" element={<FollowersPage />} />
        <Route path="/leaderboard" element={<LeaderboardPage />} />
        <Route path="/subscriptions" element={<SubscriptionsPage />} />
        <Route path="/support" element={<SupportPage />} />
        <Route path="/support/:ticketId" element={<TicketDetailPage />} />
        <Route path="/market" element={<MarketPage />} />
        <Route path="/market/:id" element={<ListingDetailPage />} />
        <Route path="/create-listing" element={<CreateListingPage />} />
        <Route path="/groups" element={<GroupsPage />} />
        <Route path="/groups/:id" element={<GroupDetailPage />} />
        <Route path="/create-group" element={<CreateGroupPage />} />
      </Route>
    </Routes>
  );
};