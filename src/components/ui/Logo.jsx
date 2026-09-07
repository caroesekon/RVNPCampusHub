import { useApp } from '../../context/AppContext.jsx';

const Logo = ({ size = 'md', showText = true }) => {
  const { appSettings } = useApp();

  const sizes = {
    sm: 'h-8 w-8',
    md: 'h-10 w-10',
    lg: 'h-14 w-14',
    xl: 'h-20 w-20',
  };

  return (
    <div className="flex items-center gap-2">
      {appSettings?.logoUrl ? (
        <img
          src={appSettings.logoUrl}
          alt={appSettings?.appName || 'Logo'}
          className={`${sizes[size]} object-contain`}
        />
      ) : (
        <div className={`${sizes[size]} rounded-full bg-bg-secondary flex items-center justify-center border border-border-color`}>
          <span className="text-text-primary font-heading font-bold text-lg">
            {(appSettings?.appName || 'R')[0]}
          </span>
        </div>
      )}

      {showText && (
        <div className="flex flex-col">
          <span className="font-heading font-bold text-text-primary leading-tight">
            {appSettings?.appName || 'RVNP Campus Hub'}
          </span>
          <span className="text-xs text-text-muted leading-tight">
            {appSettings?.tagline || 'RVNP Connected'}
          </span>
        </div>
      )}
    </div>
  );
};

export default Logo;