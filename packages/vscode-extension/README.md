# ktn-bridge VS Code Extension

VS Code extension for ktn-bridge - kintone development with Web standards.

## Features

- **Auto-completion**: Intelligent code completion for ktn-bridge APIs and events
- **Hover information**: Detailed documentation on hover for Web standards → kintone mappings
- **Code snippets**: Pre-built code snippets for common kintone development patterns
- **Pattern library**: Interactive pattern library with insertable code examples
- **Code preview**: Live preview of transformed kintone code
- **Diagnostics**: Real-time error checking and suggestions
- **Commands**: Integrated commands for project management and development

## Commands

- `ktn-bridge.init`: Initialize a new ktn-bridge project
- `ktn-bridge.dev`: Start the development server
- `ktn-bridge.build`: Build the project
- `ktn-bridge.preview`: Preview transformed code
- `ktn-bridge.generateTypes`: Generate TypeScript types
- `ktn-bridge.generateDocs`: Generate documentation
- `ktn-bridge.showPatterns`: Show pattern library

## Keyboard Shortcuts

- `Ctrl+Shift+D` (or `Cmd+Shift+D` on Mac): Start development server
- `Ctrl+Shift+B` (or `Cmd+Shift+B` on Mac): Build project
- `Ctrl+Shift+P` (or `Cmd+Shift+P` on Mac): Preview transformed code

## Configuration

Configure the extension through VS Code settings:

```json
{
  "ktn-bridge.autoPreview": true,
  "ktn-bridge.showInlineErrors": true,
  "ktn-bridge.devServerPort": 3355,
  "ktn-bridge.enableDebugMode": false,
  "ktn-bridge.patternLibrary.enabled": true
}
```

## Usage

1. Install the extension
2. Open or create a ktn-bridge project
3. Use the command palette (`Ctrl+Shift+P`) to access ktn-bridge commands
4. Start typing to see auto-completion suggestions
5. Hover over code to see transformation information

## Code Snippets

The extension includes numerous code snippets for common kintone development patterns:

- `ktn-record-list`: Record list initialization
- `ktn-field-change`: Field change event handler
- `ktn-fetch-records`: Fetch records from API
- `ktn-auto-save`: Auto-save functionality
- `ktn-bulk-operations`: Bulk operations pattern
- And many more...

## Pattern Library

Access the interactive pattern library through the command palette or by clicking the status bar item. The pattern library includes:

- **Beginner patterns**: Basic initialization and event handling
- **Intermediate patterns**: Auto-save, validation, and data fetching
- **Advanced patterns**: Bulk operations, custom events, and complex workflows

## License

MIT License