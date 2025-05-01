
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tag, Info } from 'lucide-react';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger 
} from "@/components/ui/tooltip";
import { supabase } from '@/integrations/supabase/client';
import { UploadScreenshot } from '@/types/upload';

interface ScreenCategory {
  id: string;
  name: string;
  description: string | null;
  category_group: string | null;
}

interface StepScreenTypeSelectProps {
  screenshot: UploadScreenshot;
  index: number;
  totalCount: number;
  onSelect: (index: number, screenCategoryId: string) => void;
  onBack: () => void;
}

const StepScreenTypeSelect: React.FC<StepScreenTypeSelectProps> = ({
  screenshot,
  index,
  totalCount,
  onSelect,
  onBack
}) => {
  const [screenCategories, setScreenCategories] = useState<ScreenCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoryGroups, setCategoryGroups] = useState<Record<string, ScreenCategory[]>>({});
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(
    screenshot.screenCategoryId
  );

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        
        // Fetch screen categories
        const { data: categories, error } = await supabase
          .from('screen_categories')
          .select('id, name, description, category_group')
          .order('name');
          
        if (error) throw error;
        
        setScreenCategories(categories || []);
        
        // Group categories
        const grouped = (categories || []).reduce<Record<string, ScreenCategory[]>>((acc, cat) => {
          const group = cat.category_group || 'Other';
          if (!acc[group]) {
            acc[group] = [];
          }
          acc[group].push(cat);
          return acc;
        }, {});
        
        setCategoryGroups(grouped);
      } catch (err) {
        console.error('Error fetching categories:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchCategories();
  }, []);

  const handleContinue = () => {
    if (selectedCategoryId) {
      onSelect(index, selectedCategoryId);
    }
  };

  // Get example image for a category (placeholder for now)
  const getCategoryExampleImage = (categoryName: string): string => {
    // This would ideally come from a database of example images
    return `https://placekitten.com/300/600?category=${categoryName}`;
  };

  return (
    <Card className="border-0 shadow-none">
      <CardContent className="pt-6">
        <div className="mb-6 text-center">
          <div className="bg-primary/10 inline-flex rounded-full p-3 mb-4">
            <Tag className="h-6 w-6 text-primary" />
          </div>
          <h2 className="text-2xl font-bold mb-2">
            Tag Screenshot {index + 1}/{totalCount}
          </h2>
          <p className="text-gray-500">
            Step 1: Select the screen type
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 gap-6">
          <div className="rounded-lg overflow-hidden border bg-gray-50 aspect-[9/19.5]">
            <img 
              src={screenshot.dataUrl} 
              alt={`Screenshot ${index + 1}`}
              className="w-full h-full object-contain"
            />
          </div>
          
          <div>
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <p>Loading screen types...</p>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="grid grid-cols-2 sm:grid-cols-2 gap-3">
                  {Object.entries(categoryGroups).map(([groupName, categories]) => (
                    <React.Fragment key={groupName}>
                      {categories.map((category) => (
                        <div
                          key={category.id}
                          className={`border rounded-lg p-3 cursor-pointer transition-all hover:border-primary/50 ${
                            selectedCategoryId === category.id ? 'border-primary bg-primary/5' : ''
                          }`}
                          onClick={() => setSelectedCategoryId(category.id)}
                        >
                          <div className="aspect-[9/16] w-full mb-2 bg-gray-100 rounded overflow-hidden">
                            <img 
                              src={getCategoryExampleImage(category.name)} 
                              alt={category.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium text-sm">{category.name}</h4>
                            {category.description && (
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Info className="h-4 w-4 text-gray-400" />
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p className="w-[200px] text-xs">{category.description}</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            )}
                          </div>
                        </div>
                      ))}
                    </React.Fragment>
                  ))}
                </div>
                
                <div className="flex flex-col sm:flex-row gap-3 mt-6">
                  <Button
                    variant="outline"
                    onClick={onBack}
                    className="flex-1"
                  >
                    Back
                  </Button>
                  <Button 
                    onClick={handleContinue}
                    className="flex-1"
                    disabled={!selectedCategoryId}
                  >
                    Continue
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default StepScreenTypeSelect;
