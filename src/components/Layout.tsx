import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import BottomNav from './BottomNav';
import AccessDialog from './AccessDialog';

export default function Layout() {
  return (
    <div className="min-h-dvh bg-base-200">
      <Navbar />
      <main className="mx-auto w-full max-w-3xl p-4 pb-24 md:pb-6">
        <Outlet />
      </main>
      <BottomNav />
      <AccessDialog />
    </div>
  );
}
