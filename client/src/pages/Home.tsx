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
import { useLanguage } from "@/contexts/LanguageContext";
import { 
  FileTextIcon, 
  MergeIcon, 
  ImageIcon, 
  EyeIcon, 
  Combine, 
  ScissorsIcon,
  LockIcon,
  UnlockIcon,
  RotateCwIcon,
  FilePlusIcon,
  StampIcon,
  FileSignatureIcon,
  WandIcon,
  ArrowRightToLineIcon,
  ArrowLeftToLineIcon
} from "lucide-react";

export default function Home() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { t } = useLanguage();
  
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
      {/* Modern Header with glass effect */}
      <header className="bg-white bg-opacity-80 backdrop-blur-sm sticky top-0 z-50 shadow-sm border-b border-neutral-100">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white">
              <span className="material-icons">description</span>
            </div>
            <h1 className="text-xl md:text-2xl font-bold gradient-text">{t('app.title')}</h1>
          </div>
          
          <nav className="hidden md:block">
            <ul className="flex space-x-8 items-center">
              <li>
                <a href="#" className="text-neutral-700 font-medium hover:text-primary transition-colors">
                  Home
                </a>
              </li>
              <li>
                <a href="#" className="text-neutral-600 hover:text-primary transition-colors">
                  Tools
                </a>
              </li>
              <li>
                <a href="#" className="text-neutral-600 hover:text-primary transition-colors">
                  Help
                </a>
              </li>
              <li>
                <a href="#" className="btn-gradient px-4 py-2 rounded-full text-sm font-medium flex items-center">
                  <span className="material-icons text-sm mr-1">lightbulb</span>
                  Pro Features
                </a>
              </li>
            </ul>
          </nav>
          
          <button className="md:hidden w-10 h-10 rounded-full hover:bg-neutral-100 flex items-center justify-center text-neutral-600">
            <span className="material-icons">menu</span>
          </button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12 flex-1">
        {/* Hero section with gradient text */}
        <section className="text-center mb-12 md:mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            <span className="gradient-text">{t('app.hero.title')}</span>
          </h2>
          <p className="text-neutral-600 max-w-2xl mx-auto text-lg">
            {t('app.hero.description')}
          </p>
        </section>

        {/* File Upload Area */}
        <section className="mb-12 max-w-3xl mx-auto">
          <div className="glass-card p-1">
            <FileUpload 
              onFileUpload={handleFileUpload} 
              isUploading={uploadMutation.isPending} 
              uploadProgress={uploadMutation.isPending ? 50 : 0}
            />
          </div>
        </section>

        {/* Uploaded Files List with improved styling */}
        {files.length > 0 && (
          <section className="mb-16 max-w-3xl mx-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-neutral-800">{t('app.files.title')}</h3>
              <span className="tag tag-primary">{files.length} file{files.length !== 1 ? 's' : ''}</span>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm overflow-hidden divide-y divide-neutral-100 border border-neutral-100">
              {files.map(file => (
                <div key={file.id} className="p-4 hover:bg-neutral-50 transition-colors flex items-center justify-between">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={selectedFiles.some(f => f.id === file.id)}
                      onChange={() => handleSelectFile(file)}
                      className="mr-3 h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                    />
                    <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10 text-primary mr-3">
                      <span className="material-icons">picture_as_pdf</span>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-neutral-800">{file.originalFilename}</h4>
                      <p className="text-xs text-neutral-500">{formatFileSize(file.filesize)}</p>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button 
                      className="p-2 rounded-full hover:bg-primary/10 text-neutral-500 hover:text-primary transition-colors"
                      onClick={() => handlePreviewFile(file)}
                      title="Preview"
                    >
                      <span className="material-icons text-sm">visibility</span>
                    </button>
                    <button 
                      className="p-2 rounded-full hover:bg-destructive/10 text-neutral-500 hover:text-destructive transition-colors"
                      onClick={() => handleDeleteFile(file.id)}
                      title="Delete"
                    >
                      <span className="material-icons text-sm">delete</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* PDF Tools with categories */}
        <section className="mb-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
            <div>
              <h3 className="text-2xl font-bold text-neutral-800 mb-2">{t('app.tools.title')}</h3>
              <p className="text-neutral-600">{t('app.tools.description')}</p>
            </div>
            
            {selectedFiles.length > 0 && (
              <div className="mt-4 md:mt-0 bg-neutral-100 px-4 py-2 rounded-full text-sm">
                <span className="font-medium">{selectedFiles.length} file{selectedFiles.length !== 1 ? 's' : ''} selected</span>
              </div>
            )}
          </div>
          
          {/* Essential Tools */}
          <div className="mb-10">
            <h4 className="text-lg font-semibold text-neutral-700 mb-4 flex items-center">
              <span className="material-icons mr-2 text-primary">star</span>
              {t('category.essential')}
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <ToolCard
                title="Extract Text"
                description="Extract all text content from your PDF files and save as TXT format."
                icon={<FileTextIcon />}
                onClick={handleExtractText}
                disabled={selectedFiles.length === 0}
                category="Content"
                featured={true}
              />
              
              <ToolCard
                title="Merge PDFs"
                description="Combine multiple PDF files into a single document. Maintain original formatting."
                icon={<MergeIcon />}
                onClick={handleMergePdfs}
                disabled={selectedFiles.length < 2}
                category="Organization"
                featured={true}
              />
              
              <ToolCard
                title="Convert to Images"
                description="Convert PDF pages into high-quality JPG or PNG images for sharing or editing."
                icon={<ImageIcon />}
                onClick={handleConvertToImages}
                disabled={selectedFiles.length !== 1}
                category="Conversion"
                featured={true}
              />
            </div>
          </div>
          
          {/* Editing Tools */}
          <div className="mb-10">
            <h4 className="text-lg font-semibold text-neutral-700 mb-4 flex items-center">
              <span className="material-icons mr-2 text-primary">edit</span>
              Editing Tools
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <ToolCard
                title="Split PDF"
                description="Divide your PDF into multiple files by pages or page ranges."
                icon={<ScissorsIcon />}
                onClick={() => {}}
                disabled={true}
                category="Organization"
              />
              
              <ToolCard
                title="Rotate Pages"
                description="Rotate pages to the correct orientation. Fix upside-down or sideways pages."
                icon={<RotateCwIcon />}
                onClick={() => {}}
                disabled={true}
                category="Editing"
              />
              
              <ToolCard
                title="Add Page Numbers"
                description="Automatically add page numbers to the top or bottom of each page."
                icon={<FilePlusIcon />}
                onClick={() => {}}
                disabled={true}
                category="Editing"
              />
            </div>
          </div>
          
          {/* Security Tools */}
          <div className="mb-10">
            <h4 className="text-lg font-semibold text-neutral-700 mb-4 flex items-center">
              <span className="material-icons mr-2 text-primary">security</span>
              Security Tools
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <ToolCard
                title="Protect PDF"
                description="Add password protection to your PDF to restrict access to sensitive information."
                icon={<LockIcon />}
                onClick={() => {}}
                disabled={true}
                category="Security"
              />
              
              <ToolCard
                title="Remove Password"
                description="Remove password protection from your PDF files (requires original password)."
                icon={<UnlockIcon />}
                onClick={() => {}}
                disabled={true}
                category="Security"
              />
              
              <ToolCard
                title="Add Digital Signature"
                description="Legally sign PDF documents with digital signatures for authentication."
                icon={<FileSignatureIcon />}
                onClick={() => {}}
                disabled={true}
                category="Security"
              />
            </div>
          </div>
          
          {/* Optimization Tools */}
          <div>
            <h4 className="text-lg font-semibold text-neutral-700 mb-4 flex items-center">
              <span className="material-icons mr-2 text-primary">tune</span>
              Optimization Tools
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <ToolCard
                title="Compress PDF"
                description="Reduce file size while maintaining quality. Great for email attachments."
                icon={<Combine />}
                onClick={() => {}}
                disabled={true}
                category="Optimization"
              />
              
              <ToolCard
                title="OCR Text Recognition"
                description="Convert scanned documents to searchable, selectable text with OCR technology."
                icon={<WandIcon />}
                onClick={() => {}}
                disabled={true}
                category="Conversion"
              />
              
              <ToolCard
                title="PDF to Office"
                description="Convert PDF files to editable Word, Excel, or PowerPoint formats."
                icon={<ArrowRightToLineIcon />}
                onClick={() => {}}
                disabled={true}
                category="Conversion"
              />
              
              <ToolCard
                title="Office to PDF"
                description="Convert Word, Excel, or PowerPoint documents to PDF format."
                icon={<ArrowLeftToLineIcon />}
                onClick={() => {}}
                disabled={true}
                category="Conversion"
              />
              
              <ToolCard
                title="Add Watermark"
                description="Add text or image watermarks to your PDF files for branding or protection."
                icon={<StampIcon />}
                onClick={() => {}}
                disabled={true}
                category="Editing"
              />
              
              <ToolCard
                title="View PDF"
                description="Open and view PDF files directly in your browser with our viewer."
                icon={<EyeIcon />}
                onClick={() => selectedFiles.length === 1 && handlePreviewFile(selectedFiles[0])}
                disabled={selectedFiles.length !== 1}
                category="View"
              />
            </div>
          </div>
        </section>
      </main>

      {/* Modern Footer */}
      <footer className="bg-white border-t border-neutral-200 mt-12">
        <div className="container mx-auto px-4 py-10">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white">
                  <span className="material-icons">description</span>
                </div>
                <h3 className="text-xl font-bold gradient-text">PDF Tools</h3>
              </div>
              <p className="text-neutral-600 mb-4">
                Professional PDF tools that make document workflows easier. Edit, convert, and manage your PDFs with ease.
              </p>
              <p className="text-neutral-500 text-sm">© {new Date().getFullYear()} PDF Tools. All rights reserved.</p>
            </div>
            
            <div>
              <h4 className="font-semibold text-neutral-800 mb-4">Quick Links</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-neutral-600 hover:text-primary transition-colors">Home</a></li>
                <li><a href="#" className="text-neutral-600 hover:text-primary transition-colors">Features</a></li>
                <li><a href="#" className="text-neutral-600 hover:text-primary transition-colors">Pricing</a></li>
                <li><a href="#" className="text-neutral-600 hover:text-primary transition-colors">Contact</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-neutral-800 mb-4">Legal</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-neutral-600 hover:text-primary transition-colors">Terms of Service</a></li>
                <li><a href="#" className="text-neutral-600 hover:text-primary transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="text-neutral-600 hover:text-primary transition-colors">Cookies</a></li>
                <li><a href="#" className="text-neutral-600 hover:text-primary transition-colors">Licenses</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-neutral-200 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-neutral-500 text-sm mb-4 md:mb-0">
              Built with modern technologies for optimal performance.
            </p>
            
            <div className="flex space-x-4">
              <a href="#" className="w-8 h-8 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-600 hover:bg-primary hover:text-white transition-colors">
                <span className="material-icons text-sm">facebook</span>
              </a>
              <a href="#" className="w-8 h-8 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-600 hover:bg-primary hover:text-white transition-colors">
                <span className="material-icons text-sm">discord</span>
              </a>
              <a href="#" className="w-8 h-8 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-600 hover:bg-primary hover:text-white transition-colors">
                <span className="material-icons text-sm">social_x</span>
              </a>
              <a href="#" className="w-8 h-8 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-600 hover:bg-primary hover:text-white transition-colors">
                <span className="material-icons text-sm">mail</span>
              </a>
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
