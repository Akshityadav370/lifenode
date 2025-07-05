import { useEffect, useState } from 'react';
import './App.css';
import { Coffee, House, Palette, Settings } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Dashboard from './views/Dashboard';
import Streaks from './views/Streaks';
import SettingsModal from './components/SettingsModal/SettingsModal';
import ThemeContext from './context/theme';
import { colorPalettes } from './lib/utils';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [currentPalette, setCurrentPalette] = useState('ocean');
  const [currentTheme, setCurrentTheme] = useState('light');
  const [settingsOpen, setSettingsOpen] = useState(false);

  const currentColors = colorPalettes[currentPalette][currentTheme];

  useEffect(() => {
    const savedPalette = localStorage.getItem('lifenode-palette');
    const savedTheme = localStorage.getItem('lifenode-theme');

    if (savedPalette && colorPalettes[savedPalette]) {
      setCurrentPalette(savedPalette);
    }
    if (savedTheme && ['light', 'dark'].includes(savedTheme)) {
      setCurrentTheme(savedTheme);
    }
  }, []);

  const handlePaletteChange = (palette) => {
    setCurrentPalette(palette);
    localStorage.setItem('lifenode-palette', palette);
  };

  const handleThemeChange = (theme) => {
    setCurrentTheme(theme);
    localStorage.setItem('lifenode-theme', theme);
  };

  const TabButton = ({ value, children, isActive }) => (
    <button
      onClick={() => setActiveTab(value)}
      className={`flex-1 py-2 px-4 text-sm font-medium rounded-lg transition-all ${
        isActive ? 'text-white' : ''
      }`}
      style={{
        backgroundColor: isActive ? 'var(--primary)' : 'var(--surface)',
        color: isActive ? 'white' : 'var(--text)',
        border: `1px solid ${isActive ? 'var(--primary)' : 'var(--border)'}`,
      }}
    >
      {children}
    </button>
  );

  return (
    <ThemeContext theme={currentColors}>
      <div className="p-[0.6rem] overflow-hidden">
        <header className="flex items-center justify-between mb-2 px-1">
          <div className="flex items-center gap-2">
            {activeTab !== 'dashboard' && (
              <House
                className="cursor-pointer"
                onClick={() => setActiveTab('dashboard')}
                size={18}
                style={{ color: 'var(--text)' }}
              />
            )}
            <h2
              className="text-lg font-semibold"
              style={{ color: 'var(--text)' }}
            >
              LifeNode
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <div
              className="my-button flex items-center gap-2 px-2 py-1 rounded-lg text-xs cursor-pointer"
              style={{
                color: 'var(--text)',
              }}
            >
              <Coffee size={15} />
              <span>Buy me coffee</span>
            </div>
            <Settings size={16} />
            <button
              onClick={() => setSettingsOpen(true)}
              className="p-1 rounded-lg transition-colors"
              style={{ backgroundColor: 'var(--surface)' }}
            >
              <Palette size={16} style={{ color: 'var(--text)' }} />
            </button>
          </div>
        </header>
        <main className="w-[48rem]">
          <div className="flex gap-2 mb-4">
            <TabButton value="tasks" isActive={activeTab === 'tasks'}>
              Tasks
            </TabButton>
            <TabButton value="streaks" isActive={activeTab === 'streaks'}>
              Streaks
            </TabButton>
            <TabButton value="reminders" isActive={activeTab === 'reminders'}>
              Reminders
            </TabButton>
          </div>
          <div className="px-1">
            {activeTab === 'dashboard' && <Dashboard />}
            {activeTab === 'tasks' && (
              <div
                className="p-8 text-center rounded-lg"
                style={{
                  backgroundColor: 'var(--surface)',
                  color: 'var(--text)',
                }}
              >
                Tasks functionality coming soon...
              </div>
            )}
            {activeTab === 'streaks' && <Streaks />}
            {activeTab === 'reminders' && (
              <div
                className="p-8 text-center rounded-lg"
                style={{
                  backgroundColor: 'var(--surface)',
                  color: 'var(--text)',
                }}
              >
                Reminders functionality coming soon...
              </div>
            )}
          </div>
        </main>
        <SettingsModal
          isOpen={settingsOpen}
          onClose={() => setSettingsOpen(false)}
          currentPalette={currentPalette}
          currentTheme={currentTheme}
          onPaletteChange={handlePaletteChange}
          onThemeChange={handleThemeChange}
        />
      </div>
    </ThemeContext>
  );
}

export default App;
