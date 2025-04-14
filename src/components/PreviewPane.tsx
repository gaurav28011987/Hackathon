import { Paper, Typography, Box, IconButton, ToggleButton, ToggleButtonGroup } from '@mui/material';
import { useEffect, useState, useMemo, useCallback } from 'react';
import RefreshIcon from '@mui/icons-material/Refresh';
import LaptopIcon from '@mui/icons-material/Laptop';
import SmartphoneIcon from '@mui/icons-material/Smartphone';

interface PreviewPaneProps {
  code: string;
  refreshKey?: number;
  onRefresh?: () => void;
}

type ViewMode = 'desktop' | 'mobile';

// We're using an iframe with Tailwind CSS for the preview of vanilla HTML, JavaScript, and CSS

const PreviewPane = ({ code, refreshKey, onRefresh }: PreviewPaneProps) => {
  const [previewCode, setPreviewCode] = useState(code);
  const [localRefreshKey, setLocalRefreshKey] = useState(0);
  const [viewMode, setViewMode] = useState<ViewMode>('desktop');

  // Update preview code when code, refreshKey, or localRefreshKey changes
  useEffect(() => {
    // Always update the preview code when the code prop changes
    setPreviewCode(code);
  }, [code, refreshKey, localRefreshKey]);

  const handleRefresh = useCallback(() => {
    // Increment local refresh key to force re-render
    setLocalRefreshKey(prev => prev + 1);
    
    // Also call the parent's refresh handler if provided
    if (onRefresh) {
      onRefresh();
    }
  }, [onRefresh]);

  // Helper function to extract HTML content from the code
  const extractHtmlFromCode = useCallback((code: string): string => {
    // Look for index.html which is the main entry point in vanilla JS projects
    let htmlContent = '';
    
    if (code.includes('// FILE:')) {
      // Try to find index.html first
      const htmlFileMatch = code.match(/\/\/\s*FILE:\s*index\.html\s*\n([\s\S]*?)(?=\/\/\s*FILE:|$)/i);
      if (htmlFileMatch) {
        htmlContent = htmlFileMatch[1].trim();
        
        // Extract just the body content if possible
        const bodyContentMatch = htmlContent.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
        if (bodyContentMatch) {
          return bodyContentMatch[1].trim();
        }
        
        return htmlContent;
      }
      
      // If index.html not found, look for any .html file
      const anyHtmlMatch = code.match(/\/\/\s*FILE:\s*([^\n]+\.html)\s*\n([\s\S]*?)(?=\/\/\s*FILE:|$)/i);
      if (anyHtmlMatch) {
        htmlContent = anyHtmlMatch[2].trim();
        
        // Extract just the body content if possible
        const bodyContentMatch = htmlContent.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
        if (bodyContentMatch) {
          return bodyContentMatch[1].trim();
        }
        
        return htmlContent;
      }
    }
    
    // If no HTML file is found, return a default message
    return '<div class="p-4 text-center">No HTML content found in the code</div>';
  }, []);

  // Extract JavaScript content from the code
  const extractJavaScriptFromCode = useCallback((code: string): string => {
    // Look for script.js file
    if (code.includes('// FILE:')) {
      const jsFileMatch = code.match(/\/\/\s*FILE:\s*script\.js\s*\n([\s\S]*?)(?=\/\/\s*FILE:|$)/i);
      if (jsFileMatch) {
        return jsFileMatch[1].trim();
      }
      
      // If script.js not found, look for any .js file
      const anyJsMatch = code.match(/\/\/\s*FILE:\s*([^\n]+\.js)\s*\n([\s\S]*?)(?=\/\/\s*FILE:|$)/i);
      if (anyJsMatch) {
        return anyJsMatch[2].trim();
      }
    }
    
    return '';
  }, []);

  // Extract CSS content from the code
  const extractCssFromCode = useCallback((code: string): string => {
    // Look for styles.css file
    if (code.includes('// FILE:')) {
      const cssFileMatch = code.match(/\/\/\s*FILE:\s*styles\.css\s*\n([\s\S]*?)(?=\/\/\s*FILE:|$)/i);
      if (cssFileMatch) {
        return cssFileMatch[1].trim();
      }
      
      // If styles.css not found, look for any .css file
      const anyCssMatch = code.match(/\/\/\s*FILE:\s*([^\n]+\.css)\s*\n([\s\S]*?)(?=\/\/\s*FILE:|$)/i);
      if (anyCssMatch) {
        return anyCssMatch[2].trim();
      }
    }
    
    return '';
  }, []);

  // Function to create an iframe with the extracted HTML, JavaScript, and CSS
  const createIframeContent = useCallback((code: string): string => {
    // Extract HTML from the code
    const htmlContent = extractHtmlFromCode(code);
    
    // Determine if we should use a fallback template
    const shouldUseFallback = htmlContent.includes('No HTML content found');
    
    // If we couldn't extract HTML, use a fallback based on keywords
    let finalHtml = htmlContent;
    
    if (shouldUseFallback) {
      // Analyze the code to determine what kind of component it is
      const isLoginComponent = code.toLowerCase().includes('login') || code.toLowerCase().includes('sign in');
      const isFormComponent = code.toLowerCase().includes('form') || code.toLowerCase().includes('input');
      const isListComponent = code.toLowerCase().includes('list') || code.toLowerCase().includes('items');
      const isDashboardComponent = code.toLowerCase().includes('dashboard') || code.toLowerCase().includes('analytics');
      
      if (isLoginComponent) {
        finalHtml = `
          <div class="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
            <h2 class="text-2xl font-bold text-center text-gray-800 mb-6">Login</h2>
            <div class="space-y-4">
              <div>
                <label class="block text-gray-700 text-sm font-bold mb-2">Email</label>
                <input type="email" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Enter your email">
              </div>
              <div>
                <label class="block text-gray-700 text-sm font-bold mb-2">Password</label>
                <input type="password" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Enter your password">
              </div>
              <button class="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50">Sign In</button>
              <div class="text-center mt-4">
                <a href="#" class="text-sm text-blue-500 hover:underline">Forgot password?</a>
              </div>
            </div>
          </div>
        `;
      } else if (isFormComponent) {
        finalHtml = `
          <div class="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
            <h2 class="text-2xl font-bold text-center text-gray-800 mb-6">Contact Form</h2>
            <div class="space-y-4">
              <div>
                <label class="block text-gray-700 text-sm font-bold mb-2">Name</label>
                <input type="text" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Enter your name">
              </div>
              <div>
                <label class="block text-gray-700 text-sm font-bold mb-2">Email</label>
                <input type="email" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Enter your email">
              </div>
              <div>
                <label class="block text-gray-700 text-sm font-bold mb-2">Message</label>
                <textarea class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" rows="4" placeholder="Enter your message"></textarea>
              </div>
              <button class="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50">Submit</button>
            </div>
          </div>
        `;
      } else if (isListComponent) {
        finalHtml = `
          <div class="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
            <h2 class="text-2xl font-bold text-center text-gray-800 mb-6">Item List</h2>
            <ul class="divide-y divide-gray-200">
              <li class="py-4 flex">
                <div class="ml-3">
                  <p class="text-sm font-medium text-gray-900">Item 1</p>
                  <p class="text-sm text-gray-500">Description for item 1</p>
                </div>
              </li>
              <li class="py-4 flex">
                <div class="ml-3">
                  <p class="text-sm font-medium text-gray-900">Item 2</p>
                  <p class="text-sm text-gray-500">Description for item 2</p>
                </div>
              </li>
              <li class="py-4 flex">
                <div class="ml-3">
                  <p class="text-sm font-medium text-gray-900">Item 3</p>
                  <p class="text-sm text-gray-500">Description for item 3</p>
                </div>
              </li>
            </ul>
          </div>
        `;
      } else if (isDashboardComponent) {
        finalHtml = `
          <div class="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md">
            <h2 class="text-2xl font-bold text-center text-gray-800 mb-6">Dashboard</h2>
            <div class="grid grid-cols-2 gap-4 mb-6">
              <div class="bg-white p-4 rounded-lg shadow">
                <p class="text-sm text-gray-500">Total Users</p>
                <p class="text-2xl font-bold">1,234</p>
                <p class="text-sm text-green-500">+5.3%</p>
              </div>
              <div class="bg-white p-4 rounded-lg shadow">
                <p class="text-sm text-gray-500">Revenue</p>
                <p class="text-2xl font-bold">$12,345</p>
                <p class="text-sm text-red-500">-2.1%</p>
              </div>
              <div class="bg-white p-4 rounded-lg shadow">
                <p class="text-sm text-gray-500">Conversion Rate</p>
                <p class="text-2xl font-bold">12.3%</p>
                <p class="text-sm text-green-500">+1.2%</p>
              </div>
              <div class="bg-white p-4 rounded-lg shadow">
                <p class="text-sm text-gray-500">Active Sessions</p>
                <p class="text-2xl font-bold">432</p>
                <p class="text-sm text-green-500">+8.7%</p>
              </div>
            </div>
          </div>
        `;
      } else {
        // Default component preview
        finalHtml = `
          <div class="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
            <h2 class="text-2xl font-bold text-center text-gray-800 mb-6">Vanilla JavaScript App</h2>
            <div class="text-center">
              <p class="mb-4">Count: 0</p>
              <div class="flex justify-center space-x-4">
                <button class="bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600">Decrease</button>
                <button class="bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600">Increase</button>
              </div>
            </div>
          </div>
        `;
      }
    }
    
    return finalHtml;
  }, [extractHtmlFromCode]);

  // Create the iframe HTML content with Tailwind CSS and the extracted JavaScript and CSS
  const createIframeHTML = useCallback((content: string, code: string): string => {
    // Extract Tailwind CSS classes from the code to ensure they're available in the preview
    const tailwindClasses = content.match(/class=["']([^"']*?)["']/g) || [];
    const extractedClasses = tailwindClasses.map(match => {
      const classMatch = match.match(/class=["']([^"']*?)["']/);
      return classMatch ? classMatch[1] : '';
    }).join(' ');
    
    // Extract JavaScript and CSS from the code
    const jsContent = extractJavaScriptFromCode(code);
    const cssContent = extractCssFromCode(code);
    
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
        <script src="https://cdn.tailwindcss.com"></script>
        <style>
          body { 
            font-family: 'Inter', sans-serif; 
            margin: 0; 
            padding: 0; 
            background-color: #f8fafc; 
            color: #1e293b;
          }
          .preview-container { 
            padding: 1rem; 
            min-height: 100vh;
          }
          /* Add a hidden div with all extracted Tailwind classes to ensure they're compiled */
          .tailwind-classes { display: none; }
          /* Common utility classes */
          .btn, .button { display: inline-block; padding: 0.5rem 1rem; border-radius: 0.25rem; }
          .btn-primary, .button-primary { background-color: #3b82f6; color: white; }
          .card { background: white; border-radius: 0.5rem; box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06); }
          
          /* Custom CSS from the generated code */
          ${cssContent}
        </style>
        <script>
          // Script to handle link clicks and prevent them from loading in the same iframe
          document.addEventListener('DOMContentLoaded', function() {
            // Handle all link clicks
            document.addEventListener('click', function(e) {
              const target = e.target.closest('a');
              if (target && target.href) {
                e.preventDefault();
                
                // Create a custom event for handling navigation
                const navEvent = new CustomEvent('previewNavigation', {
                  detail: {
                    href: target.href,
                    target: target.target || '_self'
                  }
                });
                
                // Dispatch the event
                window.dispatchEvent(navEvent);
                
                // Show a message that navigation would occur in a real app
                const navMessage = document.createElement('div');
                navMessage.style.position = 'fixed';
                navMessage.style.top = '10px';
                navMessage.style.left = '50%';
                navMessage.style.transform = 'translateX(-50%)';
                navMessage.style.backgroundColor = '#4f46e5';
                navMessage.style.color = 'white';
                navMessage.style.padding = '8px 16px';
                navMessage.style.borderRadius = '4px';
                navMessage.style.zIndex = '9999';
                navMessage.style.boxShadow = '0 2px 10px rgba(0,0,0,0.2)';
                navMessage.textContent = 'Navigation: ' + target.href;
                document.body.appendChild(navMessage);
                
                setTimeout(() => {
                  navMessage.style.opacity = '0';
                  navMessage.style.transition = 'opacity 0.5s ease';
                  setTimeout(() => {
                    document.body.removeChild(navMessage);
                  }, 500);
                }, 3000);
                
                return false;
              }
            });
            
            // Handle form submissions
            document.addEventListener('submit', function(e) {
              e.preventDefault();
              
              // Show a message that form submission would occur in a real app
              const formMessage = document.createElement('div');
              formMessage.style.position = 'fixed';
              formMessage.style.top = '10px';
              formMessage.style.left = '50%';
              formMessage.style.transform = 'translateX(-50%)';
              formMessage.style.backgroundColor = '#4f46e5';
              formMessage.style.color = 'white';
              formMessage.style.padding = '8px 16px';
              formMessage.style.borderRadius = '4px';
              formMessage.style.zIndex = '9999';
              formMessage.style.boxShadow = '0 2px 10px rgba(0,0,0,0.2)';
              formMessage.textContent = 'Form submitted';
              document.body.appendChild(formMessage);
              
              setTimeout(() => {
                formMessage.style.opacity = '0';
                formMessage.style.transition = 'opacity 0.5s ease';
                setTimeout(() => {
                  document.body.removeChild(formMessage);
                }, 500);
              }, 3000);
              
              return false;
            });
          });
        </script>
      </head>
      <body>
        <div class="preview-container">
          ${content}
        </div>
        <!-- Hidden div with all extracted classes to ensure Tailwind processes them -->
        <div class="tailwind-classes ${extractedClasses}"></div>
        
        <!-- JavaScript from the generated code -->
        <script>
          document.addEventListener('DOMContentLoaded', function() {
            ${jsContent}
          });
        </script>
      </body>
      </html>
    `;
  }, [extractJavaScriptFromCode, extractCssFromCode]);

  // Use useMemo to optimize rendering performance
  const previewContent = useMemo(() => {
    console.log("Rendering preview with code:", previewCode.substring(0, 50) + "...");
    
    if (!previewCode) {
      return (
        <Typography variant="body2" color="text.secondary">
          Enter a prompt to generate vanilla JavaScript code
        </Typography>
      );
    }

    // Create an iframe to display the preview
    const htmlContent = createIframeContent(previewCode);
    const htmlDocument = createIframeHTML(htmlContent, previewCode);
    
    return (
      <Box sx={{ width: '100%', height: '100%', overflow: 'auto' }}>
        <iframe
          srcDoc={htmlDocument}
          style={{ width: '100%', height: '100%', border: 'none' }}
          title="Vanilla JavaScript Preview"
          sandbox="allow-scripts"
          onLoad={(e) => {
            // Add event listener to handle custom navigation events from the iframe
            const iframe = e.target as HTMLIFrameElement;
            if (iframe.contentWindow) {
              iframe.contentWindow.addEventListener('error', (event) => {
                console.error('Iframe error:', event);
              });
            }
          }}
        />
      </Box>
    );
  }, [previewCode, localRefreshKey, createIframeContent, createIframeHTML]);

  // Handle view mode change
  const handleViewModeChange = (
    _event: React.MouseEvent<HTMLElement>,
    newViewMode: ViewMode | null,
  ) => {
    if (newViewMode !== null) {
      setViewMode(newViewMode);
    }
  };

  return (
    <Paper sx={{ height: '100%', p: 2, display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">Preview</Typography>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <ToggleButtonGroup
            value={viewMode}
            exclusive
            onChange={handleViewModeChange}
            aria-label="view mode"
            size="small"
            sx={{ mr: 1 }}
          >
            <ToggleButton value="desktop" aria-label="desktop view">
              <LaptopIcon fontSize="small" />
            </ToggleButton>
            <ToggleButton value="mobile" aria-label="mobile view">
              <SmartphoneIcon fontSize="small" />
            </ToggleButton>
          </ToggleButtonGroup>
          <IconButton onClick={handleRefresh} size="small" title="Refresh preview">
            <RefreshIcon />
          </IconButton>
        </Box>
      </Box>
      <Box
        sx={{
          flexGrow: 1,
          bgcolor: 'background.paper',
          borderRadius: 1,
          p: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden'
        }}
      >
        <Box
          sx={{
            width: viewMode === 'mobile' ? 375 : '100%',
            height: viewMode === 'mobile' ? 667 : '100%',
            maxHeight: '100%',
            border: viewMode === 'mobile' ? '12px solid #333' : 'none',
            borderRadius: viewMode === 'mobile' ? '24px' : 0,
            overflow: 'hidden',
            position: 'relative',
            transition: 'all 0.3s ease',
            boxShadow: viewMode === 'mobile' ? '0 4px 20px rgba(0,0,0,0.15)' : 'none'
          }}
        >
          {previewContent}
        </Box>
      </Box>
    </Paper>
  );
};

export default PreviewPane; 