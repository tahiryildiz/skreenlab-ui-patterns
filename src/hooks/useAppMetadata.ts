
import { useState, useEffect } from 'react';
import { App } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/sonner';

export const useAppMetadata = (appStoreLink: string) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [appData, setAppData] = useState<App | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchAppData();
  }, [appStoreLink]);

  const fetchAppData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // First, check if this app already exists in our database by store URL
      let app: App | null = null;
      
      if (appStoreLink.includes('apps.apple.com')) {
        const { data: existingAppData } = await supabase
          .from('apps')
          .select('*')
          .eq('app_store_url', appStoreLink)
          .maybeSingle();
          
        if (existingAppData) {
          app = existingAppData as unknown as App;
        }
      } else if (appStoreLink.includes('play.google.com')) {
        const { data: existingAppData } = await supabase
          .from('apps')
          .select('*')
          .eq('play_store_url', appStoreLink)
          .maybeSingle();
          
        if (existingAppData) {
          app = existingAppData as unknown as App;
        }
      }
      
      // If app doesn't exist in database, fetch it from the store API
      if (!app) {
        // Call our edge function to fetch app data
        const { data, error: fetchError } = await supabase.functions.invoke('fetch-app-data', {
          body: { appStoreLink }
        });
        
        if (fetchError) {
          throw new Error(fetchError.message || 'Failed to fetch app data');
        }
        
        if (!data || !data.appData) {
          throw new Error('No app data returned from API');
        }
        
        // Create a new App object with the fetched data
        app = {
          id: crypto.randomUUID(),
          name: data.appData.name,
          platform: data.appData.platform,
          publisher: data.appData.publisher,
          icon_url: data.appData.icon_url || 'https://placekitten.com/512/512', // Fallback icon
          screenshots_count: 0,
          bundle_id: data.appData.bundle_id
        };
      }
      
      if (!app) {
        throw new Error('Could not extract app information from the provided link');
      }
      
      setAppData(app);
    } catch (err) {
      console.error('Error fetching app data:', err);
      setError('Failed to fetch app data. Please try a different link or try again later.');
      toast.error('Failed to fetch app data');
    } finally {
      setLoading(false);
    }
  };

  const saveAppData = async (): Promise<App | null> => {
    if (!appData) return null;
    
    setSubmitting(true);
    
    try {
      // Only insert if this is a newly generated app (not from the database)
      if (typeof appData.id === 'string' && !appData.id.includes('-')) {
        const appInsertData = {
          name: appData.name || 'Unknown App',
          icon_url: appData.icon_url || null,
          bundle_id: appData.bundle_id || appData.name?.toLowerCase().replace(/\s+/g, '') || 'unknown',
          description: '',
          app_store_url: appStoreLink.includes('apps.apple.com') ? appStoreLink : null,
          play_store_url: appStoreLink.includes('play.google.com') ? appStoreLink : null
        };
        
        console.log('Inserting app data:', appInsertData);
        
        // Insert the app data
        const { data, error } = await supabase
          .from('apps')
          .insert([appInsertData]) // Make sure we pass an array
          .select();
          
        if (error) {
          console.error('Database insert error:', error);
          throw new Error(`Failed to save app data: ${error.message}`);
        }
        
        if (data && data.length > 0) {
          console.log('App successfully inserted:', data[0]);
          const updatedApp = {
            ...appData,
            id: data[0].id
          };
          setAppData(updatedApp);
          return updatedApp;
        } else {
          throw new Error('No data returned after insert');
        }
      } else {
        // If app already exists in the database, just use it
        console.log('Using existing app:', appData);
        return appData;
      }
    } catch (err) {
      console.error('Error confirming app:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to save app data';
      setError(errorMessage);
      toast.error(errorMessage);
      return null;
    } finally {
      setSubmitting(false);
    }
  };

  return {
    loading,
    error,
    appData,
    submitting,
    fetchAppData,
    saveAppData
  };
};
