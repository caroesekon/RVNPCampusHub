import { Outlet } from 'react-router-dom';
import { MobileHeader } from './MobileHeader';
import { MobileNav } from './MobileNav';

export const MobileLayout = () => {
  return (
    <div className="lg:hidden max-w-[390px] mx-auto h-screen bg-[var(--color-bg)] flex flex-col">
      <MobileHeader />
      <main className="flex-1 overflow-y-auto px-4 py-3 scrollbar-hide pb-16">
        <Outlet />
      </main>
      <MobileNav />
    </div>
  );
};