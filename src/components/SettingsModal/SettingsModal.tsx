import { Bot, Palette, MessageSquare } from 'lucide-react';
import ModelConfiguration from '../ModelConfiguration/ModelConfiguration';
import ThemeSettingsModal from '../ThemeSettingsModal/ThemeSettingsModal';
import RequestFeature from '../RequestFeature/RequestFeature';
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
  const [activeTab, setActiveTab] = useState<'model' | 'theme' | 'feature'>(
    'model'
  );

  const handleModelConfigSaved = (model: ValidModel, apiKey: string) => {
    // console.log('Model configuration saved:', { model, apiKey: '***' });
  };

  const tabs = [
    { id: 'theme', label: 'Theme', icon: Palette },
    { id: 'model', label: 'AI Model', icon: Bot },
    { id: 'feature', label: 'Feature Request', icon: MessageSquare },
  ] as const;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div
        className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 max-h-[90vh] overflow-hidden"
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
            className="text-gray-400 hover:text-gray-600 text-xl font-bold"
            style={{ color: 'var(--text-muted)' }}
          >
            ✕
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b" style={{ borderColor: 'var(--border)' }}>
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 py-3 px-2 text-xs font-medium border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-500'
                    : 'border-transparent hover:border-gray-300'
                } focus:outline-none focus-within:outline-none`}
                style={{
                  color:
                    activeTab === tab.id ? 'var(--primary)' : 'var(--text)',
                }}
              >
                <div className="flex items-center justify-center gap-1">
                  <Icon size={14} />
                  <span className="hidden sm:inline">{tab.label}</span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        <div className="p-4 max-h-[calc(90vh-120px)] overflow-y-auto">
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

          {activeTab === 'feature' && <RequestFeature onClose={onClose} />}
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
