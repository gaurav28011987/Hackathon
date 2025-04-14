import { useState } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Box, Container, Grid, Paper, IconButton, Tooltip, Alert, Tabs, Tab, CircularProgress, Button } from '@mui/material';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';

import ApiKeyInput from './components/ApiKeyInput';
import PromptPane from './components/PromptPane';
import CodeEditor from './components/CodeEditor';
import PreviewPane from './components/PreviewPane';

// Define interfaces
interface FileChange {
  fileName: string;
  changeType: 'added' | 'modified' | 'removed';
  description?: string;
}

import { generateReactNativeCode as generateAICode, modifyReactNativeCode as modifyAICode, resetOpenAI } from './services/openaiService';
import {
  generateHtmlFile,
  generateJavaScriptFile,
  generateCssFile,
  generateReadmeFile
} from './services/projectTemplates';

/**
 * Generates fallback vanilla JavaScript code when no API key is set
 * @param promptText The user's prompt text
 * @returns Generated code as a string
 */
function generateFallbackCode(promptText: string): string {
  // Extract project name from prompt if possible
  const nameMatch = promptText.match(/([a-zA-Z]+)(?:\s+project|\s+app|\s+website)?/i);
  let projectName = nameMatch ? nameMatch[1] : 'WebApp';
  projectName = projectName.charAt(0).toUpperCase() + projectName.slice(1);

  // Generate a complete project with all files
  const projectFiles = [];
  
  // Add HTML file
  projectFiles.push(generateHtmlFile(projectName));
  
  // Add JavaScript file
  projectFiles.push(generateJavaScriptFile(projectName));
  
  // Add CSS file
  projectFiles.push(generateCssFile());
  
  // Add README file
  projectFiles.push(generateReadmeFile(projectName));
  
  // Combine all files with file markers
  return projectFiles.join('\n\n');
}

/**
 * Common CSS styles used in generated vanilla JavaScript components
 * This is exported so it can be used by the fallback code generator
 */
export const commonCssStyles = `/* Common styles for vanilla JavaScript components */
.button {
  background-color: #4f46e5;
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s;
}

.button:hover {
  background-color: #4338ca;
}

.container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  background-color: #f9fafb;
}

.card {
  background-color: white;
  border-radius: 0.5rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  padding: 1.5rem;
  max-width: 32rem;
  width: 100%;
  text-align: center;
}

.title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #111827;
  margin-bottom: 1rem;
}

.description {
  color: #6b7280;
  margin-bottom: 2rem;
}`;

/**
 * Main App component
 */
