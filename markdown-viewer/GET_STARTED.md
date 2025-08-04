# Get Started with Minimal Markdown Viewer

Welcome! This guide will get you up and running in a minute.

## What is this?

A simple, lightweight tool that turns any folder with Markdown files into a browsable documentation site. Perfect for:
- 📚 Project documentation folders
- 📝 Personal notes collections  
- 🏢 Business document repositories
- 📁 Any folder with `.md` files

## Quick Start (3 steps!)

### Step 1: Get Node.js
If you don't have Node.js installed:
- Visit [nodejs.org](https://nodejs.org) and download the LTS version
- Install it (takes 2-3 minutes)

### Step 2: Set it up
Open your terminal and run these commands:

```bash
# Navigate to the markdown-viewer folder
cd markdown-viewer

# Install dependencies (one-time setup)
npm install

# Start the viewer
npm start
```

### Step 3: Open in browser
Go to `http://localhost:3000` in your web browser

**That's it!** 🎉 You should see all your `.md` files in a beautiful file tree on the right side.

## What you'll see

- **File tree sidebar**: All your Markdown files organized by folder
- **Clean reading area**: Professional, minimal design for easy reading
- **Auto-updates**: New files appear automatically (checks every 3 seconds)
- **File info**: See file sizes and modification dates on hover

## Adding it to your project

Want to add this to an existing project with lots of documentation?

1. **Copy the `markdown-viewer` folder** into your project root
2. **Run the setup** (Steps 2-3 above)
3. **Share with your team** - anyone can access the docs at `localhost:3000`

Your project structure might look like:
```
my-awesome-project/
├── README.md
├── docs/
│   ├── api.md
│   └── setup.md
├── markdown-viewer/     ← Add this folder
│   ├── index.html
│   ├── package.json
│   └── ...
└── src/
```

## Troubleshooting

**Don't have Node.js and can't install it?**
You can still use a basic Python server:
```bash
# From your project root
python3 -m http.server 8000
# Then visit: http://localhost:8000/markdown-viewer/
```
(Note: This won't auto-detect new files)

**Files not showing up?**
- Make sure they end with `.md`
- The viewer ignores system folders like `.git` and `node_modules`
- Try refreshing the browser

**Want to customize?**
- Edit `style.css` for different colors/fonts
- All files are plain HTML/CSS/JavaScript - no build process needed!

## Need help?

- Check the main [README.md](README.md) for technical details
- Open an issue on GitHub
- The tool is designed to be simple - if it's not working, something's probably misconfigured

</br>

---
