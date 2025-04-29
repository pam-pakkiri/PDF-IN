import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface DropzoneProps {
  onDrop: (acceptedFiles: File[]) => void;
  maxSize?: number;
  maxFiles?: number;
  accept?: Record<string, string[]>;
}

export function Dropzone({ 
  onDrop, 
  maxSize = 10 * 1024 * 1024, // 10MB default
  maxFiles = 5,
  accept = {
    'application/pdf': ['.pdf'],
  }
}: DropzoneProps) {
  const handleDrop = useCallback((acceptedFiles: File[]) => {
    onDrop(acceptedFiles);
  }, [onDrop]);

  const { 
    getRootProps, 
    getInputProps, 
    isDragActive,
    isDragReject,
    fileRejections
  } = useDropzone({
    onDrop: handleDrop,
    accept,
    maxSize,
    maxFiles,
  });

  // Format bytes to human readable format
  const formatBytes = (bytes: number, decimals = 2) => {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  };

  return (
    <div>
      <div
        {...getRootProps()}
        className={`dropzone bg-white p-8 text-center cursor-pointer ${
          isDragActive ? 'active' : ''
        } ${isDragReject ? 'border-error' : ''}`}
      >
        <input {...getInputProps()} />
        <span className="material-icons text-5xl text-neutral-300 mb-3">cloud_upload</span>
        <h3 className="text-lg font-medium text-neutral-700 mb-2">Upload PDF Files</h3>
        <p className="text-neutral-400 mb-4">
          Drag & drop your PDF files here or click to browse
        </p>
        <p className="text-neutral-400 text-sm">Maximum file size: {formatBytes(maxSize)}</p>
        
        <Button className="mt-4 bg-primary hover:bg-primary-dark text-white">
          Select Files
        </Button>
      </div>

      {fileRejections.length > 0 && (
        <div className="mt-4 bg-white p-4 rounded-md shadow-card border-l-4 border-error">
          <div className="flex items-start">
            <span className="material-icons text-error mr-2">error</span>
            <div>
              <h4 className="text-sm font-medium text-neutral-700">Upload Failed</h4>
              <ul className="text-sm text-neutral-500 list-disc ml-4 mt-1">
                {fileRejections.map(({ file, errors }) => (
                  <li key={file.name}>
                    {file.name} - {errors[0].message}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
