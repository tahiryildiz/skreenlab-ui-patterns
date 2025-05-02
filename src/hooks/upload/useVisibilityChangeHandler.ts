
import { useEffect } from "react";
import { restoreStateFromStorage } from "./uploadStorageUtils";
import { UploadStep, TagStep } from "./uploadStateTypes";

export function useVisibilityChangeHandler(
  location: { pathname: string },
  step: number,
  mountedRef: React.MutableRefObject<boolean>,
  isRestoringRef: React.MutableRefObject<boolean>,
  visibilityChangeHandledRef: React.MutableRefObject<boolean>,
  hasRestoredStateRef: React.MutableRefObject<boolean>, 
  isVisibilityChangeInProgressRef: React.MutableRefObject<boolean>,
  preventStateOverwriteRef: React.MutableRefObject<boolean>,
  saveUploadState: () => void,
  setStep: (step: UploadStep) => void,
  setAppStoreLink: (link: string) => void,
  setAppMetadata: (metadata: any) => void,
  setHeroImages: (images: string[] | undefined) => void,
  setHeroVideos: (videos: string[] | undefined) => void,
  setScreenshots: (screenshots: any[]) => void,
  setCurrentScreenshotIndex: (index: number) => void,
  setTagStep: (step: TagStep) => void
) {
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
              const restored = restoreStateFromStorage(
                location,
                setStep,
                setAppStoreLink,
                setAppMetadata,
                setHeroImages,
                setHeroVideos,
                setScreenshots,
                setCurrentScreenshotIndex,
                setTagStep,
                mountedRef,
                hasRestoredStateRef
              );
              
              if (restored) {
                hasRestoredStateRef.current = true;
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
}
