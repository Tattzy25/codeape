// File processing service
export const fileService = {
  // Process uploaded files
  async processFiles(files) {
    const processedFiles = []
    
    for (const file of files) {
      try {
        const content = await this.readFileContent(file)
        processedFiles.push({
          id: Date.now() + Math.random(),
          name: file.name,
          size: file.size,
          type: file.type,
          content: content,
          originalFile: file,
          processed: false
        })
      } catch (error) {
        console.error(`Error processing file ${file.name}:`, error)
        // Still add the file but mark it as having an error
        processedFiles.push({
          id: Date.now() + Math.random(),
          name: file.name,
          size: file.size,
          type: file.type,
          content: null,
          originalFile: file,
          processed: false,
          error: error.message
        })
      }
    }
    
    return processedFiles
  },

  // Read file content as text
  async readFileContent(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      
      reader.onload = (event) => {
        resolve(event.target.result)
      }
      
      reader.onerror = (error) => {
        reject(new Error(`Failed to read file: ${error}`))
      }
      
      // Read as text for most file types
      if (file.type.startsWith('text/') || 
          file.name.endsWith('.js') || 
          file.name.endsWith('.jsx') || 
          file.name.endsWith('.ts') || 
          file.name.endsWith('.tsx') || 
          file.name.endsWith('.css') || 
          file.name.endsWith('.html') || 
          file.name.endsWith('.json') || 
          file.name.endsWith('.md') || 
          file.name.endsWith('.txt')) {
        reader.readAsText(file)
      } else {
        // For binary files, read as data URL
        reader.readAsDataURL(file)
      }
    })
  },

  // Fix and download files
  async fixAndDownloadFiles(files, options) {
    for (const file of files) {
      try {
        // Here you would implement the actual fixing logic
        // For now, we'll just download the original content
        await this.downloadFile(file, options)
      } catch (error) {
        console.error(`Error fixing file ${file.name}:`, error)
      }
    }
  },

  // Download a single file
  async downloadFile(file, options = {}) {
    try {
      let content = file.content
      let filename = file.name
      
      // Apply processing options if needed
      if (options.type === 'fix' && content) {
        // Add any fixing logic here
        // For now, just add a comment if includeComments is true
        if (options.includeComments && typeof content === 'string') {
          content = `// Fixed by AI Assistant\n${content}`
        }
        
        // Add custom instructions as comment
        if (options.customInstructions && typeof content === 'string') {
          content = `// Custom instructions: ${options.customInstructions}\n${content}`
        }
        
        filename = `fixed_${filename}`
      }
      
      // Create blob and download
      const blob = new Blob([content || ''], { 
        type: file.type || 'text/plain' 
      })
      
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = filename
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      
    } catch (error) {
      console.error('Error downloading file:', error)
      throw error
    }
  },

  // Download all files as zip (simplified version)
  async downloadAllFiles(files, options = {}) {
    // For a simple implementation, download files individually
    // In a real app, you might want to use a library like JSZip
    for (const file of files) {
      await this.downloadFile(file, options)
      // Add small delay between downloads
      await new Promise(resolve => setTimeout(resolve, 100))
    }
  },

  // Remove file from list
  removeFile(files, fileId) {
    return files.filter(file => file.id !== fileId)
  },

  // Clear all files
  clearAllFiles() {
    return []
  },

  // Get file info
  getFileInfo(file) {
    return {
      name: file.name,
      size: this.formatFileSize(file.size),
      type: file.type,
      lastModified: file.originalFile?.lastModified ? 
        new Date(file.originalFile.lastModified).toLocaleString() : 'Unknown'
    }
  },

  // Format file size
  formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes'
    
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }
}

export default fileService