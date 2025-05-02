
import React from 'react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import UploadProgress from '@/components/upload/UploadProgress';
import UploadStepContent from '@/components/upload/UploadStepContent';
import { useProUserCheck } from '@/hooks/useProUserCheck';
import { useUploadState } from '@/hooks/useUploadState';
import { useScreenshotUpload } from '@/hooks/useScreenshotUpload';

const Upload = () => {
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
  
  // No visibilitychange event listeners are added here
  // We're relying entirely on sessionStorage for state persistence
  
  const handleSubmit = () => {
    uploadScreenshots(screenshots, appMetadata, user, clearUploadState, heroImages, heroVideos);
  };

  // Loading state
  if (isLoading && !hasAuthChecked) {
    return <div className="min-h-screen flex items-center justify-center bg-white">Loading...</div>;
  }

  // Redirect if not pro user
  if (!isProUser && !isLoading && hasAuthChecked && authCheckPerformedRef.current && user) {
    return null; // Will be redirected by useEffect
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
