
import { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { App } from '@/types';
import { UploadScreenshot } from '@/types/upload';
import { clearUploadStateFromStorage, restoreStateFromStorage, saveUploadState, setUploadInProgress } from './upload/uploadStorageUtils';
import { createUploadStateHandlers } from './upload/uploadStateHandlers';
import { useVisibilityChangeHandler } from './upload/useVisibilityChangeHandler';
import { UploadStep, TagStep } from './upload/uploadStateTypes';

export function useUploadState() {
  const location = useLocation();
  const [step, setStep] = useState<UploadStep>(1);
  const [appStoreLink, setAppStoreLink] = useState<string>('');
  const [appMetadata, setAppMetadata] = useState<App | null>(null);
  const [heroImages, setHeroImages] = useState<string[] | undefined>(undefined);
  const [heroVideos, setHeroVideos] = useState<string[] | undefined>(undefined);
  const [screenshots, setScreenshots] = useState<UploadScreenshot[]>([]);
  const [currentScreenshotIndex, setCurrentScreenshotIndex] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [tagStep, setTagStep] = useState<TagStep>('category');
  
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
    clearUploadStateFromStorage();
    hasRestoredStateRef.current = false;
    hasInitializedRef.current = false;
  };
  
  // Critical: Initialize with saved state immediately if available
  useEffect(() => {
    if (!hasInitializedRef.current && location.pathname === '/upload') {
      hasInitializedRef.current = true;
      
      // On initial mount, immediately try to restore state and set upload in progress
      const storedState = sessionStorage.getItem('uploadState');
      if (storedState && !hasRestoredStateRef.current) {
        console.log('Found saved upload state on initial mount, restoring immediately');
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
          setUploadInProgress();
        }
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
      setUploadInProgress();
      console.log('Setting uploadInProgress flag to true on component mount');
    }
    
    return () => {
      mountedRef.current = false;
      console.log('Upload state component unmounted');
    };
  }, []);

  // Create a saveState function for this component instance
  const saveState = () => {
    saveUploadState(
      { 
        step, 
        appStoreLink, 
        appMetadata, 
        heroImages, 
        heroVideos, 
        screenshots, 
        currentScreenshotIndex, 
        tagStep 
      },
      stateLastSavedRef,
      isRestoringRef,
      preventStateOverwriteRef,
      mountedRef
    );
  };
  
  // Setup visibility change handler
  useVisibilityChangeHandler(
    location,
    step,
    mountedRef,
    isRestoringRef,
    visibilityChangeHandledRef,
    hasRestoredStateRef,
    isVisibilityChangeInProgressRef,
    preventStateOverwriteRef,
    saveState,
    setStep,
    setAppStoreLink,
    setAppMetadata,
    setHeroImages,
    setHeroVideos,
    setScreenshots,
    setCurrentScreenshotIndex,
    setTagStep
  );
  
  // Store the user's upload state in sessionStorage for persistence
  useEffect(() => {
    // Avoid saving during restoration or if we're preventing state overwrite
    if (isRestoringRef.current || preventStateOverwriteRef.current) return;
    
    // Only save state if we're mounted and past step 1
    if (mountedRef.current && step > 1 && hasInitializedRef.current) {
      saveState();
    }
  }, [step, appStoreLink, appMetadata, heroImages, heroVideos, screenshots, currentScreenshotIndex, tagStep]);

  // Setup handlers
  const handlers = createUploadStateHandlers(
    setStep,
    setAppStoreLink,
    setAppMetadata,
    setHeroImages,
    setHeroVideos,
    setScreenshots,
    setCurrentScreenshotIndex,
    setTagStep,
    clearUploadState
  );

  // Calculate progress percentage based on current step
  const progressPercentage = () => handlers.progressPercentage(step, screenshots);

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
    handleNextStep: handlers.handleNextStep,
    handlePrevStep: handlers.handlePrevStep,
    handleAppLinkSubmit: handlers.handleAppLinkSubmit,
    handleAppMetadataConfirm: handlers.handleAppMetadataConfirm,
    handleScreenshotsUpload: handlers.handleScreenshotsUpload,
    handleScreenshotCategorySelect: handlers.handleScreenshotCategorySelect,
    handleScreenshotElementsSelect: handlers.handleScreenshotElementsSelect,
    clearUploadState
  };
}
