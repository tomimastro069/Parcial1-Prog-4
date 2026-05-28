import { Outlet } from 'react-router-dom';
import Header from '../../components/Header';
import { CartDrawer } from '../../features/store/CartDrawer';
import { ConfirmModal } from '../../components/ConfirmModal';

export default function StoreLayout() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      <main className="flex-grow">
        <Outlet />
      </main>
      <CartDrawer />
      <ConfirmModal />
    </div>
  );
}
