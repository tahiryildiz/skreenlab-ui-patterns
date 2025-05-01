
import React, { useState, useEffect } from 'react';
import { ExternalLink } from 'lucide-react';
import { App } from '@/types';
import { AppStoreMedia } from '@/hooks/useAppMetadata';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface AppInfoCardProps {
  appData: App;
  appStoreLink: string;
  appStoreMedia?: AppStoreMedia | null;
  onSelectHeroImages?: (urls: string[], positions: Record<string, number>) => void;
}

const AppInfoCard: React.FC<AppInfoCardProps> = ({ 
  appData, 
  appStoreLink,
  appStoreMedia,
  onSelectHeroImages 
}) => {
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [heroPositions, setHeroPositions] = useState<Record<string, number>>({});
  const maxSelectedImages = 3;

  // Track which position is being assigned
  const getNextAvailablePosition = (): number => {
    const usedPositions = Object.values(heroPositions);
    for (let i = 1; i <= maxSelectedImages; i++) {
      if (!usedPositions.includes(i)) {
        return i;
      }
    }
    return 1; // Default to position 1 if all are used
  };

  const handleImageToggle = (imageUrl: string) => {
    setSelectedImages(prev => {
      if (prev.includes(imageUrl)) {
        // Remove the image
        const newSelected = prev.filter(url => url !== imageUrl);
        
        // Update positions
        setHeroPositions(prevPositions => {
          const newPositions = { ...prevPositions };
          delete newPositions[imageUrl];
          return newPositions;
        });
        
        return newSelected;
      } else {
        // If already at max selection, don't add more
        if (prev.length >= maxSelectedImages) {
          return prev;
        }
        
        // Add the image and assign it a position
        const newSelected = [...prev, imageUrl];
        
        // Assign a position to the new image
        setHeroPositions(prevPositions => {
          return {
            ...prevPositions,
            [imageUrl]: getNextAvailablePosition()
          };
        });
        
        return newSelected;
      }
    });
  };

  const updateHeroPosition = (imageUrl: string, position: number) => {
    if (position < 1 || position > maxSelectedImages) return;
    
    // Check if another image already has this position
    const imageWithPosition = Object.entries(heroPositions).find(
      ([url, pos]) => pos === position && url !== imageUrl
    );
    
    setHeroPositions(prev => {
      const newPositions = { ...prev };
      
      // Swap positions if another image has the requested position
      if (imageWithPosition) {
        const [otherUrl] = imageWithPosition;
        newPositions[otherUrl] = prev[imageUrl] || getNextAvailablePosition();
      }
      
      // Set the new position
      newPositions[imageUrl] = position;
      return newPositions;
    });
  };

  React.useEffect(() => {
    if (onSelectHeroImages) {
      onSelectHeroImages(selectedImages, heroPositions);
    }
  }, [selectedImages, heroPositions, onSelectHeroImages]);

  const hasScreenshots = appStoreMedia && 
    (appStoreMedia.screenshots.length > 0 || 
     (appStoreMedia.ipad_screenshots && appStoreMedia.ipad_screenshots.length > 0));

  return (
    <div className="space-y-4">
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

      {hasScreenshots && (
        <div className="border rounded-lg p-4">
          <h4 className="font-medium mb-3">App Store Screenshots</h4>
          <Tabs defaultValue="phone">
            <TabsList>
              {appStoreMedia?.screenshots && appStoreMedia.screenshots.length > 0 && (
                <TabsTrigger value="phone">Phone</TabsTrigger>
              )}
              {appStoreMedia?.ipad_screenshots && appStoreMedia.ipad_screenshots.length > 0 && (
                <TabsTrigger value="tablet">Tablet</TabsTrigger>
              )}
            </TabsList>
            
            {appStoreMedia?.screenshots && appStoreMedia.screenshots.length > 0 && (
              <TabsContent value="phone">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {appStoreMedia.screenshots.map((screenshot, index) => (
                    <div key={index} className="relative">
                      <div className="relative overflow-hidden rounded-lg aspect-[9/16]">
                        <img 
                          src={screenshot} 
                          alt={`Screenshot ${index + 1}`} 
                          className="object-cover w-full h-full"
                        />
                        <div className="absolute top-2 right-2 flex items-center space-x-2">
                          <Checkbox 
                            checked={selectedImages.includes(screenshot)}
                            onCheckedChange={() => handleImageToggle(screenshot)}
                            disabled={!selectedImages.includes(screenshot) && selectedImages.length >= maxSelectedImages}
                          />
                        </div>

                        {selectedImages.includes(screenshot) && (
                          <div className="absolute bottom-2 right-2 bg-white rounded-full h-8 w-8 flex items-center justify-center border-2 border-primary text-primary font-bold">
                            {heroPositions[screenshot]}
                          </div>
                        )}
                      </div>
                      
                      {selectedImages.includes(screenshot) && (
                        <div className="mt-2 flex items-center justify-center space-x-2">
                          {[1, 2, 3].map(position => (
                            <button
                              key={position}
                              onClick={() => updateHeroPosition(screenshot, position)}
                              className={`h-8 w-8 rounded-full flex items-center justify-center text-sm font-medium ${
                                heroPositions[screenshot] === position 
                                  ? 'bg-primary text-white' 
                                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                              }`}
                            >
                              {position}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </TabsContent>
            )}
            
            {appStoreMedia?.ipad_screenshots && appStoreMedia.ipad_screenshots.length > 0 && (
              <TabsContent value="tablet">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {appStoreMedia.ipad_screenshots.map((screenshot, index) => (
                    <div key={index} className="relative">
                      <div className="relative overflow-hidden rounded-lg aspect-[4/3]">
                        <img 
                          src={screenshot} 
                          alt={`iPad Screenshot ${index + 1}`} 
                          className="object-cover w-full h-full"
                        />
                        <div className="absolute top-2 right-2 flex items-center space-x-2">
                          <Checkbox 
                            checked={selectedImages.includes(screenshot)}
                            onCheckedChange={() => handleImageToggle(screenshot)}
                            disabled={!selectedImages.includes(screenshot) && selectedImages.length >= maxSelectedImages}
                          />
                        </div>

                        {selectedImages.includes(screenshot) && (
                          <div className="absolute bottom-2 right-2 bg-white rounded-full h-8 w-8 flex items-center justify-center border-2 border-primary text-primary font-bold">
                            {heroPositions[screenshot]}
                          </div>
                        )}
                      </div>

                      {selectedImages.includes(screenshot) && (
                        <div className="mt-2 flex items-center justify-center space-x-2">
                          {[1, 2, 3].map(position => (
                            <button
                              key={position}
                              onClick={() => updateHeroPosition(screenshot, position)}
                              className={`h-8 w-8 rounded-full flex items-center justify-center text-sm font-medium ${
                                heroPositions[screenshot] === position 
                                  ? 'bg-primary text-white' 
                                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                              }`}
                            >
                              {position}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </TabsContent>
            )}
          </Tabs>

          {onSelectHeroImages && (
            <div className="mt-3 text-sm text-gray-500">
              Select up to {maxSelectedImages} screenshots as hero images ({selectedImages.length}/{maxSelectedImages} selected). Click on the numbers to set display order.
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AppInfoCard;
