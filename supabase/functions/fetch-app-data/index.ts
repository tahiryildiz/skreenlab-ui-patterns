
// This function fetches app metadata from the App Store or Play Store based on the URL provided
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

async function fetchAppStoreData(appId: string) {
  try {
    const response = await fetch(
      `https://itunes.apple.com/lookup?id=${appId}&country=us`,
      { method: "GET" }
    );
    const data = await response.json();
    
    if (data.resultCount === 0) {
      throw new Error("App not found");
    }
    
    const app = data.results[0];
    
    return {
      name: app.trackName,
      platform: "iOS",
      icon_url: app.artworkUrl512 || app.artworkUrl100,
      publisher: app.sellerName,
      bundle_id: app.bundleId,
      description: app.description
    };
  } catch (error) {
    console.error("Error fetching App Store data:", error);
    throw error;
  }
}

async function fetchPlayStoreData(packageName: string) {
  // Note: This is a simplified version as there's no official Google Play Store API
  // In a production app, you would use a proper backend service that scrapes the Play Store
  // or integrates with a third-party API
  try {
    // Return some minimal data based on package name
    // In a real implementation, this would fetch actual data from the Play Store
    return {
      name: packageName.split(".").pop(),
      platform: "Android",
      icon_url: null,
      publisher: "Unknown Publisher", // Would be fetched in real implementation
      bundle_id: packageName,
      description: ""
    };
  } catch (error) {
    console.error("Error fetching Play Store data:", error);
    throw error;
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { appStoreLink } = await req.json();
    
    if (!appStoreLink) {
      return new Response(
        JSON.stringify({ error: "No app store link provided" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    let appData;
    
    if (appStoreLink.includes("apps.apple.com")) {
      const appIdMatch = appStoreLink.match(/id(\d+)/);
      const appId = appIdMatch ? appIdMatch[1] : null;
      
      if (!appId) {
        return new Response(
          JSON.stringify({ error: "Invalid App Store URL format" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      appData = await fetchAppStoreData(appId);
    } else if (appStoreLink.includes("play.google.com")) {
      const packageMatch = appStoreLink.match(/id=([^&]+)/);
      const packageName = packageMatch ? packageMatch[1] : null;
      
      if (!packageName) {
        return new Response(
          JSON.stringify({ error: "Invalid Play Store URL format" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      appData = await fetchPlayStoreData(packageName);
    } else {
      return new Response(
        JSON.stringify({ error: "Unsupported app store URL" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    return new Response(
      JSON.stringify({ appData }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in fetch-app-data function:", error);
    
    return new Response(
      JSON.stringify({ error: error.message || "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
