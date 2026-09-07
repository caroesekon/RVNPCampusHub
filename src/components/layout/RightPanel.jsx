import { useApp } from '../../context/AppContext.jsx';

const RightPanel = () => {
  const { campuses } = useApp();

  return (
    <aside className="hidden xl:block w-72 shrink-0">
      <div className="sticky top-20 p-4 space-y-4">
        <div className="bg-bg-secondary rounded-xl p-4">
          <h3 className="font-heading font-semibold text-text-primary mb-3">
            Campuses
          </h3>
          <div className="space-y-2">
            {campuses.map((campus) => (
              <div key={campus.id} className="flex items-center justify-between">
                <span className="text-sm text-text-secondary">{campus.name}</span>
                <span className="text-xs text-text-muted">{campus.userCount} users</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </aside>
  );
};

export default RightPanel;