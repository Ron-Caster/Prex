# Prex - PowerPoint Alternative

A modern, infinite-canvas presentation tool built with React, Vite, and UnoCSS.

## Features
- **Infinite Grid**: Navigate horizontally and vertically.
- **Drag & Drop**: Add images and videos easily.
- **Deep Manipulation**: Crop, Trim, Zoom, and Layer elements.
- **Rich Text**: Full text editing and styling capabilities.
- **Presentation Mode**: Distraction-free fullscreen presenting.
- **Auto-Save**: Your work is automatically saved to your browser.

## Getting Started

1.  **Install Dependencies**:
    ```bash
    npm install
    ```

2.  **Run Development Server**:
    ```bash
    npm run dev
    ```

3.  **Build for Production**:
    ```bash
    npm run build
    ```

## Deployment (GitHub Pages)

This project is configured to be easily deployed to GitHub Pages.

1.  **Build the Project**:
    ```bash
    npm run build
    ```

2.  **Deploy**:
    - Push the contents of the `dist` folder to a `gh-pages` branch.
    - OR use a deploy script/action.

    **Note**: The `base: './'` in `vite.config.js` ensures that assets load correctly regardless of the repository name.
