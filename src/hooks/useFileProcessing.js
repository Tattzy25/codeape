import { useCallback } from 'react'
import { toast } from 'react-hot-toast'
import { fileService } from '../services/fileService'

export const useFileProcessing = (appState) => {
  const {
    uploadedFiles, setUploadedFiles,
    processedFiles, setProcessedFiles,
    isProcessing, setIsProcessing,
    processingOptions,
    fileInputRef
  } = appState

  // Trigger file upload dialog
  const triggerFileUpload = useCallback(() => {
    fileInputRef.current?.click()
  }, [fileInputRef])

  // Handle file upload
  const handleFileUpload = useCallback((e) => {
    const files = Array.from(e.target.files)
    
    if (files.length === 0) return
    
    // Check file types and sizes
    const validFiles = files.filter(file => {
      const validTypes = [
        '.js', '.jsx', '.ts', '.tsx', '.py', '.java', '.cpp', '.c',
        '.html', '.css', '.json', '.xml', '.md', '.txt'
      ]
      
      const isValidType = validTypes.some(type => file.name.endsWith(type))
      const isValidSize = file.size <= 1024 * 1024 * 5 // 5MB max
      
      if (!isValidType) {
        toast.error(`Invalid file type: ${file.name}`)
      } else if (!isValidSize) {
        toast.error(`File too large: ${file.name}`)
      }
      
      return isValidType && isValidSize
    })
    
    if (validFiles.length > 0) {
      setUploadedFiles(prev => [...prev, ...validFiles])
      toast.success(`${validFiles.length} file(s) uploaded`)
    }
    
    // Reset input
    e.target.value = ''
  }, [])

  // Process files with AI
  const processFilesWithAI = useCallback(async (files) => {
    if (files.length === 0) return []
    
    setIsProcessing(true)
    const results = []
    
    try {
      for (const file of files) {
        try {
          const result = await fileService.processFile(file, processingOptions)
          results.push(result)
          setProcessedFiles(prev => [...prev, result])
        } catch (error) {
          console.error(`Error processing ${file.name}:`, error)
          results.push({
            name: file.name,
            processed: false,
            error: error.message
          })
        }
      }
      
      return results
    } catch (error) {
      console.error('Processing error:', error)
      toast.error('Failed to process files')
      return []
    } finally {
      setIsProcessing(false)
    }
  }, [processingOptions])

  // Fix and download all files
  const fixAndDownload = useCallback(async () => {
    if (uploadedFiles.length === 0) {
      toast.error('No files uploaded to process')
      return
    }

    const results = await processFilesWithAI(uploadedFiles)
    
    // Auto-download all successfully processed files
    results.filter(f => f.processed).forEach(file => {
      setTimeout(() => generateDownload(file), 500) // Stagger downloads
    })
  }, [uploadedFiles, processFilesWithAI])

  // Generate download for a processed file
  const generateDownload = useCallback((file) => {
    if (!file || !file.processed || !file.content) {
      toast.error(`Cannot download ${file?.name || 'file'}`)
      return
    }
    
    const blob = new Blob([file.content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    
    a.href = url
    a.download = file.name
    document.body.appendChild(a)
    a.click()
    
    // Cleanup
    setTimeout(() => {
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    }, 100)
  }, [])

  return {
    triggerFileUpload,
    handleFileUpload,
    processFilesWithAI,
    fixAndDownload,
    generateDownload
  }
}