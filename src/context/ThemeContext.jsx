import { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};

const themes = {
  light: {
    colors: {
      bgPrimary: 'var(--bg-primary)',
      bgSecondary: 'var(--bg-secondary)',
      bgTertiary: 'var(--bg-tertiary)',
      textPrimary: 'var(--text-primary)',
      textSecondary: 'var(--text-secondary)',
      textMuted: 'var(--text-muted)',
      border: 'var(--border-color)',
      hover: 'var(--hover-color)',
    },
  },
  dark: {
    colors: {
      bgPrimary: 'var(--bg-primary)',
      bgSecondary: 'var(--bg-secondary)',
      bgTertiary: 'var(--bg-tertiary)',
      textPrimary: 'var(--text-primary)',
      textSecondary: 'var(--text-secondary)',
      textMuted: 'var(--text-muted)',
      border: 'var(--border-color)',
      hover: 'var(--hover-color)',
    },
  },
};

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('theme') || 'light';
  });

  const [colors, setColors] = useState(themes[theme].colors);

  useEffect(() => {
    localStorage.setItem('theme', theme);
    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add(theme);
    setColors(themes[theme].colors);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  const setLightTheme = () => setTheme('light');
  const setDarkTheme = () => setTheme('dark');

  const isDark = theme === 'dark';

  return (
    <ThemeContext.Provider
      value={{
        theme,
        colors,
        isDark,
        toggleTheme,
        setLightTheme,
        setDarkTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};