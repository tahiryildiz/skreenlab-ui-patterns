import { useState, useEffect, useRef } from 'react';
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
  
  // Refs for state management
  const hasRestoredStateRef = useRef(false);
  const mountedRef = useRef(true);
  const hasInitializedRef = useRef(false);
  const isRestoringRef = useRef(false);
  const visibilityChangeHandledRef = useRef(false);
  const stateLastSavedRef = useRef(0);
  
  // Additional defensive refs to prevent race conditions
  const isVisibilityChangeInProgressRef = useRef(false);
  const preventStateOverwriteRef = useRef(false);
  
  // Critical: Initialize with saved state immediately if available
  useEffect(() => {
    if (!hasInitializedRef.current && location.pathname === '/upload') {
      hasInitializedRef.current = true;
      
      // On initial mount, immediately try to restore state and set upload in progress
      const storedState = sessionStorage.getItem('uploadState');
      if (storedState && !hasRestoredStateRef.current) {
        console.log('Found saved upload state on initial mount, restoring immediately');
        restoreStateFromStorage();
        
        // Mark that we have an in-progress upload
        sessionStorage.setItem('uploadInProgress', 'true');
      } else {
        console.log('No saved upload state found, starting fresh');
        sessionStorage.removeItem('uploadInProgress');
      }
    }
  }, []);
  
  // Track component mount status
  useEffect(() => {
    mountedRef.current = true;
    console.log('Upload state component mounted');
    
    // Mark upload as in progress when component mounts if past step 1
    if (location.pathname === '/upload' && step > 1) {
      sessionStorage.setItem('uploadInProgress', 'true');
      console.log('Setting uploadInProgress flag to true on component mount');
    }
    
    return () => {
      mountedRef.current = false;
      console.log('Upload state component unmounted');
      
      // Critical: Don't clear upload in progress on unmount
      // This allows the flag to persist through remounts during tab switching
    };
  }, []);

  // Enhanced visibility change handler for more reliable state restoration
  useEffect(() => {
    const handleVisibilityChange = () => {
      // Guard against multiple visibility change events firing too quickly
      if (isVisibilityChangeInProgressRef.current) {
        console.log('Visibility change already in progress, skipping duplicate event');
        return;
      }
      
      // When page becomes visible again after being hidden
      if (document.visibilityState === 'visible' && mountedRef.current) {
        console.log('Page visible again, checking for saved state');
        isVisibilityChangeInProgressRef.current = true;
        
        // Prevent state overwrite during visibility change restoration
        preventStateOverwriteRef.current = true;
        
        // Set flag to prevent recursive state restoration
        if (!isRestoringRef.current && location.pathname === '/upload' && !visibilityChangeHandledRef.current) {
          visibilityChangeHandledRef.current = true;
          isRestoringRef.current = true;
          
          // Use setTimeout to ensure this runs after any auth checks
          setTimeout(() => {
            if (mountedRef.current) {
              // Check if we actually have state to restore
              const storedState = sessionStorage.getItem('uploadState');
              if (storedState && !hasRestoredStateRef.current) {
                restoreStateFromStorage();
                
                // Mark that we have an in-progress upload
                sessionStorage.setItem('uploadInProgress', 'true');
                sessionStorage.setItem('preventAuthRedirects', 'true');
              }
              
              isRestoringRef.current = false;
              
              // Reset the visibility change flags after a delay
              setTimeout(() => {
                visibilityChangeHandledRef.current = false;
                isVisibilityChangeInProgressRef.current = false;
                preventStateOverwriteRef.current = false;
              }, 300);
            }
          }, 100);
        }
      } else if (document.visibilityState === 'hidden') {
        // When page is hidden, immediately save current state
        if (step > 1 && location.pathname === '/upload') {
          saveUploadState();
        }
      }
    };
    
    // Register visibility change listener
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [location.pathname, step]);
  
  // Function to save state to sessionStorage
  const saveUploadState = () => {
    if (step > 1 && mountedRef.current) {
      try {
        // Skip save if a restoration is in progress or we're preventing overwrite
        if (isRestoringRef.current || preventStateOverwriteRef.current) {
          console.log('Skipping state save due to active restoration or overwrite prevention');
          return;
        }
        
        const currentTime = new Date().getTime();
        
        // Don't save state too frequently to prevent excessive writes
        if (currentTime - stateLastSavedRef.current < 100) {
          return;
        }
        
        stateLastSavedRef.current = currentTime;
        
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
          tagStep,
          timestamp: currentTime
        };
        
        sessionStorage.setItem('uploadState', JSON.stringify(stateToStore));
        sessionStorage.setItem('uploadInProgress', 'true');
        console.log('Upload state saved to sessionStorage', { step, timestamp: stateToStore.timestamp });
      } catch (error) {
        console.error('Error storing upload state:', error);
      }
    }
  };
  
  // Function to restore state from sessionStorage
  const restoreStateFromStorage = () => {
    try {
      const storedState = sessionStorage.getItem('uploadState');
      
      if (storedState && mountedRef.current) {
        const parsedState = JSON.parse(storedState);
        console.log('Restoring upload state from storage', { 
          step: parsedState.step,
          timestamp: parsedState.timestamp,
          timeElapsed: new Date().getTime() - (parsedState.timestamp || 0)
        });
        
        // Only restore state if we're on the upload page
        if (location.pathname === '/upload') {
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
          hasRestoredStateRef.current = true;
          
          // Re-mark that we have an upload in progress
          sessionStorage.setItem('uploadInProgress', 'true');
          sessionStorage.setItem('preventAuthRedirects', 'true');
        }
      }
    } catch (error) {
      console.error('Error retrieving upload state:', error);
    }
  };
  
  // Store the user's upload state in sessionStorage for persistence
  useEffect(() => {
    // Avoid saving during restoration or if we're preventing state overwrite
    if (isRestoringRef.current || preventStateOverwriteRef.current) return;
    
    // Only save state if we're mounted and past step 1
    if (mountedRef.current && step > 1 && hasInitializedRef.current) {
      saveUploadState();
    }
  }, [step, appStoreLink, appMetadata, heroImages, heroVideos, screenshots, currentScreenshotIndex, tagStep]);

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
    // Explicitly mark upload as in progress
    sessionStorage.setItem('uploadInProgress', 'true');
    sessionStorage.setItem('preventAuthRedirects', 'true');
  };

  // Handler for step 2: App metadata confirmation
  const handleAppMetadataConfirm = (app: App, selectedHeroImages?: string[], selectedHeroVideos?: string[]) => {
    setAppMetadata(app);
    setHeroImages(selectedHeroImages);
    setHeroVideos(selectedHeroVideos);
    setStep(3);
    sessionStorage.setItem('uploadInProgress', 'true');
    sessionStorage.setItem('preventAuthRedirects', 'true');
  };

  const handleScreenshotsUpload = (newScreenshots: UploadScreenshot[]) => {
    setScreenshots(newScreenshots);
    setCurrentScreenshotIndex(0);
    setTagStep('category');
    setStep(4);
    sessionStorage.setItem('uploadInProgress', 'true');
    sessionStorage.setItem('preventAuthRedirects', 'true');
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
    sessionStorage.setItem('uploadInProgress', 'true');
    sessionStorage.setItem('preventAuthRedirects', 'true');
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
    
    sessionStorage.setItem('uploadInProgress', 'true');
    sessionStorage.setItem('preventAuthRedirects', 'true');
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
    sessionStorage.removeItem('uploadInProgress');
    sessionStorage.removeItem('preventAuthRedirects');
    hasRestoredStateRef.current = false;
    hasInitializedRef.current = false;
    console.log('Upload state cleared from sessionStorage');
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
