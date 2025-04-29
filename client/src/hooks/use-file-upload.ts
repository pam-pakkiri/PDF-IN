import { useState } from 'react';
import { apiRequest } from '@/lib/queryClient';
import { PdfFile } from '@shared/schema';
import { useToast } from '@/hooks/use-toast';

export function useFileUpload() {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const uploadFiles = async (files: File[]): Promise<PdfFile[]> => {
    setIsUploading(true);
    setUploadProgress(0);
    setError(null);

    // Create a progress simulation
    const progressInterval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return prev;
        }
        return prev + 10;
      });
    }, 500);

    try {
      const formData = new FormData();
      files.forEach(file => {
        formData.append('files', file);
      });

      const response = await apiRequest('POST', '/api/upload', formData);
      const data = await response.json();

      setUploadProgress(100);
      
      // Clear the interval and reset state after a short delay
      setTimeout(() => {
        clearInterval(progressInterval);
        setIsUploading(false);
        setUploadProgress(0);
      }, 500);

      toast({
        title: "Success",
        description: "Files uploaded successfully!",
      });

      return data;
    } catch (error) {
      clearInterval(progressInterval);
      setIsUploading(false);
      
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      setError(errorMessage);
      
      toast({
        title: "Error",
        description: `Failed to upload: ${errorMessage}`,
        variant: "destructive",
      });
      
      return [];
    }
  };

  return {
    uploadFiles,
    isUploading,
    uploadProgress,
    error,
  };
}
