
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";

const fetchAppStoreData = async (appId: string): Promise<any> => {
  try {
    // Call iTunes API to get app metadata
    const itunesUrl = `https://itunes.apple.com/lookup?id=${appId}`;
    const response = await fetch(itunesUrl);
    if (!response.ok) {
      throw new Error(`iTunes API returned status: ${response.status}`);
    }

    const data = await response.json();
    if (!data.results || data.results.length === 0) {
      throw new Error('No app found with that ID');
    }

    const appInfo = data.results[0];
    console.log('App info from iTunes API:', appInfo.trackName);

    // Get more detailed info from App Store page to extract screenshots
    const appStoreUrl = `https://apps.apple.com/us/app/id${appId}`;
    console.log('Fetching HTML content for app ID:', appId);

    try {
      const htmlResponse = await fetch(appStoreUrl);
      const htmlContent = await htmlResponse.text();
      console.log(`Fetched HTML content length: ${htmlContent.length}`);

      // Extract screenshot URLs using regex
      // First, try to find the desktop class screenshots
      const screenshotRegex = /(?:desktop-screenshot|screenshot).*?srcset="([^"]+)/g;
      const screenshotMatches = [...htmlContent.matchAll(screenshotRegex)];

      // Next, find iPad screenshots
      const ipadScreenshotRegex = /ipad-screenshot.*?srcset="([^"]+)/g;
      const ipadScreenshotMatches = [...htmlContent.matchAll(ipadScreenshotRegex)];

      // Extract video previews if available
      const videoRegex = /video-preview-url="([^"]+)/g;
      const videoMatches = [...htmlContent.matchAll(videoRegex)];

      const screenshots = screenshotMatches.map(match => {
        const srcsetValue = match[1];
        // Get the highest resolution image from the srcset
        const urls = srcsetValue.split(', ');
        const highestRes = urls[urls.length - 1].split(' ')[0];
        return highestRes;
      });

      const ipadScreenshots = ipadScreenshotMatches.map(match => {
        const srcsetValue = match[1];
        const urls = srcsetValue.split(', ');
        const highestRes = urls[urls.length - 1].split(' ')[0];
        return highestRes;
      });

      const previewVideos = videoMatches.map(match => match[1]);

      console.log(`Found ${screenshots.length} screenshots and ${previewVideos.length} videos`);

      return {
        name: appInfo.trackName,
        developer: appInfo.artistName,
        bundle_id: appInfo.bundleId,
        platform: 'iOS',
        icon_url: appInfo.artworkUrl512 || appInfo.artworkUrl100,
        description: appInfo.description,
        screenshots,
        ipad_screenshots: ipadScreenshots,
        preview_videos: previewVideos
      };
    } catch (htmlError) {
      console.error('Error fetching HTML content:', htmlError);
      // Return basic info even if screenshots extraction fails
      return {
        name: appInfo.trackName,
        developer: appInfo.artistName,
        bundle_id: appInfo.bundleId,
        platform: 'iOS',
        icon_url: appInfo.artworkUrl512 || appInfo.artworkUrl100,
        description: appInfo.description,
        screenshots: [],
        ipad_screenshots: [],
        preview_videos: []
      };
    }
  } catch (error) {
    console.error('Error fetching App Store data:', error);
    throw error;
  }
};

const fetchPlayStoreData = async (appId: string): Promise<any> => {
  try {
    // For Play Store, we'll just return basic info since
    // scraping Play Store is more complex and might need a different approach
    return {
      name: appId, // Placeholder - in a real implementation we'd retrieve this
      package_name: appId,
      platform: 'Android',
      publisher: 'Unknown', // Placeholder
      screenshots: [],
      preview_videos: []
    };
  } catch (error) {
    console.error('Error fetching Play Store data:', error);
    throw error;
  }
};

const extractIdFromAppStoreUrl = (url: string): string | null => {
  // Match patterns like id123456789, /id123456789, or /app/something/id123456789
  const match = url.match(/id(\d+)/);
  return match ? match[1] : null;
};

const extractIdFromPlayStoreUrl = (url: string): string | null => {
  // Match query param format: ?id=com.example.app
  const idMatch = url.match(/[?&]id=([^&]+)/);
  if (idMatch) return idMatch[1];

  // Match path format: /store/apps/details/id=com.example.app
  const pathMatch = url.match(/\/store\/apps\/details.*?\/([^\/\?]+)$/);
  if (pathMatch) return pathMatch[1];

  return null;
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { appStoreLink } = await req.json();
    console.log('Processing app store link:', appStoreLink);
    
    let appData;
    
    if (appStoreLink.includes('apps.apple.com') || appStoreLink.includes('itunes.apple.com') || appStoreLink.includes('appstore.com')) {
      const appId = extractIdFromAppStoreUrl(appStoreLink);
      if (!appId) {
        throw new Error('Could not extract App ID from the provided App Store URL');
      }
      console.log('Extracted App Store ID:', appId);
      appData = await fetchAppStoreData(appId);
    } else if (appStoreLink.includes('play.google.com')) {
      const appId = extractIdFromPlayStoreUrl(appStoreLink);
      if (!appId) {
        throw new Error('Could not extract App ID from the provided Play Store URL');
      }
      console.log('Extracted Play Store ID:', appId);
      appData = await fetchPlayStoreData(appId);
    } else {
      throw new Error('Invalid app store link. Please provide a valid App Store or Play Store URL.');
    }

    return new Response(JSON.stringify({ 
      appData,
      status: 'success' 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error in fetch-upload-app-data function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      status: 'error'
    }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
