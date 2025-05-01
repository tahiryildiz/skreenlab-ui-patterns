import React, { useState } from 'react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import AppCard from '@/components/AppCard';
import CategoryFilter from '@/components/CategoryFilter';
import { ScreenCategory } from '@/types';
import { mockApps } from '@/services/mockData';
import { ArrowRight } from 'lucide-react';

const Index = () => {
  const [selectedCategory, setSelectedCategory] = useState<ScreenCategory | null>(null);
  
  // Apply category filtering if needed
  const filteredApps = mockApps;
  
  // Featured apps (first 3)
  const featuredApps = filteredApps.slice(0, 3);
  
  // Rest of the apps
  const remainingApps = filteredApps.slice(3);

  return (
    <div className="min-h-screen flex flex-col bg-gray-950 text-white">
      <Navbar />
      
      <main className="flex-1">
        {/* Hero Section - Modern Dark Theme */}
        <section className="py-20 lg:py-24 bg-gradient-to-b from-gray-900 to-gray-950 overflow-hidden relative">
          <div className="container px-4 md:px-6 mx-auto">
            {/* Purple gradient blob */}
            <div className="absolute top-20 right-0 w-72 h-72 bg-skreenlab-blue opacity-10 rounded-full filter blur-3xl"></div>
            
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-12">
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
                  Discover UI Patterns from the World's Best Apps
                </h1>
                <p className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto">
                  Browse and study screenshots organized by app, screen type, and component to improve your design skills.
                </p>
                <div className="flex flex-col sm:flex-row justify-center gap-4">
                  <a href="#app-gallery" className="px-8 py-3 rounded-lg bg-skreenlab-blue text-white font-medium hover:bg-skreenlab-blue/90 transition-colors">
                    Browse Apps
                  </a>
                  <a href="#features" className="px-8 py-3 rounded-lg border border-gray-700 text-gray-300 font-medium hover:bg-gray-800 transition-colors">
                    Learn More
                  </a>
                </div>
              </div>
              
              {/* Add a floating image of app screenshots */}
              <div className="relative mt-16 hidden md:block">
                <div className="absolute w-full h-full bg-gradient-to-b from-transparent to-gray-950 z-10 bottom-0"></div>
                <img 
                  src="/lovable-uploads/013e73eb-f10a-4156-9fc6-2ded251cc76e.png"
                  alt="App UI Examples"
                  className="w-full max-w-3xl mx-auto rounded-lg shadow-2xl"
                />
              </div>
            </div>
          </div>
        </section>
        
        {/* Featured Apps Section */}
        <section className="py-16 bg-gray-900">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-bold">Featured Apps</h2>
              <a href="#all-apps" className="text-skreenlab-blue flex items-center hover:underline">
                View all <ArrowRight className="ml-1 h-4 w-4" />
              </a>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredApps.map(app => (
                <div key={app.id}>
                  <AppCard app={app} />
                </div>
              ))}
            </div>
          </div>
        </section>
        
        {/* All Apps Gallery */}
        <section id="all-apps" className="py-16 bg-gray-950">
          <div className="container px-4 md:px-6 mx-auto">
            <h2 className="text-2xl font-bold mb-8">All Apps</h2>
            
            <div className="mb-8">
              <CategoryFilter 
                selectedCategory={selectedCategory}
                onSelectCategory={setSelectedCategory}
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {remainingApps.map(app => (
                <div key={app.id}>
                  <AppCard app={app} />
                </div>
              ))}
            </div>
          </div>
        </section>
        
        {/* Features Section */}
        <section id="features" className="py-16 bg-gray-900">
          <div className="container px-4 md:px-6 mx-auto">
            <h2 className="text-2xl font-bold mb-12 text-center">Why Use Skreenlab?</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-gray-800 p-6 rounded-xl hover:bg-gray-700 transition-colors">
                <div className="w-12 h-12 bg-skreenlab-blue/20 text-skreenlab-blue rounded-lg flex items-center justify-center mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="3" width="20" height="14" rx="2" />
                    <line x1="8" x2="16" y1="21" y2="21" />
                    <line x1="12" x2="12" y1="17" y2="21" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold mb-2">Rich Screenshot Library</h3>
                <p className="text-gray-300">Access thousands of carefully categorized screenshots from the world's leading mobile and web applications.</p>
              </div>
              
              <div className="bg-gray-800 p-6 rounded-xl hover:bg-gray-700 transition-colors">
                <div className="w-12 h-12 bg-skreenlab-blue/20 text-skreenlab-blue rounded-lg flex items-center justify-center mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 9h16" />
                    <path d="M4 15h16" />
                    <path d="M8 5v14" />
                    <path d="M16 5v14" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold mb-2">Organized by Pattern</h3>
                <p className="text-gray-300">Find exactly what you need with screenshots organized by app, screen category, and UI patterns.</p>
              </div>
              
              <div className="bg-gray-800 p-6 rounded-xl hover:bg-gray-700 transition-colors">
                <div className="w-12 h-12 bg-skreenlab-blue/20 text-skreenlab-blue rounded-lg flex items-center justify-center mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="m21 21-6.05-6.05m0 0a7 7 0 1 0-9.9-9.9 7 7 0 0 0 9.9 9.9Z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold mb-2">Powerful Search</h3>
                <p className="text-gray-300">Find inspiration fast with our advanced search and filtering tools designed for designers and developers.</p>
              </div>
            </div>
          </div>
        </section>
        
        {/* CTA Section */}
        <section className="py-20 bg-gradient-to-b from-gray-900 to-gray-950">
          <div className="container px-4 md:px-6 mx-auto text-center">
            <h2 className="text-3xl font-bold mb-6">Start Exploring Today</h2>
            <p className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto">
              Join thousands of designers and developers using Skreenlab to create better user interfaces.
            </p>
            <a href="#app-gallery" className="px-8 py-3 rounded-lg bg-skreenlab-blue text-white font-medium hover:bg-skreenlab-blue/90 transition-colors inline-block">
              Browse App Gallery
            </a>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default Index;
