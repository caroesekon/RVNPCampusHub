import { Outlet } from 'react-router-dom';
import { DesktopLayout } from './DesktopLayout';
import { MobileLayout } from './MobileLayout';

export const AppLayout = () => {
  return (
    <>
      <DesktopLayout />
      <MobileLayout />
    </>
  );
};