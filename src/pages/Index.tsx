import React, { useState } from 'react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import AppCard from '@/components/AppCard';
import CategoryFilter from '@/components/CategoryFilter';
import { ScreenCategory } from '@/types';
import { mockApps } from '@/services/mockData';

const Index = () => {
  const [selectedCategory, setSelectedCategory] = useState<ScreenCategory | null>(null);
  
  // Apply category filtering if needed in the future
  const filteredApps = mockApps;

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-gradient-to-b from-skreenlab-blue/10 to-white py-16">
          <div className="container px-4 md:px-6">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="text-4xl font-bold tracking-tight sm:text-5xl mb-6">
                <span className="text-skreenlab-blue">Discover</span> and <span className="text-skreenlab-blue">Study</span> 
                <br />Real-World UI Patterns
              </h1>
              <p className="text-xl text-gray-600 mb-8">
                A searchable library of screenshots from the world's best mobile and web apps, 
                organized by app, screen type, and component.
              </p>
              <div className="flex justify-center gap-4">
                <a href="#app-gallery" className="px-6 py-3 rounded-lg bg-skreenlab-blue text-white font-medium hover:bg-skreenlab-blue/90 transition-colors">
                  Browse Apps
                </a>
                <a href="#" className="px-6 py-3 rounded-lg border border-skreenlab-blue text-skreenlab-blue font-medium hover:bg-skreenlab-blue/10 transition-colors">
                  Learn More
                </a>
              </div>
            </div>
          </div>
        </section>
        
        {/* App Gallery */}
        <section id="app-gallery" className="py-12 bg-gray-900 text-white">
          <div className="container px-4 md:px-6">
            <h2 className="text-2xl font-bold mb-8">Apps</h2>
            
            <div className="mb-8">
              <CategoryFilter 
                selectedCategory={selectedCategory}
                onSelectCategory={setSelectedCategory}
              />
            </div>
            
            {/* Updated grid with larger cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredApps.map(app => (
                <div key={app.id} className="h-full">
                  <AppCard app={app} />
                </div>
              ))}
            </div>
          </div>
        </section>
        
        {/* Features Section */}
        <section className="py-12 bg-gray-50">
          <div className="container px-4 md:px-6">
            <h2 className="text-2xl font-bold mb-8 text-center">Features</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <div className="w-12 h-12 bg-skreenlab-blue/10 text-skreenlab-blue rounded-lg flex items-center justify-center mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="3" width="20" height="14" rx="2" />
                    <line x1="8" x2="16" y1="21" y2="21" />
                    <line x1="12" x2="12" y1="17" y2="21" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold mb-2">Screenshot Gallery</h3>
                <p className="text-gray-600">Browse through thousands of screenshot examples from the world's best apps.</p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <div className="w-12 h-12 bg-skreenlab-blue/10 text-skreenlab-blue rounded-lg flex items-center justify-center mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 9h16" />
                    <path d="M4 15h16" />
                    <path d="M8 5v14" />
                    <path d="M16 5v14" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold mb-2">Categorization</h3>
                <p className="text-gray-600">Screenshots are organized by app, category, and tagged with relevant components and patterns.</p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <div className="w-12 h-12 bg-skreenlab-blue/10 text-skreenlab-blue rounded-lg flex items-center justify-center mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="m21 21-6.05-6.05m0 0a7 7 0 1 0-9.9-9.9 7 7 0 0 0 9.9 9.9Z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold mb-2">Advanced Search</h3>
                <p className="text-gray-600">Find exactly what you're looking for using our powerful search and filtering capabilities.</p>
              </div>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default Index;
