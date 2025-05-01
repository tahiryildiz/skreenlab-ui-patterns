
import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { App } from '@/types';
import { UploadScreenshot } from '@/types/upload';

export function useUploadState() {
  const location = useLocation();
  const [step, setStep] = useState(1);
  const [appStoreLink, setAppStoreLink] = useState('');
  const [appMetadata, setAppMetadata] = useState<App | null>(null);
  const [heroImages, setHeroImages] = useState<string[]>([]);
  const [screenshots, setScreenshots] = useState<UploadScreenshot[]>([]);
  const [currentScreenshotIndex, setCurrentScreenshotIndex] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [tagStep, setTagStep] = useState<'category' | 'elements'>('category');
  
  // Store the user's upload state in sessionStorage for persistence
  useEffect(() => {
    // Save current upload state to sessionStorage
    const saveUploadState = () => {
      if (step > 1) {
        try {
          const stateToStore = {
            step,
            appStoreLink,
            appMetadata,
            heroImages,
            currentScreenshotIndex,
            tagStep
          };
          sessionStorage.setItem('uploadState', JSON.stringify(stateToStore));
        } catch (error) {
          console.error('Error storing upload state:', error);
        }
      }
    };

    // Save state when component updates
    saveUploadState();
  }, [step, appStoreLink, appMetadata, heroImages, currentScreenshotIndex, tagStep]);
  
  // Restore upload state from sessionStorage when returning to the page
  useEffect(() => {
    if (location.pathname === '/upload') {
      try {
        const storedState = sessionStorage.getItem('uploadState');
        if (storedState) {
          const parsedState = JSON.parse(storedState);
          setStep(parsedState.step || 1);
          setAppStoreLink(parsedState.appStoreLink || '');
          setAppMetadata(parsedState.appMetadata || null);
          setHeroImages(parsedState.heroImages || []);
          setCurrentScreenshotIndex(parsedState.currentScreenshotIndex || 0);
          setTagStep(parsedState.tagStep || 'category');
        }
      } catch (error) {
        console.error('Error retrieving upload state:', error);
      }
    }
  }, [location.pathname]);

  // Calculate progress percentage based on current step
  const progressPercentage = () => {
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

  const handleAppLinkSubmit = (link: string) => {
    setAppStoreLink(link);
    setStep(2);
  };

  const handleAppMetadataConfirm = (app: App, selectedHeroImages?: string[]) => {
    setAppMetadata(app);
    if (selectedHeroImages && selectedHeroImages.length > 0) {
      setHeroImages(selectedHeroImages);
    }
    setStep(3);
  };

  const handleScreenshotsUpload = (newScreenshots: UploadScreenshot[]) => {
    setScreenshots(newScreenshots);
    setCurrentScreenshotIndex(0);
    setTagStep('category');
    setStep(4);
  };

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
    
    if (index === screenshots.length - 1) {
      setStep(5);
    } else {
      setCurrentScreenshotIndex(prev => prev + 1);
      setTagStep('category');
    }
  };

  const clearUploadState = () => {
    sessionStorage.removeItem('currentUploadPath');
    sessionStorage.removeItem('uploadState');
    sessionStorage.removeItem('uploadedScreenshots');
  };

  return {
    step,
    appStoreLink,
    appMetadata,
    heroImages,
    screenshots,
    currentScreenshotIndex,
    tagStep,
    isSubmitting,
    setIsSubmitting,
    progressPercentage,
    handleNextStep,
    handlePrevStep,
    handleAppLinkSubmit,
    handleAppMetadataConfirm,
    handleScreenshotsUpload,
    handleScreenshotCategorySelect,
    handleScreenshotElementsSelect,
    clearUploadState
  };
}
