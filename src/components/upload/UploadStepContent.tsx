
import React from 'react';
import StepLinkInput from '@/components/upload/StepLinkInput';
import StepAppMetadata from '@/components/upload/StepAppMetadata';
import StepScreenshotUpload from '@/components/upload/StepScreenshotUpload';
import StepScreenTypeSelect from '@/components/upload/StepScreenTypeSelect';
import StepElementsSelect from '@/components/upload/StepElementsSelect';
import StepSubmit from '@/components/upload/StepSubmit';
import { App } from '@/types';
import { UploadScreenshot } from '@/types/upload';

interface UploadStepContentProps {
  step: number;
  appStoreLink: string;
  appMetadata: App | null;
  screenshots: UploadScreenshot[];
  currentScreenshotIndex: number;
  tagStep: 'category' | 'elements';
  isSubmitting: boolean;
  onAppLinkSubmit: (link: string) => void;
  onAppMetadataConfirm: (app: App, heroImages?: string[], heroVideos?: string[]) => void;
  onScreenshotsUpload: (newScreenshots: UploadScreenshot[]) => void;
  onScreenshotCategorySelect: (index: number, screenCategoryId: string) => void;
  onScreenshotElementsSelect: (index: number, uiElementIds: string[]) => void;
  onSubmit: () => void;
  onPrev: () => void;
}

const UploadStepContent: React.FC<UploadStepContentProps> = ({
  step,
  appStoreLink,
  appMetadata,
  screenshots,
  currentScreenshotIndex,
  tagStep,
  isSubmitting,
  onAppLinkSubmit,
  onAppMetadataConfirm,
  onScreenshotsUpload,
  onScreenshotCategorySelect,
  onScreenshotElementsSelect,
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
      
      {step === 4 && screenshots.length > 0 && tagStep === 'category' && (
        <StepScreenTypeSelect
          screenshot={screenshots[currentScreenshotIndex]}
          index={currentScreenshotIndex}
          totalCount={screenshots.length}
          onSelect={onScreenshotCategorySelect}
          onBack={onPrev}
        />
      )}

      {step === 4 && screenshots.length > 0 && tagStep === 'elements' && (
        <StepElementsSelect
          screenshot={screenshots[currentScreenshotIndex]}
          index={currentScreenshotIndex}
          totalCount={screenshots.length}
          onSelect={onScreenshotElementsSelect}
          onBack={() => onScreenshotCategorySelect(currentScreenshotIndex, screenshots[currentScreenshotIndex].screenCategoryId!)}
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
