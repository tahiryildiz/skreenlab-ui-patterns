
import React from 'react';
import { Screenshot } from '../types';
import { Card, CardContent } from '@/components/ui/card';

interface ScreenshotCardProps {
  screenshot: Screenshot;
  onClick?: () => void;
}

const ScreenshotCard: React.FC<ScreenshotCardProps> = ({ screenshot, onClick }) => {
  return (
    <Card className="screenshot-card overflow-hidden cursor-pointer" onClick={onClick}>
      <CardContent className="p-0">
        <div className="aspect-[9/16] w-full bg-gray-100 overflow-hidden">
          <img 
            src={screenshot.image_url} 
            alt={`${screenshot.app_name} - ${screenshot.category} screenshot`} 
            className="w-full h-full object-cover"
          />
        </div>
        <div className="p-3">
          <div className="mb-2">
            <span className="category-badge">{screenshot.category}</span>
          </div>
          <div className="flex flex-wrap gap-1">
            {screenshot.tags.slice(0, 3).map((tag, index) => (
              <span key={index} className="tag-pill">
                #{tag}
              </span>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ScreenshotCard;
