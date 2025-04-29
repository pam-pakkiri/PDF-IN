import { useState, useEffect } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { PdfFile } from '@shared/schema';
import { Button } from '@/components/ui/button';

// Initialize PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

interface PreviewModalProps {
  file: PdfFile;
  onClose: () => void;
}

export function PreviewModal({ file, onClose }: PreviewModalProps) {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState(1);

  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    setNumPages(numPages);
  }

  const goToPrevPage = () => {
    setPageNumber(prevPageNumber => Math.max(prevPageNumber - 1, 1));
  };

  const goToNextPage = () => {
    setPageNumber(prevPageNumber => 
      numPages ? Math.min(prevPageNumber + 1, numPages) : prevPageNumber
    );
  };

  const downloadFile = () => {
    window.open(`/api/files/${file.id}/download`, '_blank');
  };

  return (
    <div className="fixed inset-0 bg-neutral-900 bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-4xl max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center p-4 border-b border-neutral-200">
          <h3 className="text-lg font-medium text-neutral-700">Document Preview: {file.originalFilename}</h3>
          <button className="text-neutral-400 hover:text-neutral-600" onClick={onClose}>
            <span className="material-icons">close</span>
          </button>
        </div>
        
        <div className="flex-1 overflow-auto p-4">
          <div className="bg-neutral-100 h-full flex items-center justify-center">
            <Document
              file={`/api/files/${file.id}/view`}
              onLoadSuccess={onDocumentLoadSuccess}
              className="w-full max-w-md shadow-md"
            >
              <Page pageNumber={pageNumber} width={600} />
            </Document>
          </div>
        </div>
        
        <div className="p-4 border-t border-neutral-200 flex justify-between">
          <div className="flex space-x-2">
            <button 
              className="text-neutral-500 p-2 rounded hover:bg-neutral-100" 
              onClick={goToPrevPage}
              disabled={pageNumber <= 1}
            >
              <span className="material-icons">keyboard_arrow_left</span>
            </button>
            <span className="text-neutral-600 self-center">
              Page {pageNumber} of {numPages || '-'}
            </span>
            <button 
              className="text-neutral-500 p-2 rounded hover:bg-neutral-100" 
              onClick={goToNextPage}
              disabled={numPages !== null && pageNumber >= numPages}
            >
              <span className="material-icons">keyboard_arrow_right</span>
            </button>
          </div>
          
          <div>
            <Button className="bg-primary hover:bg-primary-dark text-white" onClick={downloadFile}>
              Download
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
