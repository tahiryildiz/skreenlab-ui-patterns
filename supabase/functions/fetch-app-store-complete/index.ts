
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";
import { DOMParser } from "https://deno.land/x/deno_dom@v0.1.38/deno-dom-wasm.ts";

// Base function to fetch app data from iTunes API
async function fetchItunesApiData(appId: string) {
  try {
    const itunesUrl = `https://itunes.apple.com/lookup?id=${appId}&entity=software&country=us`;
    const response = await fetch(itunesUrl);
    if (!response.ok) {
      throw new Error(`iTunes API returned status: ${response.status}`);
    }

    const data = await response.json();
    if (!data.results || data.results.length === 0) {
      throw new Error('No app found with that ID');
    }

    return data.results[0];
  } catch (error) {
    console.error('Error fetching from iTunes API:', error);
    throw error;
  }
}

// Function to scrape the App Store page for additional data
async function scrapeAppStorePage(appId: string) {
  try {
    const appStoreUrl = `https://apps.apple.com/us/app/id${appId}`;
    console.log(`Scraping App Store page: ${appStoreUrl}`);
    
    const response = await fetch(appStoreUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.114 Safari/537.36'
      }
    });
    
    if (!response.ok) {
      throw new Error(`App Store page returned status: ${response.status}`);
    }
    
    const html = await response.text();
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");
    
    if (!doc) {
      throw new Error("Failed to parse App Store HTML");
    }
    
    // Extract preview video URLs
    // These are typically in JSON data embedded in a script tag
    const scriptTags = doc.querySelectorAll('script');
    let previewVideos: string[] = [];
    let phoneScreenshots: string[] = [];
    
    for (let i = 0; i < scriptTags.length; i++) {
      const scriptContent = scriptTags[i].textContent || '';
      
      // Look for App Store data in JSON format
      if (scriptContent.includes('"previewVideoUrl"') || scriptContent.includes('"screenshotUrl"')) {
        try {
          // Extract JSON objects from the script content
          const jsonMatches = scriptContent.match(/\{.*\}/gs);
          if (jsonMatches) {
            for (const jsonStr of jsonMatches) {
              try {
                const jsonData = JSON.parse(jsonStr);
                
                // Extract preview videos
                if (jsonData.previewVideoUrl) {
                  previewVideos.push(jsonData.previewVideoUrl);
                } else if (jsonData.attributes && jsonData.attributes.previews) {
                  jsonData.attributes.previews.forEach((preview: any) => {
                    if (preview.url) previewVideos.push(preview.url);
                  });
                }
                
                // Extract screenshots
                if (jsonData.attributes && jsonData.attributes.screenshotUrls) {
                  phoneScreenshots = jsonData.attributes.screenshotUrls;
                }
              } catch (e) {
                // Skip invalid JSON
              }
            }
          }
        } catch (e) {
          console.error("Error parsing JSON from script tag:", e);
        }
      }
    }
    
    // Fallback method: look for video elements
    if (previewVideos.length === 0) {
      const videoElements = doc.querySelectorAll('video');
      for (let i = 0; i < videoElements.length; i++) {
        const sourceElements = videoElements[i].querySelectorAll('source');
        for (let j = 0; j < sourceElements.length; j++) {
          const src = sourceElements[j].getAttribute('src');
          if (src && !previewVideos.includes(src)) {
            previewVideos.push(src);
          }
        }
      }
    }

    // Fallback for screenshots: look for image elements in specific app preview sections
    if (phoneScreenshots.length === 0) {
      const imageElements = doc.querySelectorAll('.we-screenshot-viewer__screenshots img');
      for (let i = 0; i < imageElements.length; i++) {
        const src = imageElements[i].getAttribute('src');
        if (src) {
          phoneScreenshots.push(src);
        }
      }
    }
    
    return { 
      scrapedPreviewVideos: previewVideos,
      scrapedPhoneScreenshots: phoneScreenshots 
    };
  } catch (error) {
    console.error('Error scraping App Store page:', error);
    return { 
      scrapedPreviewVideos: [],
      scrapedPhoneScreenshots: [] 
    };
  }
}

// Main function to combine API data and scraped data
async function getCompleteAppStoreData(appId: string) {
  try {
    // Get data from iTunes API
    const appInfo = await fetchItunesApiData(appId);
    
    // Get additional data through scraping
    const scrapedData = await scrapeAppStorePage(appId);
    
    // Combine the data, prioritizing the API data but filling gaps with scraped data
    const screenshots = appInfo.screenshotUrls || [];
    const apiVideos = appInfo.previewVideos || [];
    
    // Use scraped data if API didn't return videos
    const previewVideos = apiVideos.length > 0 
      ? apiVideos 
      : scrapedData.scrapedPreviewVideos;
    
    // Use API screenshots but fall back to scraped ones if needed
    const phoneScreenshots = screenshots.length > 0 
      ? screenshots 
      : scrapedData.scrapedPhoneScreenshots;
    
    console.log(`Found ${phoneScreenshots.length} screenshots and ${previewVideos.length} preview videos for app ${appInfo.trackName}`);
    
    return {
      name: appInfo.trackName,
      developer: appInfo.artistName,
      bundle_id: appInfo.bundleId,
      platform: 'iOS',
      icon_url: appInfo.artworkUrl512 || appInfo.artworkUrl100,
      description: appInfo.description,
      category: appInfo.primaryGenreName,
      rating: appInfo.averageUserRating,
      rating_count: appInfo.userRatingCount,
      price: appInfo.price,
      currency: appInfo.currency,
      version: appInfo.version,
      release_notes: appInfo.releaseNotes,
      content_rating: appInfo.contentAdvisoryRating,
      screenshots: phoneScreenshots,
      preview_videos: previewVideos
    };
  } catch (error) {
    console.error('Error getting complete app data:', error);
    throw error;
  }
}

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

// Same Play Store data function as before
const fetchPlayStoreData = async (appId: string): Promise<any> => {
  try {
    // For Play Store, we'll return minimal data
    return {
      name: appId, // Placeholder
      package_name: appId,
      platform: 'Android',
      publisher: 'Unknown',
      screenshots: [],
      preview_videos: []
    };
  } catch (error) {
    console.error('Error fetching Play Store data:', error);
    throw error;
  }
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
      appData = await getCompleteAppStoreData(appId);
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
    console.error('Error in fetch-app-store-complete function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      status: 'error'
    }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
