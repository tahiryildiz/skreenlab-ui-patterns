
import React, { useState, useEffect } from 'react';
import { ExternalLink, Star } from 'lucide-react';
import { App } from '@/types';
import { AppStoreMedia, AppStoreDetails } from '@/hooks/useAppMetadata';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface AppInfoCardProps {
  appData: App;
  appStoreLink: string;
  appStoreMedia?: AppStoreMedia | null;
  appStoreDetails?: AppStoreDetails | null;
  onSelectHeroMedia?: (imageUrls: string[], videoUrls: string[], positions: Record<string, number>) => void;
}

const AppInfoCard: React.FC<AppInfoCardProps> = ({ 
  appData, 
  appStoreLink,
  appStoreMedia,
  appStoreDetails,
  onSelectHeroMedia 
}) => {
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [selectedVideos, setSelectedVideos] = useState<string[]>([]);
  const [heroPositions, setHeroPositions] = useState<Record<string, number>>({});
  const maxSelectedMedia = 3;

  // Track which position is being assigned
  const getNextAvailablePosition = (): number => {
    const usedPositions = Object.values(heroPositions);
    for (let i = 1; i <= maxSelectedMedia; i++) {
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
        const totalSelectedCount = prev.length + selectedVideos.length;
        if (totalSelectedCount >= maxSelectedMedia) {
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

  const handleVideoToggle = (videoUrl: string) => {
    setSelectedVideos(prev => {
      if (prev.includes(videoUrl)) {
        // Remove the video
        const newSelected = prev.filter(url => url !== videoUrl);
        
        // Update positions
        setHeroPositions(prevPositions => {
          const newPositions = { ...prevPositions };
          delete newPositions[videoUrl];
          return newPositions;
        });
        
        return newSelected;
      } else {
        // If already at max selection, don't add more
        const totalSelectedCount = selectedImages.length + prev.length;
        if (totalSelectedCount >= maxSelectedMedia) {
          return prev;
        }
        
        // Add the video and assign it a position
        const newSelected = [...prev, videoUrl];
        
        // Assign a position to the new video
        setHeroPositions(prevPositions => {
          return {
            ...prevPositions,
            [videoUrl]: getNextAvailablePosition()
          };
        });
        
        return newSelected;
      }
    });
  };

  const updateHeroPosition = (mediaUrl: string, position: number) => {
    if (position < 1 || position > maxSelectedMedia) return;
    
    // Check if another image/video already has this position
    const mediaWithPosition = Object.entries(heroPositions).find(
      ([url, pos]) => pos === position && url !== mediaUrl
    );
    
    setHeroPositions(prev => {
      const newPositions = { ...prev };
      
      // Swap positions if another media has the requested position
      if (mediaWithPosition) {
        const [otherUrl] = mediaWithPosition;
        newPositions[otherUrl] = prev[mediaUrl] || getNextAvailablePosition();
      }
      
      // Set the new position
      newPositions[mediaUrl] = position;
      return newPositions;
    });
  };

  useEffect(() => {
    if (onSelectHeroMedia) {
      onSelectHeroMedia(selectedImages, selectedVideos, heroPositions);
    }
  }, [selectedImages, selectedVideos, heroPositions, onSelectHeroMedia]);

  // Check if we have screenshots or videos to display from app store data
  const hasScreenshots = appStoreMedia && (appStoreMedia.screenshots?.length > 0);
  const hasVideos = appStoreMedia && (appStoreMedia.preview_videos && appStoreMedia.preview_videos.length > 0);
  
  // Calculate total selected media count
  const totalSelectedCount = selectedImages.length + selectedVideos.length;

  // Format app rating to display with stars
  const renderRating = () => {
    if (!appStoreDetails?.rating) return null;
    
    return (
      <div className="flex items-center mt-1">
        <div className="flex items-center mr-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star 
              key={star} 
              className={`h-3 w-3 ${star <= Math.round(appStoreDetails.rating) 
                ? 'text-yellow-400 fill-yellow-400' 
                : 'text-gray-300'}`} 
            />
          ))}
        </div>
        <span className="text-xs text-gray-500">
          {appStoreDetails.rating.toFixed(1)} 
          {appStoreDetails.rating_count && ` (${appStoreDetails.rating_count.toLocaleString()})`}
        </span>
      </div>
    );
  };

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
          <div className="flex items-center">
            <h3 className="font-medium text-lg">{appData.name}</h3>
            {appStoreDetails?.price !== undefined && appStoreDetails.price > 0 ? (
              <span className="ml-2 text-sm text-green-600 font-medium">
                {appStoreDetails.currency === 'USD' ? '$' : ''}
                {appStoreDetails.price.toFixed(2)}
              </span>
            ) : (
              <span className="ml-2 text-xs px-2 py-0.5 bg-gray-100 rounded-full text-gray-600">Free</span>
            )}
          </div>
          <p className="text-gray-500 text-sm">{appData.publisher}</p>
          {appStoreDetails?.category && (
            <span className="text-xs text-gray-500">
              {appStoreDetails.category} • {appStoreDetails.content_rating || 'Not Rated'}
            </span>
          )}
          {renderRating()}
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

      {/* Always show this section if onSelectHeroMedia is provided */}
      {onSelectHeroMedia && (
        <div className="border rounded-lg p-4">
          <h4 className="font-medium mb-3">App Store Media</h4>
          
          {(hasScreenshots || hasVideos) ? (
            <Tabs defaultValue={hasVideos ? "videos" : "screenshots"}>
              <TabsList>
                {hasScreenshots && (
                  <TabsTrigger value="screenshots">Screenshots</TabsTrigger>
                )}
                {hasVideos && (
                  <TabsTrigger value="videos">Videos</TabsTrigger>
                )}
              </TabsList>
              
              {hasScreenshots && (
                <TabsContent value="screenshots">
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {appStoreMedia?.screenshots.map((screenshot, index) => (
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
                              disabled={!selectedImages.includes(screenshot) && totalSelectedCount >= maxSelectedMedia}
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
              
              {hasVideos && (
                <TabsContent value="videos">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {appStoreMedia?.preview_videos?.map((video, index) => (
                      <div key={index} className="relative">
                        <div className="relative overflow-hidden rounded-lg aspect-[9/16]">
                          <video 
                            src={video} 
                            controls 
                            className="w-full h-full object-contain"
                            poster={appStoreMedia.screenshots?.[0]}
                          >
                            Your browser does not support the video tag.
                          </video>
                          <div className="absolute top-2 right-2 flex items-center space-x-2">
                            <Checkbox 
                              checked={selectedVideos.includes(video)}
                              onCheckedChange={() => handleVideoToggle(video)}
                              disabled={!selectedVideos.includes(video) && totalSelectedCount >= maxSelectedMedia}
                            />
                          </div>

                          {selectedVideos.includes(video) && (
                            <div className="absolute bottom-2 right-2 bg-white rounded-full h-8 w-8 flex items-center justify-center border-2 border-primary text-primary font-bold">
                              {heroPositions[video]}
                            </div>
                          )}
                        </div>
                        
                        {selectedVideos.includes(video) && (
                          <div className="mt-2 flex items-center justify-center space-x-2">
                            {[1, 2, 3].map(position => (
                              <button
                                key={position}
                                onClick={() => updateHeroPosition(video, position)}
                                className={`h-8 w-8 rounded-full flex items-center justify-center text-sm font-medium ${
                                  heroPositions[video] === position 
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
          ) : (
            <div className="p-4 bg-gray-50 rounded-lg text-center">
              <p className="text-gray-500">No screenshots or videos available from the App Store.</p>
              <p className="mt-2 text-sm text-gray-400">You can upload your own screenshots in the next step.</p>
            </div>
          )}

          <div className="mt-3 text-sm text-gray-500">
            Select up to {maxSelectedMedia} media items as hero content ({totalSelectedCount}/{maxSelectedMedia} selected). 
            {totalSelectedCount > 0 && " Click on the numbers to set display order."}
          </div>
        </div>
      )}
      
      {/* App Description */}
      {appStoreDetails?.description && (
        <div className="border rounded-lg p-4">
          <h4 className="font-medium mb-2">Description</h4>
          <div className="text-sm text-gray-600 max-h-36 overflow-y-auto">
            {appStoreDetails.description.split('\n').map((paragraph, idx) => (
              paragraph ? <p key={idx} className="mb-2">{paragraph}</p> : null
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AppInfoCard;
