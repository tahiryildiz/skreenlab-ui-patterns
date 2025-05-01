
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, Upload, CheckCircle } from 'lucide-react';
import type { App } from '@/types';
import type { UploadScreenshot } from '@/pages/Upload';

interface StepSubmitProps {
  screenshots: UploadScreenshot[];
  appMetadata: App | null;
  onSubmit: () => void;
  onBack: () => void;
  isSubmitting: boolean;
}

const StepSubmit: React.FC<StepSubmitProps> = ({ 
  screenshots, 
  appMetadata,
  onSubmit,
  onBack,
  isSubmitting
}) => {
  const getTaggedCount = () => {
    return screenshots.filter(s => 
      s.screenCategoryId && s.uiElementIds.length > 0
    ).length;
  };
  
  return (
    <Card className="border-0 shadow-none">
      <CardContent className="pt-6">
        <div className="mb-6 text-center">
          <div className="bg-primary/10 inline-flex rounded-full p-3 mb-4">
            <Upload className="h-6 w-6 text-primary" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Ready to Upload</h2>
          <p className="text-gray-500">
            Review your submission before uploading
          </p>
        </div>
        
        <div className="space-y-6">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-medium mb-2">Summary</h3>
            <ul className="space-y-2 text-sm">
              <li className="flex justify-between">
                <span className="text-gray-600">App:</span>
                <span className="font-medium">{appMetadata?.name || 'Unknown'}</span>
              </li>
              <li className="flex justify-between">
                <span className="text-gray-600">Platform:</span>
                <span className="font-medium">{appMetadata?.platform || 'Unknown'}</span>
              </li>
              <li className="flex justify-between">
                <span className="text-gray-600">Screenshots:</span>
                <span className="font-medium">{screenshots.length}</span>
              </li>
              <li className="flex justify-between">
                <span className="text-gray-600">Tagged:</span>
                <span className="font-medium">{getTaggedCount()}/{screenshots.length}</span>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-medium mb-3">Screenshots</h3>
            <div className="grid grid-cols-4 sm:grid-cols-6 gap-3">
              {screenshots.map((screenshot, index) => (
                <div key={index} className="relative rounded-lg overflow-hidden border aspect-square">
                  <img 
                    src={screenshot.dataUrl} 
                    alt={`Screenshot ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                  {screenshot.screenCategoryId && (
                    <div className="absolute top-1 right-1">
                      <CheckCircle className="h-4 w-4 text-primary bg-white rounded-full" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
          
          <div className="text-center pt-4">
            <p className="text-sm text-gray-500 mb-6">
              By submitting, you confirm these screenshots don't contain sensitive/private information
              and that you have the right to share them.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                variant="outline"
                onClick={onBack}
                className="flex-1"
                disabled={isSubmitting}
              >
                Back
              </Button>
              <Button 
                onClick={onSubmit}
                className="flex-1"
                disabled={isSubmitting || getTaggedCount() < screenshots.length}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  'Upload Screenshots'
                )}
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default StepSubmit;
