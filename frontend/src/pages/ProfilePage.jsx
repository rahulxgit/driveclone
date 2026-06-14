import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { logout } from '../store/slices/authSlice';
import { formatBytes, getInitials } from '../utils/helpers';
import {
  User, Mail, HardDrive, LogOut, Shield, Clock,
  ChevronRight, Trash2,
} from 'lucide-react';
import toast from 'react-hot-toast';

const ProfilePage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useAuth();

  const storagePercent = Math.min(((user?.storageUsed || 0) / (1024 * 1024 * 1024)) * 100, 100);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
    toast.success('Logged out successfully');
  };

  const infoRows = [
    { label: 'Full Name', value: user?.name, icon: User },
    { label: 'Email Address', value: user?.email, icon: Mail },
    {
      label: 'Member Since',
      value: user?.createdAt
        ? new Date(user.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })
        : '—',
      icon: Clock,
    },
    { label: 'Auth Method', value: 'JWT (JSON Web Token)', icon: Shield },
  ];

  return (
    <div className="p-8 max-w-3xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-display font-bold text-3xl text-zinc-100">Profile</h1>
        <p className="text-zinc-500 font-body mt-1">Your account information and storage overview</p>
      </div>

      {/* Avatar + name */}
      <div className="card p-6 flex items-center gap-5 mb-6">
        <div className="w-16 h-16 rounded-2xl bg-brand-500/20 border-2 border-brand-500/30 flex items-center justify-center shrink-0">
          <span className="font-display font-bold text-2xl text-brand-400">
            {getInitials(user?.name)}
          </span>
        </div>
        <div>
          <h2 className="font-display font-bold text-xl text-zinc-100">{user?.name}</h2>
          <p className="text-zinc-500 font-body text-sm">{user?.email}</p>
          <span className="badge bg-brand-500/15 text-brand-400 mt-1 text-xs">Free Plan</span>
        </div>
      </div>

      {/* Info rows */}
      <div className="card divide-y divide-surface-3 mb-6">
        {infoRows.map(({ label, value, icon: Icon }) => (
          <div key={label} className="flex items-center justify-between px-5 py-4">
            <div className="flex items-center gap-3">
              <Icon size={16} className="text-zinc-500 shrink-0" />
              <span className="text-sm font-body text-zinc-400">{label}</span>
            </div>
            <span className="text-sm font-body font-medium text-zinc-200">{value}</span>
          </div>
        ))}
      </div>

      {/* Storage card */}
      <div className="card p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <HardDrive size={16} className="text-brand-400" />
            <h3 className="font-display font-semibold text-zinc-200">Storage</h3>
          </div>
          <span className="font-mono text-sm text-zinc-400">
            {formatBytes(user?.storageUsed || 0)} / 1 GB
          </span>
        </div>

        {/* Progress bar */}
        <div className="h-3 bg-surface-3 rounded-full overflow-hidden mb-3">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${storagePercent}%`,
              background: storagePercent > 80
                ? 'linear-gradient(to right, #ef4444, #dc2626)'
                : 'linear-gradient(to right, #d98c1a, #e6a535)',
            }}
          />
        </div>
        <p className="text-xs text-zinc-500 font-body">
          {storagePercent.toFixed(1)}% of 1 GB used
          {storagePercent > 80 && (
            <span className="text-red-400 ml-2">⚠ Storage almost full</span>
          )}
        </p>
      </div>

      {/* Danger zone */}
      <div className="card border-red-500/20 p-6">
        <h3 className="font-display font-semibold text-red-400 mb-1">Danger Zone</h3>
        <p className="text-zinc-500 font-body text-sm mb-4">
          Actions here are permanent and cannot be undone.
        </p>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-red-500/30
            text-red-400 hover:bg-red-500/10 text-sm font-body font-medium transition-all"
        >
          <LogOut size={15} />
          Sign out of all devices
        </button>
      </div>
    </div>
  );
};

export default ProfilePage;
