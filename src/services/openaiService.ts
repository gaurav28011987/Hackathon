import OpenAI from 'openai';

// Initialize the OpenAI client
// Note: You should use environment variables for the API key in a production environment
let openai: OpenAI | null = null;

export const initializeOpenAI = (apiKey: string) => {
  openai = new OpenAI({
    apiKey,
    dangerouslyAllowBrowser: true // This is needed for client-side usage
  });
  return openai;
};

export const getOpenAIInstance = () => {
  if (!openai) {
    throw new Error('OpenAI client not initialized. Call initializeOpenAI first.');
  }
  return openai;
};

/**
 * Resets the OpenAI client instance
 * This ensures that a new chat session starts from scratch
 */
export const resetOpenAI = () => {
  openai = null;
};

export const generateReactNativeCode = async (prompt: string): Promise<string> => {
  if (!openai) {
    throw new Error('OpenAI client not initialized. Call initializeOpenAI first.');
  }

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are a web development expert specializing in creating vanilla JavaScript, HTML, and CSS projects that run directly in browsers without build steps. Generate a complete web project based on the user's prompt.

Your response MUST follow these rules:
1. Create a complete, working project using only vanilla JavaScript, HTML, and CSS
2. Do NOT use any frameworks like React, Vue, Angular, or Next.js
3. Use Tailwind CSS for styling (via CDN link)
4. Format your response with clear file markers using the format: // FILE: filename.ext
5. Add realistic data and functionality
6. Add appropriate comments explaining the code
7. Ensure the code works directly in browsers without any build steps

CRITICAL REQUIREMENTS FOR BROWSER COMPATIBILITY:
1. ALWAYS include an index.html file as the main entry point
2. Include all JavaScript in separate .js files
3. Include all CSS in separate .css files (except Tailwind)
4. Use standard Tailwind CSS classes for styling
5. Use proper HTML5 semantic elements
6. Ensure all JavaScript is properly scoped and organized
7. Use ES6+ features but ensure browser compatibility
8. Include the Tailwind CSS CDN in the HTML file

File structure should include:
- index.html (main entry point)
- styles.css (custom styles)
- script.js (main JavaScript file)
- Additional JS files for specific functionality
- Any necessary assets (in an assets/ directory)

Each file should be complete and properly formatted with the file marker.`
        },
        {
          role: "user",
          content: `Create a complete vanilla JavaScript web project for: ${prompt}`
        }
      ],
      temperature: 0.7,
      max_tokens: 4000
    });

    return completion.choices[0]?.message.content || 'Error: No response from OpenAI';
  } catch (error) {
    console.error('Error generating code with OpenAI:', error);
    throw new Error(`Failed to generate code: ${error instanceof Error ? error.message : String(error)}`);
  }
};

export const modifyReactNativeCode = async (existingCode: string, modificationPrompt: string): Promise<string> => {
  if (!openai) {
    throw new Error('OpenAI client not initialized. Call initializeOpenAI first.');
  }

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are a web development expert specializing in vanilla JavaScript, HTML, and CSS. Modify the provided web project code according to the user's request.

Your response MUST follow these rules:
1. Preserve the existing file structure with // FILE: markers
2. Modify the files as requested by the user
3. You can add new files if needed using the // FILE: marker format
4. Make sure all connections between files remain working
5. Use only vanilla JavaScript, HTML, and CSS with Tailwind (via CDN)
6. Return the complete modified project with all files

CRITICAL REQUIREMENTS FOR BROWSER COMPATIBILITY:
1. ALWAYS include an index.html file as the main entry point
2. Include all JavaScript in separate .js files
3. Include all CSS in separate .css files (except Tailwind)
4. Use standard Tailwind CSS classes for styling
5. Use proper HTML5 semantic elements
6. Ensure all JavaScript is properly scoped and organized
7. Use ES6+ features but ensure browser compatibility
8. Include the Tailwind CSS CDN in the HTML file

File structure should be maintained as:
- index.html (main entry point)
- styles.css (custom styles)
- script.js (main JavaScript file)
- Additional JS files for specific functionality
- Any necessary assets (in an assets/ directory)

Each file should be complete and properly formatted with the file marker.`
        },
        {
          role: "user",
          content: `Here is the existing vanilla JavaScript project code:\n\n${existingCode}\n\nModify this project to: ${modificationPrompt}`
        }
      ],
      temperature: 0.7,
      max_tokens: 4000
    });

    return completion.choices[0]?.message.content || 'Error: No response from OpenAI';
  } catch (error) {
    console.error('Error modifying code with OpenAI:', error);
    throw new Error(`Failed to modify code: ${error instanceof Error ? error.message : String(error)}`);
  }
};
