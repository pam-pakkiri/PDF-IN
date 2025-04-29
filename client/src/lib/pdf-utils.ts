import { apiRequest } from '@/lib/queryClient';
import { ProcessingTask } from '@shared/schema';

// Extract text from PDF
export async function extractText(fileIds: number[]): Promise<ProcessingTask> {
  const response = await apiRequest('POST', '/api/extract-text', { fileIds });
  return response.json();
}

// Merge PDFs
export async function mergePdfs(fileIds: number[], outputFilename: string = 'merged.pdf'): Promise<ProcessingTask> {
  const response = await apiRequest('POST', '/api/merge', { fileIds, outputFilename });
  return response.json();
}

// Convert PDF to images
export async function convertToImages(fileId: number, format: 'png' | 'jpg' = 'png'): Promise<ProcessingTask> {
  const response = await apiRequest('POST', '/api/convert-to-images', { fileId, format });
  return response.json();
}

// Get task status
export async function getTaskStatus(taskId: number): Promise<ProcessingTask> {
  const response = await fetch(`/api/tasks/${taskId}`);
  if (!response.ok) {
    throw new Error(`Failed to get task status: ${response.statusText}`);
  }
  return response.json();
}

// Poll task status until completion
export function pollTaskStatus(
  taskId: number, 
  onProgress: (progress: number) => void,
  onComplete: (task: ProcessingTask) => void,
  onError: (error: string) => void
): () => void {
  // Start with some initial progress for better UX
  let progress = 10;
  onProgress(progress);
  
  const intervalId = setInterval(async () => {
    try {
      const task = await getTaskStatus(taskId);
      
      if (task.status === 'processing') {
        // Simulate progress since we don't have real progress info
        progress = Math.min(progress + 10, 90);
        onProgress(progress);
      } else if (task.status === 'completed') {
        clearInterval(intervalId);
        onProgress(100);
        onComplete(task);
      } else if (task.status === 'failed') {
        clearInterval(intervalId);
        onError(task.error || 'Processing failed');
      }
    } catch (error) {
      clearInterval(intervalId);
      onError(error instanceof Error ? error.message : 'Unknown error occurred');
    }
  }, 1000);
  
  // Return a function to cancel polling
  return () => clearInterval(intervalId);
}
