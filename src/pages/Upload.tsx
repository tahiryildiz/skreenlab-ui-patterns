
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

  // Track component mount status
  useEffect(() => {
    isMounted.current = true;
    console.log('Upload page mounted');
    
    // Handle visibility change for this specific component
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && isMounted.current) {
        console.log('Upload page: Tab became visible');
        
        // Prevent any unwanted redirects by explicitly marking upload in progress
        if (step > 1) {
          console.log('Upload in progress, setting flag to prevent redirects');
          sessionStorage.setItem('uploadInProgress', 'true');
        }
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      isMounted.current = false;
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      console.log('Upload page unmounted');
    };
  }, [step]);
  
  // Check for upload in progress on initial render and set flag
  useEffect(() => {
    if (!hasInitializedRef.current) {
      hasInitializedRef.current = true;
      
      if (step > 1) {
        console.log('Upload already in progress, setting flag');
        sessionStorage.setItem('uploadInProgress', 'true');
      } else {
        // Check if we have stored state
        const storedState = sessionStorage.getItem('uploadState');
        if (storedState) {
          try {
            const parsed = JSON.parse(storedState);
            if (parsed.step > 1) {
              console.log('Found saved state with step > 1, setting flag');
              sessionStorage.setItem('uploadInProgress', 'true');
            }
          } catch (e) {
            console.error('Error parsing stored state', e);
          }
        }
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

  // After auth check, only redirect if not pro user AND there's no upload in progress
  // This prevents unwanted redirects when returning from tab switches
  const shouldRedirect = !isProUser && !isLoading && hasAuthChecked && 
                         authCheckPerformedRef.current && user && 
                         sessionStorage.getItem('uploadInProgress') !== 'true';
  
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
