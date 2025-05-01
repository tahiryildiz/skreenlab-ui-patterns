
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
    <Card className="app-card overflow-hidden flex flex-col h-full">
      <CardContent className="p-0 flex-1 flex flex-col">
        <a href={`/app/${app.id}`} className="block flex-1 flex flex-col">
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

          {/* Screenshots Display - Increased height */}
          <div className="mt-2 p-4 pt-0 flex-1">
            <div className="relative aspect-[3/4] w-full h-[400px] rounded-lg overflow-hidden bg-gray-50 flex items-center justify-center">
              {appScreenshots.length > 0 ? (
                <div className="relative w-full h-full">
                  {/* Display screenshots in a stacked, offset arrangement */}
                  {appScreenshots.map((screenshot, index) => (
                    <div 
                      key={screenshot.id}
                      className={`absolute top-0 left-0 w-full h-full transform`}
                      style={{
                        transform: `rotate(${(index - 1) * 3}deg) translateX(${(index - 1) * 5}%)`,
                        zIndex: appScreenshots.length - index,
                        transition: 'all 0.3s ease'
                      }}
                    >
                      <img 
                        src={screenshot.image_url} 
                        alt={`${app.name} screenshot ${index + 1}`}
                        className="w-full h-full object-contain shadow-lg rounded-md"
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <span className="text-gray-400">No screenshots</span>
              )}
            </div>
          </div>

          <div className="border-t border-gray-100 bg-gray-50 px-4 py-3 mt-auto flex justify-between items-center">
            <div>
              <h4 className="font-semibold text-gray-800">{appCategory}</h4>
              <span className="text-gray-500 text-sm">{app.screenshots_count} screens</span>
            </div>
            <span className="text-skreenlab-blue font-medium">View App →</span>
          </div>
        </a>
      </CardContent>
    </Card>
  );
};

export default AppCard;
