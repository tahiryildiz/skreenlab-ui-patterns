
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
  const tabSwitchDetectedRef = useRef(false);
  const preventRedirectRef = useRef(false);
  
  // Initialize flags on mount
  useEffect(() => {
    // Set flag immediately to prevent redirect races at mount time
    const uploadInProgress = sessionStorage.getItem('uploadInProgress') === 'true';
    if (uploadInProgress) {
      console.log('Upload in progress detected on component mount, preventing redirects');
      preventRedirectRef.current = true;
      sessionStorage.setItem('preventAuthRedirects', 'true');
    }
    
    return () => {
      // Don't clear flags on unmount to ensure they persist through tab switches
    };
  }, []);
  
  // Handle visibility change (tab switching)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        console.log('Tab visibility changed to visible');
        tabSwitchDetectedRef.current = true;
        
        // Critical: Set preventRedirect flag on ANY tab visibility change
        const uploadInProgress = sessionStorage.getItem('uploadInProgress') === 'true';
        const currentPath = window.location.pathname;
        
        if (uploadInProgress || currentPath === '/upload') {
          console.log('Upload in progress or on upload page, preventing redirects after tab switch');
          preventRedirectRef.current = true;
          sessionStorage.setItem('preventAuthRedirects', 'true');
          
          // Mark auth as checked to prevent unwanted redirect
          authCheckPerformedRef.current = true;
          setHasAuthChecked(true);
          
          // Double check - restore upload state flag if we're on upload path
          if (currentPath === '/upload') {
            sessionStorage.setItem('uploadInProgress', 'true');
          }
        }
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  // Check if the user is a Pro user
  useEffect(() => {
    const checkProStatus = async () => {
      // CRITICAL: Check multiple conditions that would prevent redirects
      const uploadInProgress = sessionStorage.getItem('uploadInProgress') === 'true';
      const preventRedirects = sessionStorage.getItem('preventAuthRedirects') === 'true';
      const currentPath = window.location.pathname;
      
      // Skip ALL auth checks if ANY prevention flag is true
      if (uploadInProgress || preventRedirectRef.current || preventRedirects || tabSwitchDetectedRef.current) {
        console.log('Skipping auth redirect checks due to prevention flags');
        setHasAuthChecked(true);
        return;
      }
      
      // Only proceed with checks if we're not in a tab switch AND no prevention flags
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
          
          const isPro = !!data?.is_pro;
          setIsProUser(isPro);
          
          // Only redirect if we're on the upload page AND user is not pro AND all other conditions are false
          if (!isPro && currentPath === '/upload' && 
              !uploadInProgress && 
              !preventRedirectRef.current && 
              !preventRedirects &&
              !tabSwitchDetectedRef.current) {
            toast.error('Only Pro users can upload screenshots');
            navigate('/pricing');
          }
          
          setHasAuthChecked(true);
        } catch (error) {
          console.error('Error checking Pro status:', error);
          setIsProUser(false);
        }
      } else if (!isLoading && !user && !authCheckPerformedRef.current) {
        // Only redirect if:
        // 1. Not in upload path OR
        // 2. No prevention flags set
        if (currentPath !== '/upload' && 
            !uploadInProgress && 
            !preventRedirectRef.current && 
            !preventRedirects && 
            !tabSwitchDetectedRef.current) {
          authCheckPerformedRef.current = true;
          navigate('/signin');
        } else {
          console.log('Skipping redirect - possible upload in progress');
          setHasAuthChecked(true);
        }
      }
    };

    checkProStatus();
  }, [user, isLoading, navigate]);

  return {
    user,
    isLoading,
    isProUser,
    hasAuthChecked,
    authCheckPerformedRef
  };
}
