import { Outlet } from 'react-router-dom';
import { DesktopHeader } from './DesktopHeader';
import { DesktopSidebar } from './DesktopSidebar';
import { DesktopRightSidebar } from './DesktopRightSidebar';

export const DesktopLayout = () => {
  return (
    <div className="hidden lg:flex flex-col h-screen overflow-hidden bg-[var(--color-bg)]">
      <DesktopHeader />
      <div className="flex flex-1 overflow-hidden">
        <aside className="w-[280px] xl:w-[320px] flex-shrink-0 bg-[var(--color-surface)] border-r border-[var(--color-border)] overflow-y-auto scrollbar-hide">
          <DesktopSidebar />
        </aside>
        <main className="flex-1 overflow-y-auto scrollbar-hide">
          <div className="p-4 max-w-[680px] mx-auto">
            <Outlet />
          </div>
        </main>
        <aside className="w-[280px] xl:w-[320px] flex-shrink-0 bg-[var(--color-surface)] border-l border-[var(--color-border)] overflow-y-auto scrollbar-hide">
          <DesktopRightSidebar />
        </aside>
      </div>
    </div>
  );
};