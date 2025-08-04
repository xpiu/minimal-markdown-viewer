const express = require('express');
const path = require('path');
const fs = require('fs').promises;
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

// Serve static files from parent directory (project root)
app.use(express.static(path.join(__dirname, '..')));

// API endpoint to discover markdown files
app.get('/api/discover-markdown', async (req, res) => {
    try {
        const projectRoot = path.join(__dirname, '..');
        const files = await discoverMarkdownFiles(projectRoot);
        res.json(files);
    } catch (error) {
        console.error('Error discovering markdown files:', error);
        res.status(500).json({ error: 'Failed to discover markdown files' });
    }
});

async function discoverMarkdownFiles(rootPath) {
    const files = [];
    const excludeDirs = ['node_modules']; // Keep specific exclusions for known problematic directories
    
    async function scanDirectory(dirPath, relativePath = '') {
        try {
            const entries = await fs.readdir(dirPath, { withFileTypes: true });
            
            for (const entry of entries) {
                const fullPath = path.join(dirPath, entry.name);
                const relativeFilePath = path.join(relativePath, entry.name);
                
                if (entry.isDirectory()) {
                    // Skip directories that start with a dot or are in exclude list
                    if (!entry.name.startsWith('.') && !excludeDirs.includes(entry.name)) {
                        await scanDirectory(fullPath, relativeFilePath);
                    }
                } else if (entry.isFile() && entry.name.endsWith('.md')) {
                    // Get file stats for additional metadata
                    const stats = await fs.stat(fullPath);
                    
                    files.push({
                        path: '/' + relativeFilePath.replace(/\\/g, '/'),
                        name: entry.name,
                        folder: relativePath === '' ? 'root' : relativePath.replace(/\\/g, '/'),
                        folderPath: relativePath.replace(/\\/g, '/'),
                        size: stats.size,
                        modified: stats.mtime.toISOString(),
                        displayName: entry.name.replace(/\.md$/, '')
                    });
                }
            }
        } catch (error) {
            console.warn(`Failed to scan directory ${dirPath}:`, error.message);
        }
    }
    
    await scanDirectory(rootPath);
    return files.sort((a, b) => {
        // Sort by folder first, then by name
        if (a.folder !== b.folder) {
            if (a.folder === 'root') return -1;
            if (b.folder === 'root') return 1;
            return a.folder.localeCompare(b.folder);
        }
        return a.name.localeCompare(b.name);
    });
}


// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Fallback route to serve index.html
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Markdown Viewer server running on http://localhost:${PORT}`);
    console.log(`API endpoint: http://localhost:${PORT}/api/discover-markdown`);
}); 