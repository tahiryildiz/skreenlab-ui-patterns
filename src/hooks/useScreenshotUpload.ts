
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { App } from '@/types';
import { UploadScreenshot } from '@/types/upload';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { User } from '@supabase/supabase-js';

export const useScreenshotUpload = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const uploadScreenshots = async (
    screenshots: UploadScreenshot[],
    app: App | null,
    user: User | null,
    onSuccess: () => void,
    heroImages?: string[],
    heroVideos?: string[]
  ) => {
    if (!app || !user) {
      toast.error('Missing app data or user information');
      return;
    }

    if (screenshots.length === 0) {
      toast.error('Please upload at least one screenshot');
      return;
    }

    setIsSubmitting(true);
    let successCount = 0;

    try {
      // Process each screenshot
      for (let i = 0; i < screenshots.length; i++) {
        const screenshot = screenshots[i];
        
        // Make sure the screenshot has a category assigned
        if (!screenshot.screenCategoryId) {
          toast.error(`Screenshot ${i + 1} is missing a category`);
          setIsSubmitting(false);
          return;
        }

        try {
          // Upload process implementation
          // Create file path for storage
          const fileName = `${Date.now()}-${screenshot.file.name.replace(/\s/g, '_')}`;
          const filePath = `screenshots/${app.id}/${fileName}`;
          
          // Upload screenshot to storage
          const { error: uploadError } = await supabase.storage
            .from('screenshots')
            .upload(filePath, screenshot.file);

          if (uploadError) {
            console.error('Error uploading file:', uploadError);
            toast.error(`Failed to upload ${screenshot.file.name}`);
            continue;
          }

          // Get public URL for the uploaded file
          const { data: publicUrlData } = supabase.storage
            .from('screenshots')
            .getPublicUrl(filePath);

          if (!publicUrlData?.publicUrl) {
            console.error('Could not get public URL for', filePath);
            continue;
          }

          // Mark as hero image if applicable
          const isHero = heroImages?.some(url => {
            // This is a simplification - in a real app we'd need better matching
            // between app store URLs and uploaded screenshots
            return screenshot.isHero;
          });

          // Insert screenshot record in database
          const { error: insertError } = await supabase
            .from('screenshots')
            .insert([
              {
                app_id: app.id,
                screen_category_id: screenshot.screenCategoryId,
                image_url: publicUrlData.publicUrl,
                storage_path: filePath,
                metadata: {
                  ui_elements: screenshot.uiElementIds,
                  is_hero: isHero,
                  uploader_id: user.id
                },
                width: 0,  // These would need to be determined properly
                height: 0
              }
            ]);

          if (insertError) {
            console.error('Error inserting screenshot record:', insertError);
            toast.error('Failed to save screenshot metadata');
            continue;
          }

          successCount++;
        } catch (error) {
          console.error(`Error uploading screenshot ${i + 1}:`, error);
          toast.error(`Failed to upload screenshot ${i + 1}`);
        }
      }

      // Handle hero images and videos if provided
      if (heroImages && heroImages.length > 0) {
        console.log('Saving hero images:', heroImages);
        // Implementation for saving hero images
      }
      
      // Handle hero videos if provided
      if (heroVideos && heroVideos.length > 0) {
        console.log('Saving hero videos:', heroVideos);
        // Implementation for saving hero videos
      }

      // Show success message and redirect
      if (successCount > 0) {
        toast.success(`Successfully uploaded ${successCount} screenshots`);
        onSuccess();
        navigate('/');
      } else {
        toast.error('No screenshots were uploaded successfully');
      }
    } catch (error) {
      console.error('Error in upload process:', error);
      toast.error('Upload failed. Please try again later.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return { isSubmitting, uploadScreenshots };
};
