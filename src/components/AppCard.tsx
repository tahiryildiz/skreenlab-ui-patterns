
import React from 'react';
import { App } from '../types';
import { Card, CardContent } from '@/components/ui/card';

interface AppCardProps {
  app: App;
}

const AppCard: React.FC<AppCardProps> = ({ app }) => {
  return (
    <Card className="app-card overflow-hidden">
      <CardContent className="p-0">
        <a href={`/app/${app.id}`} className="block">
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

          <div className="border-t border-gray-100 bg-gray-50 px-4 py-2 text-xs flex justify-between items-center">
            <span className="text-gray-500">{app.screenshots_count} screenshots</span>
            <span className="text-skreenlab-blue font-medium">View App →</span>
          </div>
        </a>
      </CardContent>
    </Card>
  );
};

export default AppCard;
