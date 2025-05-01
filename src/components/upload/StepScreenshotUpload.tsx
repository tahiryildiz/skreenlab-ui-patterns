import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Upload, X, ImageIcon } from 'lucide-react';
import { toast } from '@/components/ui/sonner';
import { UploadScreenshot } from '@/pages/Upload';

interface StepScreenshotUploadProps {
  onUpload: (screenshots: UploadScreenshot[]) => void;
  onBack: () => void;
}

const StepScreenshotUpload: React.FC<StepScreenshotUploadProps> = ({ 
  onUpload,
  onBack 
}) => {
  const [uploadedScreenshots, setUploadedScreenshots] = useState<UploadScreenshot[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isTabFocusedRef = useRef(true);
  
  // Save screenshots to sessionStorage when they change
  useEffect(() => {
    if (uploadedScreenshots.length > 0) {
      // Only store necessary data to avoid large objects
      const screenshotsToStore = uploadedScreenshots.map(screenshot => ({
        dataUrl: screenshot.dataUrl,
        screenCategoryId: screenshot.screenCategoryId,
        uiElementIds: screenshot.uiElementIds,
      }));
      
      try {
        sessionStorage.setItem('uploadedScreenshots', JSON.stringify(screenshotsToStore));
      } catch (error) {
        console.error('Error storing screenshots in session storage:', error);
      }
    }
  }, [uploadedScreenshots]);
  
  // Restore screenshots from sessionStorage on component mount
  useEffect(() => {
    try {
      const storedScreenshots = sessionStorage.getItem('uploadedScreenshots');
      if (storedScreenshots) {
        const parsedScreenshots = JSON.parse(storedScreenshots);
        
        // Recreate the File objects from stored data
        // Note: We can't fully recreate File objects from sessionStorage
        // So we'll only restore the screenshots if they were just added this session
        setUploadedScreenshots(parsedScreenshots.map((screenshot: any, index: number) => ({
          ...screenshot,
          file: new File([], `restored-screenshot-${index}.png`, { type: 'image/png' })
        })));
      }
    } catch (error) {
      console.error('Error retrieving screenshots from session storage:', error);
    }
  }, []);

  // Monitor tab visibility without triggering navigation changes
  useEffect(() => {
    const handleVisibilityChange = () => {
      isTabFocusedRef.current = !document.hidden;
      console.log('Tab focus changed, isTabFocused:', isTabFocusedRef.current);
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFiles(Array.from(e.target.files));
    }
  };

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(Array.from(e.dataTransfer.files));
    }
  };

  const processFiles = (files: File[]) => {
    const imageFiles = files.filter(file => 
      file.type === 'image/png' || 
      file.type === 'image/jpeg' || 
      file.type === 'image/jpg'
    );
    
    if (imageFiles.length === 0) {
      toast.error('Please upload PNG or JPEG images only');
      return;
    }
    
    if (imageFiles.length > 20) {
      toast.error('Maximum 20 images can be uploaded at once');
      return;
    }
    
    const newScreenshots: UploadScreenshot[] = [];
    
    imageFiles.forEach(file => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        if (e.target?.result) {
          newScreenshots.push({
            file,
            dataUrl: e.target.result as string,
            screenCategoryId: null,
            uiElementIds: []
          });
          
          if (newScreenshots.length === imageFiles.length) {
            setUploadedScreenshots(prev => [...prev, ...newScreenshots]);
          }
        }
      };
      
      reader.readAsDataURL(file);
    });
  };

  const handleRemoveScreenshot = (index: number) => {
    setUploadedScreenshots(prev => {
      const updated = prev.filter((_, i) => i !== index);
      
      // If there are no more screenshots, clear sessionStorage
      if (updated.length === 0) {
        sessionStorage.removeItem('uploadedScreenshots');
      }
      
      return updated;
    });
  };

  const handleBrowse = () => {
    fileInputRef.current?.click();
  };
  
  const handleContinue = () => {
    if (uploadedScreenshots.length === 0) {
      toast.error('Please upload at least one screenshot');
      return;
    }
    
    // Store the full screenshots object directly in the parent component
    onUpload(uploadedScreenshots);
    
    // Clear session storage since we're moving to the next step
    sessionStorage.removeItem('uploadedScreenshots');
  };

  // Only show confirmation when actually navigating away from the page, not when switching tabs
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      // Only show confirmation if there are screenshots AND the tab is still in focus
      // This prevents the dialog from showing when just switching tabs
      if (uploadedScreenshots.length > 0 && isTabFocusedRef.current) {
        // Standard way to show a confirmation dialog when leaving
        e.preventDefault();
        e.returnValue = '';
        return '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [uploadedScreenshots]);

  return (
    <Card className="border-0 shadow-none">
      <CardContent className="pt-6">
        <div className="mb-6 text-center">
          <div className="bg-primary/10 inline-flex rounded-full p-3 mb-4">
            <ImageIcon className="h-6 w-6 text-primary" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Upload Screenshots</h2>
          <p className="text-gray-500">
            Upload one or multiple screenshots (maximum 20)
          </p>
        </div>
        
        <div 
          className={`border-2 border-dashed rounded-lg p-8 text-center ${isDragging ? 'border-primary bg-primary/5' : 'border-gray-200'}`}
          onDragEnter={handleDragEnter}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <Upload className="h-10 w-10 text-gray-400 mx-auto mb-4" />
          <p className="text-lg font-medium mb-2">
            Drag and drop your screenshots here
          </p>
          <p className="text-sm text-gray-500 mb-4">
            PNG, JPG up to 10MB each
          </p>
          <Button 
            type="button" 
            onClick={handleBrowse}
            variant="secondary"
          >
            Browse Files
          </Button>
          <input 
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/png, image/jpeg, image/jpg"
            multiple
            className="hidden"
          />
        </div>
        
        {uploadedScreenshots.length > 0 && (
          <div className="mt-6">
            <h3 className="font-medium mb-3">
              Uploaded Screenshots ({uploadedScreenshots.length})
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {uploadedScreenshots.map((screenshot, index) => (
                <div 
                  key={index} 
                  className="relative rounded-lg overflow-hidden aspect-[9/19.5] border bg-gray-50"
                >
                  <img 
                    src={screenshot.dataUrl} 
                    alt={`Screenshot ${index + 1}`}
                    className="w-full h-full object-contain"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveScreenshot(index)}
                    className="absolute top-2 right-2 bg-black/50 rounded-full p-1"
                    aria-label="Remove screenshot"
                  >
                    <X className="h-4 w-4 text-white" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
        
        <div className="flex flex-col sm:flex-row gap-3 mt-6">
          <Button
            variant="outline"
            onClick={onBack}
            className="flex-1"
          >
            Back
          </Button>
          <Button 
            onClick={handleContinue}
            className="flex-1"
            disabled={uploadedScreenshots.length === 0}
          >
            Continue
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default StepScreenshotUpload;
