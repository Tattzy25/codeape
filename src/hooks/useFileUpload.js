import { useState, useRef, useCallback } from 'react'
import { fileService } from '../services/fileService'

export const useFileUpload = () => {
  const [uploadedFiles, setUploadedFiles] = useState([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [processingOptions, setProcessingOptions] = useState({
    type: 'fix',
    includeComments: true,
    preserveFormatting: true,
    customInstructions: ''
  })
  const [showProcessingModal, setShowProcessingModal] = useState(false)
  const fileInputRef = useRef(null)

  // Trigger file upload
  const triggerFileUpload = useCallback(() => {
    fileInputRef.current?.click()
  }, [])

  // Handle file upload
  const handleFileUpload = useCallback(async (event) => {
    const files = Array.from(event.target.files)
    if (files.length === 0) return

    setIsProcessing(true)
    
    try {
      const processedFiles = await fileService.processFiles(files)
      setUploadedFiles(prev => [...prev, ...processedFiles])
    } catch (error) {
      console.error('Error processing files:', error)
      // You might want to show an error message to the user here
    } finally {
      setIsProcessing(false)
      // Clear the input so the same file can be uploaded again
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }, [])

  // Fix and download files
  const fixAndDownload = useCallback(async () => {
    if (uploadedFiles.length === 0 || isProcessing) return

    setIsProcessing(true)
    
    try {
      await fileService.fixAndDownloadFiles(uploadedFiles, processingOptions)
    } catch (error) {
      console.error('Error fixing and downloading files:', error)
      // You might want to show an error message to the user here
    } finally {
      setIsProcessing(false)
    }
  }, [uploadedFiles, processingOptions, isProcessing])

  // Remove uploaded file
  const removeFile = useCallback((index) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index))
  }, [])

  // Clear all uploaded files
  const clearFiles = useCallback(() => {
    setUploadedFiles([])
  }, [])

  return {
    uploadedFiles,
    isProcessing,
    processingOptions,
    setProcessingOptions,
    showProcessingModal,
    setShowProcessingModal,
    fileInputRef,
    triggerFileUpload,
    handleFileUpload,
    fixAndDownload,
    removeFile,
    clearFiles
  }
}