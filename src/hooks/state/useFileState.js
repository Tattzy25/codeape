import { useState, useRef } from 'react'

const useFileState = () => {
  const [uploadedFiles, setUploadedFiles] = useState([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [processingOptions, setProcessingOptions] = useState({
    removeComments: true,
    addDocumentation: true,
    optimizeCode: false,
    fixSyntaxErrors: true
  })
  const fileInputRef = useRef(null)
  
  const addFiles = (newFiles) => {
    setUploadedFiles(prev => [...prev, ...newFiles])
  }
  
  const removeFile = (fileId) => {
    setUploadedFiles(prev => prev.filter(file => file.id !== fileId))
  }
  
  const clearFiles = () => {
    setUploadedFiles([])
  }
  
  const updateFileStatus = (fileId, status, changes = null) => {
    setUploadedFiles(prev => 
      prev.map(file => 
        file.id === fileId 
          ? { ...file, status, changes }
          : file
      )
    )
  }
  
  const triggerFileUpload = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click()
    }
  }
  
  const updateProcessingOptions = (newOptions) => {
    setProcessingOptions(prev => ({ ...prev, ...newOptions }))
  }
  
  return {
    // State
    uploadedFiles,
    isProcessing,
    processingOptions,
    fileInputRef,
    
    // Actions
    addFiles,
    removeFile,
    clearFiles,
    updateFileStatus,
    triggerFileUpload,
    setIsProcessing,
    updateProcessingOptions,
    setProcessingOptions
  }
}

export default useFileState