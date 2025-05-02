
import { App } from "@/types";
import { UploadScreenshot } from "@/types/upload";
import { setUploadInProgress } from "./uploadStorageUtils";

export const createUploadStateHandlers = (
  setStep: (value: React.SetStateAction<number>) => void,
  setAppStoreLink: (value: string) => void,
  setAppMetadata: (value: App | null) => void,
  setHeroImages: (value: string[] | undefined) => void,
  setHeroVideos: (value: string[] | undefined) => void,
  setScreenshots: (value: React.SetStateAction<UploadScreenshot[]>) => void,
  setCurrentScreenshotIndex: (value: React.SetStateAction<number>) => void,
  setTagStep: (value: React.SetStateAction<'category' | 'elements'>) => void,
  clearUploadState: () => void
) => {
  // Calculate progress percentage based on current step
  const progressPercentage = (step: number, screenshots: UploadScreenshot[]) => {
    if (step === 5) return 100;
    if (step === 4) {
      const taggedCount = screenshots.filter(s => s.screenCategoryId && s.uiElementIds.length > 0).length;
      return Math.min(75 + ((taggedCount / screenshots.length) * 25), 99);
    }
    return (step - 1) * 25;
  };

  const handleNextStep = () => {
    setStep(prev => prev + 1);
  };

  const handlePrevStep = () => {
    setStep(prev => Math.max(prev - 1, 1));
  };

  // Handler for step 1: App Store or Play Store link submission
  const handleAppLinkSubmit = (link: string) => {
    setAppStoreLink(link);
    setStep(2);
    // Explicitly mark upload as in progress
    setUploadInProgress();
  };

  // Handler for step 2: App metadata confirmation
  const handleAppMetadataConfirm = (app: App, selectedHeroImages?: string[], selectedHeroVideos?: string[]) => {
    setAppMetadata(app);
    setHeroImages(selectedHeroImages);
    setHeroVideos(selectedHeroVideos);
    setStep(3);
    setUploadInProgress();
  };

  const handleScreenshotsUpload = (newScreenshots: UploadScreenshot[]) => {
    setScreenshots(newScreenshots);
    setCurrentScreenshotIndex(0);
    setTagStep('category');
    setStep(4);
    setUploadInProgress();
  };

  // Screenshot handling
  const handleScreenshotCategorySelect = (
    index: number, 
    screenCategoryId: string
  ) => {
    setScreenshots(prev => {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        screenCategoryId
      };
      return updated;
    });
    
    setTagStep('elements');
    setUploadInProgress();
  };

  const handleScreenshotElementsSelect = (
    index: number,
    uiElementIds: string[]
  ) => {
    setScreenshots(prev => {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        uiElementIds
      };
      return updated;
    });
    
    // Fixed bug: Ensure we check against screenshots.length - 1
    setScreenshots(screenshots => {
      if (index === screenshots.length - 1) {
        setStep(5);
      } else {
        setCurrentScreenshotIndex(prev => prev + 1);
        setTagStep('category');
      }
      return screenshots;
    });
    
    setUploadInProgress();
  };

  return {
    progressPercentage,
    handleNextStep,
    handlePrevStep,
    handleAppLinkSubmit,
    handleAppMetadataConfirm,
    handleScreenshotsUpload,
    handleScreenshotCategorySelect,
    handleScreenshotElementsSelect
  };
};
