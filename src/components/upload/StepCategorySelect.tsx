
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { LayoutGrid, ArrowLeft, CheckCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { ScreenCategory } from '@/hooks/upload/uploadStateTypes';

interface StepCategorySelectProps {
  onSelectCategory: (categoryId: string) => void;
  onBack: () => void;
}

const StepCategorySelect: React.FC<StepCategorySelectProps> = ({ 
  onSelectCategory,
  onBack 
}) => {
  const [categories, setCategories] = useState<ScreenCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('screen_categories')
          .select('id, name, description')
          .order('name');
          
        if (error) throw error;
        
        setCategories(data || []);
      } catch (err) {
        console.error('Error fetching screen categories:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchCategories();
  }, []);

  const handleSelectCategory = (categoryId: string) => {
    setSelectedCategoryId(categoryId);
  };

  const handleContinue = () => {
    if (selectedCategoryId) {
      onSelectCategory(selectedCategoryId);
    }
  };

  return (
    <Card className="border-0 shadow-none">
      <CardContent className="pt-6">
        <div className="mb-6 text-center">
          <div className="bg-primary/10 inline-flex rounded-full p-3 mb-4">
            <LayoutGrid className="h-6 w-6 text-primary" />
          </div>
          <h2 className="text-2xl font-bold mb-2">
            Which screen type are you uploading?
          </h2>
          <p className="text-gray-500">
            Select a category for your screenshots
          </p>
        </div>
        
        {loading ? (
          <div className="py-8 text-center text-gray-500">Loading categories...</div>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => handleSelectCategory(category.id)}
                  className={`
                    relative bg-white border rounded-lg p-4 text-left transition-all
                    hover:border-primary hover:shadow-md
                    ${selectedCategoryId === category.id 
                      ? 'border-primary ring-2 ring-primary/20' 
                      : 'border-gray-200'}
                  `}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="h-8 w-8 bg-primary/10 rounded-full flex items-center justify-center">
                      <LayoutGrid className="h-4 w-4 text-primary" />
                    </div>
                    {selectedCategoryId === category.id && (
                      <CheckCircle className="h-5 w-5 text-primary" />
                    )}
                  </div>
                  <h3 className="font-medium">{category.name}</h3>
                  {category.description && (
                    <p className="text-sm text-gray-500 mt-1">{category.description}</p>
                  )}
                </button>
              ))}
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                variant="outline"
                onClick={onBack}
                className="flex-1"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
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
      </CardContent>
    </Card>
  );
};

export default StepCategorySelect;
