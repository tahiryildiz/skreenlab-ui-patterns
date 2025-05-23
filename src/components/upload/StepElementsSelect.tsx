
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
  Images,
  Menu,
  Search,
  User,
  Settings,
  Heart,
  Share,
  Plus,
  ArrowLeft,
  ArrowRight,
  Home,
  ShoppingCart,
  Bell,
  Camera,
  Play,
  Pause,
  Volume2,
  MapPin
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

// Fallback UI elements in case database is empty
const FALLBACK_UI_ELEMENTS: UiElementType[] = [
  // Navigation elements
  { id: 'nav-bar', name: 'Navigation Bar', category: 'Navigation', description: 'Top navigation bar with menu items' },
  { id: 'tab-bar', name: 'Tab Bar', category: 'Navigation', description: 'Bottom tab bar for main navigation' },
  { id: 'menu', name: 'Menu', category: 'Navigation', description: 'Hamburger menu or dropdown menu' },
  { id: 'breadcrumb', name: 'Breadcrumb', category: 'Navigation', description: 'Navigation breadcrumb trail' },
  { id: 'back-button', name: 'Back Button', category: 'Navigation', description: 'Button to go back to previous screen' },
  
  // Button elements
  { id: 'primary-button', name: 'Primary Button', category: 'Button', description: 'Main action button (CTA)' },
  { id: 'secondary-button', name: 'Secondary Button', category: 'Button', description: 'Secondary action button' },
  { id: 'icon-button', name: 'Icon Button', category: 'Button', description: 'Button with only an icon' },
  { id: 'fab', name: 'Floating Action Button', category: 'Button', description: 'Circular floating action button' },
  { id: 'link-button', name: 'Link/Text Button', category: 'Button', description: 'Text-style clickable link' },
  
  // Input elements
  { id: 'text-input', name: 'Text Input', category: 'Input', description: 'Text input field' },
  { id: 'search-bar', name: 'Search Bar', category: 'Input', description: 'Search input with search icon' },
  { id: 'dropdown', name: 'Dropdown', category: 'Input', description: 'Dropdown selection menu' },
  { id: 'checkbox', name: 'Checkbox', category: 'Input', description: 'Checkbox for multiple selections' },
  { id: 'radio-button', name: 'Radio Button', category: 'Input', description: 'Radio button for single selection' },
  { id: 'toggle-switch', name: 'Toggle Switch', category: 'Input', description: 'On/off toggle switch' },
  { id: 'slider', name: 'Slider', category: 'Input', description: 'Range slider control' },
  
  // Media elements
  { id: 'image', name: 'Image', category: 'Media', description: 'Static image or photo' },
  { id: 'video', name: 'Video Player', category: 'Media', description: 'Video player with controls' },
  { id: 'avatar', name: 'Avatar', category: 'Media', description: 'User profile picture' },
  { id: 'icon', name: 'Icon', category: 'Media', description: 'Functional or decorative icon' },
  { id: 'logo', name: 'Logo', category: 'Media', description: 'Brand or app logo' },
  
  // Layout elements
  { id: 'card', name: 'Card', category: 'Layout', description: 'Content card or tile' },
  { id: 'list-item', name: 'List Item', category: 'Layout', description: 'Item in a list or feed' },
  { id: 'header', name: 'Header', category: 'Layout', description: 'Page or section header' },
  { id: 'footer', name: 'Footer', category: 'Layout', description: 'Page or section footer' },
  { id: 'sidebar', name: 'Sidebar', category: 'Layout', description: 'Side navigation or content panel' },
  { id: 'modal', name: 'Modal/Dialog', category: 'Layout', description: 'Overlay modal or dialog box' },
  { id: 'banner', name: 'Banner', category: 'Layout', description: 'Promotional or informational banner' },
  
  // Form elements
  { id: 'form', name: 'Form', category: 'Form', description: 'Form container with multiple inputs' },
  { id: 'form-field', name: 'Form Field', category: 'Form', description: 'Individual form field with label' },
  { id: 'submit-button', name: 'Submit Button', category: 'Form', description: 'Form submission button' },
  
  // Content elements
  { id: 'text-content', name: 'Text Content', category: 'Content', description: 'Body text or paragraph' },
  { id: 'heading', name: 'Heading', category: 'Content', description: 'Title or section heading' },
  { id: 'badge', name: 'Badge', category: 'Content', description: 'Status badge or label' },
  { id: 'tag', name: 'Tag', category: 'Content', description: 'Content tag or category label' },
  { id: 'notification', name: 'Notification', category: 'Content', description: 'Alert or notification message' }
];

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
        
        // Fetch UI element types from database
        const { data: elements, error } = await supabase
          .from('ui_element_types')
          .select('id, name, category, description');
          
        if (error) {
          console.error('Error fetching UI elements from database:', error);
        }
        
        // Use database elements if available, otherwise use fallback elements
        const elementsToUse = (elements && elements.length > 0) ? elements : FALLBACK_UI_ELEMENTS;
        console.log(`Using ${elementsToUse === elements ? 'database' : 'fallback'} UI elements:`, elementsToUse.length, 'elements');
        
        setUiElementTypes(elementsToUse);
        
        // Group elements by category
        const grouped = elementsToUse.reduce<Record<string, UiElementType[]>>((acc, element) => {
          if (!acc[element.category]) {
            acc[element.category] = [];
          }
          acc[element.category].push(element);
          return acc;
        }, {});
        
        setElementsByCategory(grouped);
      } catch (err) {
        console.error('Error fetching elements:', err);
        // Fallback to default elements on any error
        setUiElementTypes(FALLBACK_UI_ELEMENTS);
        const grouped = FALLBACK_UI_ELEMENTS.reduce<Record<string, UiElementType[]>>((acc, element) => {
          if (!acc[element.category]) {
            acc[element.category] = [];
          }
          acc[element.category].push(element);
          return acc;
        }, {});
        setElementsByCategory(grouped);
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

  // Get icon for UI element based on name
  const getElementIcon = (elementName: string) => {
    const name = elementName.toLowerCase();
    if (name.includes('menu')) return <Menu className="h-4 w-4" />;
    if (name.includes('search')) return <Search className="h-4 w-4" />;
    if (name.includes('user') || name.includes('avatar')) return <User className="h-4 w-4" />;
    if (name.includes('setting')) return <Settings className="h-4 w-4" />;
    if (name.includes('heart') || name.includes('like')) return <Heart className="h-4 w-4" />;
    if (name.includes('share')) return <Share className="h-4 w-4" />;
    if (name.includes('plus') || name.includes('add')) return <Plus className="h-4 w-4" />;
    if (name.includes('back')) return <ArrowLeft className="h-4 w-4" />;
    if (name.includes('forward') || name.includes('next')) return <ArrowRight className="h-4 w-4" />;
    if (name.includes('home')) return <Home className="h-4 w-4" />;
    if (name.includes('cart') || name.includes('shop')) return <ShoppingCart className="h-4 w-4" />;
    if (name.includes('bell') || name.includes('notification')) return <Bell className="h-4 w-4" />;
    if (name.includes('camera')) return <Camera className="h-4 w-4" />;
    if (name.includes('play')) return <Play className="h-4 w-4" />;
    if (name.includes('pause')) return <Pause className="h-4 w-4" />;
    if (name.includes('volume') || name.includes('sound')) return <Volume2 className="h-4 w-4" />;
    if (name.includes('map') || name.includes('location')) return <MapPin className="h-4 w-4" />;
    if (name.includes('image')) return <Images className="h-4 w-4" />;
    if (name.includes('layout') || name.includes('grid')) return <LayoutGrid className="h-4 w-4" />;
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
            Step 2: Select UI elements present in this screenshot
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
                  <TabsContent key={tab.id} value={tab.id} className="space-y-4 max-h-80 overflow-y-auto">
                    {Object.entries(filteredElements)
                      .filter(([category]) => {
                        switch (tab.id) {
                          case 'navigation':
                            return ['Navigation', 'Header', 'Menu'].includes(category);
                          case 'interaction':
                            return ['Button', 'Input', 'Form', 'Control'].includes(category);
                          case 'media':
                            return ['Media', 'Image', 'Video'].includes(category);
                          case 'layout':
                            return ['Layout', 'Card', 'Grid', 'Section', 'Content'].includes(category);
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
                                        px-3 py-1.5 text-sm rounded-full flex items-center gap-2 transition-colors
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
                disabled={selectedElementIds.length === 0}
              >
                {selectedElementIds.length === 0 ? 'Select at least one element' : 
                 index === totalCount - 1 ? 'Finish Tagging' : 'Next Screenshot'}
              </Button>
            </div>
            
            {selectedElementIds.length > 0 && (
              <div className="text-sm text-gray-600 text-center">
                {selectedElementIds.length} element{selectedElementIds.length === 1 ? '' : 's'} selected
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default StepElementsSelect;
