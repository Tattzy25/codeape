// File processing utility for handling various file types

import { FILE_CONSTANTS } from '../config/appConstants'

class FileProcessor {
  constructor() {
    this.supportedTypes = new Set(FILE_CONSTANTS.SUPPORTED_TYPES)
    this.supportedExtensions = new Set(FILE_CONSTANTS.SUPPORTED_EXTENSIONS)
    this.processingQueue = []
    this.isProcessing = false
  }
  
  // Validate file before processing
  validateFile(file) {
    const errors = []
    
    // Check file size
    if (file.size > FILE_CONSTANTS.MAX_FILE_SIZE) {
      errors.push(`File size (${this.formatFileSize(file.size)}) exceeds maximum allowed size (${this.formatFileSize(FILE_CONSTANTS.MAX_FILE_SIZE)})`)
    }
    
    // Check file type
    const extension = this.getFileExtension(file.name)
    if (!this.supportedTypes.has(file.type) && !this.supportedExtensions.has(extension)) {
      errors.push(`File type '${file.type || extension}' is not supported`)
    }
    
    return {
      isValid: errors.length === 0,
      errors
    }
  }
  
  // Process a single file
  async processFile(file, options = {}) {
    try {
      // Validate file
      const validation = this.validateFile(file)
      if (!validation.isValid) {
        throw new Error(validation.errors.join(', '))
      }
      
      // Determine processing method based on file type
      const extension = this.getFileExtension(file.name)
      const processor = this.getProcessor(file.type, extension)
      
      // Read file content
      const content = await this.readFileContent(file)
      
      // Process content
      const processedContent = await processor(content, file, options)
      
      return {
        success: true,
        file: {
          name: file.name,
          size: file.size,
          type: file.type,
          lastModified: file.lastModified
        },
        content: processedContent,
        metadata: this.extractMetadata(file, content),
        processedAt: new Date().toISOString()
      }
    } catch (error) {
      return {
        success: false,
        file: {
          name: file.name,
          size: file.size,
          type: file.type
        },
        error: error.message,
        processedAt: new Date().toISOString()
      }
    }
  }
  
  // Process multiple files
  async processFiles(files, options = {}) {
    const results = []
    
    for (const file of files) {
      const result = await this.processFile(file, options)
      results.push(result)
      
      // Add delay between files to prevent overwhelming
      if (options.delay && files.length > 1) {
        await this.delay(options.delay)
      }
    }
    
    return results
  }
  
