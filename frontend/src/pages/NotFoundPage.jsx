import { useNavigate } from 'react-router-dom';
import { HardDrive, ArrowLeft } from 'lucide-react';

const NotFoundPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-surface-0 flex flex-col items-center justify-center p-6 text-center">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1c1c2208_1px,transparent_1px),linear-gradient(to_bottom,#1c1c2208_1px,transparent_1px)] bg-[size:40px_40px]" />

      <div className="relative animate-slide-up">
        <p className="font-display font-bold text-[120px] leading-none text-surface-3 select-none">404</p>
        <div className="absolute inset-0 flex items-center justify-center">
          <HardDrive size={48} className="text-brand-500 opacity-80" />
        </div>
      </div>

      <h1 className="font-display font-bold text-2xl text-zinc-100 mt-4 mb-2">Page not found</h1>
      <p className="text-zinc-500 font-body mb-8 max-w-sm">
        The folder or page you're looking for doesn't exist or has been moved.
      </p>

      <button onClick={() => navigate('/dashboard')} className="btn-primary">
        <ArrowLeft size={15} />
        Back to My Drive
      </button>
    </div>
  );
};

export default NotFoundPage;
