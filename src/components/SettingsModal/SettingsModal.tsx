import { Sun, Moon } from 'lucide-react';
import { colorPalettes } from '@/lib/utils';

const SettingsModal = ({
  isOpen,
  onClose,
  currentPalette,
  currentTheme,
  onPaletteChange,
  onThemeChange,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div
        className="rounded-lg p-6 max-w-xs w-full mx-4 shadow-xl"
        style={{
          backgroundColor: 'var(--surface)',
          border: `1px solid var(--border)`,
        }}
      >
        <h3
          className="text-lg text-center font-semibold"
          style={{ color: 'var(--text)' }}
        >
          Appearance
        </h3>

        {/* Theme Toggle */}
        <div className="mb-4">
          <label
            className="block text-sm font-medium mb-2"
            style={{ color: 'var(--text)' }}
          >
            Theme
          </label>
          <div className="flex gap-2">
            <button
              onClick={() => onThemeChange('light')}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-all ${
                currentTheme === 'light' ? 'ring-2' : ''
              }`}
              style={{
                backgroundColor:
                  currentTheme === 'light'
                    ? 'var(--primary)'
                    : 'var(--surface)',
                color: currentTheme === 'light' ? 'white' : 'var(--text)',
                borderColor: 'var(--border)',
              }}
            >
              <Sun size={16} />
              Light
            </button>
            <button
              onClick={() => onThemeChange('dark')}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-all ${
                currentTheme === 'dark' ? 'ring-2' : ''
              }`}
              style={{
                backgroundColor:
                  currentTheme === 'dark' ? 'var(--primary)' : 'var(--surface)',
                color: currentTheme === 'dark' ? 'white' : 'var(--text)',
                borderColor: 'var(--border)',
              }}
            >
              <Moon size={16} />
              Dark
            </button>
          </div>
        </div>

        {/* Color Palette */}
        <div className="mb-4">
          <label
            className="block text-sm font-medium mb-2"
            style={{ color: 'var(--text)' }}
          >
            Color Palette
          </label>
          <div className="grid grid-cols-2 gap-2">
            {Object.entries(colorPalettes).map(([key, palette]) => (
              <button
                key={key}
                onClick={() => onPaletteChange(key)}
                className={`py-2 px-3 rounded-lg border transition-all ${
                  currentPalette === key ? 'ring-2' : ''
                }`}
                style={{
                  backgroundColor:
                    currentPalette === key
                      ? 'var(--primary)'
                      : 'var(--surface)',
                  borderColor: 'var(--border)',
                }}
              >
                <div className="flex items-center gap-2">
                  <div
                    className={`w-3 h-3 rounded-full ${
                      currentPalette === key ? 'ring-2' : ''
                    }`}
                    style={{
                      backgroundColor:
                        currentPalette === key
                          ? palette[currentTheme].accent
                          : palette[currentTheme].primary,
                    }}
                  />
                  <span
                    className="text-xs font-medium"
                    style={{
                      color: currentPalette === key ? 'white' : 'var(--text)',
                    }}
                  >
                    {palette.name}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full py-2 px-4 rounded-lg text-white font-medium"
          style={{ backgroundColor: 'var(--primary)' }}
        >
          Done
        </button>
      </div>
    </div>
  );
};

export default SettingsModal;
