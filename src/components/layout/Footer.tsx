
import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-white border-t border-gray-100 py-8 mt-12">
      <div className="container px-4 md:px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
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
            </div>
            <p className="text-sm text-gray-500 max-w-xs">
              A library of real-world app screenshots for design inspiration and UX research.
            </p>
          </div>
          
          <div>
            <h3 className="font-semibold mb-4">Resources</h3>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="text-gray-600 hover:text-skreenlab-blue">Browse Apps</a></li>
              <li><a href="#" className="text-gray-600 hover:text-skreenlab-blue">Categories</a></li>
              <li><a href="#" className="text-gray-600 hover:text-skreenlab-blue">Platforms</a></li>
              <li><a href="#" className="text-gray-600 hover:text-skreenlab-blue">Upload Screenshots</a></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold mb-4">Company</h3>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="text-gray-600 hover:text-skreenlab-blue">About</a></li>
              <li><a href="#" className="text-gray-600 hover:text-skreenlab-blue">Contact</a></li>
              <li><a href="#" className="text-gray-600 hover:text-skreenlab-blue">Privacy Policy</a></li>
              <li><a href="#" className="text-gray-600 hover:text-skreenlab-blue">Terms of Service</a></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-100 mt-8 pt-4">
          <p className="text-sm text-gray-500 text-center">© {new Date().getFullYear()} Skreenlab. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
