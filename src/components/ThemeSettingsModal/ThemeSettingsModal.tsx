import { colorPalettes } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';

const ThemeSettingsModal = ({
  isOpen,
  onClose,
  currentPalette,
  currentTheme,
  onPaletteChange,
  onThemeChange,
}) => {
  if (!isOpen) return null;

  return (
    <Card
      className="h-64"
      style={{
        backgroundColor: 'var(--surface)',
        borderColor: 'var(--border)',
        color: 'var(--text)',
      }}
    >
      <CardContent className="justify-center">
        {/* Color Palette */}
        <div className="mt-4">
          <div className="grid grid-cols-1 gap-6">
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
      </CardContent>
    </Card>
  );
};

export default ThemeSettingsModal;
