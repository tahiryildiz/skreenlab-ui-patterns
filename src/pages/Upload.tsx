
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import StepLinkInput from '@/components/upload/StepLinkInput';
import StepAppMetadata from '@/components/upload/StepAppMetadata';
import StepScreenshotUpload from '@/components/upload/StepScreenshotUpload';
import StepTagScreenshots from '@/components/upload/StepTagScreenshots';
import StepSubmit from '@/components/upload/StepSubmit';
import { toast } from '@/components/ui/sonner';
import { Progress } from '@/components/ui/progress';
import { App } from '@/types';
import { supabase } from '@/integrations/supabase/client';

export type UploadScreenshot = {
  file: File;
  dataUrl: string;
  screenCategoryId: string | null;
  uiElementIds: string[];
};

const Upload = () => {
  const { user, session, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [step, setStep] = useState(1);
  const [isProUser, setIsProUser] = useState(false);
  const [appStoreLink, setAppStoreLink] = useState('');
  const [appMetadata, setAppMetadata] = useState<App | null>(null);
  const [screenshots, setScreenshots] = useState<UploadScreenshot[]>([]);
  const [currentScreenshotIndex, setCurrentScreenshotIndex] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasAuthChecked, setHasAuthChecked] = useState(false);
  const authCheckPerformedRef = useRef(false);
  const initialPathSaved = useRef(false);
  
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

  // Store the initial URL in sessionStorage and handle visibility changes
  useEffect(() => {
    if (!initialPathSaved.current) {
      sessionStorage.setItem('currentUploadPath', location.pathname);
      initialPathSaved.current = true;
    }

    // Handle tab visibility changes
    const handleVisibilityChange = () => {
      if (!document.hidden && location.pathname === '/upload') {
        // Tab is visible again and we're on the upload page
        // No need to navigate as we're already on the correct page
        console.log('Upload tab is visible again');
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [location.pathname]);

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

  // Check if the user is a Pro user - only once
  useEffect(() => {
    const checkProStatus = async () => {
      if (user && !authCheckPerformedRef.current) {
        authCheckPerformedRef.current = true;
        
        try {
          const { data, error } = await supabase
            .from('profiles')
            .select('is_pro')
            .eq('id', user.id)
            .single();
          
          if (error) {
            console.error('Error checking Pro status:', error);
            setIsProUser(false);
            return;
          }
          
          // Safely access is_pro with correct typing
          const isPro = !!data?.is_pro;
          setIsProUser(isPro);
          
          if (!isPro) {
            toast.error('Only Pro users can upload screenshots');
            navigate('/pricing');
          }
          
          // Mark that we've checked auth
          setHasAuthChecked(true);
        } catch (error) {
          console.error('Error checking Pro status:', error);
          setIsProUser(false);
        }
      } else if (!isLoading && !user && !authCheckPerformedRef.current) {
        // Only redirect if we're done loading, there's no user, and we haven't checked auth yet
        authCheckPerformedRef.current = true;
        navigate('/signin');
      }
    };

    // Only check pro status if we haven't already checked auth
    if ((!hasAuthChecked || (user && !authCheckPerformedRef.current) || (!isLoading && !user && !authCheckPerformedRef.current)) && !isSubmitting) {
      checkProStatus();
    }
  }, [user, isLoading, navigate, hasAuthChecked, isSubmitting]);

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

  const handleSubmit = async () => {
    if (!appMetadata || !user) return;
    
    setIsSubmitting(true);
    
    try {
      // Process each screenshot
      for (const screenshot of screenshots) {
        // 1. Upload image to Supabase Storage
        const fileName = `${Date.now()}-${screenshot.file.name.replace(/\s+/g, '-')}`;
        const filePath = `screenshots/${user.id}/${fileName}`;
        
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('screenshots')
          .upload(filePath, screenshot.file);
          
        if (uploadError) throw uploadError;
        
        // 2. Get public URL for the uploaded file
        const { data: publicUrlData } = supabase.storage
          .from('screenshots')
          .getPublicUrl(filePath);
        
        const imageUrl = publicUrlData.publicUrl;
        
        // 3. Create record in screenshots table
        const { error: screenshotError } = await supabase
          .from('screenshots')
          .insert({
            image_url: imageUrl,
            app_id: appMetadata.id,
            screen_category_id: screenshot.screenCategoryId,
            metadata: {
              width: 0, // To be extracted from image
              height: 0, // To be extracted from image
              ui_elements: screenshot.uiElementIds
            },
            storage_path: filePath,
          });
          
        if (screenshotError) throw screenshotError;
      }
      
      toast.success('Screenshots successfully uploaded');
      
      // Clear the session storage before navigating away
      sessionStorage.removeItem('currentUploadPath');
      sessionStorage.removeItem('uploadState');
      sessionStorage.removeItem('uploadedScreenshots');
      
      navigate(`/app/${appMetadata.id}`);
    } catch (error) {
      console.error('Error during upload:', error);
      toast.error('Failed to upload screenshots');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading && !hasAuthChecked) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  // Only redirect if not pro, not loading, auth check is complete, and we haven't already set isProUser to false
  if (!isProUser && !isLoading && hasAuthChecked && authCheckPerformedRef.current && user) {
    return null; // Will be redirected by useEffect
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 container max-w-5xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Upload Screenshots</h1>
          <Progress value={progressPercentage()} className="h-2" />
          <div className="flex justify-between mt-2 text-sm text-gray-500">
            <span>Step {step} of 5</span>
            <span>{Math.floor(progressPercentage())}% Complete</span>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border p-6">
          {step === 1 && (
            <StepLinkInput 
              onSubmit={handleAppLinkSubmit} 
            />
          )}
          
          {step === 2 && (
            <StepAppMetadata
              appStoreLink={appStoreLink}
              onConfirm={handleAppMetadataConfirm}
              onBack={handlePrevStep}
            />
          )}
          
          {step === 3 && (
            <StepScreenshotUpload
              onUpload={handleScreenshotsUpload}
              onBack={handlePrevStep}
            />
          )}
          
          {step === 4 && screenshots.length > 0 && (
            <StepTagScreenshots
              screenshot={screenshots[currentScreenshotIndex]}
              index={currentScreenshotIndex}
              totalCount={screenshots.length}
              onSubmit={handleScreenshotTag}
              onBack={handlePrevStep}
            />
          )}
          
          {step === 5 && (
            <StepSubmit
              screenshots={screenshots}
              appMetadata={appMetadata}
              onSubmit={handleSubmit}
              onBack={handlePrevStep}
              isSubmitting={isSubmitting}
            />
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
  
  function handleScreenshotTag(
    index: number, 
    screenCategoryId: string, 
    uiElementIds: string[]
  ) {
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
  }
};

export default Upload;
