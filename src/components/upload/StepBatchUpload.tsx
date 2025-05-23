
import React from 'react';
import StepScreenshotUpload from './StepScreenshotUpload';
import type { UploadScreenshot } from '@/types/upload';
import { Button } from '../ui/button';

interface StepBatchUploadProps {
  categoryId: string;
  categoryName: string;
  existingScreenshots: UploadScreenshot[];
  onUpload: (newScreenshots: UploadScreenshot[]) => void;
  onChangeCategory: () => void;
  onTagScreenshots: () => void;
  onBack: () => void;
}

const StepBatchUpload: React.FC<StepBatchUploadProps> = ({
  categoryId,
  categoryName,
  existingScreenshots,
  onUpload,
  onChangeCategory,
  onTagScreenshots,
  onBack
}) => {
  // Calculate how many screenshots already exist for this category
  const existingCategoryScreenshots = existingScreenshots.filter(
    s => s.screenCategoryId === categoryId
  );
  
  // Handle screenshot upload
  const handleUpload = (screenshots: UploadScreenshot[]) => {
    // Make sure all screenshots for this batch get the selected category
    const screenshotsWithCategory = screenshots.map(s => ({
      ...s,
      screenCategoryId: categoryId
    }));
    
    // Pass the screenshots to the parent component
    onUpload(screenshotsWithCategory);
  };
  
  return (
    <div>
      <div className="mb-4">
        <h3 className="text-lg font-medium">Uploading to: {categoryName}</h3>
        {existingCategoryScreenshots.length > 0 && (
          <p className="text-sm text-gray-500 mt-1">
            {existingCategoryScreenshots.length} screenshots already uploaded for this category
          </p>
        )}
      </div>
      
      <StepScreenshotUpload 
        onUpload={handleUpload} 
        onBack={onBack} 
      />
    </div>
  );
};

export default StepBatchUpload;
