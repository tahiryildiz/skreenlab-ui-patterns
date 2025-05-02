
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
  const isRestoringSession = useRef(false);
  
  // Store the initial URL in sessionStorage
  useEffect(() => {
    if (!initialPathSaved.current) {
      sessionStorage.setItem('currentUploadPath', '/upload');
      initialPathSaved.current = true;
      console.log('Initial path saved to sessionStorage');
    }
  }, []);

  // Check if the user is a Pro user
  useEffect(() => {
    const checkProStatus = async () => {
      // IMPORTANT NEW CODE: Check if upload is in progress to prevent unwanted redirects
      const uploadInProgress = sessionStorage.getItem('uploadInProgress') === 'true';
      
      // Check if we're restoring from a tab switch
      const storedState = sessionStorage.getItem('uploadState');
      isRestoringSession.current = !!storedState;
      
      // If upload is in progress and we're returning from a tab switch, 
      // skip authentication checks entirely
      if (uploadInProgress && isRestoringSession.current) {
        console.log('Upload in progress detected, skipping auth redirect checks');
        setHasAuthChecked(true); // Mark auth as checked to prevent further checks
        return;
      }
      
      if (user && !authCheckPerformedRef.current) {
        authCheckPerformedRef.current = true;
        console.log('Checking pro status for user:', user.id);
        
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
          
          // Only redirect if:
          // 1. User is not Pro
          // 2. We're not restoring a session
          // 3. There's no upload in progress
          if (!isPro && !isRestoringSession.current && !uploadInProgress) {
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
        // Only redirect if:
        // 1. We're done loading
        // 2. There's no user
        // 3. We haven't checked auth yet
        // 4. There's no upload in progress
        if (!uploadInProgress) {
          authCheckPerformedRef.current = true;
          navigate('/signin');
        } else {
          // Special case: If upload is in progress but no user,
          // we'll let the component handle this situation rather than redirecting
          console.log('Upload in progress but no user, skipping redirect');
          setHasAuthChecked(true);
        }
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
