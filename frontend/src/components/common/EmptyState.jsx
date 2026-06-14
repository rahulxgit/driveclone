/**
 * Generic empty state UI — used across dashboard, folder view, images page
 */
const EmptyState = ({ icon: Icon, title, description, action }) => (
  <div className="flex flex-col items-center justify-center py-24 px-6 text-center animate-fade-in">
    <div className="w-20 h-20 rounded-3xl bg-surface-2 border border-surface-3 flex items-center justify-center mx-auto mb-5 shadow-inner">
      <Icon size={36} className="text-zinc-600" />
    </div>
    <h3 className="font-display font-semibold text-zinc-300 text-lg mb-2">{title}</h3>
    <p className="text-zinc-500 font-body text-sm mb-6 max-w-xs">{description}</p>
    {action && action}
  </div>
);

export default EmptyState;
