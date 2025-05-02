
import { supabase } from '@/integrations/supabase/client';
import { App } from '@/types';
import { AppStoreDetails } from '@/types/appMetadata';
import { isIOSAppLink, isAndroidAppLink } from '@/utils/appStoreUtils';

/**
 * Checks if an app exists in the database by store URL
 */
export async function findExistingAppByStoreUrl(appStoreLink: string): Promise<App | null> {
  if (isIOSAppLink(appStoreLink)) {
    const { data: existingAppData, error: dbError } = await supabase
      .from('apps')
      .select('*')
      .eq('app_store_url', appStoreLink)
      .maybeSingle();
      
    if (dbError) {
      console.error('Database query error:', dbError);
      throw new Error('Failed to check database for existing app');
    }
      
    return existingAppData as unknown as App;
  } 
  
  if (isAndroidAppLink(appStoreLink)) {
    const { data: existingAppData, error: dbError } = await supabase
      .from('apps')
      .select('*')
      .eq('play_store_url', appStoreLink)
      .maybeSingle();
      
    if (dbError) {
      console.error('Database query error:', dbError);
      throw new Error('Failed to check database for existing app');
    }
      
    return existingAppData as unknown as App;
  }
  
  return null;
}

/**
 * Fetches app data from the store API via Supabase edge function
 */
export async function fetchAppDataFromApi(appStoreLink: string) {
  const { data, error: fetchError } = await supabase.functions.invoke('fetch-app-store-complete', {
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

  return data;
}

/**
 * Finds a category ID based on the app store category name
 */
export async function findCategoryByName(categoryName: string): Promise<string | null> {
  if (!categoryName) return null;
  
  const { data: categoryData, error: categoryError } = await supabase
    .from('app_categories')
    .select('id')
    .eq('app_store_category', categoryName)
    .maybeSingle();
    
  if (categoryError) {
    console.log('Error fetching category:', categoryError);
    return null;
  }
  
  return categoryData ? categoryData.id : null;
}

/**
 * Saves app data to the database
 */
export async function saveApp(appData: App, appStoreLink: string, appStoreDetails?: AppStoreDetails | null) {
  // Only insert if this is a newly generated app (with temporary UUID)
  const isNewApp = typeof appData.id === 'string' && appData.id.includes('-');
  
  if (!isNewApp) {
    // If app already exists in the database, just return it
    console.log('Using existing app:', appData);
    return appData;
  }
  
  // Get category ID if available
  let categoryId: string | null = null;
  if (appStoreDetails?.category) {
    categoryId = await findCategoryByName(appStoreDetails.category);
    if (categoryId) {
      console.log('Found matching category ID:', categoryId);
    } else {
      console.log('No matching category found for:', appStoreDetails.category);
    }
  }
  
  // Prepare data for insertion
  const appInsertData = {
    name: appData.name || 'Unknown App',
    icon_url: appData.icon_url || null,
    bundle_id: appData.bundle_id || 
              appData.name?.toLowerCase().replace(/\s+/g, '') || 
              'unknown',
    description: appStoreDetails?.description || '',
    app_store_url: isIOSAppLink(appStoreLink) ? appStoreLink : null,
    play_store_url: isAndroidAppLink(appStoreLink) ? appStoreLink : null,
    category_id: categoryId,
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
  return {
    ...appData,
    id: data[0].id
  };
}
