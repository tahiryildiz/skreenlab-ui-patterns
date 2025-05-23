
import React from 'react';
import StepLinkInput from '@/components/upload/StepLinkInput';
import StepAppMetadata from '@/components/upload/StepAppMetadata';
import StepCategorySelect from '@/components/upload/StepCategorySelect';
import StepBatchUpload from '@/components/upload/StepBatchUpload';
import StepElementsSelect from '@/components/upload/StepElementsSelect';
import StepSubmit from '@/components/upload/StepSubmit';
import { App } from '@/types';
import { UploadScreenshot } from '@/types/upload';
import { supabase } from '@/integrations/supabase/client';

interface UploadStepContentProps {
  step: number;
  appStoreLink: string;
  appMetadata: App | null;
  selectedCategory: string | null;
  screenshots: UploadScreenshot[];
  currentScreenshotIndex: number;
  tagStep: 'category' | 'elements';
  isSubmitting: boolean;
  onAppLinkSubmit: (link: string) => void;
  onAppMetadataConfirm: (app: App, heroImages?: string[], heroVideos?: string[]) => void;
  onCategorySelect: (categoryId: string) => void;
  onScreenshotsUpload: (newScreenshots: UploadScreenshot[]) => void;
  onScreenshotElementsSelect: (index: number, uiElementIds: string[]) => void;
  onChangeCategory: () => void;
  onSubmit: () => void;
  onPrev: () => void;
}

interface CategoryInfo {
  id: string;
  name: string;
}

const UploadStepContent: React.FC<UploadStepContentProps> = ({
  step,
  appStoreLink,
  appMetadata,
  selectedCategory,
  screenshots,
  currentScreenshotIndex,
  tagStep,
  isSubmitting,
  onAppLinkSubmit,
  onAppMetadataConfirm,
  onCategorySelect,
  onScreenshotsUpload,
  onScreenshotElementsSelect,
  onChangeCategory,
  onSubmit,
  onPrev
}) => {
  const [categoryInfo, setCategoryInfo] = React.useState<CategoryInfo | null>(null);

  // Fetch category info when selected category changes
  React.useEffect(() => {
    const fetchCategoryInfo = async () => {
      if (!selectedCategory) return;
      
      try {
        const { data, error } = await supabase
          .from('screen_categories')
          .select('id, name')
          .eq('id', selectedCategory)
          .single();
          
        if (error) throw error;
        if (data) {
          setCategoryInfo(data);
        }
      } catch (err) {
        console.error('Error fetching category info:', err);
      }
    };
    
    fetchCategoryInfo();
  }, [selectedCategory]);

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
        <StepCategorySelect
          onSelectCategory={onCategorySelect}
          onBack={onPrev}
        />
      )}
      
      {step === 4 && selectedCategory && categoryInfo && (
        <StepBatchUpload
          categoryId={selectedCategory}
          categoryName={categoryInfo.name}
          existingScreenshots={screenshots}
          onUpload={onScreenshotsUpload}
          onChangeCategory={onChangeCategory}
          onTagScreenshots={() => {}}
          onBack={onPrev}
        />
      )}

      {step === 4 && screenshots.length > 0 && tagStep === 'elements' && currentScreenshotIndex < screenshots.length && (
        <StepElementsSelect
          screenshot={screenshots[currentScreenshotIndex]}
          index={currentScreenshotIndex}
          totalCount={screenshots.length}
          onSelect={onScreenshotElementsSelect}
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
