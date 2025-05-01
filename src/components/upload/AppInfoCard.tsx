
import React, { useState } from 'react';
import { ExternalLink, Image } from 'lucide-react';
import { App } from '@/types';
import { AppStoreMedia } from '@/hooks/useAppMetadata';
import { 
  Carousel, 
  CarouselContent, 
  CarouselItem, 
  CarouselNext, 
  CarouselPrevious
} from '@/components/ui/carousel';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';

interface AppInfoCardProps {
  appData: App;
  appStoreLink: string;
  appStoreMedia?: AppStoreMedia | null;
  onSelectHeroImages?: (urls: string[]) => void;
}

const AppInfoCard: React.FC<AppInfoCardProps> = ({ 
  appData, 
  appStoreLink,
  appStoreMedia,
  onSelectHeroImages 
}) => {
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const maxSelectedImages = 3;

  const handleImageToggle = (imageUrl: string) => {
    setSelectedImages(prev => {
      if (prev.includes(imageUrl)) {
        return prev.filter(url => url !== imageUrl);
      } else {
        // If already at max selection, remove the first one
        if (prev.length >= maxSelectedImages) {
          return [...prev.slice(1), imageUrl];
        }
        return [...prev, imageUrl];
      }
    });
  };

  React.useEffect(() => {
    if (onSelectHeroImages) {
      onSelectHeroImages(selectedImages);
    }
  }, [selectedImages, onSelectHeroImages]);

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
                <Carousel className="w-full">
                  <CarouselContent>
                    {appStoreMedia.screenshots.map((screenshot, index) => (
                      <CarouselItem key={index} className="basis-1/2 md:basis-1/3 lg:basis-1/4">
                        <div className="relative p-1">
                          <div className="relative overflow-hidden rounded-lg aspect-[9/16]">
                            <img 
                              src={screenshot} 
                              alt={`Screenshot ${index + 1}`} 
                              className="object-cover w-full h-full"
                            />
                            <div className="absolute top-2 right-2">
                              <Checkbox 
                                checked={selectedImages.includes(screenshot)}
                                onCheckedChange={() => handleImageToggle(screenshot)}
                                disabled={!selectedImages.includes(screenshot) && selectedImages.length >= maxSelectedImages}
                              />
                            </div>
                          </div>
                        </div>
                      </CarouselItem>
                    ))}
                  </CarouselContent>
                  <CarouselPrevious />
                  <CarouselNext />
                </Carousel>
              </TabsContent>
            )}
            
            {appStoreMedia?.ipad_screenshots && appStoreMedia.ipad_screenshots.length > 0 && (
              <TabsContent value="tablet">
                <Carousel className="w-full">
                  <CarouselContent>
                    {appStoreMedia.ipad_screenshots.map((screenshot, index) => (
                      <CarouselItem key={index} className="basis-1/2 md:basis-1/3 lg:basis-1/4">
                        <div className="relative p-1">
                          <div className="relative overflow-hidden rounded-lg aspect-[4/3]">
                            <img 
                              src={screenshot} 
                              alt={`iPad Screenshot ${index + 1}`} 
                              className="object-cover w-full h-full"
                            />
                            <div className="absolute top-2 right-2">
                              <Checkbox 
                                checked={selectedImages.includes(screenshot)}
                                onCheckedChange={() => handleImageToggle(screenshot)}
                                disabled={!selectedImages.includes(screenshot) && selectedImages.length >= maxSelectedImages}
                              />
                            </div>
                          </div>
                        </div>
                      </CarouselItem>
                    ))}
                  </CarouselContent>
                  <CarouselPrevious />
                  <CarouselNext />
                </Carousel>
              </TabsContent>
            )}
          </Tabs>

          {onSelectHeroImages && (
            <div className="mt-3 text-sm text-gray-500">
              Select up to {maxSelectedImages} screenshots as hero images ({selectedImages.length}/{maxSelectedImages} selected)
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AppInfoCard;
