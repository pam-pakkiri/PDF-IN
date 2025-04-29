import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ProcessingTask } from '@shared/schema';

interface ResultModalProps {
  task: ProcessingTask;
  onClose: () => void;
}

export function ResultModal({ task, onClose }: ResultModalProps) {
  const handleDownloadFile = (fileId: number) => {
    window.open(`/api/results/${fileId}`, '_blank');
  };

  const handleDownloadAll = () => {
    if (task.outputFiles) {
      task.outputFiles.forEach(file => {
        handleDownloadFile(file.id);
      });
    }
  };
  
  return (
    <div className="fixed inset-0 bg-neutral-900 bg-opacity-75 flex items-center justify-center z-50">
      <Card className="bg-white rounded-lg shadow-lg w-full max-w-md p-6">
        <div className="text-center mb-6">
          <span className="material-icons text-success text-4xl mb-4">check_circle</span>
          <h3 className="text-lg font-medium text-neutral-700 mb-2">Processing Complete</h3>
          <p className="text-neutral-500 text-sm">Your files have been successfully processed.</p>
        </div>
        
        {task.outputFiles && task.outputFiles.length > 0 && (
          <div className="mb-6 bg-neutral-50 rounded-md p-4">
            <h4 className="text-sm font-medium text-neutral-700 mb-2">Files Ready for Download</h4>
            
            <div className="space-y-2">
              {task.outputFiles.map((file, index) => (
                <div key={index} className="flex items-center justify-between py-2 border-b border-neutral-100">
                  <div className="flex items-center">
                    <span className="material-icons text-primary mr-2 text-sm">insert_drive_file</span>
                    <span className="text-sm text-neutral-600">{file.filename}</span>
                  </div>
                  <button 
                    className="text-primary hover:text-primary-dark text-sm flex items-center"
                    onClick={() => handleDownloadFile(file.id)}
                  >
                    <span className="material-icons text-sm mr-1">download</span>
                    Download
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
        
        <div className="flex justify-between">
          <Button 
            variant="secondary"
            className="bg-neutral-200 hover:bg-neutral-300 text-neutral-700"
            onClick={onClose}
          >
            Close
          </Button>
          
          {task.outputFiles && task.outputFiles.length > 0 && (
            <Button 
              className="bg-primary hover:bg-primary-dark text-white"
              onClick={handleDownloadAll}
            >
              Download All
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
}
