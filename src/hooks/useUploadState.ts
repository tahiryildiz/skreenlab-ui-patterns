import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { App } from '@/types';
import { UploadScreenshot } from '@/types/upload';

export function useUploadState() {
  const location = useLocation();
  const [step, setStep] = useState(1);
  const [appStoreLink, setAppStoreLink] = useState<string>('');
  const [appMetadata, setAppMetadata] = useState<App | null>(null);
  const [heroImages, setHeroImages] = useState<string[] | undefined>(undefined);
  const [heroVideos, setHeroVideos] = useState<string[] | undefined>(undefined);
  const [screenshots, setScreenshots] = useState<UploadScreenshot[]>([]);
  const [currentScreenshotIndex, setCurrentScreenshotIndex] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [tagStep, setTagStep] = useState<'category' | 'elements'>('category');
  
  // Store the user's upload state in sessionStorage for persistence
  useEffect(() => {
    // Save current upload state to sessionStorage whenever it changes
    const saveUploadState = () => {
      if (step > 1) {
        try {
          const stateToStore = {
            step,
            appStoreLink,
            appMetadata,
            heroImages,
            heroVideos,
            screenshots: screenshots.map(s => ({
              dataUrl: s.dataUrl,
              screenCategoryId: s.screenCategoryId,
              uiElementIds: s.uiElementIds,
              fileName: s.file?.name || 'screenshot.png',
              fileType: s.file?.type || 'image/png',
              fileSize: s.file?.size || 0,
              hasFile: !!s.file
            })),
            currentScreenshotIndex,
            tagStep
          };
          sessionStorage.setItem('uploadState', JSON.stringify(stateToStore));
          console.log('Upload state saved to sessionStorage');
        } catch (error) {
          console.error('Error storing upload state:', error);
        }
      }
    };

    // Save state when component updates
    saveUploadState();
  }, [step, appStoreLink, appMetadata, heroImages, heroVideos, screenshots, currentScreenshotIndex, tagStep]);
  
  // Restore upload state from sessionStorage when returning to the page
  useEffect(() => {
    // This effect should run only once when the component mounts
    try {
      const storedState = sessionStorage.getItem('uploadState');
      if (storedState) {
        const parsedState = JSON.parse(storedState);
        setStep(parsedState.step || 1);
        setAppStoreLink(parsedState.appStoreLink || '');
        setAppMetadata(parsedState.appMetadata || null);
        setHeroImages(parsedState.heroImages || undefined);
        setHeroVideos(parsedState.heroVideos || undefined);
        
        // Restore screenshots with reconstructed File objects
        if (parsedState.screenshots && Array.isArray(parsedState.screenshots)) {
          const restoredScreenshots = parsedState.screenshots.map((s: any) => {
            // Create a new object with the saved properties
            let screenshot: UploadScreenshot = {
              dataUrl: s.dataUrl,
              screenCategoryId: s.screenCategoryId || null,
              uiElementIds: s.uiElementIds || [],
              file: null as any // We'll try to reconstruct this below
            };
            
            // Try to reconstruct a File object from the dataUrl if possible
            if (s.dataUrl && s.fileName) {
              try {
                // Convert data URL to blob
                const arr = s.dataUrl.split(',');
                const mime = arr[0].match(/:(.*?);/)[1];
                const bstr = atob(arr[1]);
                let n = bstr.length;
                const u8arr = new Uint8Array(n);
                while (n--) {
                  u8arr[n] = bstr.charCodeAt(n);
                }
                
                // Create File object from blob
                const blob = new Blob([u8arr], { type: mime });
                screenshot.file = new File([blob], s.fileName, { type: s.fileType || mime });
              } catch (error) {
                console.error('Error reconstructing File from dataUrl:', error);
              }
            }
            
            return screenshot;
          });
          
          setScreenshots(restoredScreenshots);
        } else {
          setScreenshots([]);
        }
        
        setCurrentScreenshotIndex(parsedState.currentScreenshotIndex || 0);
        setTagStep(parsedState.tagStep || 'category');
        
        console.log('Successfully restored upload state from sessionStorage');
      }
    } catch (error) {
      console.error('Error retrieving upload state:', error);
    }
  }, []);

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

  // Handler for step 1: App Store or Play Store link submission
  const handleAppLinkSubmit = (link: string) => {
    setAppStoreLink(link);
    setStep(2);
  };

  // Handler for step 2: App metadata confirmation
  const handleAppMetadataConfirm = (app: App, selectedHeroImages?: string[], selectedHeroVideos?: string[]) => {
    setAppMetadata(app);
    setHeroImages(selectedHeroImages);
    setHeroVideos(selectedHeroVideos);
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

  // Clear all upload state
  const clearUploadState = () => {
    setStep(1);
    setAppStoreLink('');
    setAppMetadata(null);
    setHeroImages(undefined);
    setHeroVideos(undefined);
    setScreenshots([]);
    setCurrentScreenshotIndex(0);
    setTagStep('category');
    sessionStorage.removeItem('uploadState');
  };

  return {
    step,
    appStoreLink,
    appMetadata,
    heroImages,
    heroVideos,
    screenshots,
    currentScreenshotIndex,
    tagStep,
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
