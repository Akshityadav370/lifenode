import { VALID_MODELS, ValidModel } from '@/constants/valid_modal';
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

const ChatBox = () => {
  return (
    <Card className="w-80 h-96">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bot className="h-5 w-5" />
          AI Assistant
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-4">
          <p className="text-sm text-muted-foreground">
            Chat interface will be implemented here
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

const ContentPage = () => {
  const [chatboxExpanded, setChatboxExpanded] = useState<boolean>(false);
  const [currentModel, setCurrentModel] = useState<ValidModel | null>(null);
  const [currentApiKey, setCurrentApiKey] = useState<string | null>(null);

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
    <Card className="w-80">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Configure AI Model
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSaveConfiguration} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Select Model</label>
            <Select
              value={selectedModel}
              onValueChange={handleModelChange}
              onOpenChange={setIsSelectInteracting}
            >
              <SelectTrigger>
                <SelectValue placeholder="Choose an AI model" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Available Models</SelectLabel>
                  <SelectSeparator />
                  {VALID_MODELS.map((modelOption) => (
                    <SelectItem key={modelOption.name} value={modelOption.name}>
                      {modelOption.display}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label htmlFor="apikey" className="text-sm font-medium">
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
            />
          </div>

          <Button
            type="submit"
            disabled={!selectedModel || !inputApiKey.trim() || isLoading}
            className="w-full"
          >
            {isLoading ? 'Saving...' : 'Save Configuration'}
          </Button>

          {submitMessage && (
            <div
              className={`flex items-center gap-2 text-sm p-3 rounded-md ${
                submitMessage.state === 'success'
                  ? 'bg-green-50 text-green-700 border border-green-200'
                  : 'bg-red-50 text-red-700 border border-red-200'
              }`}
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
      <ChatBox />
    </div>
  );

  return (
    <div
      id="content-wrapper"
      ref={ref}
      className="dark z-50"
      style={{
        position: 'fixed',
        bottom: '30px',
        right: '30px',
      }}
    >
      {chatboxExpanded && (
        <div className="mb-4">
          {hasValidConfig ? renderConfiguredState() : renderConfigurationForm()}
        </div>
      )}

      <div className="flex justify-end">
        <Button
          size="icon"
          onClick={() => setChatboxExpanded(!chatboxExpanded)}
        >
          <Bot />
        </Button>
      </div>
    </div>
  );
};

export default ContentPage;
