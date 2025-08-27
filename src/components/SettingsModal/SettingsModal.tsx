import { Bot, Palette } from 'lucide-react';
import ModelConfiguration from '../ModelConfiguration/ModelConfiguration';
import ThemeSettingsModal from '../ThemeSettingsModal/ThemeSettingsModal';
import { ValidModel } from '@/constants/valid_model';
import { useState } from 'react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentPalette: string;
  currentTheme: string;
  onPaletteChange: (palette: string) => void;
  onThemeChange: (theme: string) => void;
}

const SettingsModal = ({
  isOpen,
  onClose,
  currentPalette,
  currentTheme,
  onPaletteChange,
  onThemeChange,
}: SettingsModalProps) => {
  if (!isOpen) return null;
  const [activeTab, setActiveTab] = useState<'model' | 'theme'>('model');

  const handleModelConfigSaved = (model: ValidModel, apiKey: string) => {
    // console.log('Model configuration saved:', { model, apiKey: '***' });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div
        className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4"
        style={{
          backgroundColor: 'var(--surface)',
          borderColor: 'var(--border)',
        }}
      >
        <div
          className="flex items-center justify-between p-4 border-b"
          style={{ borderColor: 'var(--border)' }}
        >
          <h2
            className="text-lg font-semibold"
            style={{ color: 'var(--text)' }}
          >
            Settings
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
            style={{ color: 'var(--text-muted)' }}
          >
            ✕
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b" style={{ borderColor: 'var(--border)' }}>
          <button
            onClick={() => setActiveTab('theme')}
            className={`flex-1 py-3 px-4 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'theme'
                ? 'border-blue-500'
                : 'border-transparent hover:border-gray-300'
            } focus:outline-none focus-within:outline-none`}
            style={{
              color: activeTab === 'theme' ? 'var(--primary)' : 'var(--text)',
            }}
          >
            <div className="flex items-center justify-center gap-2">
              <Palette size={16} />
              Theme
            </div>
          </button>
          <button
            onClick={() => setActiveTab('model')}
            className={`flex-1 py-3 px-4 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'model'
                ? 'border-blue-500'
                : 'border-transparent hover:border-gray-300'
            } focus:outline-none focus-within:outline-none`}
            style={{
              color: activeTab === 'model' ? 'var(--primary)' : 'var(--text)',
            }}
          >
            <div className="flex items-center justify-center gap-2">
              <Bot size={16} />
              AI Model
            </div>
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-4">
          {activeTab === 'theme' && (
            <ThemeSettingsModal
              isOpen={activeTab === 'theme'}
              onClose={onClose}
              currentPalette={currentPalette}
              currentTheme={currentTheme}
              onPaletteChange={onPaletteChange}
              onThemeChange={onThemeChange}
            />
          )}

          {activeTab === 'model' && (
            <div className="space-y-4">
              <ModelConfiguration
                onConfigurationSaved={handleModelConfigSaved}
                className="w-full"
                showTitle={false}
                autoLoad={true}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
