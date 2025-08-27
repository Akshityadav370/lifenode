import React, { useCallback, useEffect, useState } from 'react';
import { VALID_MODELS, ValidModel } from '@/constants/valid_model';
import { useChromeStorage } from '@/hooks/useChromeStorage';
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
import { Settings, Check, AlertCircle } from 'lucide-react';
import { Input } from '../ui/input';

interface ModelConfigurationProps {
  onConfigurationSaved?: (model: ValidModel, apiKey: string) => void;
  onModelChange?: (model: ValidModel) => void;
  className?: string;
  showTitle?: boolean;
  autoLoad?: boolean;
}

interface SubmitMessage {
  state: 'error' | 'success';
  message: string;
}

const ModelConfiguration: React.FC<ModelConfigurationProps> = ({
  onConfigurationSaved,
  onModelChange,
  className = 'w-80',
  showTitle = true,
  autoLoad = true,
}) => {
  const [selectedModel, setSelectedModel] = useState<ValidModel | ''>('');
  const [inputApiKey, setInputApiKey] = useState<string>('');
  const [isSelectInteracting, setIsSelectInteracting] =
    useState<boolean>(false);
  const [isInputFocused, setIsInputFocused] = useState<boolean>(false);

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [submitMessage, setSubmitMessage] = useState<SubmitMessage | null>(
    null
  );

  const [currentModel, setCurrentModel] = useState<ValidModel | null>(null);
  const [currentApiKey, setCurrentApiKey] = useState<string | null>(null);

  const {
    setKeyModel,
    getKeyModel,
    setSelectedModel: saveSelectedModel,
    getSelectedModel,
  } = useChromeStorage();

  const loadStoredConfiguration = useCallback(async () => {
    if (!autoLoad) return;

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
  }, [getKeyModel, getSelectedModel, autoLoad]);

  const handleModelChange = useCallback(
    (value: ValidModel) => {
      setSelectedModel(value);
      setInputApiKey('');
      setSubmitMessage(null);
      onModelChange?.(value);
    },
    [onModelChange]
  );

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

      // Call the callback with the saved configuration
      onConfigurationSaved?.(selectedModel as ValidModel, inputApiKey.trim());

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
    loadStoredConfiguration();
  }, [loadStoredConfiguration]);

  const exposedProps = {
    isSelectInteracting,
    isInputFocused,
    currentModel,
    currentApiKey,
    hasValidConfig: currentModel && currentApiKey,
  };

  return (
    <Card
      className={className}
      style={{
        backgroundColor: 'var(--surface)',
        borderColor: 'var(--border)',
        color: 'var(--text)',
      }}
      {...exposedProps}
    >
      {showTitle && (
        <CardHeader>
          <CardTitle
            className="flex items-center gap-2"
            style={{ color: 'var(--text)' }}
          >
            <Settings className="h-5 w-5" />
            Configure AI Model
          </CardTitle>
        </CardHeader>
      )}
      <CardContent className={!showTitle ? 'pt-6' : ''}>
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
                  //   backgroundColor: 'var(--surface)',
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

        {currentModel && currentApiKey && (
          <div
            className="mt-4 p-3 rounded-md border text-sm"
            style={{
              backgroundColor: 'var(--background)',
              borderColor: 'var(--border)',
              color: 'var(--text-muted)',
            }}
          >
            <div className="flex items-center gap-2 mb-1">
              <Check className="h-3 w-3 text-green-500" />
              <span className="font-medium">Current Configuration</span>
            </div>
            <div>Model: {currentModel}</div>
            <div>API Key: {'*'.repeat(8)}...</div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ModelConfiguration;
