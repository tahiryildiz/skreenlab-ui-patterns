
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import ScreenshotCard from '@/components/ScreenshotCard';
import ScreenshotLightbox from '@/components/ScreenshotLightbox';
import CategoryFilter from '@/components/CategoryFilter';
import { App, Screenshot, ScreenCategory } from '@/types';
import { getAppById, getScreenshotsByApp } from '@/services/mockData';

const AppDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [app, setApp] = useState<App | null>(null);
  const [screenshots, setScreenshots] = useState<Screenshot[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<ScreenCategory | null>(null);
  const [selectedScreenshot, setSelectedScreenshot] = useState<Screenshot | null>(null);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  useEffect(() => {
    if (id) {
      const appData = getAppById(id);
      if (appData) {
        setApp(appData);
        const screenshotData = getScreenshotsByApp(appData.name);
        setScreenshots(screenshotData);
      }
    }
  }, [id]);

  const filteredScreenshots = selectedCategory 
    ? screenshots.filter(screenshot => screenshot.category === selectedCategory)
    : screenshots;

  const handleScreenshotClick = (screenshot: Screenshot) => {
    setSelectedScreenshot(screenshot);
    setLightboxOpen(true);
  };

  if (!app) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <p className="text-xl text-gray-500">Loading app details...</p>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1">
        {/* App Header */}
        <section className="py-8 border-b">
          <div className="container px-4 md:px-6">
            <div className="flex items-center">
              <div className="w-16 h-16 rounded-lg overflow-hidden mr-4 bg-gray-100 flex items-center justify-center">
                {app.icon_url ? (
                  <img src={app.icon_url} alt={app.name} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-gray-400 text-2xl">{app.name.charAt(0)}</span>
                )}
              </div>
              
              <div>
                <h1 className="text-2xl font-bold mb-1">{app.name}</h1>
                <div className="flex items-center text-sm text-gray-500 space-x-2">
                  <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-gray-100">
                    {app.platform}
                  </span>
                  <span>{app.publisher}</span>
                </div>
              </div>
            </div>
          </div>
        </section>
        
        {/* Screenshots Section */}
        <section className="py-8">
          <div className="container px-4 md:px-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">Screenshots</h2>
            </div>
            
            <div className="mb-6">
              <CategoryFilter 
                selectedCategory={selectedCategory}
                onSelectCategory={setSelectedCategory}
              />
            </div>
            
            {filteredScreenshots.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {filteredScreenshots.map(screenshot => (
                  <ScreenshotCard 
                    key={screenshot.id} 
                    screenshot={screenshot} 
                    onClick={() => handleScreenshotClick(screenshot)}
                  />
                ))}
              </div>
            ) : (
              <div className="bg-gray-50 text-center p-8 rounded-lg">
                <p className="text-gray-500">
                  {selectedCategory 
                    ? `No ${selectedCategory} screenshots found for this app.` 
                    : 'No screenshots found for this app.'}
                </p>
              </div>
            )}
          </div>
        </section>
      </main>
      
      <ScreenshotLightbox
        screenshot={selectedScreenshot}
        isOpen={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
      />
      
      <Footer />
    </div>
  );
};

export default AppDetail;
