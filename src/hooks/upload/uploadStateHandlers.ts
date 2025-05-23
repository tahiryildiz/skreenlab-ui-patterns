
import { App } from "@/types";
import { UploadScreenshot } from "@/types/upload";
import { setUploadInProgress } from "./uploadStorageUtils";
import { UploadStep, TagStep } from "./uploadStateTypes";

export const createUploadStateHandlers = (
  setStep: (value: React.SetStateAction<UploadStep>) => void,
  setAppStoreLink: (value: string) => void,
  setAppMetadata: (value: App | null) => void,
  setHeroImages: (value: string[] | undefined) => void,
  setHeroVideos: (value: string[] | undefined) => void,
  setScreenshots: (value: React.SetStateAction<UploadScreenshot[]>) => void,
  setCurrentScreenshotIndex: (value: React.SetStateAction<number>) => void,
  setTagStep: (value: React.SetStateAction<TagStep>) => void,
  setSelectedCategory: (value: string | null) => void,
  clearUploadState: () => void
) => {
  // Calculate progress percentage based on current step
  const progressPercentage = (step: number, screenshots: UploadScreenshot[]) => {
    if (step === 5) return 100;
    if (step === 4) {
      // Fix: Use screenshots.length instead of applying .length to a number
      const taggedCount = screenshots.filter(s => s.screenCategoryId && s.uiElementIds.length > 0).length;
      return Math.min(75 + ((taggedCount / screenshots.length) * 25), 99);
    }
    return (step - 1) * 25;
  };

  const handleNextStep = () => {
    setStep(prev => {
      // Ensure we cast the result to UploadStep
      const nextStep = (prev + 1) as UploadStep;
      return nextStep <= 5 ? nextStep : prev;
    });
  };

  const handlePrevStep = () => {
    setStep(prev => {
      // Ensure we cast the result to UploadStep
      const prevStep = (prev - 1) as UploadStep;
      return prevStep >= 1 ? prevStep : prev;
    });
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

  // Handler for step 3: Category selection
  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategory(categoryId);
    setStep(4);
    setUploadInProgress();
  };

  const handleScreenshotsUpload = (newScreenshots: UploadScreenshot[]) => {
    if (!selectedCategory) {
      console.error("No category selected for screenshots");
      return;
    }
    
    // Assign the selected category to all new screenshots
    const screenshotsWithCategory = newScreenshots.map(screenshot => ({
      ...screenshot,
      screenCategoryId: selectedCategory
    }));
    
    // Important: Accumulate screenshots rather than replacing them
    setScreenshots(prevScreenshots => [...prevScreenshots, ...screenshotsWithCategory]);
    
    // Set current index to the length of previous screenshots
    // This way we start tagging from the first new screenshot
    setCurrentScreenshotIndex(prevScreenshots => prevScreenshots.length);
    
    setTagStep('elements');
    setUploadInProgress();
  };

  // Screenshot handling
  const handleScreenshotElementsSelect = (
    index: number,
    uiElementIds: string[]
  ) => {
    setScreenshots(prev => {
      const updated = [...prev];
      if (index >= 0 && index < updated.length) {
        updated[index] = {
          ...updated[index],
          uiElementIds
        };
      }
      
      // Check if this is the last screenshot
      if (index === updated.length - 1) {
        // Move to final step if all screenshots are tagged
        setStep(5);
      } else {
        // Move to next screenshot
        setCurrentScreenshotIndex(index + 1);
      }
      
      return updated;
    });
    
    setUploadInProgress();
  };

  // Handler to change category and upload more screenshots
  const handleChangeCategory = () => {
    setSelectedCategory(null);
    setStep(3);
    setUploadInProgress();
  };

  return {
    progressPercentage,
    handleNextStep,
    handlePrevStep,
    handleAppLinkSubmit,
    handleAppMetadataConfirm,
    handleCategorySelect,
    handleScreenshotsUpload,
    handleScreenshotElementsSelect,
    handleChangeCategory
  };
};
