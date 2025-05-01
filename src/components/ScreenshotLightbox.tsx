
import React from 'react';
import { Screenshot } from '../types';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { X } from 'lucide-react';

interface ScreenshotLightboxProps {
  screenshot: Screenshot | null;
  isOpen: boolean;
  onClose: () => void;
}

const ScreenshotLightbox: React.FC<ScreenshotLightboxProps> = ({ 
  screenshot, 
  isOpen, 
  onClose 
}) => {
  if (!screenshot) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[900px] p-0 gap-0 overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-[2fr,1fr] h-[80vh]">
          {/* Screenshot display */}
          <div className="h-full bg-gray-900 flex items-center justify-center p-4 relative">
            <button 
              className="absolute top-4 right-4 p-2 bg-black/40 rounded-full text-white hover:bg-black/60 transition-colors"
              onClick={onClose}
            >
              <X size={20} />
            </button>
            <img 
              src={screenshot.image_url} 
              alt={`${screenshot.app_name} - ${screenshot.category} screenshot`}
              className="max-h-full max-w-full object-contain"
            />
          </div>
          
          {/* Screenshot metadata */}
          <div className="p-6 bg-white overflow-y-auto">
            <h3 className="text-xl font-bold mb-4">{screenshot.app_name}</h3>
            
            <div className="mb-6">
              <h4 className="text-sm font-semibold text-gray-500 mb-2">CATEGORY</h4>
              <div className="category-badge">{screenshot.category}</div>
            </div>
            
            <div className="mb-6">
              <h4 className="text-sm font-semibold text-gray-500 mb-2">TAGS</h4>
              <div className="flex flex-wrap gap-1">
                {screenshot.tags.map((tag, index) => (
                  <span key={index} className="tag-pill">
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
            
            <div className="mb-6">
              <h4 className="text-sm font-semibold text-gray-500 mb-2">UPLOADED</h4>
              <p className="text-sm">{new Date(screenshot.uploaded_at).toLocaleDateString()}</p>
            </div>
            
            {screenshot.description && (
              <div>
                <h4 className="text-sm font-semibold text-gray-500 mb-2">DESCRIPTION</h4>
                <p className="text-sm text-gray-700">{screenshot.description}</p>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ScreenshotLightbox;
