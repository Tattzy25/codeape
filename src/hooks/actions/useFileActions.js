import { fileService } from '../../services/fileService'
import { fileProcessor } from '../../utils/fileProcessor'
import toast from 'react-hot-toast'
import JSZip from 'jszip'

const useFileActions = ({ 
  uploadedFiles, 
  addFiles, 
  updateFileStatus, 
  clearFiles,
  setIsProcessing,
  processingOptions 
}) => {
  
  const handleFileUpload = async (event) => {
    const files = Array.from(event.target.files)
    if (files.length === 0) return
    
    try {
      const processedFiles = await Promise.all(
        files.map(async (file) => {
          const content = await fileService.readFile(file)
          return {
            id: Date.now() + Math.random(),
            name: file.name,
            size: file.size,
            type: file.type,
            content,
            status: 'uploaded',
            changes: null
          }
        })
      )
      
      addFiles(processedFiles)
      toast.success(`${files.length} file(s) uploaded successfully`)
    } catch (error) {
      console.error('Error uploading files:', error)
      toast.error('Failed to upload files')
    }
    
    // Reset file input
    event.target.value = ''
  }
  
  const processFile = async (file) => {
    try {
      updateFileStatus(file.id, 'processing')
      
      const processedContent = await fileProcessor.processFile(
        file.content,
        file.name,
        processingOptions
      )
      
      const changes = fileProcessor.generateChanges(
        file.content,
        processedContent
      )
      
      updateFileStatus(file.id, 'completed', changes)
      return { success: true, changes }
    } catch (error) {
      console.error('Error processing file:', error)
      updateFileStatus(file.id, 'error')
      return { success: false, error: error.message }
    }
  }
  
  const processAllFiles = async () => {
    if (uploadedFiles.length === 0) {
      toast.error('No files to process')
      return
    }
    
    setIsProcessing(true)
    
    try {
      const results = await Promise.all(
        uploadedFiles.map(file => processFile(file))
      )
      
      const successCount = results.filter(r => r.success).length
      const errorCount = results.length - successCount
      
      if (errorCount === 0) {
        toast.success(`All ${successCount} files processed successfully`)
      } else {
        toast.error(`${successCount} files processed, ${errorCount} failed`)
      }
    } catch (error) {
      console.error('Error processing files:', error)
      toast.error('Failed to process files')
    } finally {
      setIsProcessing(false)
    }
  }
  
  const downloadFile = (file) => {
    try {
      const content = file.changes?.processedContent || file.content
      const blob = new Blob([content], { type: 'text/plain' })
      const url = URL.createObjectURL(blob)
      
      const link = document.createElement('a')
      link.href = url
      link.download = `processed_${file.name}`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      URL.revokeObjectURL(url)
      toast.success(`Downloaded ${file.name}`)
    } catch (error) {
      console.error('Error downloading file:', error)
      toast.error('Failed to download file')
    }
  }
  
  const downloadAllFiles = async () => {
    try {
      const zip = new JSZip()
      
      uploadedFiles.forEach(file => {
        const content = file.changes?.processedContent || file.content
        zip.file(`processed_${file.name}`, content)
      })
      
      const zipBlob = await zip.generateAsync({ type: 'blob' })
      const url = URL.createObjectURL(zipBlob)
      
      const link = document.createElement('a')
      link.href = url
      link.download = 'processed_files.zip'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      URL.revokeObjectURL(url)
      toast.success('All files downloaded as ZIP')
    } catch (error) {
      console.error('Error creating ZIP:', error)
      toast.error('Failed to download files')
    }
  }
  
  const fixAndDownload = async () => {
    await processAllFiles()
    setTimeout(() => {
      downloadAllFiles()
    }, 1000)
  }
  
  return {
    // Actions
    handleFileUpload,
    processFile,
    processAllFiles,
    downloadFile,
    downloadAllFiles,
    fixAndDownload,
    clearFiles
  }
}

export default useFileActions