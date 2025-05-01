
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/sonner';
import { User } from '@supabase/supabase-js';
import { App } from '@/types';
import { UploadScreenshot } from '@/types/upload';

export function useScreenshotUpload() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const uploadScreenshots = async (
    screenshots: UploadScreenshot[], 
    appMetadata: App | null, 
    user: User | null,
    clearUploadState: () => void
  ) => {
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
      clearUploadState();
      
      navigate(`/app/${appMetadata.id}`);
    } catch (error) {
      console.error('Error during upload:', error);
      toast.error('Failed to upload screenshots');
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    isSubmitting,
    uploadScreenshots
  };
}
