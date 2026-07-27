import { Toggle } from '@/components/ui/Toggle';
import { useTheme } from '@/context/ThemeContext';
import { updateTheme } from '@/api/settings';
import toast from 'react-hot-toast';

export const AppearanceSettings = () => {
  const { darkMode, toggleDarkMode } = useTheme();

  const handleToggle = async (v) => {
    toggleDarkMode();
    await updateTheme({ darkMode: v });
    toast.success('Theme updated');
  };

  return (
    <div className="card border-l-transparent">
      <h3 className="font-bold text-[var(--color-text)] mb-3">🎨 Appearance</h3>
      <Toggle enabled={darkMode} onChange={handleToggle} label="Dark Mode" description="Switch between light and dark theme" />
    </div>
  );
};