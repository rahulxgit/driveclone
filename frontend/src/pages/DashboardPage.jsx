import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchFolders } from '../store/slices/folderSlice';
import { useAuth } from '../hooks/useAuth';
import FolderCard from '../components/folders/FolderCard';
import CreateFolderModal from '../components/folders/CreateFolderModal';
import EmptyState from '../components/common/EmptyState';
import { FolderCardSkeleton } from '../components/common/Skeleton';
import { formatBytes } from '../utils/helpers';
import { Plus, FolderOpen, HardDrive, TrendingUp } from 'lucide-react';

const DashboardPage = () => {
  const dispatch = useDispatch();
  const { user } = useAuth();
  const { folders, loading } = useSelector((state) => state.folders);
  const [showCreateFolder, setShowCreateFolder] = useState(false);

  useEffect(() => {
    dispatch(fetchFolders(null)); // root-level
  }, [dispatch]);

  const stats = [
    {
      label: 'Root Folders',
      value: folders.length,
      icon: FolderOpen,
      color: 'text-brand-400',
      bg: 'bg-brand-500/10',
    },
    {
      label: 'Storage Used',
      value: formatBytes(user?.storageUsed || 0),
      icon: HardDrive,
      color: 'text-blue-400',
      bg: 'bg-blue-500/10',
    },
    {
      label: 'Drive Content',
      value: formatBytes(folders.reduce((acc, f) => acc + (f.size || 0), 0)),
      icon: TrendingUp,
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/10',
    },
  ];

  return (
    <div className="p-8 max-w-7xl mx-auto animate-fade-in">

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display font-bold text-3xl text-zinc-100">
            My Drive
          </h1>
          <p className="text-zinc-500 font-body mt-1">
            {loading ? 'Loading…' : `${folders.length} root folder${folders.length !== 1 ? 's' : ''}`}
          </p>
        </div>
        <button onClick={() => setShowCreateFolder(true)} className="btn-primary">
          <Plus size={16} />
          New Folder
        </button>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
        {stats.map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="card p-5 flex items-center gap-4">
            <div className={`w-11 h-11 rounded-xl ${bg} ${color} flex items-center justify-center shrink-0`}>
              <Icon size={20} />
            </div>
            <div>
              <p className="text-2xl font-display font-bold text-zinc-100">{value}</p>
              <p className="text-xs text-zinc-500 font-body">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Section header */}
      <div className="mb-5 flex items-center justify-between">
        <h2 className="font-display font-semibold text-lg text-zinc-200">Root Folders</h2>
        {folders.length > 0 && (
          <span className="badge bg-surface-3 text-zinc-400">{folders.length} items</span>
        )}
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => <FolderCardSkeleton key={i} />)}
        </div>
      ) : folders.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {folders.map((folder) => (
            <FolderCard key={folder._id} folder={folder} />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={FolderOpen}
          title="No folders yet"
          description="Create your first folder to start organising your files and images."
          action={
            <button onClick={() => setShowCreateFolder(true)} className="btn-primary">
              <Plus size={15} />
              Create First Folder
            </button>
          }
        />
      )}

      <CreateFolderModal
        isOpen={showCreateFolder}
        onClose={() => setShowCreateFolder(false)}
        parentFolder={null}
      />
    </div>
  );
};

export default DashboardPage;
