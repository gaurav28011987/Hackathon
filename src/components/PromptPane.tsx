import { useState, useEffect } from 'react';
import { Box, TextField, Button, Paper, Typography, CircularProgress, Alert, List, ListItem, ListItemText, Divider, Collapse, IconButton } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import CloseIcon from '@mui/icons-material/Close';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';

interface FileChange {
  fileName: string;
  changeType: 'added' | 'modified' | 'removed';
  description?: string;
}

interface Message {
  text: string;
  isUser: boolean;
  timestamp: Date;
  type: 'prompt' | 'response' | 'modification';
  fileChanges?: FileChange[];
}

interface ErrorLog {
  message: string;
  timestamp: Date;
  details?: string;
}

interface PromptPaneProps {
  onPromptSubmit: (prompt: string, isModification: boolean) => Promise<FileChange[]>;
  isReset?: boolean;
}

const PromptPane = ({ onPromptSubmit, isReset }: PromptPaneProps) => {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errorLogs, setErrorLogs] = useState<ErrorLog[]>([]);
  const [showErrorLog, setShowErrorLog] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      text: "Hello! I'm your AI assistant powered by OpenAI. I can help you create and modify vanilla JavaScript web projects. First, add your OpenAI API key above, then describe what you'd like to create. For subsequent prompts, I'll automatically modify your existing code unless you specifically ask for a new project.",
      isUser: false,
      timestamp: new Date(),
      type: 'response'
    }
  ]);

  // Reset messages when isReset is true
  useEffect(() => {
    if (isReset) {
      setMessages([
        {
          text: "Hello! I'm your AI assistant powered by OpenAI. I can help you create and modify vanilla JavaScript web projects. First, add your OpenAI API key above, then describe what you'd like to create. For subsequent prompts, I'll automatically modify your existing code unless you specifically ask for a new project.",
          isUser: false,
          timestamp: new Date(),
          type: 'response'
        }
      ]);
      setErrorLogs([]);
      setError(null);
    }
  }, [isReset]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (prompt.trim()) {
      setLoading(true);
      setError(null);
      
      // Determine if this is a modification request based on keywords or context
      // Look for modification keywords or phrases in the prompt
      const modificationKeywords = ['modify', 'change', 'update', 'edit', 'revise', 'alter', 'adjust', 'improve'];
      const hasModificationKeyword = modificationKeywords.some(keyword => 
        prompt.toLowerCase().includes(keyword)
      );
      
      // If there are previous messages and the last one was a response, assume this is a modification
      // unless it's explicitly a new generation request
      const hasPreviousResponse = messages.length > 1 && 
        !messages[messages.length - 1].isUser && 
        messages[messages.length - 1].type === 'response';
      
      const isNewGenerationRequest = prompt.toLowerCase().includes('new') && 
        (prompt.toLowerCase().includes('project') || prompt.toLowerCase().includes('code'));
      
      // Determine if this is a modification request
      const isModification = (hasModificationKeyword || hasPreviousResponse) && !isNewGenerationRequest;
      
      // Add user message with the appropriate type
      const userMessage: Message = {
        text: prompt,
        isUser: true,
        timestamp: new Date(),
        type: isModification ? 'modification' : 'prompt'
      };
      setMessages(prev => [...prev, userMessage]);
      
      try {
        // Call onPromptSubmit and get file changes
        const fileChanges = await onPromptSubmit(prompt, isModification);
        
        // Create a message for the AI response
        let responseText = isModification 
          ? "I've modified the code according to your request. Here's what changed:\n\n"
          : "I've generated new code based on your request. Here are the files created:\n\n";
        
        // Add AI response with file change details
        const aiMessage: Message = {
          text: responseText,
          isUser: false,
          timestamp: new Date(),
          type: 'response',
          fileChanges: fileChanges
        };
        
        setMessages(prev => [...prev, aiMessage]);
        setPrompt('');
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'An error occurred';
        setError(errorMessage);
        setErrorLogs(prev => [...prev, {
          message: errorMessage,
          timestamp: new Date(),
          details: err instanceof Error ? err.stack : undefined
        }]);
      } finally {
        setLoading(false);
      }
    }
  };

  const clearErrorLogs = () => {
    setErrorLogs([]);
    setError(null);
  };

  return (
    <Paper sx={{ height: '100%', p: 2, display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">
          Chat with AI Assistant
        </Typography>
        <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
          Powered by OpenAI
        </Typography>
        {errorLogs.length > 0 && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <IconButton 
              size="small" 
              onClick={() => setShowErrorLog(!showErrorLog)}
              color="error"
            >
              {showErrorLog ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            </IconButton>
            <IconButton 
              size="small" 
              onClick={clearErrorLogs}
              color="error"
            >
              <CloseIcon />
            </IconButton>
          </Box>
        )}
      </Box>

      <Collapse in={showErrorLog && errorLogs.length > 0}>
        <Paper 
          sx={{ 
            mb: 2, 
            p: 2, 
            bgcolor: 'error.dark',
            color: 'error.contrastText',
            maxHeight: '200px',
            overflow: 'auto'
          }}
        >
          <Typography variant="subtitle2" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <ErrorOutlineIcon /> Error Log
          </Typography>
          <List dense>
            {errorLogs.map((log, index) => (
              <ListItem key={index} sx={{ 
                flexDirection: 'column', 
                alignItems: 'flex-start',
                borderLeft: '2px solid',
                borderColor: 'error.main',
                pl: 2,
                mb: 1
              }}>
                <ListItemText 
                  primary={log.message}
                  secondary={
                    <Box component="div">
                      <Typography variant="caption" component="span">
                        {log.timestamp.toLocaleString()}
                      </Typography>
                      {log.details && (
                        <Typography 
                          variant="caption" 
                          component="pre" 
                          sx={{ 
                            mt: 1, 
                            whiteSpace: 'pre-wrap',
                            fontFamily: 'monospace',
                            fontSize: '0.75rem'
                          }}
                        >
                          {log.details}
                        </Typography>
                      )}
                    </Box>
                  }
                />
              </ListItem>
            ))}
          </List>
        </Paper>
      </Collapse>

      {error && !showErrorLog && (
        <Alert 
          severity="error" 
          sx={{ mb: 2 }}
          action={
            <IconButton
              size="small"
              onClick={() => setShowErrorLog(true)}
            >
              <ExpandMoreIcon />
            </IconButton>
          }
        >
          {error}
        </Alert>
      )}

      <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <List sx={{ flexGrow: 1, overflow: 'auto', mb: 2 }}>
          {messages.map((message, index) => (
            <ListItem key={index} sx={{ 
              flexDirection: 'column', 
              alignItems: message.isUser ? 'flex-end' : 'flex-start',
              padding: '8px 16px'
            }}>
              <Paper sx={{ 
                p: 2, 
                maxWidth: '80%',
                backgroundColor: message.isUser ? 'primary.main' : 'background.paper',
                color: message.isUser ? 'primary.contrastText' : 'text.primary',
                borderRadius: 2,
                wordBreak: 'break-word',
                boxShadow: 1,
                borderLeft: message.type === 'modification' ? '4px solid orange' : 'none'
              }}>
                <ListItemText 
                  primary={message.text}
                  secondary={
                    <Box component="div">
                      <Typography variant="caption" component="span">
                        {message.timestamp.toLocaleTimeString()}
                      </Typography>
                      
                      {/* Display file changes if available */}
                      {message.fileChanges && message.fileChanges.length > 0 && (
                        <Box sx={{ mt: 1, borderLeft: '2px solid', borderColor: 'divider', pl: 1 }}>
                          <Typography variant="subtitle2" component="div" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                            File Changes:
                          </Typography>
                          <List dense disablePadding>
                            {message.fileChanges.map((change, idx) => (
                              <ListItem key={idx} sx={{ py: 0.5 }}>
                                <ListItemText
                                  primary={
                                    <Box component="span" sx={{ 
                                      display: 'flex', 
                                      alignItems: 'center',
                                      color: change.changeType === 'added' 
                                        ? 'success.main' 
                                        : change.changeType === 'modified' 
                                          ? 'info.main' 
                                          : 'error.main'
                                    }}>
                                      <Typography variant="body2" component="span" sx={{ fontWeight: 'medium' }}>
                                        {change.fileName}
                                      </Typography>
                                      <Typography variant="caption" component="span" sx={{ 
                                        ml: 1,
                                        px: 0.7, 
                                        py: 0.2, 
                                        borderRadius: 1,
                                        bgcolor: change.changeType === 'added' 
                                          ? 'success.main' 
                                          : change.changeType === 'modified' 
                                            ? 'info.main' 
                                            : 'error.main',
                                        color: 'white'
                                      }}>
                                        {change.changeType.toUpperCase()}
                                      </Typography>
                                    </Box>
                                  }
                                  secondary={change.description}
                                  secondaryTypographyProps={{ variant: 'caption' }}
                                />
                              </ListItem>
                            ))}
                          </List>
                        </Box>
                      )}
                    </Box>
                  }
                />
              </Paper>
            </ListItem>
          ))}
        </List>
        <Divider sx={{ mb: 2 }} />
        <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', gap: 1 }}>
          <TextField
            fullWidth
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Type your message or request code modifications..."
            variant="outlined"
            size="small"
            disabled={loading}
          />
          <Button
            type="submit"
            variant="contained"
            endIcon={loading ? <CircularProgress size={20} color="inherit" /> : <SendIcon />}
            disabled={!prompt.trim() || loading}
          >
            Send
          </Button>
        </Box>
      </Box>
    </Paper>
  );
};

export default PromptPane;