  // Read file content as text
  readFileContent(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      
      reader.onload = (event) => {
        resolve(event.target.result)
      }
      
      reader.onerror = () => {
        reject(new Error('Failed to read file'))
      }
      
      // Read as text for most file types
      if (this.isTextFile(file)) {
        reader.readAsText(file)
      } else {
        reader.readAsDataURL(file)
      }
    })
  }
  
  // Get appropriate processor for file type
  getProcessor(mimeType, extension) {
    // Text files
    if (mimeType === 'text/plain' || extension === '.txt') {
      return this.processTextFile
    }
    
    // Markdown files
    if (mimeType === 'text/markdown' || extension === '.md') {
      return this.processMarkdownFile
    }
    
    // JSON files
    if (mimeType === 'application/json' || extension === '.json') {
      return this.processJsonFile
    }
    
    // CSV files
    if (mimeType === 'text/csv' || extension === '.csv') {
      return this.processCsvFile
    }
    
    // JavaScript files
    if (mimeType === 'application/javascript' || ['.js', '.jsx', '.ts', '.tsx'].includes(extension)) {
      return this.processJavaScriptFile
    }
    
    // HTML files
    if (mimeType === 'text/html' || extension === '.html') {
      return this.processHtmlFile
    }
    
    // CSS files
    if (mimeType === 'text/css' || extension === '.css') {
      return this.processCssFile
    }
    
    // XML files
    if (mimeType === 'application/xml' || mimeType === 'text/xml' || extension === '.xml') {
      return this.processXmlFile
    }
    
    // YAML files
    if (mimeType === 'application/x-yaml' || ['.yml', '.yaml'].includes(extension)) {
      return this.processYamlFile
    }
    
    // Default text processor
    return this.processTextFile
  }
  
  // Text file processor
  processTextFile = async (content, file, options) => {
    const lines = content.split('\n')
    
    return {
      type: 'text',
      content,
      lineCount: lines.length,
      wordCount: this.countWords(content),
      characterCount: content.length,
      encoding: 'utf-8'
    }
  }
  
  // Markdown file processor
  processMarkdownFile = async (content, file, options) => {
    const lines = content.split('\n')
    const headers = lines.filter(line => line.startsWith('#'))
    
    return {
      type: 'markdown',
      content,
      lineCount: lines.length,
      wordCount: this.countWords(content),
      characterCount: content.length,
      headers: headers.map(header => ({
        level: header.match(/^#+/)[0].length,
        text: header.replace(/^#+\s*/, '')
      })),
      encoding: 'utf-8'
    }
  }
  
  // JSON file processor
  processJsonFile = async (content, file, options) => {
    try {
      const parsed = JSON.parse(content)
      
      return {
        type: 'json',
        content,
        parsed,
        isValid: true,
        size: this.getObjectSize(parsed),
        keys: this.getObjectKeys(parsed),
        encoding: 'utf-8'
      }
    } catch (error) {
      return {
        type: 'json',
        content,
        isValid: false,
        error: error.message,
        encoding: 'utf-8'
      }
    }
  }
  
  // CSV file processor
  processCsvFile = async (content, file, options) => {
    const lines = content.split('\n').filter(line => line.trim())
    const headers = lines[0] ? lines[0].split(',').map(h => h.trim()) : []
    const rows = lines.slice(1).map(line => line.split(',').map(cell => cell.trim()))
    
    return {
      type: 'csv',
      content,
      headers,
      rows,
      rowCount: rows.length,
      columnCount: headers.length,
      encoding: 'utf-8'
    }
  }
  
  // JavaScript file processor
  processJavaScriptFile = async (content, file, options) => {
    const lines = content.split('\n')
    const imports = lines.filter(line => line.trim().startsWith('import'))
    const exports = lines.filter(line => line.trim().startsWith('export'))
    const functions = this.extractFunctions(content)
    const classes = this.extractClasses(content)
    
    return {
      type: 'javascript',
      content,
      lineCount: lines.length,
      imports,
      exports,
      functions,
      classes,
      encoding: 'utf-8'
    }
  }
  
  // HTML file processor
  processHtmlFile = async (content, file, options) => {
    const parser = new DOMParser()
    const doc = parser.parseFromString(content, 'text/html')
    
    return {
      type: 'html',
      content,
      title: doc.title,
      headings: this.extractHeadings(doc),
      links: this.extractLinks(doc),
      images: this.extractImages(doc),
      encoding: 'utf-8'
    }
  }
  
  // CSS file processor
  processCssFile = async (content, file, options) => {
    const rules = this.extractCssRules(content)
    const selectors = this.extractCssSelectors(content)
    
    return {
      type: 'css',
      content,
      rules,
      selectors,
      encoding: 'utf-8'
    }
  }
  
  // XML file processor
  processXmlFile = async (content, file, options) => {
    try {
      const parser = new DOMParser()
      const doc = parser.parseFromString(content, 'text/xml')
      
      return {
        type: 'xml',
        content,
        isValid: !doc.querySelector('parsererror'),
        rootElement: doc.documentElement?.tagName,
        encoding: 'utf-8'
      }
    } catch (error) {
      return {
        type: 'xml',
        content,
        isValid: false,
        error: error.message,
        encoding: 'utf-8'
      }
    }
  }
  
  // YAML file processor
  processYamlFile = async (content, file, options) => {
    // Basic YAML processing (would need a proper YAML parser for production)
    const lines = content.split('\n')
    const keys = lines.filter(line => line.includes(':')).map(line => line.split(':')[0].trim())
    
    return {
      type: 'yaml',
      content,
      lineCount: lines.length,
      keys,
      encoding: 'utf-8'
    }
  }
  
  // Utility methods
  getFileExtension(filename) {
    return filename.toLowerCase().substring(filename.lastIndexOf('.'))
  }
  
  isTextFile(file) {
    return file.type.startsWith('text/') || 
           this.supportedExtensions.has(this.getFileExtension(file.name))
  }
  
  formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }
  
  countWords(text) {
    return text.trim().split(/\s+/).filter(word => word.length > 0).length
  }
  
  getObjectSize(obj) {
    return JSON.stringify(obj).length
  }
  
  getObjectKeys(obj, prefix = '') {
    const keys = []
    for (const key in obj) {
      const fullKey = prefix ? `${prefix}.${key}` : key
      keys.push(fullKey)
      if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
        keys.push(...this.getObjectKeys(obj[key], fullKey))
      }
    }
    return keys
  }
  
  extractFunctions(content) {
    const functionRegex = /function\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\s*\(/g
    const arrowFunctionRegex = /const\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\s*=\s*\(/g
    const functions = []
    
    let match
    while ((match = functionRegex.exec(content)) !== null) {
      functions.push({ name: match[1], type: 'function' })
    }
    
    while ((match = arrowFunctionRegex.exec(content)) !== null) {
      functions.push({ name: match[1], type: 'arrow' })
    }
    
    return functions
  }
  
  extractClasses(content) {
    const classRegex = /class\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\s*{/g
    const classes = []
    
    let match
    while ((match = classRegex.exec(content)) !== null) {
      classes.push({ name: match[1] })
    }
    
    return classes
  }
  
  extractHeadings(doc) {
    const headings = []
    for (let i = 1; i <= 6; i++) {
      const elements = doc.querySelectorAll(`h${i}`)
      elements.forEach(el => {
        headings.push({ level: i, text: el.textContent })
      })
    }
    return headings
  }
  
  extractLinks(doc) {
    const links = []
    doc.querySelectorAll('a[href]').forEach(link => {
      links.push({ href: link.href, text: link.textContent })
    })
    return links
  }
  
  extractImages(doc) {
    const images = []
    doc.querySelectorAll('img[src]').forEach(img => {
      images.push({ src: img.src, alt: img.alt })
    })
    return images
  }
  
  extractCssRules(content) {
    const ruleRegex = /([^{]+)\s*{[^}]*}/g
    const rules = []
    
    let match
    while ((match = ruleRegex.exec(content)) !== null) {
      rules.push(match[1].trim())
    }
    
    return rules
  }
  
  extractCssSelectors(content) {
    const selectorRegex = /([^{,]+)(?=\s*{)/g
    const selectors = []
    
    let match
    while ((match = selectorRegex.exec(content)) !== null) {
      selectors.push(match[1].trim())
    }
    
    return selectors
  }
  
  extractMetadata(file, content) {
    return {
      filename: file.name,
      size: file.size,
      type: file.type,
      lastModified: new Date(file.lastModified).toISOString(),
      extension: this.getFileExtension(file.name),
      contentLength: content.length,
      contentType: this.detectContentType(content)
    }
  }
  
  detectContentType(content) {
    if (content.startsWith('<!DOCTYPE html') || content.startsWith('<html')) {
      return 'html'
    }
    if (content.startsWith('{') || content.startsWith('[')) {
      return 'json'
    }
    if (content.includes('function') || content.includes('=>')) {
      return 'javascript'
    }
    return 'text'
  }
  
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
  }
}

// Create singleton instance
const fileProcessor = new FileProcessor()

export default fileProcessor

// Export utility functions
export const processFile = (file, options) => fileProcessor.processFile(file, options)
export const processFiles = (files, options) => fileProcessor.processFiles(files, options)
export const validateFile = (file) => fileProcessor.validateFile(file)
export const formatFileSize = (bytes) => fileProcessor.formatFileSize(bytes)