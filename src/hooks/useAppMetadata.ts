
import { useState, useEffect } from 'react';
import { App } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useAppMetadata = (appStoreLink: string) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [appData, setAppData] = useState<App | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Validate the app store link
  const isValidStoreLink = (link: string): boolean => {
    return Boolean(
      link && 
      (link.includes('apps.apple.com') || 
       link.includes('play.google.com') || 
       link.includes('appstore.com'))
    );
  };

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
      let app: App | null = null;
      
      if (appStoreLink.includes('apps.apple.com') || appStoreLink.includes('appstore.com')) {
        const { data: existingAppData, error: dbError } = await supabase
          .from('apps')
          .select('*')
          .eq('app_store_url', appStoreLink)
          .maybeSingle();
          
        if (dbError) {
          console.error('Database query error:', dbError);
          throw new Error('Failed to check database for existing app');
        }
          
        if (existingAppData) {
          app = existingAppData as unknown as App;
          console.log('Found existing iOS app:', app);
        }
      } else if (appStoreLink.includes('play.google.com')) {
        const { data: existingAppData, error: dbError } = await supabase
          .from('apps')
          .select('*')
          .eq('play_store_url', appStoreLink)
          .maybeSingle();
          
        if (dbError) {
          console.error('Database query error:', dbError);
          throw new Error('Failed to check database for existing app');
        }
          
        if (existingAppData) {
          app = existingAppData as unknown as App;
          console.log('Found existing Android app:', app);
        }
      }
      
      // If app doesn't exist in database, fetch it from the store API
      if (!app) {
        console.log('App not found in database, fetching from API...');
        // Call our edge function to fetch app data
        const { data, error: fetchError } = await supabase.functions.invoke('fetch-app-data', {
          body: { appStoreLink }
        });
        
        if (fetchError) {
          console.error('Edge function error:', fetchError);
          throw new Error(fetchError.message || 'Failed to fetch app data');
        }
        
        if (!data || !data.appData) {
          console.error('Invalid data returned from API:', data);
          throw new Error('No app data returned from API');
        }

        console.log('App data fetched from API:', data.appData);
        
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
      // Only insert if this is a newly generated app (with temporary UUID)
      const isNewApp = typeof appData.id === 'string' && appData.id.includes('-');
      
      if (isNewApp) {
        // Prepare data for insertion
        const appInsertData = {
          name: appData.name || 'Unknown App',
          icon_url: appData.icon_url || null,
          bundle_id: appData.bundle_id || 
                    appData.name?.toLowerCase().replace(/\s+/g, '') || 
                    'unknown',
          description: '',
          app_store_url: appStoreLink.includes('apple') ? appStoreLink : null,
          play_store_url: appStoreLink.includes('play.google.com') ? appStoreLink : null,
          updated_at: new Date().toISOString()
        };
        
        console.log('Inserting new app data:', appInsertData);
        
        // Insert the app data
        const { data, error } = await supabase
          .from('apps')
          .insert([appInsertData])
          .select();
          
        if (error) {
          console.error('Database insert error:', error);
          throw new Error(`Failed to save app data: ${error.message}`);
        }
        
        if (!data || data.length === 0) {
          throw new Error('No data returned after insert');
        }
        
        console.log('App successfully inserted:', data[0]);
        const updatedApp = {
          ...appData,
          id: data[0].id
        };
        setAppData(updatedApp);
        toast.success('App data saved successfully');
        return updatedApp;
      } else {
        // If app already exists in the database, just use it
        console.log('Using existing app:', appData);
        toast.success('Using existing app data');
        return appData;
      }
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
    submitting,
    fetchAppData,
    saveAppData,
    retryFetch
  };
};
