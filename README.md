# ChatGPT Email Guard

A browser extension that alerts on emails in ChatGPT prompts and keeps a local history.

## Features

- Detects email addresses in ChatGPT prompts
- Provides alerts when emails are found
- Maintains local history of detected emails
- Works on chatgpt.com

## Installation

### From Source

1. Clone the repository
2. Install dependencies: `npm install`
3. Build the extension: `npm run build`
4. Load the extension from the `dist/` directory

### Chrome/Edge

1. Open `chrome://extensions/`
2. Enable "Developer mode"
3. Click "Load unpacked" and select the `dist/` folder

### Firefox

1. Open `about:debugging`
2. Click "This Firefox"
3. Click "Load Temporary Add-on"
4. Select any file in the `dist/` folder

## Development

- `npm run build` - Build for production

## Permissions

- `storage` - Store email history locally
- `https://chatgpt.com/*` - Access ChatGPT pages

## Version

Current version: 0.0.36

## Author

russ.developer@gmail.com (Ruslan Balabanov)
