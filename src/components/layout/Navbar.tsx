
import React from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

const Navbar = () => {
  return (
    <header className="sticky top-0 z-50 w-full bg-white border-b border-gray-100 shadow-sm">
      <div className="container flex h-16 items-center justify-between px-4 md:px-6">
        <div className="flex items-center gap-2">
          <a href="/" className="flex items-center gap-2">
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
            <span className="text-xl font-bold">Skreenlab</span>
          </a>
        </div>
        
        <div className="flex-1 px-8 max-w-xl mx-auto">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <Input 
              type="search" 
              placeholder="Search for apps, components, or flows..." 
              className="pl-10 w-full rounded-full bg-gray-50 border-gray-100 focus:bg-white" 
            />
          </div>
        </div>
        
        <nav className="flex items-center gap-4">
          <a href="#" className="text-sm font-medium hover:text-skreenlab-blue transition-colors">Browse</a>
          <a href="#" className="text-sm font-medium hover:text-skreenlab-blue transition-colors">Categories</a>
          <a href="#" className="text-sm font-medium px-4 py-2 rounded-full bg-skreenlab-blue text-white hover:bg-skreenlab-blue/90 transition-colors">Sign In</a>
        </nav>
      </div>
    </header>
  );
};

export default Navbar;
