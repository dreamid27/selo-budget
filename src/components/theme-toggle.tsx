import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { FC, KeyboardEvent } from 'react';

type Theme = 'light' | 'dark';

export const ThemeToggle: FC = () => {
  const { theme, setTheme } = useTheme() as {
    theme: Theme;
    setTheme: (theme: Theme) => void;
  };

  const handleToggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleToggleTheme();
    }
  };

  return (
    <button
      onClick={handleToggleTheme}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      className="relative inline-flex h-10 w-10 items-center justify-center rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:focus:ring-gray-700"
      aria-label="Toggle theme"
      role="switch"
      aria-checked={theme === 'dark'}
    >
      <div className="relative h-5 w-5">
        <Sun className="absolute inset-0 rotate-0 scale-100 transition-transform duration-200 dark:-rotate-90 dark:scale-0" />
        <Moon className="absolute inset-0 rotate-90 scale-0 transition-transform duration-200 dark:rotate-0 dark:scale-100" />
      </div>
      <span className="sr-only">Toggle theme</span>
    </button>
  );
};
