
import { useState, useEffect } from 'react';
import { App } from '@/types';
import { toast } from 'sonner';
import { AppStoreMedia, AppStoreDetails } from '@/types/appMetadata';
import { isValidStoreLink } from '@/utils/appStoreUtils';
import { findExistingAppByStoreUrl, fetchAppDataFromApi, saveApp } from '@/services/appDataService';

export { AppStoreMedia, AppStoreDetails } from '@/types/appMetadata';

export const useAppMetadata = (appStoreLink: string) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [appData, setAppData] = useState<App | null>(null);
  const [appStoreMedia, setAppStoreMedia] = useState<AppStoreMedia | null>(null);
  const [appStoreDetails, setAppStoreDetails] = useState<AppStoreDetails | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (appStoreLink) {
      fetchAppData();
    }
  }, [appStoreLink]);

  const fetchAppData = async () => {
    if (!appStoreLink) {
      setError("No app store link provided");
      setLoading(false);
      return;
    }

    if (!isValidStoreLink(appStoreLink)) {
      setError("Please provide a valid App Store or Google Play Store link");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      // First, check if this app already exists in our database by store URL
      let app: App | null = await findExistingAppByStoreUrl(appStoreLink);
      
      // If app doesn't exist in database, fetch it from the store API
      if (!app) {
        console.log('App not found in database, fetching from API...');
        try {
          // Call our enhanced edge function
          const data = await fetchAppDataFromApi(appStoreLink);
          
          console.log('App data fetched from enhanced API:', data.appData);
          
          // Store app store media (screenshots, videos)
          setAppStoreMedia({
            screenshots: data.appData.screenshots || [],
            preview_videos: data.appData.preview_videos || []
          });
          
          // Store additional app details
          setAppStoreDetails({
            category: data.appData.category,
            rating: data.appData.rating,
            rating_count: data.appData.rating_count,
            description: data.appData.description,
            price: data.appData.price,
            currency: data.appData.currency,
            content_rating: data.appData.content_rating,
            version: data.appData.version,
            release_notes: data.appData.release_notes
          });
          
          // Create a new App object with the fetched data
          app = {
            id: crypto.randomUUID(), // Temporary ID for new app
            name: data.appData.name || 'Unknown App',
            platform: data.appData.platform || (appStoreLink.includes('apple') ? 'iOS' : 'Android'),
            publisher: data.appData.developer || data.appData.publisher || 'Unknown Publisher',
            icon_url: data.appData.icon_url || 'https://placekitten.com/512/512', // Fallback icon
            screenshots_count: 0,
            bundle_id: data.appData.bundle_id || data.appData.package_name || ''
          };
        } catch (apiError) {
          console.error('API fetch error:', apiError);
          // Even if the API fetch fails, we'll create a minimal app object
          app = {
            id: crypto.randomUUID(),
            name: 'Unknown App',
            platform: appStoreLink.includes('apple') ? 'iOS' : 'Android',
            publisher: 'Unknown Publisher',
            icon_url: 'https://placekitten.com/512/512',
            screenshots_count: 0,
            bundle_id: ''
          };
          
          // We'll still set up an empty app store media object
          setAppStoreMedia({
            screenshots: [],
            preview_videos: []
          });
          
          setAppStoreDetails(null);
        }
      }
      
      if (!app) {
        throw new Error('Could not extract app information from the provided link');
      }
      
      setAppData(app);
    } catch (err) {
      console.error('Error fetching app data:', err);
      const errorMessage = err instanceof Error ? 
        err.message : 
        'Failed to fetch app data. Please try a different link or try again later.';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const saveAppData = async (): Promise<App | null> => {
    if (!appData) {
      toast.error('No app data to save');
      return null;
    }
    
    setSubmitting(true);
    
    try {
      const updatedApp = await saveApp(appData, appStoreLink, appStoreDetails);
      setAppData(updatedApp);
      toast.success('App data saved successfully');
      return updatedApp;
    } catch (err) {
      console.error('Error saving app:', err);
      const errorMessage = err instanceof Error ? 
        err.message : 
        'Failed to save app data to database';
      setError(errorMessage);
      toast.error(errorMessage);
      return null;
    } finally {
      setSubmitting(false);
    }
  };

  const retryFetch = () => {
    setError(null);
    fetchAppData();
  };

  return {
    loading,
    error,
    appData,
    appStoreMedia,
    appStoreDetails,
    submitting,
    fetchAppData,
    saveAppData,
    retryFetch
  };
};
