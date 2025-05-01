
import React from 'react';
import { Progress } from '@/components/ui/progress';

interface UploadProgressProps {
  step: number;
  progressValue: number;
}

const UploadProgress: React.FC<UploadProgressProps> = ({ step, progressValue }) => {
  return (
    <div className="mb-8">
      <h1 className="text-3xl font-bold mb-2">Upload Screenshots</h1>
      <Progress value={progressValue} className="h-2" />
      <div className="flex justify-between mt-2 text-sm text-gray-500">
        <span>Step {step} of 5</span>
        <span>{Math.floor(progressValue)}% Complete</span>
      </div>
    </div>
  );
};

export default UploadProgress;
