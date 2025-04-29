import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { FileUpload } from "@/components/ui/file-upload";
import { PdfFile, ProcessingTask } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { apiRequest } from "@/lib/queryClient";
import { ToolCard } from "@/components/ui/tool-card";
import { PreviewModal } from "@/components/ui/preview-modal";
import { ProcessingModal } from "@/components/ui/processing-modal";
import { ResultModal } from "@/components/ui/result-modal";
import { useToast } from "@/hooks/use-toast";
import { FileTextIcon, MergeIcon, ImageIcon, EyeIcon, Combine, ScissorsIcon } from "lucide-react";

export default function Home() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [selectedFiles, setSelectedFiles] = useState<PdfFile[]>([]);
  const [previewFile, setPreviewFile] = useState<PdfFile | null>(null);
  const [processingTask, setProcessingTask] = useState<ProcessingTask | null>(null);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [completedTask, setCompletedTask] = useState<ProcessingTask | null>(null);
  
  // Fetch files
  const { data: files = [], isLoading: isLoadingFiles } = useQuery<PdfFile[]>({
    queryKey: ['/api/files'],
  });
  
  // Upload file mutation
  const uploadMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const response = await apiRequest('POST', '/api/upload', formData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/files'] });
      toast({
        title: "Success",
        description: "Files uploaded successfully!",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to upload: ${error.message}`,
        variant: "destructive",
      });
    },
  });
  
  // Delete file mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest('DELETE', `/api/files/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/files'] });
      toast({
        title: "Success",
        description: "File deleted successfully!",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to delete: ${error.message}`,
        variant: "destructive",
      });
    },
  });
  
  // Extract text mutation
  const extractTextMutation = useMutation({
    mutationFn: async (fileIds: number[]) => {
      const response = await apiRequest('POST', '/api/extract-text', { fileIds });
      return response.json();
    },
    onSuccess: (data) => {
      setProcessingTask(data);
      pollTaskStatus(data.id);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to extract text: ${error.message}`,
        variant: "destructive",
      });
    },
  });
  
  // Merge PDFs mutation
  const mergePdfsMutation = useMutation({
    mutationFn: async (fileIds: number[]) => {
      const response = await apiRequest('POST', '/api/merge', { 
        fileIds,
        outputFilename: "merged.pdf" 
      });
      return response.json();
    },
    onSuccess: (data) => {
      setProcessingTask(data);
      pollTaskStatus(data.id);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to merge PDFs: ${error.message}`,
        variant: "destructive",
      });
    },
  });
  
  // Convert to images mutation
  const convertToImagesMutation = useMutation({
    mutationFn: async (fileId: number) => {
      const response = await apiRequest('POST', '/api/convert-to-images', { 
        fileId,
        format: "png" 
      });
      return response.json();
    },
    onSuccess: (data) => {
      setProcessingTask(data);
      pollTaskStatus(data.id);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to convert to images: ${error.message}`,
        variant: "destructive",
      });
    },
  });
  
  // Poll task status
  const pollTaskStatus = (taskId: number) => {
    const intervalId = setInterval(async () => {
      try {
        const response = await fetch(`/api/tasks/${taskId}`);
        const task = await response.json();
        
        if (task.status === "processing") {
          // Simulate progress for better UX
          setProcessingProgress(prev => Math.min(prev + 10, 90));
        } else if (task.status === "completed") {
          setProcessingProgress(100);
          setCompletedTask(task);
          setProcessingTask(null);
          clearInterval(intervalId);
        } else if (task.status === "failed") {
          setProcessingTask(null);
          clearInterval(intervalId);
          toast({
            title: "Error",
            description: task.error || "Processing failed",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error("Error polling task status:", error);
        clearInterval(intervalId);
      }
    }, 1000);
    
    return intervalId;
  };
  
  // Handle file upload
  const handleFileUpload = (files: File[]) => {
    const formData = new FormData();
    files.forEach(file => {
      formData.append('files', file);
    });
    
    uploadMutation.mutate(formData);
  };
  
  // Handle file selection
  const handleSelectFile = (file: PdfFile) => {
    if (selectedFiles.some(f => f.id === file.id)) {
      setSelectedFiles(selectedFiles.filter(f => f.id !== file.id));
    } else {
      setSelectedFiles([...selectedFiles, file]);
    }
  };
  
  // Handle file preview
  const handlePreviewFile = (file: PdfFile) => {
    setPreviewFile(file);
  };
  
  // Handle file deletion
  const handleDeleteFile = (id: number) => {
    deleteMutation.mutate(id);
    setSelectedFiles(selectedFiles.filter(f => f.id !== id));
  };
  
  // Handle text extraction
  const handleExtractText = () => {
    if (selectedFiles.length === 0) {
      toast({
        title: "Error",
        description: "Please select at least one file",
        variant: "destructive",
      });
      return;
    }
    
    extractTextMutation.mutate(selectedFiles.map(file => file.id));
  };
  
  // Handle PDF merging
  const handleMergePdfs = () => {
    if (selectedFiles.length < 2) {
      toast({
        title: "Error",
        description: "Please select at least two files to merge",
        variant: "destructive",
      });
      return;
    }
    
    mergePdfsMutation.mutate(selectedFiles.map(file => file.id));
  };
  
  // Handle conversion to images
  const handleConvertToImages = () => {
    if (selectedFiles.length !== 1) {
      toast({
        title: "Error",
        description: "Please select exactly one file to convert",
        variant: "destructive",
      });
      return;
    }
    
    convertToImagesMutation.mutate(selectedFiles[0].id);
  };
  
  // Close result modal
  const closeResultModal = () => {
    setCompletedTask(null);
    setProcessingProgress(0);
    queryClient.invalidateQueries({ queryKey: ['/api/files'] });
  };
  
  // Format file size
  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    else return (bytes / 1048576).toFixed(1) + ' MB';
  };
  
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <span className="material-icons text-primary text-3xl">description</span>
            <h1 className="text-xl md:text-2xl font-medium text-neutral-700">PDF Tools</h1>
          </div>
          
          <nav className="hidden md:block">
            <ul className="flex space-x-6">
              <li><a href="#" className="text-neutral-500 hover:text-primary transition-colors">Home</a></li>
              <li><a href="#" className="text-neutral-500 hover:text-primary transition-colors">Tools</a></li>
              <li><a href="#" className="text-neutral-500 hover:text-primary transition-colors">Help</a></li>
            </ul>
          </nav>
          
          <button className="md:hidden text-neutral-500">
            <span className="material-icons">menu</span>
          </button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 flex-1">
        {/* Hero */}
        <section className="text-center mb-8 md:mb-12">
          <h2 className="text-2xl md:text-3xl font-medium text-neutral-700 mb-3">All-in-one PDF Tools</h2>
          <p className="text-neutral-500 max-w-2xl mx-auto">Upload your PDF files and transform them using our simple yet powerful tools. Extract text, merge files, convert to images, and more.</p>
        </section>

        {/* File Upload Area */}
        <section className="mb-12 max-w-3xl mx-auto">
          <FileUpload 
            onFileUpload={handleFileUpload} 
            isUploading={uploadMutation.isPending} 
            uploadProgress={uploadMutation.isPending ? 50 : 0}
          />
        </section>

        {/* Uploaded Files List */}
        {files.length > 0 && (
          <section className="mb-12 max-w-3xl mx-auto">
            <h3 className="text-xl font-medium text-neutral-700 mb-4">Uploaded Files</h3>
            
            <div className="bg-white rounded-md shadow-md divide-y divide-neutral-100">
              {files.map(file => (
                <div key={file.id} className="p-4 flex items-center justify-between">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={selectedFiles.some(f => f.id === file.id)}
                      onChange={() => handleSelectFile(file)}
                      className="mr-3 h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                    />
                    <span className="material-icons text-primary mr-3">picture_as_pdf</span>
                    <div>
                      <h4 className="text-sm font-medium text-neutral-700">{file.originalFilename}</h4>
                      <p className="text-xs text-neutral-400">{formatFileSize(file.filesize)}</p>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button 
                      className="text-neutral-400 hover:text-neutral-600"
                      onClick={() => handlePreviewFile(file)}
                    >
                      <span className="material-icons">visibility</span>
                    </button>
                    <button 
                      className="text-neutral-400 hover:text-error"
                      onClick={() => handleDeleteFile(file.id)}
                    >
                      <span className="material-icons">delete</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* PDF Tools */}
        <section>
          <h3 className="text-xl font-medium text-neutral-700 mb-6">PDF Tools</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <ToolCard
              title="Extract Text"
              description="Extract all text content from your PDF files and save as TXT format."
              icon={<FileTextIcon className="text-primary" />}
              onClick={handleExtractText}
              disabled={selectedFiles.length === 0}
            />
            
            <ToolCard
              title="Merge PDFs"
              description="Combine multiple PDF files into a single document. Rearrange as needed."
              icon={<MergeIcon className="text-primary" />}
              onClick={handleMergePdfs}
              disabled={selectedFiles.length < 2}
            />
            
            <ToolCard
              title="Convert to Images"
              description="Convert PDF pages into high-quality JPG or PNG images."
              icon={<ImageIcon className="text-primary" />}
              onClick={handleConvertToImages}
              disabled={selectedFiles.length !== 1}
            />
            
            <ToolCard
              title="View PDF"
              description="Open and view PDF files directly in your browser with our viewer."
              icon={<EyeIcon className="text-primary" />}
              onClick={() => selectedFiles.length === 1 && handlePreviewFile(selectedFiles[0])}
              disabled={selectedFiles.length !== 1}
            />
            
            <ToolCard
              title="Compress PDF"
              description="Reduce the file size of your PDF documents while maintaining quality."
              icon={<Combine className="text-primary" />}
              onClick={() => {}}
              disabled={true}
            />
            
            <ToolCard
              title="Split PDF"
              description="Divide your PDF into multiple files by pages or page ranges."
              icon={<ScissorsIcon className="text-primary" />}
              onClick={() => {}}
              disabled={true}
            />
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-neutral-200 mt-12">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <div className="flex items-center space-x-2">
                <span className="material-icons text-primary text-xl">description</span>
                <span className="text-neutral-700 font-medium">PDF Tools</span>
              </div>
              <p className="text-neutral-500 text-sm mt-1">© 2023 PDF Tools. All rights reserved.</p>
            </div>
            
            <div>
              <ul className="flex space-x-6">
                <li><a href="#" className="text-neutral-500 hover:text-primary text-sm">Terms</a></li>
                <li><a href="#" className="text-neutral-500 hover:text-primary text-sm">Privacy</a></li>
                <li><a href="#" className="text-neutral-500 hover:text-primary text-sm">Help</a></li>
              </ul>
            </div>
          </div>
        </div>
      </footer>

      {/* Modals */}
      {previewFile && (
        <PreviewModal 
          file={previewFile} 
          onClose={() => setPreviewFile(null)} 
        />
      )}
      
      {processingTask && (
        <ProcessingModal 
          progress={processingProgress} 
          onCancel={() => setProcessingTask(null)} 
        />
      )}
      
      {completedTask && (
        <ResultModal 
          task={completedTask} 
          onClose={closeResultModal} 
        />
      )}
    </div>
  );
}
