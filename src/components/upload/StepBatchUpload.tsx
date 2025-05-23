
import React, { useState } from 'react';
import StepScreenshotUpload from './StepScreenshotUpload';
import type { UploadScreenshot } from '@/types/upload';

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
    // Just pass them to the parent component
    onUpload(screenshots);
  };
  
  return (
    <div>
      <StepScreenshotUpload 
        onUpload={handleUpload} 
        onBack={onBack} 
      />
    </div>
  );
};

export default StepBatchUpload;
