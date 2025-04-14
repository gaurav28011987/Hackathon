# Vanilla JavaScript Code Generator with OpenAI Integration

This application allows you to generate vanilla JavaScript web projects using OpenAI's API. Simply enter a prompt describing the web application you want to create, and the AI will generate the complete code for you. You can also modify existing code by describing the changes you want to make.

## Features

- Generate complete vanilla JavaScript web projects using OpenAI's GPT-4o model
- Create projects with HTML, CSS, and JavaScript without any build steps
- Edit generated code in real-time with syntax highlighting
- Preview the UI of your web applications directly in the browser
- Modify existing projects by describing the changes
- Tailwind CSS styling for modern, responsive designs
- Fallback to template-based generation when no API key is provided
- Dark/Light mode toggle for comfortable coding experience
- Multi-file support with tabbed interface for easy navigation
- Download all generated files as a ZIP archive
- Copy code to clipboard with a single click

## Technology Stack

- React 18 for the UI framework
- TypeScript for type safety
- Monaco Editor for code editing (same as VS Code)
- Material UI components for the interface
- OpenAI API for code generation
- JSZip for file download functionality
- Vite for fast development and building

## Setup

1. Clone this repository
2. Install dependencies with `npm install`
3. Obtain an OpenAI API key from [OpenAI's platform](https://platform.openai.com/)
4. Create a `.env` file based on `.env.example` and add your API key (or enter it in the UI)
5. Run the development server with `npm run dev`

## How It Works

1. **Enter Your API Key**: Provide your OpenAI API key to enable AI-powered code generation. The application uses GPT-4o for optimal results.

2. **Describe Your Project**: Enter a prompt describing the web application you want to create. Be as specific as possible about functionality, design, and features.

3. **Generate Code**: The AI will create a complete vanilla JavaScript project with HTML, CSS, and JavaScript files that work directly in browsers without any build steps.

4. **Edit & Preview**: View and edit the generated code in the built-in Monaco editor. Navigate between multiple files using the tabbed interface.

5. **Modify Your Project**: Need changes? Describe the modifications you want, and the AI will update your code while maintaining the project structure.

6. **Download & Use**: Download all files as a ZIP archive with a single click. The generated code is ready to use without any additional configuration.

## Project Structure

The generated projects typically include:

- `index.html`: Main entry point with Tailwind CSS integration via CDN
- `styles.css`: Custom CSS styles beyond Tailwind classes
- `script.js`: Main JavaScript functionality
- Additional JS files for specific features
- `README.md`: Documentation for the generated project

## Development

### Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default tseslint.config({
  extends: [
    // Remove ...tseslint.configs.recommended and replace with this
    ...tseslint.configs.recommendedTypeChecked,
    // Alternatively, use this for stricter rules
    ...tseslint.configs.strictTypeChecked,
    // Optionally, add this for stylistic rules
    ...tseslint.configs.stylisticTypeChecked,
  ],
  languageOptions: {
    // other options...
    parserOptions: {
      project: ['./tsconfig.node.json', './tsconfig.app.json'],
      tsconfigRootDir: import.meta.dirname,
    },
  },
})
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default tseslint.config({
  plugins: {
    // Add the react-x and react-dom plugins
    'react-x': reactX,
    'react-dom': reactDom,
  },
  rules: {
    // other rules...
    // Enable its recommended typescript rules
    ...reactX.configs['recommended-typescript'].rules,
    ...reactDom.configs.recommended.rules,
  },
})
```

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
