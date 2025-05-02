
import React, { useEffect, useRef } from 'react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import UploadProgress from '@/components/upload/UploadProgress';
import UploadStepContent from '@/components/upload/UploadStepContent';
import { useProUserCheck } from '@/hooks/useProUserCheck';
import { useUploadState } from '@/hooks/useUploadState';
import { useScreenshotUpload } from '@/hooks/useScreenshotUpload';

const Upload = () => {
  // Component mounted status tracking with aggressive redirect prevention
  const isMounted = useRef(true);
  const hasInitializedRef = useRef(false);
  const preventRedirectRef = useRef(false);
  const freshLoadRef = useRef(true); // Track if this is a fresh page load
  
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

  // Clear session storage when component mounts from a fresh page load
  // This helps prevent previous uploads from being remembered
  useEffect(() => {
    // Check if this is a fresh navigation from another page (not tab switching)
    if (freshLoadRef.current) {
      // Use small delay to ensure this happens after any state restoration attempts
      const timer = setTimeout(() => {
        console.log('Fresh load of Upload page - clearing upload state');
        clearUploadState();
        sessionStorage.removeItem('uploadState');
        sessionStorage.removeItem('uploadInProgress');
        sessionStorage.removeItem('preventAuthRedirects');
        sessionStorage.removeItem('tempScreenshots');
        sessionStorage.removeItem('currentUploadPath');
      }, 50);
      
      freshLoadRef.current = false;
      return () => clearTimeout(timer);
    }
  }, [clearUploadState]);

  // CRITICAL: Set flags immediately on component mount to prevent redirects
  // This runs before any other effects
  useEffect(() => {
    // Set this synchronously before any async operations
    preventRedirectRef.current = true;
    
    // Immediate setup to prevent redirect race conditions
    sessionStorage.setItem('currentUploadPath', '/upload');
    
    // If we're past step 1, mark upload as in-progress
    if (step > 1) {
      console.log('Setting upload in progress flag from Upload component mount');
      sessionStorage.setItem('uploadInProgress', 'true');
      sessionStorage.setItem('preventAuthRedirects', 'true');
    }
    
    // Setup of aggressive visibility change handling
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && isMounted.current) {
        console.log('Upload page: Tab became visible');
        
        // Forces flags set on ANY tab visibility change
        preventRedirectRef.current = true;
        sessionStorage.setItem('preventAuthRedirects', 'true');
        
        // If we're past step 1 or have any screenshots, mark upload as in-progress
        if (step > 1 || screenshots.length > 0) {
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
      
      // Don't reset the uploadInProgress flag when unmounting
      // This prevents issues when the component is remounted during tab switching
    };
  }, [step, screenshots.length]);
  
  // Additional effect to ensure we have the upload in progress flag set
  useEffect(() => {
    if (!hasInitializedRef.current) {
      hasInitializedRef.current = true;
      
      if (step > 1) {
        console.log('Setting upload in progress flag on component initialize');
        sessionStorage.setItem('uploadInProgress', 'true');
        sessionStorage.setItem('preventAuthRedirects', 'true');
        preventRedirectRef.current = true;
      }
    }
    
    // Aggressively set flag whenever step changes to anything past 1
    if (step > 1) {
      sessionStorage.setItem('uploadInProgress', 'true');
      sessionStorage.setItem('preventAuthRedirects', 'true');
      preventRedirectRef.current = true;
    }
  }, [step]);
  
  const handleSubmit = () => {
    uploadScreenshots(screenshots, appMetadata, user, clearUploadState, heroImages, heroVideos);
  };

  // Loading state
  if (isLoading && !hasAuthChecked) {
    return <div className="min-h-screen flex items-center justify-center bg-white">Loading...</div>;
  }

  // CRITICAL: More restrictive redirect condition
  // Only redirect if ALL these conditions are met
  const shouldRedirect = 
    !isProUser && 
    !isLoading && 
    hasAuthChecked && 
    authCheckPerformedRef.current && 
    user && 
    sessionStorage.getItem('uploadInProgress') !== 'true' &&
    sessionStorage.getItem('preventAuthRedirects') !== 'true' &&
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
