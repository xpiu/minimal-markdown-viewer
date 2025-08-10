# Minimal Markdown Viewer for local use in the browser

Browse and read Markdown files locally in the browser. Useful mini-tool to add to any project folder with multiple Markdown files. Only loads Markdown (.md) files. Uses the marked.js (CDN) and Node.js for Markdown parsing.

![Minimal Markdown Viewer Interface screenshot 1](/markdown-viewer/screenshot-1.png)

![Minimal Markdown Viewer Interface screenshot 2](/markdown-viewer/screenshot-2.png)

## Benefits

- **💧 Drop-in simplicity**: Just drop the markdown-viewer folder into any of your project folders.
- **🌐 Always available**: Lives with your project, accessible to any team member with browser access
- **🎯 Project-focused**: Designed for browsing documentation within existing codebases, not standalone editing
- **🪶 Lightweight alternative**: Simpler than heavy documentation generators or standalone markdown editors
- **🤖 Accomodating AI's love for Markdown**
- **📜 MIT licence**

## Features

- **🔄 Dynamic File Discovery**: Automatically scans and discovers all Markdown files in the repository
- **🏍️ Easy to start in a local folder**: Run npm start and visit http://localhost:3000 to begin browsing your Markdown Files.
- **⚡ Real-time Updates**: Detects file additions, deletions, and modifications every 3 seconds
- **📁 Smart File Tree**: Organized sidebar with folder structure and enhanced display names
- **💾 File Metadata**: Shows file sizes, modification dates, and hover tooltips
- **🎨 Professional, minimal look**: Minimal look. Dark mode toggle available.
- **⚙️ Node.js server**: Built-in Express server with intelligent file system scanning

## How to Use

### Use local Node.js server (Recommended)
1. **Install dependencies**: 
   ```bash
   cd markdown-viewer
   npm install
   ```
2. **Start the server**:
   ```bash
   npm start
   # Server starts on http://localhost:3000
   ```
3. **Open in browser**: Go to `http://localhost:3000` in your web browser
4. **Automatic discovery**: The app automatically finds and displays all `.md` files
5. **Real-time updates**: File tree updates automatically when you add/remove/modify files


### Note

 * You may safely remove the README.md, screenshot.png and GET_STARTED.md files, they're demo files.

## File Discovery

The viewer **automatically discovers all Markdown files** in your repository, including:

- **Root directory files**: All `.md` files in the project root
- **Subdirectory files**: Recursively scans all folders and subfolders
- **Dynamic detection**: New files appear immediately, deleted files are removed from the tree
- **Smart exclusions**: Ignores system directories (`.git`, `node_modules`, `.archive`, etc.)
- **Enhanced display**: Better file names and folder organization

**No manual configuration needed** - just add `.md` files anywhere in your repository and they'll appear automatically!

## Technical Details

### Server-Side (Node.js)
- **Express.js server** with file system scanning API
- **Dynamic file discovery** with recursive directory traversal
- **Real-time change detection** comparing file lists and modification times
- **CORS enabled** for cross-origin requests
- **Smart file filtering** excludes system directories

### Client-Side
- **Dependencies**: Uses marked.js (CDN) for Markdown parsing
- **Enhanced UI**: Custom CSS with Google Fonts (Crimson Text, Inter)
- **Modern JavaScript**: ES6+ classes, async/await, fetch API
- **Intelligent polling**: 3-second intervals with smart change detection
- **Visual feedback**: Animated notifications and file metadata tooltips
- **Graceful fallback**: Continues working when server is temporarily unavailable

## Browser Compatibility

Works in all modern browsers that support:
- ES6 classes and async/await
- Fetch API
- CSS Grid

## Development

No build process required. Edit the files directly:
- `index.html` - Main structure
- `style.css` - Styling and layout
- `script.js` - Application logic

The app will automatically reflect changes when you refresh the browser.

## Contributing

**Contributions welcome!** 🤝 

I want this micro-app to be less complex. It works, but I appreciate contributions that make the app simpler without losing its flexibility and versatility. Design contributions are welcome as well.

There's room for improvement:
- Bug fixes and performance optimizations
- Better file tree organization
- Enhanced markdown rendering features
- Cross-browser compatibility improvements

Feel free to open issues or submit pull requests. Let's keep it simple and useful for everyone.

## Safety & Security

This Markdown Viewer is designed specifically for **local use only** and is safe for viewing your own documentation:

- **🔒 Local-only**: No external network connections (except CDN for marked.js)
- **📂 Your files only**: Only accesses markdown files you own in your project directories
- **🚫 No data collection**: No telemetry, analytics, or data transmission
- **👤 Single user**: Runs locally on localhost, not exposed to external networks
- **📝 Read-only intent**: Designed for viewing documentation, not modifying files

**Note**: This tool is not hardened for production or multi-user environments. It's intended as a simple local documentation browser for developers working on their own projects.

## Contact

 * [xpiu](https://github.com/xpiu)

## License

MIT License, 

### Licence dependencies

- **marked.js**: MIT License - 2018+, MarkedJS (https://github.com/markedjs/marked)
- **Node.js**: MIT License - Node.js contributors (https://github.com/nodejs/node)
- **express**: MIT License - (c) TJ Holowaychuk
- **cors**: MIT License - TJ Holowaychuk
- **path**: MIT License - Joyent, Inc.
- **nodemon**: MIT License - Remy Sharp