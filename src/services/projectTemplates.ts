/**
 * Project templates for vanilla JavaScript, HTML, and CSS code generation
 * This file contains template functions for generating different types of web projects
 */

// Generate HTML file
export function generateHtmlFile(projectName: string): string {
  return `// FILE: index.html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${projectName}</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link rel="stylesheet" href="styles.css">
</head>
<body class="bg-gray-100 min-h-screen">
  <div id="app" class="container mx-auto px-4 py-8">
    <h1 class="text-3xl font-bold text-center mb-8">${projectName}</h1>
    <div id="content" class="bg-white rounded-lg shadow-md p-6">
      <!-- Content will be loaded here -->
      <p class="text-gray-700">Loading content...</p>
    </div>
  </div>
  <script src="script.js"></script>
</body>
</html>`;
}

// Generate JavaScript file
export function generateJavaScriptFile(projectName: string): string {
  return `// FILE: script.js
// Main JavaScript file for ${projectName}

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', () => {
  // Get references to DOM elements
  const contentElement = document.getElementById('content');
  
  // Initialize the application
  initApp();
  
  /**
   * Initialize the application
   */
  function initApp() {
    // Display welcome message
    renderWelcomeMessage();
    
    // Set up event listeners
    setupEventListeners();
  }
  
  /**
   * Render welcome message in the content area
   */
  function renderWelcomeMessage() {
    contentElement.innerHTML = \`
      <div class="text-center">
        <h2 class="text-2xl font-bold mb-4">Welcome to ${projectName}</h2>
        <p class="text-gray-700 mb-6">This is a vanilla JavaScript application with Tailwind CSS.</p>
        <button id="actionButton" class="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded">
          Click Me
        </button>
        <div id="counter" class="mt-4 text-lg font-semibold">Count: 0</div>
      </div>
    \`;
  }
  
  /**
   * Set up event listeners for interactive elements
   */
  function setupEventListeners() {
    // Add event listener after the button is added to the DOM
    setTimeout(() => {
      const actionButton = document.getElementById('actionButton');
      let count = 0;
      
      if (actionButton) {
        actionButton.addEventListener('click', () => {
          count++;
          const counterElement = document.getElementById('counter');
          if (counterElement) {
            counterElement.textContent = \`Count: \${count}\`;
          }
        });
      }
    }, 0);
  }
});`;
}

// Generate CSS file
export function generateCssFile(): string {
  return `// FILE: styles.css
/* Custom styles for the application */

:root {
  --primary-color: #4f46e5;
  --secondary-color: #6366f1;
  --text-color: #333333;
  --background-color: #f9fafb;
}

body {
  font-family: 'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  color: var(--text-color);
  line-height: 1.6;
}

/* Animations */
.fade-in {
  animation: fadeIn 0.5s ease-in-out;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

/* Custom button styles */
.custom-button {
  transition: all 0.3s ease;
}

.custom-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}
`;
}

// Generate README file
export function generateReadmeFile(projectName: string): string {
  return `// FILE: README.md
# ${projectName}

A vanilla JavaScript web application with Tailwind CSS styling.

## Features

- Modern JavaScript (ES6+) syntax
- Tailwind CSS for styling
- Responsive design
- No build step required

## Getting Started

Simply open the index.html file in your browser to run the application.

## Project Structure

- index.html - Main entry point
- script.js - JavaScript functionality
- styles.css - Custom CSS styles
`;
}

// Generate a complete project with all files
export function generateCompleteProject(projectName: string): Record<string, string> {
  return {
    'index.html': generateHtmlFile(projectName),
    'script.js': generateJavaScriptFile(projectName),
    'styles.css': generateCssFile(),
    'README.md': generateReadmeFile(projectName)
  };
}
