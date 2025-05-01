
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { 
  Tag, 
  Info, 
  CheckCircle2 
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { UploadScreenshot } from '@/pages/Upload';

interface StepTagScreenshotsProps {
  screenshot: UploadScreenshot;
  index: number;
  totalCount: number;
  onSubmit: (index: number, screenCategoryId: string, uiElementIds: string[]) => void;
  onBack: () => void;
}

interface ScreenCategory {
  id: string;
  name: string;
  description: string | null;
}

interface UiElementType {
  id: string;
  name: string;
  category: string;
  description: string | null;
}

const StepTagScreenshots: React.FC<StepTagScreenshotsProps> = ({ 
  screenshot, 
  index,
  totalCount,
  onSubmit,
  onBack
}) => {
  const [screenCategories, setScreenCategories] = useState<ScreenCategory[]>([]);
  const [uiElementTypes, setUiElementTypes] = useState<UiElementType[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(
    screenshot.screenCategoryId
  );
  const [selectedElementIds, setSelectedElementIds] = useState<string[]>(
    screenshot.uiElementIds
  );
  const [loading, setLoading] = useState(true);
  const [elementsByCategory, setElementsByCategory] = useState<Record<string, UiElementType[]>>({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch screen categories
        const { data: categories, error: catError } = await supabase
          .from('screen_categories')
          .select('id, name, description');
          
        if (catError) throw catError;
        
        // Fetch UI element types
        const { data: elements, error: elemError } = await supabase
          .from('ui_element_types')
          .select('id, name, category, description');
          
        if (elemError) throw elemError;
        
        setScreenCategories(categories || []);
        setUiElementTypes(elements || []);
        
        // Group elements by category
        const grouped = (elements || []).reduce<Record<string, UiElementType[]>>((acc, element) => {
          if (!acc[element.category]) {
            acc[element.category] = [];
          }
          acc[element.category].push(element);
          return acc;
        }, {});
        
        setElementsByCategory(grouped);
      } catch (err) {
        console.error('Error fetching data:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  const toggleElementSelection = (elementId: string) => {
    setSelectedElementIds(prev => {
      if (prev.includes(elementId)) {
        return prev.filter(id => id !== elementId);
      } else {
        return [...prev, elementId];
      }
    });
  };

  const handleSubmitTags = () => {
    if (selectedCategoryId) {
      onSubmit(index, selectedCategoryId, selectedElementIds);
    }
  };

  return (
    <Card className="border-0 shadow-none">
      <CardContent className="pt-6">
        <div className="mb-6 text-center">
          <div className="bg-primary/10 inline-flex rounded-full p-3 mb-4">
            <Tag className="h-6 w-6 text-primary" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Tag Screenshot {index + 1}/{totalCount}</h2>
          <p className="text-gray-500">
            Specify screen type and UI elements present
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
          
          <div className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="screenCategory" className="block font-medium text-sm">
                Screen Type <span className="text-red-500">*</span>
              </label>
              <Select
                disabled={loading}
                value={selectedCategoryId || undefined}
                onValueChange={setSelectedCategoryId}
              >
                <SelectTrigger id="screenCategory">
                  <SelectValue placeholder="Select screen type" />
                </SelectTrigger>
                <SelectContent position="popper" className="max-h-[240px]">
                  {screenCategories.map(category => (
                    <SelectItem key={category.id} value={category.id}>
                      <div className="flex items-center">
                        <span>{category.name}</span>
                        {category.description && (
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Info className="ml-1 h-3.5 w-3.5 text-gray-400" />
                              </TooltipTrigger>
                              <TooltipContent>
                                <p className="w-[200px] text-xs">{category.description}</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="block font-medium text-sm">
                UI Elements Present
              </label>
              
              {loading ? (
                <div className="py-4 text-center text-gray-500">Loading elements...</div>
              ) : (
                <div className="space-y-4">
                  {Object.entries(elementsByCategory).map(([category, elements]) => (
                    <div key={category} className="space-y-2">
                      <h4 className="text-xs font-medium uppercase text-gray-500">
                        {category}
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {elements.map(element => (
                          <TooltipProvider key={element.id}>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <button
                                  type="button"
                                  onClick={() => toggleElementSelection(element.id)}
                                  className={`
                                    px-3 py-1.5 text-sm rounded-full flex items-center
                                    ${selectedElementIds.includes(element.id)
                                      ? 'bg-primary text-white'
                                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }
                                  `}
                                >
                                  {element.name}
                                  {selectedElementIds.includes(element.id) && (
                                    <CheckCircle2 className="ml-1 h-3.5 w-3.5" />
                                  )}
                                </button>
                              </TooltipTrigger>
                              {element.description && (
                                <TooltipContent>
                                  <p className="w-[200px] text-xs">{element.description}</p>
                                </TooltipContent>
                              )}
                            </Tooltip>
                          </TooltipProvider>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
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
            onClick={handleSubmitTags}
            className="flex-1"
            disabled={!selectedCategoryId}
          >
            {index === totalCount - 1 ? 'Finish' : 'Next Screenshot'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default StepTagScreenshots;
