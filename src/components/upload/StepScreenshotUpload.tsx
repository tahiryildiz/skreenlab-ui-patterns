
import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ImageUp, ArrowLeft, Trash } from 'lucide-react';
import { UploadScreenshot } from '@/types/upload';
import { toast } from 'sonner';

interface StepScreenshotUploadProps {
  onUpload: (screenshots: UploadScreenshot[]) => void;
  onBack: () => void;
}

const StepScreenshotUpload: React.FC<StepScreenshotUploadProps> = ({ 
  onUpload,
  onBack 
}) => {
  const [uploading, setUploading] = useState(false);
  const [screenshots, setScreenshots] = useState<UploadScreenshot[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load any saved screenshots from sessionStorage
  useEffect(() => {
    try {
      const savedScreenshots = sessionStorage.getItem('tempScreenshots');
      if (savedScreenshots) {
        // We can only save the data URLs, not the File objects, so we need special handling
        const parsedData = JSON.parse(savedScreenshots);
        setScreenshots(parsedData);
      }
    } catch (error) {
      console.error('Error loading saved screenshots:', error);
    }
  }, []);

  // Save screenshots to sessionStorage when they change
  useEffect(() => {
    if (screenshots.length > 0) {
      try {
        // Save only what can be serialized (dataUrl, screenCategoryId, uiElementIds)
        const serializableData = screenshots.map(screenshot => ({
          dataUrl: screenshot.dataUrl,
          screenCategoryId: screenshot.screenCategoryId,
          uiElementIds: screenshot.uiElementIds,
          // We can't serialize the File object directly
          fileName: screenshot.file.name,
          fileType: screenshot.file.type,
          fileSize: screenshot.file.size,
          // Include a flag to track if we have the actual file object
          hasFile: true
        }));
        sessionStorage.setItem('tempScreenshots', JSON.stringify(serializableData));
      } catch (error) {
        console.error('Error saving screenshots to sessionStorage:', error);
      }
    }
  }, [screenshots]);

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    const newScreenshots: UploadScreenshot[] = [];

    // Convert selected files to data URLs and create screenshot objects
    const promises = Array.from(files).map((file) => {
      return new Promise<void>((resolve) => {
        const reader = new FileReader();
        reader.onload = (event) => {
          if (event.target && typeof event.target.result === 'string') {
            newScreenshots.push({
              file,
              dataUrl: event.target.result,
              screenCategoryId: null,
              uiElementIds: []
            });
            resolve();
          }
        };
        reader.readAsDataURL(file);
      });
    });

    Promise.all(promises).then(() => {
      setScreenshots((prev) => [...prev, ...newScreenshots]);
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    });
  };

  // Handle file selection via drag and drop
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    const droppedFiles = e.dataTransfer.files;
    if (!droppedFiles || droppedFiles.length === 0) return;
    
    // Filter for image files only
    const imageFiles = Array.from(droppedFiles).filter(
      file => file.type.startsWith('image/')
    );
    
    if (imageFiles.length === 0) {
      toast.error("Please upload image files only.");
      return;
    }
    
    // Create a fake event to reuse the file handling logic
    const mockEvent = {
      target: {
        files: imageFiles
      }
    } as unknown as React.ChangeEvent<HTMLInputElement>;
    
    handleFileChange(mockEvent);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  // Handle screenshot removal
  const handleRemoveScreenshot = (index: number) => {
    setScreenshots((prev) => {
      const updated = prev.filter((_, i) => i !== index);
      // If we've removed all screenshots, clear sessionStorage
      if (updated.length === 0) {
        sessionStorage.removeItem('tempScreenshots');
      }
      return updated;
    });
  };

  // Handle submit
  const handleSubmit = () => {
    if (screenshots.length === 0) {
      toast.error("Please upload at least one screenshot.");
      return;
    }

    // Clear temp storage since we're moving to the next step
    sessionStorage.removeItem('tempScreenshots');
    onUpload(screenshots);
  };

  // Don't use beforeunload here - it would trigger when switching tabs
  // Instead, rely on the sessionStorage to persist state

  return (
    <Card className="border-0 shadow-none">
      <CardContent className="pt-6">
        <div className="mb-6 text-center">
          <div className="bg-primary/10 inline-flex rounded-full p-3 mb-4">
            <ImageUp className="h-6 w-6 text-primary" />
          </div>
          <h2 className="text-2xl font-bold">Upload Screenshots</h2>
          <p className="text-gray-500 mt-2">
            Upload screenshots for your app
          </p>
        </div>

        <div 
          className="border-2 border-dashed rounded-xl p-6 text-center cursor-pointer hover:bg-gray-50 transition-colors mb-6"
          onClick={() => fileInputRef.current?.click()}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileChange}
            className="hidden"
          />
          <ImageUp className="h-10 w-10 mx-auto text-gray-400 mb-2" />
          <p className="font-medium mb-1">
            {uploading ? 'Processing...' : 'Drop your screenshots here'}
          </p>
          <p className="text-sm text-gray-500">
            or <span className="text-primary font-medium">click to browse</span>
          </p>
        </div>

        {screenshots.length > 0 && (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mt-4 mb-6">
              {screenshots.map((screenshot, index) => (
                <div key={index} className="relative group">
                  <img
                    src={screenshot.dataUrl}
                    alt={`Screenshot ${index + 1}`}
                    className="w-full h-auto aspect-[9/16] object-cover rounded-md"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveScreenshot(index)}
                    className="absolute -top-2 -right-2 bg-white rounded-full p-1 shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash className="h-4 w-4 text-red-500" />
                  </button>
                </div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                variant="outline"
                onClick={onBack}
                className="flex-1"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
              <Button
                onClick={handleSubmit}
                className="flex-1"
                disabled={uploading || screenshots.length === 0}
              >
                Continue
              </Button>
            </div>
          </>
        )}

        {screenshots.length === 0 && (
          <Button
            variant="outline"
            onClick={onBack}
            className="w-full"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default StepScreenshotUpload;
