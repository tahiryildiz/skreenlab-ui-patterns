
import React, { useState, useEffect } from 'react';
import { Search, Upload, Crown, LogOut } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const Navbar = () => {
  const { user, signOut, isLoading } = useAuth();
  const [isProUser, setIsProUser] = useState(false);
  
  useEffect(() => {
    const checkProStatus = async () => {
      if (user) {
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
          setIsProUser(!!data?.is_pro);
        } catch (error) {
          console.error('Error checking Pro status:', error);
          setIsProUser(false);
        }
      }
    };

    if (!isLoading && user) {
      checkProStatus();
    } else {
      setIsProUser(false);
    }
  }, [user, isLoading]);

  // Get initials from email for avatar fallback
  const getInitials = (email) => {
    if (!email) return "U";
    return email.charAt(0).toUpperCase();
  };

  // Generate Gravatar URL
  const getGravatarUrl = (email) => {
    if (!email) return "";
    // MD5 hash of email is required for Gravatar, but we'll use a placeholder
    // In a real app, you would implement an MD5 hash function
    return `https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y`;
  };
  
  return (
    <header className="sticky top-0 z-50 w-full bg-white border-b border-gray-200 shadow-sm">
      <div className="container flex h-16 items-center justify-between px-4 md:px-6">
        <div className="flex items-center gap-2">
          <Link to="/" className="flex items-center gap-2">
            <div className="bg-skreenlab-blue text-white p-1 rounded">
              <svg 
                xmlns="http://www.w3.org/2000/svg"
                width="24" 
                height="24" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              >
                <rect x="2" y="3" width="20" height="14" rx="2" />
                <line x1="8" x2="16" y1="21" y2="21" />
                <line x1="12" x2="12" y1="17" y2="21" />
              </svg>
            </div>
            <span className="text-xl font-bold text-gray-800">Skreenlab</span>
          </Link>
        </div>
        
        <div className="flex-1 px-8 max-w-xl mx-auto">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" size={18} />
            <Input 
              type="search" 
              placeholder="Search for apps, components, or flows..." 
              className="pl-10 w-full rounded-full bg-gray-50 border-gray-200 focus:bg-white" 
            />
          </div>
        </div>
        
        <nav className="flex items-center gap-4">
          {!isProUser && (
            <Link to="/pricing" className="text-sm font-medium text-gray-700 hover:text-skreenlab-blue transition-colors">Pricing</Link>
          )}
          
          {!isLoading && (
            user ? (
              <div className="flex items-center gap-4">
                {isProUser && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Link to="/upload">
                          <Button 
                            variant="default"
                            className="bg-skreenlab-blue hover:bg-skreenlab-blue/90 text-white rounded-full"
                            size="sm"
                          >
                            <Upload className="h-4 w-4 mr-1" />
                            Upload
                          </Button>
                        </Link>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Upload new screenshots</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <div className="relative cursor-pointer">
                      {isProUser && (
                        <div className="absolute -top-1 -left-1 z-10">
                          <Crown className="h-4 w-4 text-yellow-500" />
                        </div>
                      )}
                      <Avatar>
                        <AvatarImage src={getGravatarUrl(user.email)} alt="User profile" />
                        <AvatarFallback>{getInitials(user.email)}</AvatarFallback>
                      </Avatar>
                    </div>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <div className="px-2 py-1.5 text-sm font-semibold">{isProUser ? 'Pro User' : 'Free User'}</div>
                    <DropdownMenuSeparator />
                    {!isProUser && (
                      <Link to="/pricing">
                        <DropdownMenuItem>
                          <Crown className="mr-2 h-4 w-4 text-yellow-500" />
                          <span>Upgrade to Pro</span>
                        </DropdownMenuItem>
                      </Link>
                    )}
                    <DropdownMenuItem onClick={signOut}>
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Sign Out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ) : (
              <>
                <Link to="/signin" className="text-sm font-medium text-gray-700 hover:text-skreenlab-blue transition-colors">Sign In</Link>
                <Link to="/signup" className="text-sm font-medium px-4 py-2 rounded-full bg-skreenlab-blue text-white hover:bg-skreenlab-blue/90 transition-colors">Join for Free</Link>
              </>
            )
          )}
        </nav>
      </div>
    </header>
  );
};

export default Navbar;
