
import React from 'react';

interface PlatformFilterProps {
  selectedPlatform: string | null;
  onSelectPlatform: (platform: string | null) => void;
}

const platforms = ['iOS', 'Android', 'Web'];

const PlatformFilter: React.FC<PlatformFilterProps> = ({ 
  selectedPlatform, 
  onSelectPlatform 
}) => {
  return (
    <div className="flex space-x-2">
      <button
        onClick={() => onSelectPlatform(null)}
        className={`px-4 py-2 rounded-full text-sm transition-colors ${
          selectedPlatform === null
            ? 'bg-skreenlab-blue text-white'
            : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
        }`}
      >
        All Platforms
      </button>
      
      {platforms.map((platform) => (
        <button
          key={platform}
          onClick={() => onSelectPlatform(platform)}
          className={`px-4 py-2 rounded-full text-sm transition-colors ${
            selectedPlatform === platform
              ? 'bg-skreenlab-blue text-white'
              : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
          }`}
        >
          {platform}
        </button>
      ))}
    </div>
  );
};

export default PlatformFilter;
