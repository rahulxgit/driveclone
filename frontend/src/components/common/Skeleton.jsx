const Skeleton = ({ className = '' }) => (
  <div className={`skeleton ${className}`} />
);

export const FolderCardSkeleton = () => (
  <div className="card p-4 space-y-3">
    <div className="flex items-center gap-3">
      <Skeleton className="w-10 h-10 rounded-xl" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
      </div>
    </div>
  </div>
);

export const ImageCardSkeleton = () => (
  <div className="card overflow-hidden">
    <Skeleton className="h-40 rounded-none rounded-t-2xl" />
    <div className="p-3 space-y-2">
      <Skeleton className="h-3 w-3/4" />
      <Skeleton className="h-3 w-1/2" />
    </div>
  </div>
);

export default Skeleton;
