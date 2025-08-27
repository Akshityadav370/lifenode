import { useEffect, useState } from 'react';
import './App.css';
import { Coffee, House, Moon, Palette, Settings, Sun } from 'lucide-react';
import Dashboard from './views/Dashboard';
import Streaks from './views/Streaks';
import ThemeContext from './context/theme';
import { colorPalettes } from './lib/utils';
import Reminders from './views/Reminders';
import Tasks from './views/Tasks';
import SettingsModal from './components/SettingsModal/SettingsModal';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [currentPalette, setCurrentPalette] = useState('ocean');
  const [currentTheme, setCurrentTheme] = useState('light');
  const [settingsOpen, setSettingsOpen] = useState(false);

  const currentColors = colorPalettes[currentPalette][currentTheme];

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const result = await chrome.storage.sync.get([
          'lifenode-palette',
          'lifenode-theme',
        ]);

        if (
          result['lifenode-palette'] &&
          colorPalettes[result['lifenode-palette']]
        ) {
          setCurrentPalette(result['lifenode-palette']);
        }
        if (
          result['lifenode-theme'] &&
          ['light', 'dark'].includes(result['lifenode-theme'])
        ) {
          setCurrentTheme(result['lifenode-theme']);
        }
      } catch (error) {
        console.error('Failed to load settings from Chrome storage:', error);
        const savedPalette = localStorage.getItem('lifenode-palette');
        const savedTheme = localStorage.getItem('lifenode-theme');

        if (savedPalette && colorPalettes[savedPalette]) {
          setCurrentPalette(savedPalette);
        }
        if (savedTheme && ['light', 'dark'].includes(savedTheme)) {
          setCurrentTheme(savedTheme);
        }
      }
    };

    loadSettings();
  }, []);

  const handlePaletteChange = async (palette) => {
    setCurrentPalette(palette);
    try {
      await chrome.storage.sync.set({ 'lifenode-palette': palette });
      localStorage.setItem('lifenode-palette', palette);
    } catch (error) {
      console.error('Failed to save palette to Chrome storage:', error);
      localStorage.setItem('lifenode-palette', palette);
    }
  };

  const handleThemeChange = async (theme) => {
    setCurrentTheme(theme);
    try {
      await chrome.storage.sync.set({ 'lifenode-theme': theme });
      localStorage.setItem('lifenode-theme', theme);
    } catch (error) {
      console.error('Failed to save theme to Chrome storage:', error);
      localStorage.setItem('lifenode-theme', theme);
    }
  };

  const TabButton = ({ value, children, isActive }) => (
    <button
      onClick={() => setActiveTab(value)}
      className={`flex-1 py-2 px-4 text-sm font-semibold rounded-lg transition-all ${
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
          <div className="flex items-center gap-3">
            <a
              href="https://www.buymeacoffee.com/akshityadav"
              target="_blank"
              rel="noopener noreferrer"
              className="my-button flex items-center gap-2 px-2 py-1 rounded-lg text-xs cursor-pointer border"
              style={{
                color: 'var(--text)',
              }}
            >
              <Coffee size={15} />
              <span>Buy me coffee</span>
            </a>
            <button
              onClick={() =>
                handleThemeChange(currentTheme === 'light' ? 'dark' : 'light')
              }
              className="p-1 rounded-lg transition-colors duration-900 focus:outline-none"
              style={{ backgroundColor: 'var(--surface)' }}
            >
              <span
                className="block transition-all duration-900 ease-in-out transform"
                style={{ color: 'var(--text)' }}
              >
                {currentTheme === 'light' ? (
                  <Sun size={16} />
                ) : (
                  <Moon size={16} />
                )}
              </span>
            </button>
            <button
              onClick={() => setSettingsOpen(true)}
              className="p-1 rounded-lg transition-colors"
              style={{ backgroundColor: 'var(--surface)' }}
            >
              <Settings size={16} style={{ color: 'var(--text)' }} />
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
            {activeTab === 'tasks' && <Tasks />}
            {activeTab === 'streaks' && <Streaks />}
            {activeTab === 'reminders' && <Reminders />}
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
