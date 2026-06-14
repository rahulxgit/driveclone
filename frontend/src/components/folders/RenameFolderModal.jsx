import { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { updateFolder, fetchFolderTree } from '../../store/slices/folderSlice';
import Modal from '../common/Modal';
import toast from 'react-hot-toast';

const FOLDER_COLORS = [
  '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4',
  '#10B981', '#F97316', '#EC4899', '#3B82F6',
];

const RenameFolderModal = ({ isOpen, onClose, folder }) => {
  const dispatch = useDispatch();
  const [name, setName] = useState('');
  const [color, setColor] = useState('#F59E0B');
  const [loading, setLoading] = useState(false);

  // Seed current values when modal opens
  useEffect(() => {
    if (folder && isOpen) {
      setName(folder.name || '');
      setColor(folder.color || '#F59E0B');
    }
  }, [folder, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);
    try {
      await dispatch(updateFolder({ id: folder._id, data: { name: name.trim(), color } })).unwrap();
      dispatch(fetchFolderTree()); // Refresh sidebar tree
      toast.success('Folder renamed');
      onClose();
    } catch (err) {
      toast.error(err || 'Failed to rename folder');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Rename Folder">
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-body text-zinc-400 mb-1.5">Folder name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="input-field"
            autoFocus
            maxLength={100}
          />
        </div>

        <div>
          <label className="block text-sm font-body text-zinc-400 mb-2">Color</label>
          <div className="flex items-center gap-2 flex-wrap">
            {FOLDER_COLORS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setColor(c)}
                className={`w-7 h-7 rounded-full transition-transform hover:scale-110
                  ${color === c ? 'ring-2 ring-offset-2 ring-offset-surface-1 scale-110' : ''}`}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
        </div>

        <div className="flex gap-3 justify-end pt-1">
          <button type="button" onClick={onClose} className="btn-ghost">Cancel</button>
          <button type="submit" disabled={!name.trim() || loading} className="btn-primary">
            {loading ? 'Saving…' : 'Save Changes'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default RenameFolderModal;
