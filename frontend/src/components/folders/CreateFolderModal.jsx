import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { createFolder } from '../../store/slices/folderSlice';
import Modal from '../common/Modal';
import toast from 'react-hot-toast';
import { FolderPlus } from 'lucide-react';

const FOLDER_COLORS = [
  '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4',
  '#10B981', '#F97316', '#EC4899', '#3B82F6',
];

const CreateFolderModal = ({ isOpen, onClose, parentFolder = null }) => {
  const dispatch = useDispatch();
  const [name, setName]     = useState('');
  const [color, setColor]   = useState('#F59E0B');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);
    try {
      await dispatch(createFolder({
        name: name.trim(),
        parentFolder: parentFolder || null,
        color,
      })).unwrap();

      toast.success(`"${name.trim()}" created`);
      setName('');
      setColor('#F59E0B');
      onClose(); // Parent handles tree refresh via onClose callback
    } catch (err) {
      toast.error(err || 'Failed to create folder');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="New Folder">
      <form onSubmit={handleSubmit} className="space-y-5">

        <div>
          <label className="block text-sm font-body text-zinc-400 mb-1.5">Folder name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Campaigns, Projects, Assets…"
            className="input-field"
            autoFocus
            maxLength={100}
          />
        </div>

        <div>
          <label className="block text-sm font-body text-zinc-400 mb-2">Colour</label>
          <div className="flex items-center gap-2 flex-wrap">
            {FOLDER_COLORS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setColor(c)}
                className={`w-7 h-7 rounded-full transition-transform hover:scale-110
                  ${color === c ? 'ring-2 ring-offset-2 ring-offset-surface-1 ring-white/30 scale-110' : ''}`}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
        </div>

        {/* Live preview */}
        <div className="flex items-center gap-3 p-3 bg-surface-2 rounded-xl border border-surface-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
            style={{ backgroundColor: `${color}20`, color }}
          >
            <FolderPlus size={20} />
          </div>
          <div className="min-w-0">
            <p className="font-display font-semibold text-zinc-200 text-sm truncate">
              {name || 'Untitled folder'}
            </p>
            <p className="text-xs text-zinc-600">
              {parentFolder ? 'Sub-folder' : 'Root folder'}
            </p>
          </div>
        </div>

        <div className="flex gap-3 justify-end pt-1">
          <button type="button" onClick={onClose} className="btn-ghost">Cancel</button>
          <button type="submit" disabled={!name.trim() || loading} className="btn-primary">
            {loading ? 'Creating…' : 'Create Folder'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default CreateFolderModal;
