import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { deleteImage } from '../../store/slices/imageSlice';
import { formatBytes, timeAgo, truncate } from '../../utils/helpers';
import { Trash2, ExternalLink, ZoomIn } from 'lucide-react';
import toast from 'react-hot-toast';

const ImageCard = ({ image }) => {
  const dispatch = useDispatch();
  const [hovered, setHovered] = useState(false);
  const [lightbox, setLightbox] = useState(false);

  const handleDelete = async (e) => {
    e.stopPropagation();
    if (!window.confirm('Delete this image?')) return;
    try {
      await dispatch(deleteImage(image._id)).unwrap();
      toast.success('Image deleted');
    } catch (err) {
      toast.error(err || 'Failed to delete');
    }
  };

  return (
    <>
      <div
        className="card overflow-hidden group animate-fade-in cursor-pointer"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onClick={() => setLightbox(true)}
      >
        {/* Image */}
        <div className="relative h-40 bg-surface-2 overflow-hidden">
          <img
            src={image.url}
            alt={image.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />

          {/* Overlay */}
          <div className={`absolute inset-0 bg-black/50 flex items-center justify-center gap-3
            transition-opacity duration-200 ${hovered ? 'opacity-100' : 'opacity-0'}`}>
            <button
              onClick={(e) => { e.stopPropagation(); setLightbox(true); }}
              className="w-9 h-9 rounded-full bg-white/10 backdrop-blur flex items-center justify-center
                text-white hover:bg-white/20 transition-colors"
            >
              <ZoomIn size={15} />
            </button>
            <a
              href={image.url}
              target="_blank"
              rel="noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="w-9 h-9 rounded-full bg-white/10 backdrop-blur flex items-center justify-center
                text-white hover:bg-white/20 transition-colors"
            >
              <ExternalLink size={15} />
            </a>
            <button
              onClick={handleDelete}
              className="w-9 h-9 rounded-full bg-red-500/20 backdrop-blur flex items-center justify-center
                text-red-400 hover:bg-red-500/40 transition-colors"
            >
              <Trash2 size={15} />
            </button>
          </div>
        </div>

        {/* Meta */}
        <div className="p-3">
          <p className="text-sm font-body font-medium text-zinc-200 truncate">{truncate(image.name, 24)}</p>
          <div className="flex items-center justify-between mt-1">
            <span className="badge bg-surface-3 text-zinc-500">{formatBytes(image.size)}</span>
            <span className="text-xs text-zinc-600">{timeAgo(image.createdAt)}</span>
          </div>
        </div>
      </div>

      {/* Lightbox */}
      {lightbox && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setLightbox(false)}
        >
          <img
            src={image.url}
            alt={image.name}
            className="max-w-full max-h-full object-contain rounded-xl shadow-2xl"
          />
          <p className="absolute bottom-6 left-1/2 -translate-x-1/2 text-zinc-400 text-sm font-body bg-surface-2 px-4 py-1.5 rounded-full">
            {image.name} · {formatBytes(image.size)}
          </p>
        </div>
      )}
    </>
  );
};

export default ImageCard;
