import { VALID_MODELS, ValidModel } from '@/constants/valid_model';
import { useChromeStorage } from '@/hooks/useChromeStorage';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { Bot, Settings, Check, AlertCircle } from 'lucide-react';
import { Input } from '../ui/input';
import ChatBox from '../ChatBox/ChatBox';
import { colorPalettes } from '@/lib/utils';
import ThemeContext from '@/context/theme';

const ContentPage = () => {
  const [chatboxExpanded, setChatboxExpanded] = useState<boolean>(false);
  const [currentModel, setCurrentModel] = useState<ValidModel | null>(null);
  const [currentApiKey, setCurrentApiKey] = useState<string | null>(null);
  const [currentPalette, setCurrentPalette] = useState('ocean');
  const [currentTheme, setCurrentTheme] = useState('light');

  const metaDescriptionEl = document.querySelector('meta[name=description]');
  const problemStatement = metaDescriptionEl?.getAttribute('content') as string;

  // Form states
  const [selectedModel, setSelectedModel] = useState<ValidModel | ''>('');
  const [inputApiKey, setInputApiKey] = useState<string>('');
  const [isSelectInteracting, setIsSelectInteracting] =
    useState<boolean>(false);
  const [isInputFocused, setIsInputFocused] = useState<boolean>(false);

  // Status states
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [submitMessage, setSubmitMessage] = useState<{
    state: 'error' | 'success';
    message: string;
  } | null>(null);

  const ref = useRef<HTMLDivElement>(null);
  const {
    setKeyModel,
    getKeyModel,
    setSelectedModel: saveSelectedModel,
    getSelectedModel,
  } = useChromeStorage();

  const hasValidConfig = currentModel && currentApiKey;
  const currentColors = colorPalettes[currentPalette][currentTheme];

  useEffect(() => {
    const loadThemeSettings = async () => {
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
        console.error('Failed to load theme settings:', error);
      }
    };

    loadThemeSettings();

    const handleStorageChange = (changes: any, namespace: string) => {
      if (namespace === 'sync') {
        if (changes['lifenode-palette']) {
          setCurrentPalette(changes['lifenode-palette'].newValue);
        }
        if (changes['lifenode-theme']) {
          setCurrentTheme(changes['lifenode-theme'].newValue);
        }
      }
    };

    chrome.storage.onChanged.addListener(handleStorageChange);

    return () => {
      chrome.storage.onChanged.removeListener(handleStorageChange);
    };
  }, []);

  const loadStoredConfiguration = useCallback(async () => {
    try {
      const storedModel = await getSelectedModel();
      if (storedModel) {
        const { model, apiKey } = await getKeyModel(storedModel);
        if (apiKey) {
          setCurrentModel(model);
          setCurrentApiKey(apiKey);
        } else {
          // Model is selected but no API key - show in form
          setSelectedModel(storedModel);
          setCurrentModel(null);
          setCurrentApiKey(null);
        }
      }
    } catch (error) {
      console.error('Failed to load stored configuration:', error);
    }
  }, [getKeyModel, getSelectedModel]);

  const handleModelChange = useCallback((value: ValidModel) => {
    setSelectedModel(value);
    setInputApiKey('');
    setSubmitMessage(null);
  }, []);

  const handleSaveConfiguration = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    if (!selectedModel || !inputApiKey.trim()) {
      setSubmitMessage({
        state: 'error',
        message: 'Please select a model and enter an API key',
      });
      return;
    }

    try {
      setIsLoading(true);
      setSubmitMessage(null);

      await setKeyModel(inputApiKey.trim(), selectedModel as ValidModel);

      await saveSelectedModel(selectedModel as ValidModel);

      setCurrentModel(selectedModel as ValidModel);
      setCurrentApiKey(inputApiKey.trim());

      setSelectedModel('');
      setInputApiKey('');

      setSubmitMessage({
        state: 'success',
        message: 'Configuration saved successfully!',
      });

      setTimeout(() => {
        setSubmitMessage(null);
      }, 2000);
    } catch (error: any) {
      setSubmitMessage({
        state: 'error',
        message: error.message || 'Failed to save configuration',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const handleDocumentClick = (e: MouseEvent) => {
      if (isSelectInteracting || isInputFocused) return;

      if (!ref.current) return;
      const target = e.target as HTMLElement;

      // Don't close if clicked inside chatbox
      if (ref.current.contains(target)) return;

      // Don't close if clicked inside content-wrapper
      const contentWrapper = document.getElementById('content-wrapper');
      if (contentWrapper && contentWrapper.contains(target)) return;

      // Don't close if it's input-related element
      if (
        target.closest('input') ||
        target.closest('[role="combobox"]') ||
        target.closest('[data-radix-popper-content-wrapper]') ||
        target.closest('.autocomplete-dropdown')
      ) {
        return;
      }

      setChatboxExpanded(false);
    };

    if (chatboxExpanded) {
      document.addEventListener('click', handleDocumentClick);
    }

    return () => {
      document.removeEventListener('click', handleDocumentClick);
    };
  }, [chatboxExpanded, isSelectInteracting, isInputFocused]);

  useEffect(() => {
    loadStoredConfiguration();
  }, [loadStoredConfiguration]);

  const renderConfigurationForm = () => (
    <Card
      className="w-80"
      style={{
        backgroundColor: 'var(--surface)',
        borderColor: 'var(--border)',
        color: 'var(--text)',
      }}
    >
      <CardHeader>
        <CardTitle
          className="flex items-center gap-2"
          style={{ color: 'var(--text)' }}
        >
          <Settings className="h-5 w-5" />
          Configure AI Model
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSaveConfiguration} className="space-y-4">
          <div className="space-y-2">
            <label
              className="text-sm font-medium"
              style={{ color: 'var(--text)' }}
            >
              Select Model
            </label>
            <Select
              value={selectedModel}
              onValueChange={handleModelChange}
              onOpenChange={setIsSelectInteracting}
            >
              <SelectTrigger
                style={{
                  backgroundColor: 'var(--background)',
                  borderColor: 'var(--border)',
                  color: 'var(--text)',
                }}
              >
                <SelectValue placeholder="Choose an AI model" />
              </SelectTrigger>
              <SelectContent
                style={{
                  // backgroundColor: 'var(--surface)',
                  borderColor: 'var(--border)',
                  color: 'var(--text)',
                }}
              >
                <SelectGroup>
                  <SelectLabel style={{ color: 'var(--text-muted)' }}>
                    Available Models
                  </SelectLabel>
                  <SelectSeparator
                    style={{ backgroundColor: 'var(--border)' }}
                  />
                  {VALID_MODELS.map((modelOption) => (
                    <SelectItem
                      key={modelOption.name}
                      value={modelOption.name}
                      style={{ color: 'var(--text)' }}
                    >
                      {modelOption.display}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label
              htmlFor="apikey"
              className="text-sm font-medium"
              style={{ color: 'var(--text)' }}
            >
              API Key {selectedModel && `for ${selectedModel}`}
            </label>
            <Input
              id="apikey"
              type="password"
              value={inputApiKey}
              onChange={(e) => setInputApiKey(e.target.value)}
              onFocus={() => setIsInputFocused(true)}
              onBlur={() => setIsInputFocused(false)}
              placeholder="Enter your API key"
              disabled={!selectedModel}
              style={{
                backgroundColor: 'var(--background)',
                borderColor: 'var(--border)',
                color: 'var(--text)',
              }}
            />
          </div>

          <Button
            type="submit"
            disabled={!selectedModel || !inputApiKey.trim() || isLoading}
            className="w-full"
            style={{
              backgroundColor: 'var(--primary)',
              color: 'white',
              opacity:
                !selectedModel || !inputApiKey.trim() || isLoading ? 0.6 : 1,
            }}
          >
            {isLoading ? 'Saving...' : 'Save Configuration'}
          </Button>

          {submitMessage && (
            <div
              className={`flex items-center gap-2 text-sm p-3 rounded-md border`}
              style={{
                backgroundColor:
                  submitMessage.state === 'success'
                    ? 'var(--success)'
                    : 'var(--error)',
                color: 'white',
                borderColor:
                  submitMessage.state === 'success'
                    ? 'var(--success)'
                    : 'var(--error)',
                opacity: 0.9,
              }}
            >
              {submitMessage.state === 'success' ? (
                <Check className="h-4 w-4" />
              ) : (
                <AlertCircle className="h-4 w-4" />
              )}
              {submitMessage.message}
            </div>
          )}
        </form>
      </CardContent>
    </Card>
  );

  const renderConfiguredState = () => (
    <div className="space-y-3">
      <ChatBox
        visible={chatboxExpanded}
        context={{ problemStatement }}
        model={currentModel}
        apiKey={currentApiKey}
      />
    </div>
  );

  return (
    <ThemeContext theme={currentColors}>
      <div
        id="content-wrapper"
        ref={ref}
        className="z-50"
        style={{
          position: 'fixed',
          bottom: '30px',
          right: '30px',
        }}
      >
        {chatboxExpanded && (
          <div className="mb-4">
            {hasValidConfig
              ? renderConfiguredState()
              : renderConfigurationForm()}
          </div>
        )}

        <div className="flex justify-end">
          <Button
            size="icon"
            onClick={() => setChatboxExpanded(!chatboxExpanded)}
            style={{
              backgroundColor: 'var(--primary)',
              color: 'white',
            }}
          >
            <Bot />
          </Button>
        </div>
      </div>
    </ThemeContext>
  );
};

export default ContentPage;
