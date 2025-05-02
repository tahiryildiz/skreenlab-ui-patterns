
import { UploadScreenshot } from '@/types/upload';
import { SerializedScreenshot, SerializedUploadState, UploadState, UploadStep, TagStep } from './uploadStateTypes';

// Save upload state to session storage
export const saveUploadState = (
  state: UploadState,
  stateLastSavedRef: React.MutableRefObject<number>,
  isRestoringRef: React.MutableRefObject<boolean>,
  preventStateOverwriteRef: React.MutableRefObject<boolean>,
  mountedRef: React.MutableRefObject<boolean>
): void => {
  if (state.step > 1 && mountedRef.current) {
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
      
      const stateToStore: SerializedUploadState = {
        ...state,
        screenshots: state.screenshots.map(s => ({
          dataUrl: s.dataUrl,
          screenCategoryId: s.screenCategoryId,
          uiElementIds: s.uiElementIds,
          fileName: s.file?.name || 'screenshot.png',
          fileType: s.file?.type || 'image/png',
          fileSize: s.file?.size || 0,
          hasFile: !!s.file
        })),
        timestamp: currentTime
      };
      
      sessionStorage.setItem('uploadState', JSON.stringify(stateToStore));
      sessionStorage.setItem('uploadInProgress', 'true');
      console.log('Upload state saved to sessionStorage', { step: state.step, timestamp: stateToStore.timestamp });
    } catch (error) {
      console.error('Error storing upload state:', error);
    }
  }
};

// Restore state from session storage
export const restoreStateFromStorage = (
  location: { pathname: string },
  setStep: (step: UploadStep) => void,
  setAppStoreLink: (link: string) => void,
  setAppMetadata: (metadata: any) => void,
  setHeroImages: (images: string[] | undefined) => void,
  setHeroVideos: (videos: string[] | undefined) => void,
  setScreenshots: (screenshots: UploadScreenshot[]) => void,
  setCurrentScreenshotIndex: (index: number) => void,
  setTagStep: (step: TagStep) => void,
  mountedRef: React.MutableRefObject<boolean>,
  hasRestoredStateRef: React.MutableRefObject<boolean>
): boolean => {
  try {
    const storedState = sessionStorage.getItem('uploadState');
    
    if (storedState && mountedRef.current) {
      const parsedState: SerializedUploadState = JSON.parse(storedState);
      console.log('Restoring upload state from storage', { 
        step: parsedState.step,
        timestamp: parsedState.timestamp,
        timeElapsed: new Date().getTime() - (parsedState.timestamp || 0)
      });
      
      // Only restore state if we're on the upload page
      if (location.pathname === '/upload') {
        setStep(parsedState.step as UploadStep || 1);
        setAppStoreLink(parsedState.appStoreLink || '');
        setAppMetadata(parsedState.appMetadata || null);
        setHeroImages(parsedState.heroImages || undefined);
        setHeroVideos(parsedState.heroVideos || undefined);
        
        // Restore screenshots with reconstructed File objects
        if (parsedState.screenshots && Array.isArray(parsedState.screenshots)) {
          const restoredScreenshots = parsedState.screenshots.map((s: SerializedScreenshot) => {
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
                const mime = arr[0].match(/:(.*?);/)![1];
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
        setTagStep(parsedState.tagStep as TagStep || 'category');
        
        console.log('Successfully restored upload state from sessionStorage');
        
        // Re-mark that we have an upload in progress
        sessionStorage.setItem('uploadInProgress', 'true');
        sessionStorage.setItem('preventAuthRedirects', 'true');
        
        return true;
      }
    }
    return false;
  } catch (error) {
    console.error('Error retrieving upload state:', error);
    return false;
  }
};

// Clear all upload state from session storage
export const clearUploadStateFromStorage = (): void => {
  sessionStorage.removeItem('uploadState');
  sessionStorage.removeItem('uploadInProgress');
  sessionStorage.removeItem('preventAuthRedirects');
  sessionStorage.removeItem('tempScreenshots');
  sessionStorage.removeItem('currentUploadPath');
  console.log('Upload state cleared from sessionStorage');
};

// Set upload in progress flags
export const setUploadInProgress = (): void => {
  sessionStorage.setItem('uploadInProgress', 'true');
  sessionStorage.setItem('preventAuthRedirects', 'true');
};
