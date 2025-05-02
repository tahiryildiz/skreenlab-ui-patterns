
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, CheckCircle } from 'lucide-react';
import { App } from '@/types';
import { useAppMetadata } from '@/hooks/useAppMetadata';
import AppInfoCard from './AppInfoCard';
import ErrorDisplay from './ErrorDisplay';

interface StepAppMetadataProps {
  appStoreLink: string;
  onConfirm: (app: App, heroImages?: string[]) => void;
  onBack: () => void;
}

const StepAppMetadata: React.FC<StepAppMetadataProps> = ({ 
  appStoreLink, 
  onConfirm,
  onBack
}) => {
  const { 
    loading, 
    error, 
    appData, 
    appStoreMedia,
    appStoreDetails,
    submitting, 
    saveAppData,
    retryFetch
  } = useAppMetadata(appStoreLink);

  const [selectedHeroImages, setSelectedHeroImages] = useState<string[]>([]);
  const [heroPositions, setHeroPositions] = useState<Record<string, number>>({});

  const handleConfirm = async () => {
    const savedApp = await saveAppData();
    if (savedApp) {
      // Sort hero images by position before passing them
      const sortedHeroImages = [...selectedHeroImages].sort(
        (a, b) => (heroPositions[a] || 999) - (heroPositions[b] || 999)
      );
      onConfirm(savedApp, sortedHeroImages.length > 0 ? sortedHeroImages : undefined);
    }
  };

  const handleSelectHeroImages = (urls: string[], positions: Record<string, number>) => {
    setSelectedHeroImages(urls);
    setHeroPositions(positions);
  };

  return (
    <Card className="border-0 shadow-none">
      <CardContent className="pt-6">
        <div className="mb-6 text-center">
          <div className="bg-primary/10 inline-flex rounded-full p-3 mb-4">
            <CheckCircle className="h-6 w-6 text-primary" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Confirm App Details</h2>
          <p className="text-gray-500">
            Is this the correct app?
          </p>
        </div>
        
        {loading ? (
          <div className="py-8 flex justify-center">
            <Loader2 className="h-8 w-8 text-primary animate-spin" />
          </div>
        ) : error ? (
          <ErrorDisplay 
            message={error} 
            onBack={onBack}
            onRetry={retryFetch} 
          />
        ) : appData && (
          <div className="space-y-6">
            <AppInfoCard 
              appData={appData} 
              appStoreLink={appStoreLink} 
              appStoreMedia={appStoreMedia}
              appStoreDetails={appStoreDetails}
              onSelectHeroImages={handleSelectHeroImages}
            />
            
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                variant="outline"
                onClick={onBack}
                className="flex-1"
                disabled={submitting}
              >
                Back
              </Button>
              <Button 
                onClick={handleConfirm}
                className="flex-1"
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Yes, Continue'
                )}
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default StepAppMetadata;
