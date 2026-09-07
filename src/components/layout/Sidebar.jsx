import { NavLink, useNavigate } from 'react-router-dom';
import {
  IoHome,
  IoVideocam,
  IoChatbubbles,
  IoPeople,
  IoCalendar,
  IoStorefront,
  IoPerson,
  IoClose,
  IoHeart,
} from 'react-icons/io5';
import Logo from '../ui/Logo.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { useNotifications } from '../../context/NotificationContext.jsx';

const Sidebar = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { unreadMessages } = useNotifications();

  const menuItems = [
    { icon: IoHome, label: 'Feed', path: '/feed', badge: 0 },
    { icon: IoVideocam, label: 'Reels', path: '/reels', badge: 0 },
    { icon: IoChatbubbles, label: 'Messages', path: '/messages', badge: unreadMessages },
    { icon: IoPeople, label: 'Groups', path: '/groups', badge: 0 },
    { icon: IoCalendar, label: 'Events', path: '/events', badge: 0 },
    { icon: IoStorefront, label: 'Marketplace', path: '/marketplace', badge: 0 },
  ];

  const handleNavigate = (path) => {
    navigate(path);
    onClose();
  };

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`
          fixed top-0 left-0 h-full w-64 z-50
          bg-rvnp-green text-rvnp-white
          transform transition-transform duration-300
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0
          lg:sticky lg:top-14 lg:h-[calc(100vh-3.5rem)] lg:shrink-0
          overflow-y-auto
        `}
      >
        <div className="p-4 border-b border-rvnp-green-dark flex items-center justify-between shrink-0">
          <Logo size="sm" showText={false} />
          <button onClick={onClose} className="lg:hidden text-rvnp-white p-1">
            <IoClose size={22} />
          </button>
        </div>

        <nav className="p-3 space-y-1">
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={onClose}
              className={({ isActive }) => `
                flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-sm
                ${isActive ? 'bg-rvnp-white text-rvnp-green font-medium' : 'text-rvnp-white hover:bg-rvnp-green-dark'}
              `}
            >
              <item.icon size={18} />
              <span className="truncate flex-1">{item.label}</span>
              {item.badge > 0 && (
                <span className="min-w-[18px] h-[18px] px-1 rounded-full bg-rvnp-red text-rvnp-white text-[10px] font-bold flex items-center justify-center shrink-0">
                  {item.badge > 99 ? '99+' : item.badge}
                </span>
              )}
            </NavLink>
          ))}

          <NavLink
            to="/friends"
            onClick={onClose}
            className={({ isActive }) => `
              flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-sm
              ${isActive ? 'bg-rvnp-white text-rvnp-green font-medium' : 'text-rvnp-white hover:bg-rvnp-green-dark'}
            `}
          >
            <IoHeart size={18} />
            <span className="truncate flex-1">Friends</span>
          </NavLink>

          <NavLink
            to="/followers"
            onClick={onClose}
            className={({ isActive }) => `
              flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-sm
              ${isActive ? 'bg-rvnp-white text-rvnp-green font-medium' : 'text-rvnp-white hover:bg-rvnp-green-dark'}
            `}
          >
            <IoPeople size={18} />
            <span className="truncate flex-1">Followers</span>
          </NavLink>

          <button
            onClick={() => handleNavigate(`/profile/${user?.id}`)}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-sm text-rvnp-white hover:bg-rvnp-green-dark"
          >
            <IoPerson size={18} />
            <span className="truncate">Profile</span>
          </button>
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;