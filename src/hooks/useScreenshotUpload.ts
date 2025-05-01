
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { App } from '@/types';
import { UploadScreenshot } from '@/types/upload';
import { toast } from 'sonner';

export function useScreenshotUpload() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const uploadScreenshots = async (
    screenshots: UploadScreenshot[],
    appMetadata: App | null,
    user: any,
    onComplete: () => void,
    heroImages: string[] = []
  ) => {
    if (!appMetadata || !user) {
      toast.error('Missing app metadata or user information');
      return;
    }

    if (screenshots.length === 0) {
      toast.error('No screenshots to upload');
      return;
    }

    setIsSubmitting(true);
    let successCount = 0;

    try {
      for (const screenshot of screenshots) {
        // Skip if no category is selected
        if (!screenshot.screenCategoryId) {
          console.warn('Skipping screenshot without category');
          continue;
        }

        // Create file path for storage
        const fileName = `${Date.now()}-${screenshot.file.name.replace(/\s/g, '_')}`;
        const filePath = `screenshots/${appMetadata.id}/${fileName}`;
        
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
        const isHero = heroImages.some(url => {
          // This is a simplification - in a real app we'd need better matching
          // between app store URLs and uploaded screenshots
          return screenshot.isHero;
        });

        // Insert screenshot record in database
        const { error: insertError } = await supabase
          .from('screenshots')
          .insert([
            {
              app_id: appMetadata.id,
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
      }

      // Also save any hero images from the app store that were selected
      for (const heroUrl of heroImages) {
        // We'd need to fetch the image data, convert to file, and upload
        // This is simplified for demonstration purposes
        // In a real app, we'd fetch the image, create a File object, and upload it
      }

      if (successCount > 0) {
        toast.success(`Successfully uploaded ${successCount} screenshots`);
        
        // Update app screenshots_count
        const { error: updateError } = await supabase
          .from('apps')
          .update({ 
            screenshots_count: successCount,
            updated_at: new Date().toISOString()
          })
          .eq('id', appMetadata.id);
          
        if (updateError) {
          console.error('Error updating app record:', updateError);
        }
        
        // Clear upload state and redirect
        onComplete();
        // Here we would redirect to a success page or app detail
      } else {
        toast.error('No screenshots were uploaded successfully');
      }
    } catch (error) {
      console.error('Error in upload process:', error);
      toast.error('An error occurred during the upload process');
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    isSubmitting,
    uploadScreenshots
  };
}
