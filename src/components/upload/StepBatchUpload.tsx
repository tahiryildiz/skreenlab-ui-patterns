
import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ImageUp, ArrowLeft, Trash, Plus, Tag } from 'lucide-react';
import { UploadScreenshot } from '@/types/upload';
import { toast } from 'sonner';

interface StepBatchUploadProps {
  categoryId: string;
  categoryName: string;
  existingScreenshots: UploadScreenshot[];
  onUpload: (screenshots: UploadScreenshot[], categoryId: string) => void;
  onBack: () => void;
  onChangeCategory: () => void;
  onTagScreenshots: () => void;
}

const StepBatchUpload: React.FC<StepBatchUploadProps> = ({ 
  categoryId,
  categoryName,
  existingScreenshots,
  onUpload,
  onBack,
  onChangeCategory,
  onTagScreenshots
}) => {
  const [uploading, setUploading] = useState(false);
  const [newScreenshots, setNewScreenshots] = useState<UploadScreenshot[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Show existing screenshots for this category
  const existingForCategory = existingScreenshots.filter(s => s.screenCategoryId === categoryId);
  
  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    const batchScreenshots: UploadScreenshot[] = [];

    // Convert selected files to data URLs and create screenshot objects
    const promises = Array.from(files).map((file) => {
      return new Promise<void>((resolve) => {
        const reader = new FileReader();
        reader.onload = (event) => {
          if (event.target && typeof event.target.result === 'string') {
            batchScreenshots.push({
              file,
              dataUrl: event.target.result,
              screenCategoryId: categoryId,
              uiElementIds: []
            });
            resolve();
          }
        };
        reader.readAsDataURL(file);
      });
    });

    Promise.all(promises).then(() => {
      setNewScreenshots(batchScreenshots);
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
    setNewScreenshots((prev) => prev.filter((_, i) => i !== index));
  };

  // Handle submit
  const handleSubmit = () => {
    if (newScreenshots.length === 0) {
      toast.error("Please upload at least one screenshot.");
      return;
    }

    onUpload(newScreenshots, categoryId);
  };

  return (
    <Card className="border-0 shadow-none">
      <CardContent className="pt-6">
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
            <div>
              <h2 className="text-2xl font-bold">Upload {categoryName} Screenshots</h2>
              <p className="text-gray-500 mt-1">
                Upload screenshots for the {categoryName.toLowerCase()} screens
              </p>
            </div>
            {existingForCategory.length > 0 && (
              <div className="bg-primary/10 px-3 py-1.5 rounded-full text-sm font-medium text-primary mt-2 sm:mt-0">
                {existingForCategory.length} screenshot{existingForCategory.length === 1 ? '' : 's'} uploaded
              </div>
            )}
          </div>
          
          <div className="flex flex-wrap gap-2 mt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onChangeCategory}
              className="text-xs"
            >
              <Plus className="h-3.5 w-3.5 mr-1" />
              Add Another Category
            </Button>
            
            {existingForCategory.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={onTagScreenshots}
                className="text-xs"
              >
                <Tag className="h-3.5 w-3.5 mr-1" />
                Tag Uploaded Screenshots
              </Button>
            )}
          </div>
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
            {uploading ? 'Processing...' : `Drop ${categoryName} screenshots here`}
          </p>
          <p className="text-sm text-gray-500">
            or <span className="text-primary font-medium">click to browse</span>
          </p>
        </div>

        {newScreenshots.length > 0 && (
          <>
            <h3 className="font-medium mb-3">New Screenshots</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mt-4 mb-6">
              {newScreenshots.map((screenshot, index) => (
                <div key={index} className="relative group">
                  <img
                    src={screenshot.dataUrl}
                    alt={`${categoryName} Screenshot ${index + 1}`}
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
                disabled={uploading || newScreenshots.length === 0}
              >
                Upload {newScreenshots.length} Screenshot{newScreenshots.length === 1 ? '' : 's'}
              </Button>
            </div>
          </>
        )}

        {newScreenshots.length === 0 && (
          <Button
            variant="outline"
            onClick={onBack}
            className="w-full"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        )}
        
        {existingForCategory.length > 0 && newScreenshots.length === 0 && (
          <div className="mt-6">
            <h3 className="font-medium mb-3">Uploaded {categoryName} Screenshots</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {existingForCategory.map((screenshot, index) => (
                <div key={index} className="relative">
                  <img
                    src={screenshot.dataUrl}
                    alt={`${categoryName} Screenshot ${index + 1}`}
                    className="w-full h-auto aspect-[9/16] object-cover rounded-md"
                  />
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/50 to-transparent p-2 rounded-b-md">
                    <span className="text-xs text-white">
                      {screenshot.uiElementIds.length} UI Elements
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default StepBatchUpload;
