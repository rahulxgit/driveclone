import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { deleteFolder, fetchFolderTree } from '../../store/slices/folderSlice';
import { formatBytes, timeAgo } from '../../utils/helpers';
import { Folder, FolderOpen, Trash2, Pencil, MoreVertical, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';
import RenameFolderModal from './RenameFolderModal';

const FolderCard = ({ folder }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [showRename, setShowRename] = useState(false);

  const handleDelete = async (e) => {
    e.stopPropagation();
    setMenuOpen(false);
    if (!window.confirm(`Delete "${folder.name}" and all its contents? This cannot be undone.`)) return;
    try {
      await dispatch(deleteFolder(folder._id)).unwrap();
      dispatch(fetchFolderTree()); // Refresh sidebar
      toast.success(`"${folder.name}" deleted`);
    } catch (err) {
      toast.error(err || 'Failed to delete folder');
    }
  };

  const handleNavigate = () => navigate(`/folder/${folder._id}`);

  return (
    <>
      <div
        className="card-hover p-4 group relative animate-fade-in"
        onClick={handleNavigate}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => { setHovered(false); setMenuOpen(false); }}
      >
        {/* Top row */}
        <div className="flex items-start justify-between mb-3">
          <div
            className="w-11 h-11 rounded-2xl flex items-center justify-center transition-transform duration-200"
            style={{ backgroundColor: `${folder.color || '#F59E0B'}20`, color: folder.color || '#F59E0B' }}
          >
            {hovered ? <FolderOpen size={22} /> : <Folder size={22} />}
          </div>

          {/* Context menu */}
          <div className="relative" onClick={(e) => e.stopPropagation()}>
            <button
              className="opacity-0 group-hover:opacity-100 btn-ghost p-1.5 rounded-lg transition-opacity"
              onClick={() => setMenuOpen(!menuOpen)}
            >
              <MoreVertical size={15} />
            </button>

            {menuOpen && (
              <div className="absolute right-0 top-8 z-20 w-44 card shadow-2xl py-1.5 animate-scale-in">
                <button
                  className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-zinc-400 hover:text-zinc-100 hover:bg-surface-3 transition-colors"
                  onClick={() => { setShowRename(true); setMenuOpen(false); }}
                >
                  <Pencil size={14} />
                  Rename
                </button>
                <div className="my-1 border-t border-surface-3" />
                <button
                  className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors"
                  onClick={handleDelete}
                >
                  <Trash2 size={14} />
                  Delete folder
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Name */}
        <p className="font-display font-semibold text-zinc-100 text-sm truncate mb-1">{folder.name}</p>

        {/* Meta */}
        <div className="flex items-center justify-between">
          <span className="badge bg-surface-3 text-zinc-400">{formatBytes(folder.size || 0)}</span>
          <div className="flex items-center gap-1 text-zinc-500 text-xs">
            <span>{timeAgo(folder.createdAt)}</span>
            <ChevronRight size={12} className="opacity-0 group-hover:opacity-100 text-brand-400 transition-opacity" />
          </div>
        </div>

        {/* Depth badge */}
        {folder.depth > 0 && (
          <span className="absolute top-3 left-3 badge bg-surface-3 text-zinc-600 text-[10px]">
            L{folder.depth}
          </span>
        )}
      </div>

      {/* Rename modal */}
      <RenameFolderModal
        isOpen={showRename}
        onClose={() => setShowRename(false)}
        folder={folder}
      />
    </>
  );
};

export default FolderCard;
