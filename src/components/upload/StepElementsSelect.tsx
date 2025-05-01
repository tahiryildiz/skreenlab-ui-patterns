
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { 
  Tag, 
  Info, 
  CheckCircle2,
  LayoutGrid,
  Layers,
  ToggleLeft,
  Images
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { UploadScreenshot } from '@/types/upload';
import { Input } from '@/components/ui/input';

interface StepElementsSelectProps {
  screenshot: UploadScreenshot;
  index: number;
  totalCount: number;
  onSelect: (index: number, uiElementIds: string[]) => void;
  onBack: () => void;
}

interface UiElementType {
  id: string;
  name: string;
  category: string;
  description: string | null;
}

const ELEMENT_TABS = [
  { id: 'navigation', label: 'Navigation', icon: <LayoutGrid className="h-4 w-4" /> },
  { id: 'interaction', label: 'Buttons & Inputs', icon: <ToggleLeft className="h-4 w-4" /> },
  { id: 'media', label: 'Media', icon: <Images className="h-4 w-4" /> },
  { id: 'layout', label: 'Layout', icon: <Layers className="h-4 w-4" /> }
];

const StepElementsSelect: React.FC<StepElementsSelectProps> = ({ 
  screenshot, 
  index,
  totalCount,
  onSelect,
  onBack
}) => {
  const [uiElementTypes, setUiElementTypes] = useState<UiElementType[]>([]);
  const [selectedElementIds, setSelectedElementIds] = useState<string[]>(
    screenshot.uiElementIds
  );
  const [loading, setLoading] = useState(true);
  const [elementsByCategory, setElementsByCategory] = useState<Record<string, UiElementType[]>>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('navigation');

  useEffect(() => {
    const fetchElements = async () => {
      try {
        setLoading(true);
        
        // Fetch UI element types
        const { data: elements, error } = await supabase
          .from('ui_element_types')
          .select('id, name, category, description');
          
        if (error) throw error;
        
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
        console.error('Error fetching elements:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchElements();
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

  const handleSubmit = () => {
    onSelect(index, selectedElementIds);
  };

  // Filter elements based on search query
  const filteredElements = Object.entries(elementsByCategory).reduce(
    (acc, [category, elements]) => {
      const filtered = searchQuery 
        ? elements.filter(el => el.name.toLowerCase().includes(searchQuery.toLowerCase()))
        : elements;
      
      if (filtered.length > 0) {
        acc[category] = filtered;
      }
      
      return acc;
    },
    {} as Record<string, UiElementType[]>
  );

  // Get icon for UI element
  const getElementIcon = (elementName: string) => {
    // This would ideally map element names to appropriate icons
    return <ToggleLeft className="h-4 w-4" />;
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
            Step 2: Select UI elements present
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
          
          <div className="space-y-4">
            <Input
              placeholder="Search UI elements..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="mb-4"
            />
            
            {loading ? (
              <div className="py-4 text-center text-gray-500">Loading elements...</div>
            ) : (
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid grid-cols-4 mb-4">
                  {ELEMENT_TABS.map(tab => (
                    <TabsTrigger key={tab.id} value={tab.id} className="flex items-center gap-2">
                      {tab.icon} 
                      <span className="hidden sm:inline">{tab.label}</span>
                    </TabsTrigger>
                  ))}
                </TabsList>
                
                {ELEMENT_TABS.map(tab => (
                  <TabsContent key={tab.id} value={tab.id} className="space-y-4">
                    {Object.entries(filteredElements)
                      .filter(([category]) => {
                        switch (tab.id) {
                          case 'navigation':
                            return ['Header', 'Navigation', 'Menu'].includes(category);
                          case 'interaction':
                            return ['Button', 'Input', 'Form', 'Control'].includes(category);
                          case 'media':
                            return ['Media', 'Image', 'Video'].includes(category);
                          case 'layout':
                            return ['Layout', 'Card', 'Grid', 'Section'].includes(category);
                          default:
                            return true;
                        }
                      })
                      .map(([category, elements]) => (
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
                                        px-3 py-1.5 text-sm rounded-full flex items-center gap-2
                                        ${selectedElementIds.includes(element.id)
                                          ? 'bg-primary text-white'
                                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                        }
                                      `}
                                    >
                                      {getElementIcon(element.name)}
                                      {element.name}
                                      {selectedElementIds.includes(element.id) && (
                                        <CheckCircle2 className="h-3.5 w-3.5" />
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
                  </TabsContent>
                ))}
              </Tabs>
            )}
            
            <div className="flex flex-col sm:flex-row gap-3 mt-6">
              <Button
                variant="outline"
                onClick={onBack}
                className="flex-1"
              >
                Back
              </Button>
              <Button 
                onClick={handleSubmit}
                className="flex-1"
              >
                {index === totalCount - 1 ? 'Finish' : 'Next Screenshot'}
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default StepElementsSelect;
