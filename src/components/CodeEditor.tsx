import { Paper, Typography, IconButton, Snackbar, Box, Tabs, Tab, Tooltip } from '@mui/material';
import Editor from '@monaco-editor/react';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import JSZip from 'jszip';
import { useState, useCallback, useEffect } from 'react';

interface CodeEditorProps {
  code: string;
  onCodeChange?: (newCode: string) => void;
}

interface FileData {
  name: string;
  content: string;
}

const CodeEditor = ({ code, onCodeChange }: CodeEditorProps) => {
  const [showCopied, setShowCopied] = useState(false);
  const [showDownloaded, setShowDownloaded] = useState(false);
  const [activeFileIndex, setActiveFileIndex] = useState(0);
  const [files, setFiles] = useState<FileData[]>([{ name: 'Component.tsx', content: code }]);

  // Parse code to extract multiple files if they exist
  const parseCodeIntoFiles = useCallback((codeString: string): FileData[] => {
    // Check if the code contains file markers
    if (codeString.includes('// FILE:')) {
      const fileRegex = /\/\/\s*FILE:\s*([^\n]+)\s*\n([\s\S]*?)(?=\/\/\s*FILE:|$)/g;
      const files: FileData[] = [];
      let match;

      while ((match = fileRegex.exec(codeString)) !== null) {
        const fileName = match[1].trim();
        const fileContent = match[2].trim();
        files.push({ name: fileName, content: fileContent });
      }

      return files.length > 0 ? files : [{ name: 'Component.tsx', content: codeString }];
    } else {
      // If no file markers, treat the entire code as a single file
      return [{ name: 'Component.tsx', content: codeString }];
    }
  }, []);

  // Update files when code prop changes
  useEffect(() => {
    if (code) {
      const parsedFiles = parseCodeIntoFiles(code);
      setFiles(parsedFiles);
      // Reset to first file when new code is loaded
      setActiveFileIndex(0);
    }
  }, [code, parseCodeIntoFiles]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(files[activeFileIndex]?.content || '');
      setShowCopied(true);
    } catch (err) {
      console.error('Failed to copy code:', err);
    }
  };

  // Function to download all files as a zip
  const handleDownloadAllFiles = async () => {
    try {
      const zip = new JSZip();
      
      // Add all files to the zip
      files.forEach(file => {
        zip.file(file.name, file.content);
      });
      
      // Generate the zip file
      const content = await zip.generateAsync({ type: 'blob' });
      
      // Create a download link
      const url = URL.createObjectURL(content);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'web-project.zip';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      setShowDownloaded(true);
    } catch (err) {
      console.error('Failed to download files:', err);
    }
  };

  // Use useCallback to memoize the change handler for better performance
  const handleEditorChange = useCallback((value: string | undefined) => {
    if (value !== undefined) {
      // Update the content of the active file
      const updatedFiles = [...files];
      if (updatedFiles[activeFileIndex]) {
        updatedFiles[activeFileIndex].content = value;
        setFiles(updatedFiles);
        
        // Combine all file contents for parent component
        const combinedCode = updatedFiles.map(file => 
          `// FILE: ${file.name}\n${file.content}`
        ).join('\n\n');
        
        // Notify parent of changes
        onCodeChange?.(combinedCode);
      }
    }
  }, [files, activeFileIndex, onCodeChange]);

  // Determine the language based on file extension
  const getLanguage = useCallback((fileName: string) => {
    const ext = fileName.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'js': return 'javascript';
      case 'jsx': return 'javascript';
      case 'ts': return 'typescript';
      case 'tsx': return 'typescript';
      case 'css': return 'css';
      case 'html': return 'html';
      case 'json': return 'json';
      case 'md': return 'markdown';
      default: return 'typescript';
    }
  }, []);

  return (
    <Paper sx={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', px: 2, pt: 2, pb: 1 }}>
        <Typography variant="h6" gutterBottom sx={{ mb: 0 }}>
          Generated Code
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Tooltip title="Download as ZIP">
            <IconButton onClick={handleDownloadAllFiles} size="small">
              <FileDownloadIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Copy code">
            <IconButton onClick={handleCopy} size="small">
              <ContentCopyIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>
      
      {files.length > 1 && (
        <Box sx={{ borderBottom: 1, borderColor: 'divider', px: 2 }}>
          <Tabs 
            value={activeFileIndex}
            onChange={(_, newValue) => setActiveFileIndex(newValue)}
            variant="scrollable"
            scrollButtons="auto"
            aria-label="code files tabs"
          >
            {files.map((file, index) => (
              <Tab key={index} label={file.name} />
            ))}
          </Tabs>
        </Box>
      )}
      
      <Box sx={{ flexGrow: 1, overflow: 'hidden' }}>
        <Editor
          height="100%"
          language={getLanguage(files[activeFileIndex]?.name || 'Component.tsx')}
          value={files[activeFileIndex]?.content || ''}
          theme="vs-dark"
          onChange={handleEditorChange}
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            readOnly: false,
            scrollBeyondLastLine: false,
            automaticLayout: true,
            lineNumbers: 'on',
            renderLineHighlight: 'all',
            scrollbar: {
              vertical: 'visible',
              horizontal: 'visible',
            },
          }}
        />
      </Box>
      
      <Snackbar
        open={showCopied}
        autoHideDuration={2000}
        onClose={() => setShowCopied(false)}
        message="Code copied to clipboard"
      />
      <Snackbar
        open={showDownloaded}
        autoHideDuration={2000}
        onClose={() => setShowDownloaded(false)}
        message="Project files downloaded as ZIP"
      />
    </Paper>
  );
};

export default CodeEditor; 