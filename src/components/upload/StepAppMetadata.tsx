
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, CheckCircle, XCircle, ExternalLink } from 'lucide-react';
import { App } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/sonner';

interface StepAppMetadataProps {
  appStoreLink: string;
  onConfirm: (app: App) => void;
  onBack: () => void;
}

const StepAppMetadata: React.FC<StepAppMetadataProps> = ({ 
  appStoreLink, 
  onConfirm,
  onBack
}) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [appData, setAppData] = useState<App | null>(null);

  useEffect(() => {
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
    
    fetchAppData();
  }, [appStoreLink]);

  const handleConfirm = async () => {
    if (!appData) return;
    
    try {
      // If this is a new app, insert it into our database
      if (!appData.id.startsWith('00000000-')) { // Check if it's a generated UUID
        const { data, error } = await supabase
          .from('apps')
          .insert({
            name: appData.name,
            icon_url: appData.icon_url,
            bundle_id: appData.bundle_id || appData.name.toLowerCase().replace(/\s+/g, ''),
            description: '',
            app_store_url: appData.platform === 'iOS' ? appStoreLink : null,
            play_store_url: appData.platform === 'Android' ? appStoreLink : null
          })
          .select()
          .single();
          
        if (error) throw error;
        
        // Update the app data with the inserted record
        if (data) {
          onConfirm({
            ...appData,
            id: data.id
          });
          return;
        }
      }
      
      // If app already exists, just pass it along
      onConfirm(appData);
    } catch (err) {
      console.error('Error confirming app:', err);
      setError('Failed to save app data. Please try again.');
      toast.error('Failed to save app data');
    }
  };

  return (
    <Card className="border-0 shadow-none">
      <CardContent className="pt-6">
        <div className="mb-6 text-center">
          <div className="bg-primary/10 inline-flex rounded-full p-3 mb-4">
            <CheckCircle className="h-6 w-6 text-primary" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Confirm App Details</h2>
          <p className="text-gray-500">
            Is this the correct app?
          </p>
        </div>
        
        {loading ? (
          <div className="py-8 flex justify-center">
            <Loader2 className="h-8 w-8 text-primary animate-spin" />
          </div>
        ) : error ? (
          <div className="py-8 text-center">
            <XCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <p className="text-destructive">{error}</p>
            <Button onClick={onBack} className="mt-4">
              Try Different Link
            </Button>
          </div>
        ) : appData && (
          <div className="space-y-6">
            <div className="flex items-center p-4 border rounded-lg">
              {appData.icon_url && (
                <img 
                  src={appData.icon_url} 
                  alt={appData.name}
                  className="h-16 w-16 rounded-2xl mr-4"
                />
              )}
              
              <div className="flex-1">
                <h3 className="font-medium text-lg">{appData.name}</h3>
                <p className="text-gray-500 text-sm">{appData.publisher}</p>
                <div className="flex items-center mt-1">
                  <span className="text-xs font-medium px-2 py-0.5 bg-gray-100 rounded-full mr-2">
                    {appData.platform}
                  </span>
                  <a 
                    href={appStoreLink} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-xs text-primary flex items-center"
                  >
                    View in store <ExternalLink className="h-3 w-3 ml-1" />
                  </a>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                variant="outline"
                onClick={onBack}
                className="flex-1"
              >
                Back
              </Button>
              <Button 
                onClick={handleConfirm}
                className="flex-1"
              >
                Yes, Continue
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default StepAppMetadata;
