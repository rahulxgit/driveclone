import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { useDispatch, useSelector } from 'react-redux';
import { uploadImage, setUploadProgress } from '../../store/slices/imageSlice';
import { formatBytes } from '../../utils/helpers';
import { Upload, X, CheckCircle, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const ImageUploader = ({ folderId, onUploadComplete }) => {
  const dispatch = useDispatch();
  const { uploading, uploadProgress } = useSelector((state) => state.images);
  const [queue, setQueue] = useState([]);

  const onDrop = useCallback((acceptedFiles, rejectedFiles) => {
    rejectedFiles.forEach(({ file, errors }) => {
      const msg = errors[0]?.code === 'file-too-large'
        ? `${file.name} exceeds 10MB limit`
        : `${file.name}: ${errors[0]?.message}`;
      toast.error(msg);
    });
    const newItems = acceptedFiles.map((file) => ({
      file,
      status: 'pending',
      id: `${file.name}-${Date.now()}-${Math.random()}`,
      previewUrl: URL.createObjectURL(file),
    }));
    setQueue((prev) => [...prev, ...newItems]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'] },
    maxSize: 10 * 1024 * 1024,
    multiple: true,
  });

  const handleUploadAll = async () => {
    const pending = queue.filter((q) => q.status === 'pending');
    let successCount = 0;
    for (const item of pending) {
      setQueue((prev) => prev.map((q) => q.id === item.id ? { ...q, status: 'uploading' } : q));
      try {
        await dispatch(uploadImage({
          folderId,
          file: item.file,
          onProgress: (p) => dispatch(setUploadProgress(p)),
        })).unwrap();
        setQueue((prev) => prev.map((q) => q.id === item.id ? { ...q, status: 'done' } : q));
        successCount++;
      } catch (err) {
        setQueue((prev) => prev.map((q) => q.id === item.id ? { ...q, status: 'error' } : q));
        toast.error(`Failed: ${item.file.name}`);
      }
    }
    if (successCount > 0) {
      toast.success(`${successCount} file${successCount > 1 ? 's' : ''} uploaded!`);
      onUploadComplete?.();
    }
  };

  const removeFromQueue = (id) => {
    setQueue((prev) => {
      const item = prev.find((q) => q.id === id);
      if (item?.previewUrl) URL.revokeObjectURL(item.previewUrl);
      return prev.filter((q) => q.id !== id);
    });
  };

  const pendingCount = queue.filter((q) => q.status === 'pending').length;
  const doneCount = queue.filter((q) => q.status === 'done').length;

  return (
    <div className="space-y-4">
      {/* Drop zone */}
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer
          transition-all duration-200 select-none
          ${isDragActive
            ? 'border-brand-400 bg-brand-500/10 scale-[1.01]'
            : 'border-surface-4 hover:border-brand-500/50 hover:bg-surface-2'}`}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center gap-3">
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-colors
            ${isDragActive ? 'bg-brand-500/20 text-brand-400' : 'bg-surface-3 text-zinc-400'}`}>
            <Upload size={26} />
          </div>
          <div>
            <p className="font-display font-semibold text-zinc-200 text-sm">
              {isDragActive ? 'Drop to add to queue…' : 'Drag & drop images here'}
            </p>
            <p className="text-xs text-zinc-500 mt-1">
              or <span className="text-brand-400 underline underline-offset-2">browse files</span>
              {' '}· JPG, PNG, GIF, WebP, SVG · max 10 MB
            </p>
          </div>
        </div>
      </div>

      {/* Queue */}
      {queue.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between px-1">
            <p className="text-xs font-display font-semibold text-zinc-400 uppercase tracking-wide">
              Queue ({queue.length})
            </p>
            {doneCount > 0 && (
              <button
                onClick={() => setQueue((prev) => prev.filter((q) => q.status !== 'done'))}
                className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
              >
                Clear done
              </button>
            )}
          </div>

          {queue.map((item) => (
            <div
              key={item.id}
              className={`flex items-center gap-3 p-3 rounded-xl border transition-all
                ${item.status === 'done'      ? 'bg-emerald-500/5 border-emerald-500/20' : ''}
                ${item.status === 'error'     ? 'bg-red-500/5 border-red-500/20'         : ''}
                ${item.status === 'uploading' ? 'bg-brand-500/5 border-brand-500/20'     : ''}
                ${item.status === 'pending'   ? 'bg-surface-2 border-surface-3'           : ''}
              `}
            >
              <img
                src={item.previewUrl}
                alt=""
                className="w-10 h-10 rounded-lg object-cover shrink-0 bg-surface-3"
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-body text-zinc-200 truncate">{item.file.name}</p>
                <p className="text-xs text-zinc-500">{formatBytes(item.file.size)}</p>
                {item.status === 'uploading' && (
                  <div className="mt-1.5 h-1 bg-surface-4 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-brand-500 rounded-full transition-all"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                )}
              </div>
              <div className="shrink-0">
                {item.status === 'done'      && <CheckCircle size={18} className="text-emerald-400" />}
                {item.status === 'error'     && <AlertCircle size={18} className="text-red-400" />}
                {item.status === 'uploading' && (
                  <svg className="animate-spin h-4 w-4 text-brand-400" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.4 0 0 5.4 0 12h4z"/>
                  </svg>
                )}
                {item.status === 'pending'   && (
                  <button onClick={() => removeFromQueue(item.id)} className="text-zinc-500 hover:text-red-400 transition-colors">
                    <X size={16} />
                  </button>
                )}
              </div>
            </div>
          ))}

          {pendingCount > 0 && (
            <div className="flex justify-end pt-1">
              <button onClick={handleUploadAll} disabled={uploading} className="btn-primary">
                {uploading ? (
                  <><svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.4 0 0 5.4 0 12h4z"/>
                  </svg> Uploading… {uploadProgress}%</>
                ) : (
                  <><Upload size={15} /> Upload {pendingCount} file{pendingCount !== 1 ? 's' : ''}</>
                )}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ImageUploader;
