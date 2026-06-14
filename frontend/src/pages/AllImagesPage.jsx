import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAllImages } from '../store/slices/imageSlice';
import ImageCard from '../components/images/ImageCard';
import EmptyState from '../components/common/EmptyState';
import { ImageCardSkeleton } from '../components/common/Skeleton';
import { formatBytes } from '../utils/helpers';
import { Images, HardDrive, Search } from 'lucide-react';

const AllImagesPage = () => {
  const dispatch = useDispatch();
  const { images, loading } = useSelector((s) => s.images);
  const [search, setSearch] = useState('');

  useEffect(() => {
    dispatch(fetchAllImages());
  }, [dispatch]);

  const filtered = images.filter((img) =>
    img.name.toLowerCase().includes(search.toLowerCase())
  );

  const totalSize = images.reduce((acc, img) => acc + (img.size || 0), 0);

  return (
    <div className="p-8 max-w-7xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <div>
          <h1 className="font-display font-bold text-3xl text-zinc-100">All Images</h1>
          <p className="text-zinc-500 font-body mt-1">
            {loading ? 'Loading…' : `${images.length} file${images.length !== 1 ? 's' : ''} · ${formatBytes(totalSize)}`}
          </p>
        </div>

        {/* Storage badge */}
        <div className="card px-4 py-2.5 flex items-center gap-2">
          <HardDrive size={15} className="text-brand-400" />
          <span className="text-sm font-mono text-zinc-300">{formatBytes(totalSize)}</span>
        </div>
      </div>

      {/* Search */}
      {images.length > 0 && (
        <div className="relative mb-6 max-w-sm">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
          <input
            type="text"
            placeholder="Search by file name…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-field pl-10"
          />
        </div>
      )}

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
          {[...Array(12)].map((_, i) => <ImageCardSkeleton key={i} />)}
        </div>
      ) : filtered.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
          {filtered.map((image) => <ImageCard key={image._id} image={image} />)}
        </div>
      ) : images.length > 0 ? (
        <div className="text-center py-16">
          <p className="text-zinc-500 font-body">No images match "{search}"</p>
        </div>
      ) : (
        <EmptyState
          icon={Images}
          title="No images uploaded"
          description="Navigate into any folder and use the Upload tab to add your first images."
        />
      )}
    </div>
  );
};

export default AllImagesPage;
