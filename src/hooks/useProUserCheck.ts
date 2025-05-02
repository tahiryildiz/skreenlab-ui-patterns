
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/sonner';

export function useProUserCheck() {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();
  const [isProUser, setIsProUser] = useState(false);
  const [hasAuthChecked, setHasAuthChecked] = useState(false);
  const authCheckPerformedRef = useRef(false);
  const initialPathSaved = useRef(false);
  
  // Store the initial URL in sessionStorage
  useEffect(() => {
    if (!initialPathSaved.current) {
      sessionStorage.setItem('currentUploadPath', '/upload');
      initialPathSaved.current = true;
    }
    
    // We're removing the visibilitychange event listener as it's causing navigation issues
    // No need to add any event listeners here since we're using sessionStorage for persistence
  }, []);

  // Check if the user is a Pro user
  useEffect(() => {
    const checkProStatus = async () => {
      if (user && !authCheckPerformedRef.current) {
        authCheckPerformedRef.current = true;
        
        try {
          const { data, error } = await supabase
            .from('profiles')
            .select('is_pro')
            .eq('id', user.id)
            .single();
          
          if (error) {
            console.error('Error checking Pro status:', error);
            setIsProUser(false);
            return;
          }
          
          // Safely access is_pro with correct typing
          const isPro = !!data?.is_pro;
          setIsProUser(isPro);
          
          if (!isPro) {
            toast.error('Only Pro users can upload screenshots');
            navigate('/pricing');
          }
          
          // Mark that we've checked auth
          setHasAuthChecked(true);
        } catch (error) {
          console.error('Error checking Pro status:', error);
          setIsProUser(false);
        }
      } else if (!isLoading && !user && !authCheckPerformedRef.current) {
        // Only redirect if we're done loading, there's no user, and we haven't checked auth yet
        authCheckPerformedRef.current = true;
        navigate('/signin');
      }
    };

    // Only check pro status if we haven't already checked auth
    if (!hasAuthChecked || (user && !authCheckPerformedRef.current) || (!isLoading && !user && !authCheckPerformedRef.current)) {
      checkProStatus();
    }
  }, [user, isLoading, navigate, hasAuthChecked]);

  return {
    user,
    isLoading,
    isProUser,
    hasAuthChecked,
    authCheckPerformedRef
  };
}
