
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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

interface CategoryGroup {
  id: string;
  name: string;
  icon: string;
  categories: ScreenCategory[];
}

interface StepScreenTypeSelectProps {
  screenshot: UploadScreenshot;
  index: number;
  totalCount: number;
  onSelect: (index: number, screenCategoryId: string) => void;
  onBack: () => void;
}

// Predefined category groups with emojis
const CATEGORY_GROUPS: Record<string, { name: string, icon: string }> = {
  'onboarding': { name: 'Onboarding', icon: '🛂' },
  'profile': { name: 'Profile / Account', icon: '👤' },
  'commerce': { name: 'Commerce', icon: '💳' },
  'legal': { name: 'Legal', icon: '📄' },
  'content': { name: 'Content', icon: '📚' },
  'settings': { name: 'Settings', icon: '⚙️' },
  'dashboard': { name: 'Dashboard / Admin', icon: '📊' },
  'other': { name: 'Other', icon: '❓' }
};

const StepScreenTypeSelect: React.FC<StepScreenTypeSelectProps> = ({
  screenshot,
  index,
  totalCount,
  onSelect,
  onBack
}) => {
  const [screenCategories, setScreenCategories] = useState<ScreenCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoryGroups, setCategoryGroups] = useState<CategoryGroup[]>([]);
  const [selectedTab, setSelectedTab] = useState<string>('onboarding');
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
        
        // Group categories by our predefined groups
        const grouped: Record<string, ScreenCategory[]> = {};
        
        // Initialize empty arrays for each group
        Object.keys(CATEGORY_GROUPS).forEach(key => {
          grouped[key] = [];
        });
        
        // Group categories
        (categories || []).forEach(category => {
          const groupKey = getGroupKeyForCategory(category);
          if (!grouped[groupKey]) {
            grouped[groupKey] = [];
          }
          grouped[groupKey].push(category);
        });
        
        // Transform to array format for UI rendering
        const formattedGroups = Object.entries(grouped).map(([key, categories]) => ({
          id: key, // Add the id property using the key
          ...CATEGORY_GROUPS[key as keyof typeof CATEGORY_GROUPS] || { name: key, icon: '📱' },
          categories
        }));
        
        setCategoryGroups(formattedGroups);
        
        // Set initial tab based on current selection or first non-empty group
        if (selectedCategoryId) {
          const category = categories?.find(c => c.id === selectedCategoryId);
          if (category) {
            const groupKey = getGroupKeyForCategory(category);
            setSelectedTab(groupKey);
          }
        } else {
          const firstNonEmptyGroup = formattedGroups.find(g => g.categories.length > 0);
          if (firstNonEmptyGroup) {
            setSelectedTab(firstNonEmptyGroup.id);
          }
        }
      } catch (err) {
        console.error('Error fetching categories:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchCategories();
  }, [selectedCategoryId]);

  // Helper to determine which group a category belongs to
  const getGroupKeyForCategory = (category: ScreenCategory): string => {
    const categoryName = category.name.toLowerCase();
    const groupName = category.category_group?.toLowerCase() || '';
    
    if (groupName.includes('onboard') || categoryName.includes('welcome') || categoryName.includes('intro'))
      return 'onboarding';
    
    if (groupName.includes('profile') || categoryName.includes('account') || categoryName.includes('user'))
      return 'profile';
    
    if (groupName.includes('commerce') || categoryName.includes('payment') || categoryName.includes('checkout') || categoryName.includes('cart'))
      return 'commerce';
    
    if (groupName.includes('legal') || categoryName.includes('term') || categoryName.includes('privacy') || categoryName.includes('policy'))
      return 'legal';
    
    if (groupName.includes('content') || categoryName.includes('feed') || categoryName.includes('article') || categoryName.includes('news'))
      return 'content';
    
    if (groupName.includes('setting') || categoryName.includes('preference') || categoryName.includes('config'))
      return 'settings';
    
    if (groupName.includes('dashboard') || groupName.includes('admin') || categoryName.includes('analytics') || categoryName.includes('stat'))
      return 'dashboard';
    
    return 'other';
  };

  const handleContinue = () => {
    if (selectedCategoryId) {
      onSelect(index, selectedCategoryId);
    }
  };

  // Get example image for a category (placeholder)
  const getCategoryExampleImage = (categoryName: string): string => {
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
                <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
                  <div className="w-full overflow-x-auto pb-2">
                    <TabsList className="inline-flex w-full justify-start">
                      {categoryGroups.map((group) => (
                        <TabsTrigger 
                          key={group.id} 
                          value={group.id}
                          className="min-w-fit whitespace-nowrap"
                          disabled={group.categories.length === 0}
                        >
                          <span className="mr-2">{group.icon}</span>
                          {group.name}
                        </TabsTrigger>
                      ))}
                    </TabsList>
                  </div>
                  
                  {categoryGroups.map((group) => (
                    <TabsContent key={group.id} value={group.id} className="mt-4">
                      {group.categories.length === 0 ? (
                        <div className="text-center py-6 text-gray-500">
                          No screen types in this category
                        </div>
                      ) : (
                        <div className="grid grid-cols-2 gap-3">
                          {group.categories.map((category) => (
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
                        </div>
                      )}
                    </TabsContent>
                  ))}
                </Tabs>
                
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
