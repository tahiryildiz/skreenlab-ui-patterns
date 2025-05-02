
import React, { useEffect, useRef } from 'react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import UploadProgress from '@/components/upload/UploadProgress';
import UploadStepContent from '@/components/upload/UploadStepContent';
import { useProUserCheck } from '@/hooks/useProUserCheck';
import { useUploadState } from '@/hooks/useUploadState';
import { useScreenshotUpload } from '@/hooks/useScreenshotUpload';

const Upload = () => {
  // Component mounted status tracking
  const isMounted = useRef(true);
  const hasInitializedRef = useRef(false);
  const preventRedirectRef = useRef(false);
  
  // User authentication and pro status check
  const { 
    user, 
    isLoading, 
    isProUser, 
    hasAuthChecked, 
    authCheckPerformedRef 
  } = useProUserCheck();
  
  // Upload state management
  const {
    step,
    appStoreLink,
    appMetadata,
    heroImages,
    heroVideos,
    screenshots,
    currentScreenshotIndex,
    tagStep,
    progressPercentage,
    handlePrevStep,
    handleAppLinkSubmit,
    handleAppMetadataConfirm,
    handleScreenshotsUpload,
    handleScreenshotCategorySelect,
    handleScreenshotElementsSelect,
    clearUploadState
  } = useUploadState();
  
  // Screenshot upload handling
  const { isSubmitting, uploadScreenshots } = useScreenshotUpload();

  // Critical: Set flag immediately on component mount to prevent redirects
  useEffect(() => {
    // Set this in a timeout to ensure it runs after any auth checks
    setTimeout(() => {
      if (isMounted.current) {
        preventRedirectRef.current = true;
        
        if (step > 1) {
          console.log('Setting upload in progress flag from Upload component mount');
          sessionStorage.setItem('uploadInProgress', 'true');
        }
      }
    }, 0);
  }, []);

  // Track component mount status
  useEffect(() => {
    isMounted.current = true;
    console.log('Upload page mounted');
    
    // Handle visibility change for this specific component
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && isMounted.current) {
        console.log('Upload page: Tab became visible');
        
        // Double-check that we have the upload in progress flag set
        // if we're past step 1
        if (step > 1) {
          console.log('Upload in progress, setting flag to prevent redirects');
          sessionStorage.setItem('uploadInProgress', 'true');
          preventRedirectRef.current = true;
        }
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      isMounted.current = false;
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      console.log('Upload page unmounted');
      
      // Don't reset the uploadInProgress flag when unmounting
      // This prevents issues when the component is remounted during tab switching
    };
  }, [step]);
  
  // Check for upload in progress on initial render and set flag
  useEffect(() => {
    if (!hasInitializedRef.current) {
      hasInitializedRef.current = true;
      
      // Initialize storedState variable to avoid repeated lookups
      const storedState = sessionStorage.getItem('uploadState');
      
      if (step > 1 || (storedState && JSON.parse(storedState).step > 1)) {
        console.log('Setting upload in progress flag on component initialize');
        sessionStorage.setItem('uploadInProgress', 'true');
        preventRedirectRef.current = true;
      }
    }
  }, [step]);
  
  const handleSubmit = () => {
    uploadScreenshots(screenshots, appMetadata, user, clearUploadState, heroImages, heroVideos);
  };

  // Loading state
  if (isLoading && !hasAuthChecked) {
    return <div className="min-h-screen flex items-center justify-center bg-white">Loading...</div>;
  }

  // Only redirect if:
  // 1. Not pro user
  // 2. Not loading
  // 3. Auth has been checked
  // 4. Auth check has been performed
  // 5. User exists
  // 6. No upload in progress
  // 7. Not preventing redirect
  const shouldRedirect = !isProUser && !isLoading && hasAuthChecked && 
                         authCheckPerformedRef.current && user && 
                         sessionStorage.getItem('uploadInProgress') !== 'true' &&
                         !preventRedirectRef.current;
  
  if (shouldRedirect) {
    console.log('Redirect condition met, redirecting to pricing...');
    return <div className="min-h-screen flex items-center justify-center bg-white">Redirecting to pricing...</div>;
  }

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />
      
      <main className="flex-1 container max-w-5xl mx-auto px-4 py-8">
        <UploadProgress 
          step={step} 
          progressValue={progressPercentage()} 
        />

        <UploadStepContent 
          step={step}
          appStoreLink={appStoreLink}
          appMetadata={appMetadata}
          screenshots={screenshots}
          currentScreenshotIndex={currentScreenshotIndex}
          tagStep={tagStep}
          isSubmitting={isSubmitting}
          onAppLinkSubmit={handleAppLinkSubmit}
          onAppMetadataConfirm={handleAppMetadataConfirm}
          onScreenshotsUpload={handleScreenshotsUpload}
          onScreenshotCategorySelect={handleScreenshotCategorySelect}
          onScreenshotElementsSelect={handleScreenshotElementsSelect}
          onSubmit={handleSubmit}
          onPrev={handlePrevStep}
        />
      </main>
      
      <Footer />
    </div>
  );
};

export default Upload;
