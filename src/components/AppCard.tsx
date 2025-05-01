
import React from 'react';
import { App } from '../types';
import { Card, CardContent } from '@/components/ui/card';
import { mockScreenshots } from '@/services/mockData';

interface AppCardProps {
  app: App;
}

const AppCard: React.FC<AppCardProps> = ({ app }) => {
  // Get up to 3 screenshots for this app
  const appScreenshots = mockScreenshots
    .filter(screenshot => screenshot.app_name === app.name)
    .slice(0, 3);
  
  // Get the category from the first screenshot or default to "unknown"
  const appCategory = appScreenshots.length > 0 
    ? appScreenshots[0].category.charAt(0).toUpperCase() + appScreenshots[0].category.slice(1) 
    : 'Unknown';

  return (
    <Card className="app-card overflow-hidden">
      <CardContent className="p-0">
        <a href={`/app/${app.id}`} className="block">
          {/* App header with icon and info */}
          <div className="p-4 flex items-center space-x-4">
            <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center">
              {app.icon_url ? (
                <img src={app.icon_url} alt={app.name} className="w-full h-full object-cover" />
              ) : (
                <span className="text-gray-400 text-2xl">{app.name.charAt(0)}</span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-base truncate">{app.name}</h3>
              <div className="flex items-center mt-1 text-xs text-gray-500 space-x-2">
                <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-gray-100">
                  {app.platform}
                </span>
                <span>{app.publisher}</span>
              </div>
            </div>
          </div>

          {/* Screenshots Display - New Layout */}
          <div className="bg-gray-50 p-4 rounded-2xl mx-4">
            <div className="relative w-full pb-[100%]">
              {appScreenshots.length > 0 ? (
                <>
                  {/* Map screenshots to positions based on index */}
                  {appScreenshots.map((screenshot, index) => {
                    let positionClasses = '';
                    
                    if (index === 0) {
                      // Center (main) screenshot
                      positionClasses = "absolute left-1/2 top-1/2 w-[41%] z-30 transform -translate-x-1/2 -translate-y-1/2 rounded-2xl shadow-lg";
                    } else if (index === 1) {
                      // Left screenshot
                      positionClasses = "absolute left-[5%] top-1/2 w-[33%] z-20 transform -translate-y-1/2 -rotate-5 rounded-xl shadow-md";
                    } else if (index === 2) {
                      // Right screenshot
                      positionClasses = "absolute right-[5%] top-1/2 w-[33%] z-20 transform -translate-y-1/2 rotate-5 rounded-xl shadow-md";
                    }
                    
                    return (
                      <div 
                        key={screenshot.id}
                        className={positionClasses}
                      >
                        <img 
                          src={screenshot.image_url} 
                          alt={`${app.name} screenshot ${index + 1}`}
                          className="w-full h-auto object-contain rounded-inherit"
                        />
                      </div>
                    );
                  })}
                </>
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-gray-400">No screenshots</span>
                </div>
              )}
            </div>
          </div>

          {/* Footer with category info */}
          <div className="border-t border-gray-100 bg-gray-50 px-4 py-3 mt-4 flex justify-between items-center">
            <div>
              <h4 className="font-semibold text-gray-800">{appCategory}</h4>
              <span className="text-gray-500 text-sm">{app.screenshots_count || appScreenshots.length} screens</span>
            </div>
            <span className="text-skreenlab-blue font-medium">View App →</span>
          </div>
        </a>
      </CardContent>
    </Card>
  );
};

export default AppCard;
