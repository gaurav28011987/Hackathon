import { useState, useEffect } from 'react';
import { Box, TextField, Button, Typography, Alert, Collapse } from '@mui/material';
import { initializeOpenAI } from '../services/openaiService';

interface ApiKeyInputProps {
  onApiKeySet: (isSet: boolean) => void;
  isReset?: boolean; // Flag to indicate if the parent component has requested a reset
}

const API_KEY_STORAGE_KEY = 'openai_api_key';

const ApiKeyInput = ({ onApiKeySet, isReset = false }: ApiKeyInputProps) => {
  const [apiKey, setApiKey] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Reset effect - runs when isReset flag changes
  useEffect(() => {
    if (isReset) {
      handleReset();
    }
  }, [isReset]);

  // Check for API key from environment variables or local storage on component mount
  useEffect(() => {
    // First try to get API key from environment variables
    const envApiKey = import.meta.env.VITE_OPENAI_API_KEY || (window as any).process?.env?.VITE_OPENAI_API_KEY;
    
    // Then try to get from local storage
    const savedApiKey = localStorage.getItem(API_KEY_STORAGE_KEY);
    
    // Use env variable if available, otherwise use saved key
    const keyToUse = envApiKey || savedApiKey;
    
    if (keyToUse) {
      try {
        initializeOpenAI(keyToUse);
        setApiKey(keyToUse);
        setIsInitialized(true);
        onApiKeySet(true);
      } catch (err) {
        setError('Failed to initialize with API key');
        if (!envApiKey) {
          // Only remove from localStorage if it wasn't from env
          localStorage.removeItem(API_KEY_STORAGE_KEY);
        }
      }
    }
  }, [onApiKeySet]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!apiKey.trim()) {
      setError('API key is required');
      return;
    }

    try {
      initializeOpenAI(apiKey.trim());
      localStorage.setItem(API_KEY_STORAGE_KEY, apiKey.trim());
      setIsInitialized(true);
      onApiKeySet(true);
    } catch (err) {
      setError(`Failed to initialize OpenAI: ${err instanceof Error ? err.message : String(err)}`);
    }
  };

  const handleReset = () => {
    localStorage.removeItem(API_KEY_STORAGE_KEY);
    setApiKey('');
    setIsInitialized(false);
    onApiKeySet(false);
  };

  return (
    <Box sx={{ mt: 2 }}>
      <Typography variant="h6" gutterBottom>
      Vanilla JavaScript with HTML/CSS Code Generator
      </Typography>
      <Typography variant="body2" color="text.secondary" gutterBottom>
        Generate Vanilla JavaScript with HTML/CSS components with AI. Enter your OpenAI API key to get started.
      </Typography>
      
      {isInitialized ? (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Alert severity="success" sx={{ flexGrow: 1 }}>
            API key is set and ready to use
          </Alert>
          <Button 
            variant="outlined" 
            color="primary" 
            onClick={handleReset}
            size="small"
          >
            Reset API Key
          </Button>
        </Box>
      ) : (
        <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
          <TextField
            fullWidth
            label="Enter your OpenAI API Key"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            type="password"
            margin="normal"
            variant="outlined"
            placeholder="sk-..."
            helperText="Your API key is stored only in your browser's local storage"
            required
          />
          
          <Collapse in={!!error}>
            <Alert severity="error" sx={{ mt: 1, mb: 2 }}>
              {error}
            </Alert>
          </Collapse>
          
          <Button 
            type="submit" 
            variant="contained" 
            color="primary"
            disabled={!apiKey.trim()}
          >
            Save API Key
          </Button>
        </Box>
      )}
    </Box>
  );
};

export default ApiKeyInput;
