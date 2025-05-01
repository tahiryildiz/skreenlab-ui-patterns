
import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { App } from '@/types';
import { UploadScreenshot } from '@/types/upload';

export function useUploadState() {
  const location = useLocation();
  const [step, setStep] = useState(1);
  const [appStoreLink, setAppStoreLink] = useState('');
  const [appMetadata, setAppMetadata] = useState<App | null>(null);
  const [screenshots, setScreenshots] = useState<UploadScreenshot[]>([]);
  const [currentScreenshotIndex, setCurrentScreenshotIndex] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
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
            currentScreenshotIndex
          };
          sessionStorage.setItem('uploadState', JSON.stringify(stateToStore));
        } catch (error) {
          console.error('Error storing upload state:', error);
        }
      }
    };

    // Save state when component updates
    saveUploadState();
  }, [step, appStoreLink, appMetadata, currentScreenshotIndex]);
  
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
          setCurrentScreenshotIndex(parsedState.currentScreenshotIndex || 0);
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

  const handleAppMetadataConfirm = (app: App) => {
    setAppMetadata(app);
    setStep(3);
  };

  const handleScreenshotsUpload = (newScreenshots: UploadScreenshot[]) => {
    setScreenshots(newScreenshots);
    setCurrentScreenshotIndex(0);
    setStep(4);
  };

  const handleScreenshotTag = (
    index: number, 
    screenCategoryId: string, 
    uiElementIds: string[]
  ) => {
    setScreenshots(prev => {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        screenCategoryId,
        uiElementIds
      };
      return updated;
    });
    
    if (index === screenshots.length - 1) {
      setStep(5);
    } else {
      setCurrentScreenshotIndex(index + 1);
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
    screenshots,
    currentScreenshotIndex,
    isSubmitting,
    setIsSubmitting,
    progressPercentage,
    handleNextStep,
    handlePrevStep,
    handleAppLinkSubmit,
    handleAppMetadataConfirm,
    handleScreenshotsUpload,
    handleScreenshotTag,
    clearUploadState
  };
}
