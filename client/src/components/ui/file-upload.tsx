import { useState, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

interface FileUploadProps {
  onFileUpload: (files: File[]) => void;
  isUploading: boolean;
  uploadProgress: number;
}

export function FileUpload({ onFileUpload, isUploading, uploadProgress }: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    validateAndUpload(files);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files);
      validateAndUpload(files);
    }
  };

  const validateAndUpload = (files: File[]) => {
    // Reset error
    setError(null);
    
    // Check if files are PDFs
    const validFiles = files.filter(
      file => file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')
    );
    
    if (validFiles.length === 0) {
      setError('Please upload PDF files only.');
      return;
    }
    
    // Check file size (10MB limit)
    const oversizedFiles = validFiles.filter(file => file.size > 10 * 1024 * 1024);
    if (oversizedFiles.length > 0) {
      setError('One or more files exceed the 10MB size limit.');
      return;
    }
    
    onFileUpload(validFiles);
  };

  const handleClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div>
      <div 
        className={`dropzone bg-white p-8 text-center cursor-pointer ${isDragging ? 'active' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
      >
        <span className="material-icons text-5xl text-neutral-300 mb-3">cloud_upload</span>
        <h3 className="text-lg font-medium text-neutral-700 mb-2">Upload PDF Files</h3>
        <p className="text-neutral-400 mb-4">Drag & drop your PDF files here or click to browse</p>
        <p className="text-neutral-400 text-sm">Maximum file size: 10MB</p>
        
        <input 
          type="file" 
          ref={fileInputRef}
          className="hidden" 
          accept=".pdf" 
          multiple 
          onChange={handleFileInputChange}
        />
        
        <button className="mt-4 bg-primary hover:bg-primary-dark text-white px-6 py-2 rounded-md transition-colors font-medium text-sm">
          Select Files
        </button>
      </div>

      {/* Upload Progress */}
      {isUploading && (
        <div className="mt-4 bg-white p-4 rounded-md shadow-card">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-neutral-700">Uploading files...</span>
            <span className="text-sm text-neutral-500">{uploadProgress}%</span>
          </div>
          <div className="w-full bg-neutral-100 rounded-full h-2">
            <div 
              className="bg-primary h-2 rounded-full" 
              style={{ width: `${uploadProgress}%` }}
            ></div>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mt-4 bg-white p-4 rounded-md shadow-card border-l-4 border-error">
          <div className="flex items-start">
            <span className="material-icons text-error mr-2">error</span>
            <div>
              <h4 className="text-sm font-medium text-neutral-700">Upload Failed</h4>
              <p className="text-sm text-neutral-500">{error}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
