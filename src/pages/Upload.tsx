
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
  const [step, setStep] = useState(1);
  const [isProUser, setIsProUser] = useState(false);
  const [appStoreLink, setAppStoreLink] = useState('');
  const [appMetadata, setAppMetadata] = useState<App | null>(null);
  const [screenshots, setScreenshots] = useState<UploadScreenshot[]>([]);
  const [currentScreenshotIndex, setCurrentScreenshotIndex] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Check if the user is a Pro user
  useEffect(() => {
    const checkProStatus = async () => {
      if (user) {
        try {
          const { data, error } = await supabase
            .from('profiles')
            .select('is_pro')
            .eq('id', user.id)
            .single();
          
          if (error) throw error;
          
          setIsProUser(!!data?.is_pro);
          
          if (!data?.is_pro) {
            toast.error('Only Pro users can upload screenshots');
            navigate('/pricing');
          }
        } catch (error) {
          console.error('Error checking Pro status:', error);
          setIsProUser(false);
          navigate('/pricing');
        }
      }
    };

    if (!isLoading && user) {
      checkProStatus();
    } else if (!isLoading && !user) {
      navigate('/signin');
    }
  }, [user, isLoading, navigate]);

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
      navigate(`/app/${appMetadata.id}`);
    } catch (error) {
      console.error('Error during upload:', error);
      toast.error('Failed to upload screenshots');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!isProUser && !isLoading) {
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
};

export default Upload;
