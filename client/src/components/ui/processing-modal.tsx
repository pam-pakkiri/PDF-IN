import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface ProcessingModalProps {
  progress: number;
  onCancel: () => void;
}

export function ProcessingModal({ progress, onCancel }: ProcessingModalProps) {
  return (
    <div className="fixed inset-0 bg-neutral-900 bg-opacity-75 flex items-center justify-center z-50">
      <Card className="bg-white rounded-lg shadow-lg w-full max-w-md p-6">
        <div className="text-center mb-6">
          <span className="material-icons text-primary text-4xl mb-4">sync</span>
          <h3 className="text-lg font-medium text-neutral-700 mb-2">Processing Your Files</h3>
          <p className="text-neutral-500 text-sm">Please wait while we process your PDF files...</p>
        </div>
        
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-neutral-700">Progress</span>
            <span className="text-sm text-neutral-500">{progress}%</span>
          </div>
          <div className="w-full bg-neutral-100 rounded-full h-2">
            <div 
              className="bg-primary h-2 rounded-full" 
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>
        
        <div className="text-center">
          <Button 
            variant="secondary"
            className="bg-neutral-200 hover:bg-neutral-300 text-neutral-700" 
            onClick={onCancel}
          >
            Cancel
          </Button>
        </div>
      </Card>
    </div>
  );
}
