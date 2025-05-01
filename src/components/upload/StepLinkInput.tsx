
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { LinkIcon } from 'lucide-react';

interface StepLinkInputProps {
  onSubmit: (link: string) => void;
}

const StepLinkInput: React.FC<StepLinkInputProps> = ({ onSubmit }) => {
  const [link, setLink] = useState('');
  const [error, setError] = useState<string | null>(null);
  
  const validateUrl = (url: string) => {
    // Simple validation for App Store or Play Store URLs
    const isAppStore = url.includes('apps.apple.com');
    const isPlayStore = url.includes('play.google.com/store/apps');
    
    if (!url.startsWith('https://')) {
      return 'URL must start with https://';
    }
    
    if (!isAppStore && !isPlayStore) {
      return 'URL must be from App Store or Google Play Store';
    }
    
    return null;
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const validationError = validateUrl(link);
    
    if (validationError) {
      setError(validationError);
      return;
    }
    
    setError(null);
    onSubmit(link);
  };
  
  return (
    <Card className="border-0 shadow-none">
      <CardContent className="pt-6">
        <div className="mb-6 text-center">
          <div className="bg-primary/10 inline-flex rounded-full p-3 mb-4">
            <LinkIcon className="h-6 w-6 text-primary" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Add App Store Link</h2>
          <p className="text-gray-500">
            Paste a valid App Store or Google Play Store link to begin
          </p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Input
              type="url"
              value={link}
              onChange={(e) => setLink(e.target.value)}
              placeholder="Paste the App Store or Play Store URL here..."
              className="h-12"
              required
            />
            {error && <p className="text-destructive mt-2 text-sm">{error}</p>}
          </div>
          
          <Button 
            type="submit" 
            className="w-full h-12" 
            disabled={!link}
          >
            Continue
          </Button>
        </form>
        
        <div className="mt-6 text-center text-sm text-gray-500">
          <p>Example URLs:</p>
          <p className="text-xs mt-1">
            https://apps.apple.com/us/app/notion-notes-docs-tasks/id1232780281
            <br />
            https://play.google.com/store/apps/details?id=com.spotify.music
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default StepLinkInput;
