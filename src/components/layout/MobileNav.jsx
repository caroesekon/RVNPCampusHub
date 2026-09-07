import { NavLink } from 'react-router-dom';
import { IoHome, IoVideocam, IoChatbubbles, IoPeople, IoStorefront } from 'react-icons/io5';
import { useNotifications } from '../../context/NotificationContext.jsx';

const MobileNav = () => {
  const { unreadMessages } = useNotifications();

  const items = [
    { icon: IoHome, label: 'Home', path: '/feed', badge: 0 },
    { icon: IoVideocam, label: 'Reels', path: '/reels', badge: 0 },
    { icon: IoChatbubbles, label: 'Chats', path: '/messages', badge: unreadMessages },
    { icon: IoPeople, label: 'Groups', path: '/groups', badge: 0 },
    { icon: IoStorefront, label: 'Market', path: '/marketplace', badge: 0 },
  ];

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-rvnp-green text-rvnp-white z-40 h-14 shrink-0 w-full">
      <div className="flex justify-around items-center h-full">
        {items.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => `
              flex flex-col items-center justify-center gap-0.5 px-2 py-1 rounded-lg min-w-[52px] h-full relative
              ${isActive ? 'text-rvnp-white font-semibold' : 'text-rvnp-white opacity-70'}
            `}
          >
            <div className="relative">
              <item.icon size={20} />
              {item.badge > 0 && (
                <span className="absolute -top-1.5 -right-2 min-w-[16px] h-[16px] px-1 rounded-full bg-rvnp-red text-rvnp-white text-[9px] font-bold flex items-center justify-center">
                  {item.badge > 99 ? '99+' : item.badge}
                </span>
              )}
            </div>
            <span className="text-[10px] leading-none">{item.label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
};

export default MobileNav;