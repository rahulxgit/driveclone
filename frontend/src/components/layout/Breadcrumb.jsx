import { useNavigate } from 'react-router-dom';
import { ChevronRight, HardDrive } from 'lucide-react';

const Breadcrumb = ({ breadcrumb = [] }) => {
  const navigate = useNavigate();

  return (
    <nav className="flex items-center gap-1 text-sm font-body flex-wrap">
      {/* Root */}
      <button
        onClick={() => navigate('/dashboard')}
        className="flex items-center gap-1.5 text-zinc-400 hover:text-zinc-200 transition-colors"
      >
        <HardDrive size={14} />
        <span>My Drive</span>
      </button>

      {breadcrumb.map((crumb, index) => {
        const isLast = index === breadcrumb.length - 1;
        return (
          <div key={crumb._id} className="flex items-center gap-1">
            <ChevronRight size={13} className="text-zinc-600" />
            <button
              onClick={() => !isLast && navigate(`/folder/${crumb._id}`)}
              className={`transition-colors ${
                isLast
                  ? 'text-zinc-100 font-medium cursor-default'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              {crumb.name}
            </button>
          </div>
        );
      })}
    </nav>
  );
};

export default Breadcrumb;
