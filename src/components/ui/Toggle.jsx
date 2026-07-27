export const Toggle = ({ enabled, onChange, label, description }) => {
  return (
    <div className="flex items-center justify-between py-3">
      <div className="flex-1 min-w-0 mr-4">
        {label && <p className="text-sm font-semibold text-[var(--color-text)]">{label}</p>}
        {description && <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">{description}</p>}
      </div>
      <button
        type="button"
        onClick={() => onChange?.(!enabled)}
        className={`relative inline-flex h-7 w-12 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
          enabled ? 'bg-[var(--color-primary)]' : 'bg-gray-300 dark:bg-gray-600'
        }`}
      >
        <span
          className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
            enabled ? 'translate-x-5' : 'translate-x-0'
          }`}
        />
      </button>
    </div>
  );
};