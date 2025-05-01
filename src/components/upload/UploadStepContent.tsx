
import React from 'react';
import StepLinkInput from '@/components/upload/StepLinkInput';
import StepAppMetadata from '@/components/upload/StepAppMetadata';
import StepScreenshotUpload from '@/components/upload/StepScreenshotUpload';
import StepTagScreenshots from '@/components/upload/StepTagScreenshots';
import StepSubmit from '@/components/upload/StepSubmit';
import { App } from '@/types';
import { UploadScreenshot } from '@/types/upload';

interface UploadStepContentProps {
  step: number;
  appStoreLink: string;
  appMetadata: App | null;
  screenshots: UploadScreenshot[];
  currentScreenshotIndex: number;
  isSubmitting: boolean;
  onAppLinkSubmit: (link: string) => void;
  onAppMetadataConfirm: (app: App) => void;
  onScreenshotsUpload: (newScreenshots: UploadScreenshot[]) => void;
  onScreenshotTag: (index: number, screenCategoryId: string, uiElementIds: string[]) => void;
  onSubmit: () => void;
  onPrev: () => void;
}

const UploadStepContent: React.FC<UploadStepContentProps> = ({
  step,
  appStoreLink,
  appMetadata,
  screenshots,
  currentScreenshotIndex,
  isSubmitting,
  onAppLinkSubmit,
  onAppMetadataConfirm,
  onScreenshotsUpload,
  onScreenshotTag,
  onSubmit,
  onPrev
}) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border p-6">
      {step === 1 && (
        <StepLinkInput onSubmit={onAppLinkSubmit} />
      )}
      
      {step === 2 && (
        <StepAppMetadata
          appStoreLink={appStoreLink}
          onConfirm={onAppMetadataConfirm}
          onBack={onPrev}
        />
      )}
      
      {step === 3 && (
        <StepScreenshotUpload
          onUpload={onScreenshotsUpload}
          onBack={onPrev}
        />
      )}
      
      {step === 4 && screenshots.length > 0 && (
        <StepTagScreenshots
          screenshot={screenshots[currentScreenshotIndex]}
          index={currentScreenshotIndex}
          totalCount={screenshots.length}
          onSubmit={onScreenshotTag}
          onBack={onPrev}
        />
      )}
      
      {step === 5 && (
        <StepSubmit
          screenshots={screenshots}
          appMetadata={appMetadata}
          onSubmit={onSubmit}
          onBack={onPrev}
          isSubmitting={isSubmitting}
        />
      )}
    </div>
  );
};

export default UploadStepContent;
