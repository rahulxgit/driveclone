import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import { fetchFolderTree } from '../../store/slices/folderSlice';
import { logout } from '../../store/slices/authSlice';
import { useAuth } from '../../hooks/useAuth';
import { formatBytes, getInitials } from '../../utils/helpers';
import {
  FolderOpen, Folder, ChevronRight, ChevronDown,
  HardDrive, Images, LogOut, Plus, User,
} from 'lucide-react';

// ─── Recursive Tree Node ──────────────────────────────────────────────────────
const TreeNode = ({ folder, level = 0, onNavigate }) => {
  const [expanded, setExpanded] = useState(false);
  const location = useLocation();
  const isActive = location.pathname === `/folder/${folder._id}`;
  const hasChildren = folder.children?.length > 0;

  return (
    <div>
      <div
        className={`flex items-center gap-1.5 py-1.5 pr-3 rounded-xl cursor-pointer
          text-sm transition-all duration-150 group
          ${isActive
            ? 'bg-brand-500/15 text-brand-300'
            : 'text-zinc-400 hover:text-zinc-200 hover:bg-surface-3'
          }`}
        style={{ paddingLeft: `${12 + level * 16}px` }}
        onClick={() => onNavigate(folder._id)}
      >
        <button
          onClick={(e) => { e.stopPropagation(); setExpanded(!expanded); }}
          className="w-4 h-4 flex items-center justify-center shrink-0"
        >
          {hasChildren
            ? (expanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />)
            : <span className="w-1 h-1 rounded-full bg-current opacity-30" />
          }
        </button>

        <span style={{ color: folder.color || '#F59E0B' }}>
          {isActive || expanded ? <FolderOpen size={14} /> : <Folder size={14} />}
        </span>

        <span className="truncate font-body font-medium flex-1">{folder.name}</span>
      </div>

      {expanded && hasChildren && (
        <div>
          {folder.children.map((child) => (
            <TreeNode key={child._id} folder={child} level={level + 1} onNavigate={onNavigate} />
          ))}
        </div>
      )}
    </div>
  );
};

// ─── Sidebar ──────────────────────────────────────────────────────────────────
const Sidebar = ({ onNewFolder }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { tree, treeLoading } = useSelector((state) => state.folders);

  useEffect(() => {
    dispatch(fetchFolderTree());
  }, [dispatch]);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const navItems = [
    { label: 'My Drive',   icon: HardDrive, path: '/dashboard' },
    { label: 'All Images', icon: Images,    path: '/images'    },
    { label: 'Profile',    icon: User,      path: '/profile'   },
  ];

  const storagePercent = Math.min(
    ((user?.storageUsed || 0) / (1024 * 1024 * 1024)) * 100,
    100
  );

  return (
    <aside className="w-64 h-screen bg-surface-1 border-r border-surface-3 flex flex-col shrink-0">

      {/* ── Logo ── */}
      <div className="px-5 py-5 border-b border-surface-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-brand-500 flex items-center justify-center shadow-md shadow-brand-900/40">
            <HardDrive size={18} className="text-white" />
          </div>
          <div>
            <h1 className="font-display font-bold text-base text-zinc-100 leading-none">DriveClone</h1>
            <p className="text-[10px] text-zinc-500 mt-0.5 font-mono">AI-Enabled · MERN Stack</p>
          </div>
        </div>
      </div>

      {/* ── Nav links ── */}
      <div className="px-3 py-3 space-y-1">
        {navItems.map(({ label, icon: Icon, path }) => (
          <button
            key={path}
            onClick={() => navigate(path)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-body font-medium transition-all
              ${location.pathname === path
                ? 'bg-brand-500/15 text-brand-300'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-surface-3'
              }`}
          >
            <Icon size={16} />
            {label}
          </button>
        ))}
      </div>

      {/* ── Folder tree ── */}
      <div className="flex-1 overflow-y-auto px-3 py-2">
        <div className="flex items-center justify-between px-2 mb-2">
          <span className="text-xs font-display font-semibold text-zinc-500 uppercase tracking-wider">
            Folders
          </span>
          <button
            onClick={onNewFolder}
            title="New root folder"
            className="btn-ghost p-1 rounded-lg text-zinc-500 hover:text-brand-400"
          >
            <Plus size={14} />
          </button>
        </div>

        <div className="space-y-0.5">
          {treeLoading ? (
            <div className="space-y-1.5 px-2">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="skeleton h-7 rounded-lg" />
              ))}
            </div>
          ) : tree.length > 0 ? (
            tree.map((folder) => (
              <TreeNode
                key={folder._id}
                folder={folder}
                onNavigate={(id) => navigate(`/folder/${id}`)}
              />
            ))
          ) : (
            <p className="text-xs text-zinc-600 px-3 py-2 italic">
              No folders yet — create one above ↑
            </p>
          )}
        </div>
      </div>

      {/* ── Storage bar ── */}
      <div className="px-4 py-3 border-t border-surface-3">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-xs text-zinc-500 font-body">Storage</span>
          <span className="text-xs font-mono text-zinc-400">
            {formatBytes(user?.storageUsed || 0)} / 1 GB
          </span>
        </div>
        <div className="h-1.5 bg-surface-4 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-700 ${
              storagePercent > 80
                ? 'bg-red-500'
                : 'bg-gradient-to-r from-brand-500 to-brand-400'
            }`}
            style={{ width: `${storagePercent}%` }}
          />
        </div>
      </div>

      {/* ── User footer ── */}
      <div className="px-3 py-3 border-t border-surface-3 flex items-center gap-3">
        <button
          onClick={() => navigate('/profile')}
          className="w-8 h-8 rounded-full bg-brand-500/20 border border-brand-500/30
            flex items-center justify-center hover:ring-2 ring-brand-500/40 transition-all"
        >
          <span className="text-xs font-display font-bold text-brand-400">
            {getInitials(user?.name)}
          </span>
        </button>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-body font-medium text-zinc-200 truncate">{user?.name}</p>
          <p className="text-xs text-zinc-500 truncate">{user?.email}</p>
        </div>
        <button
          onClick={handleLogout}
          title="Logout"
          className="btn-ghost p-1.5 rounded-lg text-zinc-500 hover:text-red-400"
        >
          <LogOut size={15} />
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
