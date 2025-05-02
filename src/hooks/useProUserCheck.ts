
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
  const tabSwitchInProgressRef = useRef(false);
  
  // Handle visibility change (tab switching)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        console.log('Tab visibility changed to visible');
        tabSwitchInProgressRef.current = true;
        
        // Critical: Check if upload was in progress before tab switch
        const uploadInProgress = sessionStorage.getItem('uploadInProgress') === 'true';
        if (uploadInProgress) {
          console.log('Upload in progress detected after tab switch, preventing redirects');
          // Mark auth as already checked to prevent unwanted redirect
          authCheckPerformedRef.current = true;
          setHasAuthChecked(true);
          
          // Set timeout to reset the tab switch flag after the current execution cycle
          setTimeout(() => {
            tabSwitchInProgressRef.current = false;
          }, 100);
        }
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);
  
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
      // IMPORTANT: If we detected a tab switch with upload in progress, skip all redirects
      if (tabSwitchInProgressRef.current) {
        console.log('Tab switch detected, skipping auth checks');
        return;
      }
      
      // Check if upload is in progress to prevent unwanted redirects
      const uploadInProgress = sessionStorage.getItem('uploadInProgress') === 'true';
      
      // Check if we're restoring from a tab switch
      const storedState = sessionStorage.getItem('uploadState');
      isRestoringSession.current = !!storedState;
      
      // If upload is in progress, skip authentication checks entirely
      if (uploadInProgress) {
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
          // 4. We're not in a tab switch
          if (!isPro && !isRestoringSession.current && !uploadInProgress && !tabSwitchInProgressRef.current) {
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
        // 5. We're not in a tab switch
        if (!uploadInProgress && !tabSwitchInProgressRef.current) {
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
    if (!tabSwitchInProgressRef.current && 
        (!hasAuthChecked || 
         (user && !authCheckPerformedRef.current) || 
         (!isLoading && !user && !authCheckPerformedRef.current))) {
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
