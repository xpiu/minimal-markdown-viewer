class MarkdownViewer {
    constructor() {
        this.fileTree = document.getElementById('file-tree');
        this.markdownViewer = document.getElementById('markdown-viewer');
        this.darkModeCheckbox = document.getElementById('dark-mode-checkbox');
        this.updateIndicator = document.getElementById('update-indicator');
        this.currentFile = null;
        this.fileList = [];
        this.refreshInterval = null;
        this.currentPopover = null;
        
        this.init();
    }
    
    async init() {
        await this.loadFileTree();
        this.startAutoRefresh();
        this.initDarkMode();
        this.initResizer();
    }
    
    async loadFileTree() {
        try {
            const files = await this.discoverMarkdownFiles();
            
            const hasChanges = this.detectFileChanges(files);
            if (hasChanges) {
                console.log('File changes detected, updating tree');
                this.fileList = files;
                this.renderFileTree();
                this.notifyFileChanges();
            }
        } catch (error) {
            console.error('Error loading file tree:', error);
            this.fileTree.innerHTML = `
                <div class="loading-container error">
                    <span class="loading-text">⚠️ Error loading files</span>
                </div>
            `;
        }
    }

    detectFileChanges(newFiles) {
        if (this.fileList.length === 0) {
            return true; // Initial load
        }

        // Check for additions
        const addedFiles = newFiles.filter(newFile => 
            !this.fileList.find(oldFile => oldFile.path === newFile.path)
        );
        
        // Check for removals
        const removedFiles = this.fileList.filter(oldFile => 
            !newFiles.find(newFile => newFile.path === oldFile.path)
        );

        // Check for modifications (if we have modification times)
        const modifiedFiles = newFiles.filter(newFile => {
            const oldFile = this.fileList.find(f => f.path === newFile.path);
            return oldFile && newFile.modified && oldFile.modified && 
                   new Date(newFile.modified) > new Date(oldFile.modified);
        });
        
        if (addedFiles.length > 0) {
            console.log('Added files:', addedFiles.map(f => f.path));
        }
        if (removedFiles.length > 0) {
            console.log('Removed files:', removedFiles.map(f => f.path));
        }
        if (modifiedFiles.length > 0) {
            console.log('Modified files:', modifiedFiles.map(f => f.path));
        }
        
        return addedFiles.length > 0 || removedFiles.length > 0 || modifiedFiles.length > 0;
    }

    notifyFileChanges() {
        // Show small rotating indicator near dark mode toggle
        if (this.updateIndicator) {
            this.updateIndicator.classList.add('spinning');
            
            // Hide indicator after 1.5 seconds
            setTimeout(() => {
                this.updateIndicator.classList.remove('spinning');
            }, 1500);
        }
    }
    
    async discoverMarkdownFiles() {
        try {
            // Try server-side discovery first
            const response = await fetch('/api/discover-markdown');
            if (response.ok) {
                const files = await response.json();
                console.log('Discovered files via API:', files.length);
                return files;
            } else {
                console.warn('Server-side discovery failed, falling back to client-side');
                throw new Error(`Server responded with ${response.status}`);
            }
        } catch (error) {
            console.warn('Server-side discovery failed, falling back to client-side:', error.message);
            return await this.clientSideDiscovery();
        }
    }

    async clientSideDiscovery() {
        // Fallback hardcoded file list for when server is unavailable
        console.log('Using fallback client-side discovery');
        const knownFiles = [
            // Root folder files
            { path: '/README.md', name: 'README.md', folder: 'root', displayName: 'README' },
            { path: '/sample-doc.md', name: 'sample-doc.md', folder: 'root', displayName: 'Sample Document' },
            { path: '/getting-started.md', name: 'getting-started.md', folder: 'root', displayName: 'Getting Started' },
            
            // Docs folder
            { path: '/docs/user-guide.md', name: 'user-guide.md', folder: 'docs', displayName: 'User Guide' },
            { path: '/docs/api-reference.md', name: 'api-reference.md', folder: 'docs', displayName: 'API Reference' },

            // Examples folder  
            { path: '/examples/example1.md', name: 'example1.md', folder: 'examples', displayName: 'Example 1' },
            { path: '/examples/example2.md', name: 'example2.md', folder: 'examples', displayName: 'Example 2' }
        ];
        
        return knownFiles;
    }
    
    renderFileTree() {
        const folderStructure = this.buildFolderStructure(this.fileList);
        let html = this.renderFolderStructure(folderStructure);
        
        this.fileTree.innerHTML = html;
        this.attachEventListeners();
    }

    buildFolderStructure(files) {
        const structure = { files: [], folders: {} };
        
        files.forEach(file => {
            if (file.folder === 'root') {
                structure.files.push(file);
            } else {
                const pathParts = file.folderPath.split('/').filter(Boolean);
                let current = structure;
                
                // Navigate/create the folder structure
                pathParts.forEach((folderName, index) => {
                    if (!current.folders[folderName]) {
                        current.folders[folderName] = { files: [], folders: {} };
                    }
                    current = current.folders[folderName];
                });
                
                current.files.push(file);
            }
        });
        
        return structure;
    }

    renderFolderStructure(structure, depth = 0) {
        let html = '';
        
        // Render files at current level (root files first)
        if (depth === 0) {
            structure.files.sort((a, b) => a.name.localeCompare(b.name));
            structure.files.forEach(file => {
                html += this.createFileItem(file);
            });
        }
        
        // Render folders
        const folderNames = Object.keys(structure.folders).sort();
        folderNames.forEach(folderName => {
            const folder = structure.folders[folderName];
            html += this.createFolderItem(folderName, folder, depth);
        });
        
        return html;
    }

    createFolderItem(folderName, folderData, depth = 0) {
        const indent = depth * 12;
        let html = `
            <div class="folder-group" style="margin-left: ${indent}px;">
                <div class="folder-header" data-folder="${folderName}">
                    <span class="folder-icon">📁</span>
                    <span class="folder-name">${folderName}</span>
                </div>
                <div class="folder-children">
        `;
        
        // Sort and render files in this folder
        folderData.files.sort((a, b) => a.displayName.localeCompare(b.displayName));
        folderData.files.forEach(file => {
            html += this.createFileItem(file);
        });
        
        // Render subfolders recursively
        html += this.renderFolderStructure(folderData, depth + 1);
        
        html += `
                </div>
            </div>
        `;
        
        return html;
    }
    
    createFileItem(file) {
        const isActive = this.currentFile && this.currentFile.path === file.path ? 'active' : '';
        const displayName = file.displayName || file.name;
        const fileSize = file.size ? ` (${this.formatFileSize(file.size)})` : '';
        const lastModified = file.modified ? new Date(file.modified).toLocaleDateString() : '';
        
        return `
            <div class="file-item ${isActive}" data-path="${file.path}" data-name="${file.name}" title="Last modified: ${lastModified}${fileSize}">
                <span class="file-icon">📄</span>
                <span class="file-name">${displayName}</span>
            </div>
        `;
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
    }
    
    // This method is now replaced by the new createFolderItem above
    
    attachEventListeners() {
        const fileItems = this.fileTree.querySelectorAll('.file-item');
        const folders = this.fileTree.querySelectorAll('.folder');
        
        // Make file tree focusable for keyboard navigation
        this.fileTree.setAttribute('tabindex', '0');
        
        fileItems.forEach(item => {
            item.addEventListener('click', () => {
                const path = item.dataset.path;
                const name = item.dataset.name;
                this.loadMarkdownFile(path, name);
            });
            
            // Add popover functionality
            this.addPopoverListeners(item);
        });
        
        const folderHeaders = this.fileTree.querySelectorAll('.folder-header');
        folderHeaders.forEach(folderHeader => {
            folderHeader.addEventListener('click', () => {
                const folderGroup = folderHeader.closest('.folder-group');
                folderGroup.classList.toggle('collapsed');
            });
        });
        
        // Add keyboard navigation for file tree
        this.fileTree.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
                e.preventDefault();
                const scrollStep = 30;
                if (e.key === 'ArrowUp') {
                    this.fileTree.scrollTop -= scrollStep;
                } else {
                    this.fileTree.scrollTop += scrollStep;
                }
            }
        });
        
        // Focus file tree when clicked
        this.fileTree.addEventListener('click', () => {
            this.fileTree.focus();
        });
    }
    
    addPopoverListeners(fileItem) {
        let popover = null;
        let hoverTimeout = null;
        
        fileItem.addEventListener('mouseenter', (e) => {
            // Clear any existing timeout
            if (hoverTimeout) {
                clearTimeout(hoverTimeout);
            }
            
            // Create popover after a short delay
            hoverTimeout = setTimeout(() => {
                const fileName = fileItem.dataset.name;
                if (fileName) {
                    this.showPopover(fileItem, fileName);
                }
            }, 300); // 300ms delay before showing
        });
        
        fileItem.addEventListener('mouseleave', () => {
            // Clear timeout if mouse leaves before popover shows
            if (hoverTimeout) {
                clearTimeout(hoverTimeout);
                hoverTimeout = null;
            }
            
            // Hide popover
            this.hidePopover();
        });
    }
    
    showPopover(element, fileName) {
        // Remove any existing popover
        this.hidePopover();
        
        // Extract filename and extension
        const lastDotIndex = fileName.lastIndexOf('.');
        const name = lastDotIndex > 0 ? fileName.substring(0, lastDotIndex) : fileName;
        const extension = lastDotIndex > 0 ? fileName.substring(lastDotIndex) : '';
        
        // Create popover element
        const popover = document.createElement('div');
        popover.className = 'file-popover';
        popover.innerHTML = `
            <span class="filename">${name}</span><span class="extension">${extension}</span>
        `;
        
        // Add to body
        document.body.appendChild(popover);
        
        // Position popover
        const rect = element.getBoundingClientRect();
        const popoverRect = popover.getBoundingClientRect();
        
        // Position to the right of the element, vertically centered
        let left = rect.right + 8;
        let top = rect.top + (rect.height / 2) - (popoverRect.height / 2);
        
        // Adjust if popover would go off screen
        if (left + popoverRect.width > window.innerWidth) {
            left = rect.left - popoverRect.width - 8; // Show on left side instead
        }
        
        if (top < 8) {
            top = 8;
        } else if (top + popoverRect.height > window.innerHeight - 8) {
            top = window.innerHeight - popoverRect.height - 8;
        }
        
        popover.style.left = left + 'px';
        popover.style.top = top + 'px';
        
        // Show popover with animation
        requestAnimationFrame(() => {
            popover.classList.add('visible');
        });
        
        // Store reference for cleanup
        this.currentPopover = popover;
    }
    
    hidePopover() {
        if (this.currentPopover) {
            this.currentPopover.remove();
            this.currentPopover = null;
        }
    }
    
    async loadMarkdownFile(path, name) {
        try {
            this.updateActiveFile(path);
            
            const response = await fetch(path);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const markdown = await response.text();
            const html = marked.parse(markdown);
            
            this.markdownViewer.innerHTML = `<div class="markdown-content">${html}</div>`;
            this.currentFile = { path, name };
            
        } catch (error) {
            console.error('Error loading markdown file:', error);
            this.showErrorState(name, error.message);
        }
    }
    
    updateActiveFile(path) {
        const fileItems = this.fileTree.querySelectorAll('.file-item');
        fileItems.forEach(item => {
            item.classList.remove('active');
            if (item.dataset.path === path) {
                item.classList.add('active');
            }
        });
    }
    
    showErrorState(fileName, errorMessage) {
        this.markdownViewer.innerHTML = `
            <div class="error-content">
                <h3>Error loading ${fileName}</h3>
                <p>${errorMessage}</p>
            </div>
        `;
    }
    
    startAutoRefresh() {
        this.refreshInterval = setInterval(() => {
            this.loadFileTree();
        }, 5000);
    }
    
    stopAutoRefresh() {
        if (this.refreshInterval) {
            clearInterval(this.refreshInterval);
            this.refreshInterval = null;
        }
    }
    
    initDarkMode() {
        // Load saved dark mode preference
        const savedDarkMode = localStorage.getItem('darkMode') === 'true';
        this.darkModeCheckbox.checked = savedDarkMode;
        if (savedDarkMode) {
            document.body.classList.add('dark-mode');
        }
        
        // Add event listener for toggle
        this.darkModeCheckbox.addEventListener('change', () => {
            const isDarkMode = this.darkModeCheckbox.checked;
            document.body.classList.toggle('dark-mode', isDarkMode);
            localStorage.setItem('darkMode', isDarkMode);
        });
    }

    initResizer() {
        const resizer = document.getElementById('resizer');
        const sidebar = document.querySelector('.sidebar');
        const mainContent = document.querySelector('.main-content');
        let isResizing = false;

        resizer.addEventListener('mousedown', (e) => {
            isResizing = true;
            document.body.style.cursor = 'col-resize';
            document.body.style.userSelect = 'none';
            
            // Add overlay to prevent iframe/content interference
            const overlay = document.createElement('div');
            overlay.id = 'resize-overlay';
            overlay.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: transparent;
                cursor: col-resize;
                z-index: 9999;
            `;
            document.body.appendChild(overlay);
        });

        document.addEventListener('mousemove', (e) => {
            if (!isResizing) return;
            
            const containerRect = document.querySelector('.app-container').getBoundingClientRect();
            const resizerWidth = 6;
            const minSidebarWidth = 250;
            const maxSidebarWidth = 600;
            const minMainWidth = 300;
            
            // Calculate new sidebar width from the right edge
            const newSidebarWidth = containerRect.right - e.clientX - resizerWidth/2;
            
            // Constrain the sidebar width
            const constrainedWidth = Math.max(minSidebarWidth, 
                                    Math.min(maxSidebarWidth, newSidebarWidth));
            
            // Ensure main content doesn't get too small
            const remainingWidth = containerRect.width - constrainedWidth - resizerWidth;
            if (remainingWidth >= minMainWidth) {
                sidebar.style.width = constrainedWidth + 'px';
            }
        });

        document.addEventListener('mouseup', () => {
            if (isResizing) {
                isResizing = false;
                document.body.style.cursor = '';
                document.body.style.userSelect = '';
                
                // Remove overlay
                const overlay = document.getElementById('resize-overlay');
                if (overlay) {
                    overlay.remove();
                }
                
                // Save width preference
                const sidebarWidth = sidebar.style.width;
                localStorage.setItem('sidebarWidth', sidebarWidth);
            }
        });

        // Restore saved width
        const savedWidth = localStorage.getItem('sidebarWidth');
        if (savedWidth) {
            sidebar.style.width = savedWidth;
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new MarkdownViewer();
});

window.addEventListener('beforeunload', () => {
    if (window.markdownViewer) {
        window.markdownViewer.stopAutoRefresh();
    }
});