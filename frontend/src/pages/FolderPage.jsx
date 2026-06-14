import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchFolder, fetchFolders, fetchFolderTree } from '../store/slices/folderSlice';
import { fetchImagesByFolder } from '../store/slices/imageSlice';
import FolderCard from '../components/folders/FolderCard';
import CreateFolderModal from '../components/folders/CreateFolderModal';
import ImageCard from '../components/images/ImageCard';
import ImageUploader from '../components/images/ImageUploader';
import Breadcrumb from '../components/layout/Breadcrumb';
import EmptyState from '../components/common/EmptyState';
import { FolderCardSkeleton, ImageCardSkeleton } from '../components/common/Skeleton';
import { formatBytes } from '../utils/helpers';
import { Plus, Upload, Folder, Images, HardDrive } from 'lucide-react';

const FolderPage = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { currentFolder, breadcrumb, folders, loading: foldersLoading } = useSelector((s) => s.folders);
  const { images, loading: imagesLoading } = useSelector((s) => s.images);
  const [showCreateFolder, setShowCreateFolder] = useState(false);
  const [showUploader, setShowUploader] = useState(false);
  const [activeTab, setActiveTab] = useState('folders');

  useEffect(() => {
    if (id) {
      dispatch(fetchFolder(id));
      dispatch(fetchFolders(id));
      dispatch(fetchImagesByFolder(id));
    }
  }, [id, dispatch]);

  const handleFolderCreated = () => {
    dispatch(fetchFolders(id));
    dispatch(fetchFolderTree());
  };

  const tabs = [
    { key: 'folders', label: 'Sub-Folders', icon: Folder,  count: folders.length },
    { key: 'images',  label: 'Images',      icon: Images,  count: images.length  },
    { key: 'upload',  label: 'Upload',       icon: Upload,  count: null           },
  ];

  return (
    <div className="p-8 max-w-7xl mx-auto animate-fade-in">

      {/* Breadcrumb */}
      <div className="mb-6">
        <Breadcrumb breadcrumb={breadcrumb} />
      </div>

      {/* Folder header */}
      <div className="flex items-start justify-between mb-6 flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg"
            style={{
              backgroundColor: `${currentFolder?.color || '#F59E0B'}20`,
              color: currentFolder?.color || '#F59E0B',
            }}
          >
            <Folder size={28} />
          </div>
          <div>
            <h1 className="font-display font-bold text-3xl text-zinc-100">
              {currentFolder?.name || '…'}
            </h1>
            <div className="flex items-center gap-3 mt-1 flex-wrap">
              <span className="badge bg-surface-3 text-zinc-400 font-mono text-xs">
                <HardDrive size={10} />
                {formatBytes(currentFolder?.size || 0)}
              </span>
              <span className="badge bg-surface-3 text-zinc-500 text-xs">
                Depth Level {currentFolder?.depth ?? '…'}
              </span>
              <span className="badge bg-surface-3 text-zinc-500 text-xs">
                {folders.length} sub-folder{folders.length !== 1 ? 's' : ''}
              </span>
              <span className="badge bg-surface-3 text-zinc-500 text-xs">
                {images.length} image{images.length !== 1 ? 's' : ''}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button onClick={() => setShowCreateFolder(true)} className="btn-ghost">
            <Plus size={15} />
            New Folder
          </button>
          <button onClick={() => setActiveTab('upload')} className="btn-primary">
            <Upload size={15} />
            Upload Images
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 p-1 bg-surface-2 rounded-xl w-fit border border-surface-3">
        {tabs.map(({ key, label, icon: Icon, count }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-body font-medium transition-all
              ${activeTab === key
                ? 'bg-surface-4 text-zinc-100 shadow-sm'
                : 'text-zinc-500 hover:text-zinc-300'
              }`}
          >
            <Icon size={14} />
            {label}
            {count !== null && (
              <span className={`badge text-[10px] ${
                activeTab === key ? 'bg-brand-500/20 text-brand-400' : 'bg-surface-4 text-zinc-600'
              }`}>
                {count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ── Tab: Upload ── */}
      {activeTab === 'upload' && (
        <div className="card p-6 animate-slide-up">
          <h3 className="font-display font-semibold text-zinc-200 mb-4">
            Upload to "{currentFolder?.name}"
          </h3>
          <ImageUploader
            folderId={id}
            onUploadComplete={() => dispatch(fetchImagesByFolder(id))}
          />
        </div>
      )}

      {/* ── Tab: Sub-folders ── */}
      {activeTab === 'folders' && (
        foldersLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => <FolderCardSkeleton key={i} />)}
          </div>
        ) : folders.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {folders.map((folder) => <FolderCard key={folder._id} folder={folder} />)}
          </div>
        ) : (
          <EmptyState
            icon={Folder}
            title="No sub-folders"
            description={`"${currentFolder?.name || 'This folder'}" has no nested folders yet.`}
            action={
              <button onClick={() => setShowCreateFolder(true)} className="btn-primary">
                <Plus size={14} /> Create Sub-Folder
              </button>
            }
          />
        )
      )}

      {/* ── Tab: Images ── */}
      {activeTab === 'images' && (
        imagesLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => <ImageCardSkeleton key={i} />)}
          </div>
        ) : images.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {images.map((image) => <ImageCard key={image._id} image={image} />)}
          </div>
        ) : (
          <EmptyState
            icon={Images}
            title="No images here"
            description="Upload images into this folder using the Upload tab."
            action={
              <button onClick={() => setActiveTab('upload')} className="btn-primary">
                <Upload size={14} /> Upload Images
              </button>
            }
          />
        )
      )}

      <CreateFolderModal
        isOpen={showCreateFolder}
        onClose={() => { setShowCreateFolder(false); handleFolderCreated(); }}
        parentFolder={id}
      />
    </div>
  );
};

export default FolderPage;
