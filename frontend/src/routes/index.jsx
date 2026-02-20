import { createBrowserRouter } from 'react-router-dom';

import UserLayout from '../layouts/UserLayout';
import AdminLayout from '../layouts/AdminLayout';
import ProtectedRoute from './ProtectedRoute';

import Landing from '../pages/Landing';
import Login from '../pages/Login';
import AdminLogin from '../pages/AdminLogin';
import Register from '../pages/Register';
import Menu from '../pages/Menu';
import Checkout from '../pages/Checkout';
import Orders from '../pages/Orders';
import AdminDashboard from '../pages/AdminDashboard';
import AdminFoods from '../pages/AdminFoods';
import AdminOrders from '../pages/AdminOrders';

const router = createBrowserRouter([
  {
    path: '/',
    element: <UserLayout />,
    children: [
      { index: true, element: <Landing /> },
      { path: 'login', element: <Login /> },
      { path: 'admin-login', element: <AdminLogin /> },
      { path: 'register', element: <Register /> },
      { path: 'menu', element: <Menu /> },
      {
        path: 'checkout',
        element: (
          <ProtectedRoute>
            <Checkout />
          </ProtectedRoute>
        ),
      },
      {
        path: 'orders',
        element: (
          <ProtectedRoute>
            <Orders />
          </ProtectedRoute>
        ),
      },
    ],
  },
  {
    path: '/admin',
    element: (
      <ProtectedRoute adminOnly>
        <AdminLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <AdminDashboard /> },
      { path: 'foods', element: <AdminFoods /> },
      { path: 'orders', element: <AdminOrders /> },
    ],
  },
]);

export default router;