function App() {
  const [mode, setMode] = useState<'light' | 'dark'>('dark');
  const [generatedCode, setGeneratedCode] = useState<string>('');
  const [isApiKeySet, setIsApiKeySet] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<number>(0);
  const [refreshKey, setRefreshKey] = useState<number>(0);
  const [isReset, setIsReset] = useState<boolean>(false);
  // Track prompt history to enable incremental modifications
  // This could be used in the future for more advanced features
  const [, setPromptHistory] = useState<string[]>([]);

  const theme = createTheme({
    palette: {
      mode,
    },
  });

  const toggleTheme = () => {
    setMode(prevMode => prevMode === 'light' ? 'dark' : 'light');
  };

  /**
   * Extract file changes from generated code
   * @param oldCode Previous code (if any)
   * @param newCode Newly generated code
   * @param isModification Whether this is a modification to existing code
   * @returns Array of file changes
   */
  const extractFileChanges = (oldCode: string, newCode: string, isModification: boolean): FileChange[] => {
    const fileChanges: FileChange[] = [];
    
    // Extract file names from code using regex
    const fileRegex = /\/\/\s*FILE:\s*([^\n]+)\s*\n/g;
    
    // Get all files in the old code
    const oldFiles = new Map<string, string>();
    if (oldCode) {
      let match;
      while ((match = fileRegex.exec(oldCode)) !== null) {
        const fileName = match[1].trim();
        const startIdx = match.index + match[0].length;
        const endIdx = oldCode.indexOf('// FILE:', startIdx);
        const fileContent = endIdx > -1 
          ? oldCode.substring(startIdx, endIdx).trim()
          : oldCode.substring(startIdx).trim();
        oldFiles.set(fileName, fileContent);
      }
    }
    
    // Get all files in the new code
    const newFiles = new Map<string, string>();
    if (newCode) {
      let match;
      fileRegex.lastIndex = 0; // Reset regex index
      while ((match = fileRegex.exec(newCode)) !== null) {
        const fileName = match[1].trim();
        const startIdx = match.index + match[0].length;
        const endIdx = newCode.indexOf('// FILE:', startIdx);
        const fileContent = endIdx > -1 
          ? newCode.substring(startIdx, endIdx).trim()
          : newCode.substring(startIdx).trim();
        newFiles.set(fileName, fileContent);
      }
    }
    
    // If this is a new generation, all files are new
    if (!isModification || oldFiles.size === 0) {
      newFiles.forEach((content, fileName) => {
        fileChanges.push({
          fileName,
          changeType: 'added',
          description: 'New file created'
        });
      });
      return fileChanges;
    }
    
    // Check for added, modified, and removed files
    // Added files: in new but not in old
    newFiles.forEach((content, fileName) => {
      if (!oldFiles.has(fileName)) {
        fileChanges.push({
          fileName,
          changeType: 'added',
          description: 'New file created'
        });
      } else if (oldFiles.get(fileName) !== content) {
        fileChanges.push({
          fileName,
          changeType: 'modified',
          description: 'File content updated'
        });
      }
    });
    
    // Removed files: in old but not in new
    oldFiles.forEach((content, fileName) => {
      if (!newFiles.has(fileName)) {
        fileChanges.push({
          fileName,
          changeType: 'removed',
          description: 'File removed'
        });
      }
    });
    
    return fileChanges;
  };

  /**
   * Handles prompt submission from the PromptPane component
   * @param prompt The user's prompt text
   * @param isModification Whether this is a modification to existing code
   * @returns Array of file changes
   */
  const handlePromptSubmit = async (prompt: string, isModification: boolean): Promise<FileChange[]> => {
    setError(null);
    setIsLoading(true);
    
    try {
      let code: string;
      let fileChanges: FileChange[] = [];
      
      // Add the prompt to history regardless of whether it's a modification or new generation
      setPromptHistory(prev => [...prev, prompt]);
      
      // Store the previous code for comparison
      const previousCode = generatedCode;
      
      if (!isApiKeySet) {
        // Use fallback code generation if API key is not set
        code = generateFallbackCode(prompt);
      } else if (isModification && generatedCode) {
        // Modify existing code - always use the current generatedCode
        // This ensures modifications are cumulative
        code = await modifyAICode(generatedCode, prompt);
      } else {
        // Generate new code
        code = await generateAICode(prompt);
      }
      
      // Extract file changes by comparing previous and new code
      fileChanges = extractFileChanges(previousCode, code, isModification);
      
      setGeneratedCode(code);
      // Refresh the preview after code generation
      handleRefreshPreview();
      
      return fileChanges;
    } catch (err) {
      console.error('Error generating code:', err);
      setError(err instanceof Error ? err.message : 'Failed to generate code');
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Handles code changes from the CodeEditor component
   * @param newCode The updated code from the editor
   */
  const handleCodeChange = (newCode: string) => {
    setGeneratedCode(newCode);
    // When code is changed, we should refresh the preview
    handleRefreshPreview();
  };

  /**
   * Refreshes the preview by incrementing the refresh key
   * This forces the PreviewPane component to re-render
   */
  const handleRefreshPreview = () => {
    setRefreshKey(prev => prev + 1);
  };

  /**
   * Resets the chat by clearing generated code, prompt history, and OpenAI state
   * This allows starting a new chat from scratch with a fresh GPT-4o context
   */
  const handleResetChat = () => {
    // Reset UI state
    setGeneratedCode('');
    setPromptHistory([]);
    setError(null);
    setRefreshKey(prev => prev + 1);
    
    // Reset OpenAI client to clear conversation history
    resetOpenAI();
    
    // Trigger API key reset in child component
    setIsReset(true);
    
    // Reset after the effect has run
    setTimeout(() => {
      setIsReset(false);
    }, 100);
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container maxWidth={false} sx={{ height: '100vh', p: 0 }}>
        <Box sx={{ height: '100%', position: 'relative' }}>
          <Box sx={{ 
            position: 'absolute', 
            top: 16, 
            right: 16, 
            zIndex: 1000,
            display: 'flex',
            gap: 1
          }}>
            <Tooltip title="New Chat">
              <IconButton 
                onClick={handleResetChat} 
                color="primary" 
                sx={{ 
                  bgcolor: 'background.paper',
                  borderRadius: '50%',
                  boxShadow: 2,
                  '&:hover': { bgcolor: 'action.hover' }
                }}
              >
                <RestartAltIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title={`Switch to ${mode === 'light' ? 'dark' : 'light'} mode`}>
              <IconButton 
                onClick={toggleTheme} 
                color="inherit" 
                sx={{ 
                  bgcolor: 'background.paper',
                  borderRadius: '50%',
                  boxShadow: 2
                }}
              >
                {mode === 'light' ? <Brightness4Icon /> : <Brightness7Icon />}
              </IconButton>
            </Tooltip>
          </Box>
          <Grid container sx={{ height: '100%' }}>
            <Grid item xs={12} sx={{ p: 1 }}>
              <Paper sx={{ p: 2 }}>
                <ApiKeyInput onApiKeySet={setIsApiKeySet} isReset={isReset} />
                {error && (
                  <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                  </Alert>
                )}
              </Paper>
            </Grid>
            <Grid item xs={12} md={6} sx={{ p: 1, height: 'calc(100% - 80px)' }}>
              <Paper sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column', position: 'relative' }}>
                {isLoading && (
                  <Box sx={{ 
                    position: 'absolute', 
                    top: 0, 
                    left: 0, 
                    right: 0,
                    bottom: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: 'rgba(255, 255, 255, 0.7)',
                    zIndex: 1
                  }}>
                    <CircularProgress />
                  </Box>
                )}
                <PromptPane 
                  onPromptSubmit={handlePromptSubmit}
                  isReset={isReset}
                />
              </Paper>
            </Grid>
            <Grid item xs={12} md={6} sx={{ p: 1, height: 'calc(100% - 80px)' }}>
              <Paper sx={{ p: 0, height: '100%', display: 'flex', flexDirection: 'column' }}>
                <Tabs 
                  value={activeTab} 
                  onChange={(_, newValue) => setActiveTab(newValue)}
                  sx={{ borderBottom: 1, borderColor: 'divider' }}
                >
                  <Tab label="Code Editor" />
                  <Tab label="Preview" />
                </Tabs>
                <Box sx={{ flexGrow: 1, overflow: 'auto' }}>
                  {activeTab === 0 ? (
                    <CodeEditor 
                      code={generatedCode} 
                      onCodeChange={handleCodeChange} 
                    />
                  ) : (
                    <PreviewPane 
                      code={generatedCode} 
                      onRefresh={handleRefreshPreview}
                      refreshKey={refreshKey}
                    />
                  )}
                </Box>
              </Paper>
            </Grid>
          </Grid>
        </Box>
      </Container>
    </ThemeProvider>
  );
}

export default App;
