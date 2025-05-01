
import React from 'react';
import { ExternalLink } from 'lucide-react';
import { App } from '@/types';

interface AppInfoCardProps {
  appData: App;
  appStoreLink: string;
}

const AppInfoCard: React.FC<AppInfoCardProps> = ({ appData, appStoreLink }) => {
  return (
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
  );
};

export default AppInfoCard;
