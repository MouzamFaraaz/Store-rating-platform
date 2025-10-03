
import React, { useEffect, useState } from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import Header from '../../components/layout/Header';
import ManageUsers from './ManageUsers';
import ManageStores from './ManageStores';
import UpdatePassword from '../shared/UpdatePassword';
import { mockApiService } from '../../services/mockApiService';

const StatCard: React.FC<{ title: string; value: number; icon: React.ReactNode }> = ({ title, value, icon }) => (
  <div className="bg-white p-6 rounded-lg shadow-md flex items-center space-x-4">
    <div className="bg-primary-100 text-primary-600 rounded-full p-3">
      {icon}
    </div>
    <div>
      <p className="text-sm font-medium text-gray-500">{title}</p>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
    </div>
  </div>
);

const DashboardHome: React.FC = () => {
    const [stats, setStats] = useState({ users: 0, stores: 0, ratings: 0 });

    useEffect(() => {
        const fetchStats = async () => {
            const data = await mockApiService.getAdminDashboardStats();
            setStats(data);
        };
        fetchStats();
    }, []);

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatCard title="Total Users" value={stats.users} icon={<UsersIcon />} />
            <StatCard title="Total Stores" value={stats.stores} icon={<StoreIcon />} />
            <StatCard title="Total Ratings" value={stats.ratings} icon={<StarIcon />} />
        </div>
    );
};

const AdminDashboard: React.FC = () => {
  const location = useLocation();
  
  const navLinks = [
    { path: '/admin', label: 'Dashboard', exact: true },
    { path: '/admin/users', label: 'Manage Users' },
    { path: '/admin/stores', label: 'Manage Stores' },
    { path: '/admin/update-password', label: 'Update Password' },
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <nav className="mb-6 bg-white shadow rounded-lg">
          <ul className="flex">
            {navLinks.map(link => {
              const isActive = link.exact ? location.pathname === link.path : location.pathname.startsWith(link.path);
              return (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className={`block px-4 py-3 text-sm font-medium border-b-2 ${
                      isActive
                        ? 'border-primary-500 text-primary-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    {link.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <Routes>
          <Route index element={<DashboardHome />} />
          <Route path="users" element={<ManageUsers />} />
          <Route path="stores" element={<ManageStores />} />
          <Route path="update-password" element={<UpdatePassword />} />
        </Routes>
      </div>
    </div>
  );
};

const UsersIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M15 21a6 6 0 00-9-5.197M15 11a4 4 0 110-5.292" /></svg>;
const StoreIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M5 6h14M5 11h14M5 16h14" /></svg>;
const StarIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.783-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg>;

export default AdminDashboard;
