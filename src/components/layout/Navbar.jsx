import { useNavigate } from 'react-router-dom';
import { IoMenu, IoSearch, IoNotifications, IoMoon, IoSunny } from 'react-icons/io5';
import Logo from '../ui/Logo.jsx';
import Avatar from '../ui/Avatar.jsx';
import Badge from '../ui/Badge.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { useTheme } from '../../context/ThemeContext.jsx';
import { useNotifications } from '../../context/NotificationContext.jsx';

const Navbar = ({ onMenuClick }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const { unreadNotifications } = useNotifications();

  return (
    <header className="sticky top-0 z-30 bg-rvnp-green text-rvnp-white h-14 shrink-0 w-full">
      <div className="flex items-center justify-between px-2 sm:px-3 h-full gap-1 sm:gap-2 w-full">
        <div className="flex items-center gap-1 min-w-0 shrink-0">
          <button onClick={onMenuClick} className="lg:hidden text-rvnp-white p-1.5 shrink-0">
            <IoMenu size={22} />
          </button>
          <div className="shrink-0">
            <Logo size="sm" showText={false} />
          </div>
        </div>

        <button
          onClick={() => navigate('/search')}
          className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-rvnp-green-dark text-rvnp-white w-56 lg:w-64 shrink-0"
        >
          <IoSearch size={16} />
          <span className="text-sm truncate">Search...</span>
        </button>

        <div className="flex items-center gap-0.5 sm:gap-1.5 shrink-0">
          <button
            onClick={() => navigate('/search')}
            className="md:hidden p-1.5 rounded-lg text-rvnp-white"
          >
            <IoSearch size={20} />
          </button>

          <button
            onClick={() => navigate('/notifications')}
            className="p-1.5 rounded-lg text-rvnp-white relative"
          >
            <IoNotifications size={20} />
            {unreadNotifications > 0 && (
              <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-rvnp-red text-rvnp-white text-[10px] font-bold flex items-center justify-center">
                {unreadNotifications > 99 ? '99+' : unreadNotifications}
              </span>
            )}
          </button>

          <button
            onClick={toggleTheme}
            className="p-1.5 rounded-lg text-rvnp-white"
          >
            {isDark ? <IoSunny size={20} /> : <IoMoon size={20} />}
          </button>

          <div
            className="rounded-full border-2 border-rvnp-white cursor-pointer shrink-0"
            onClick={() => navigate(`/profile/${user?.id}`)}
          >
            <Avatar src={user?.avatarUrl} name={user?.fullName} size="sm" />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;