
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Mail, Lock } from 'lucide-react';

const SignIn = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // This would connect to authentication service in a real app
    console.log('Sign in attempt with:', { email, password });
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />
      
      <main className="flex-1 flex">
        {/* Left side - Form */}
        <div className="w-full lg:w-1/2 flex flex-col justify-center px-8 md:px-16 lg:px-24 py-12">
          <div className="max-w-md mx-auto w-full">
            <h1 className="text-3xl md:text-4xl font-bold mb-6">Welcome back</h1>
            <p className="text-gray-600 mb-8">
              Sign in to continue to Skreenlab
            </p>
            
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                    <Input
                      id="email"
                      type="email"
                      required
                      className="pl-10 h-12 text-base border-gray-300"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                </div>
                
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                      Password
                    </label>
                    <Link to="/forgot-password" className="text-sm text-skreenlab-blue hover:text-skreenlab-blue/80">
                      Forgot?
                    </Link>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                    <Input
                      id="password"
                      type="password"
                      required
                      className="pl-10 h-12 text-base border-gray-300"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>
                </div>
              </div>
              
              <Button type="submit" className="w-full h-12 text-base font-medium bg-skreenlab-blue hover:bg-skreenlab-blue/90">
                Sign in
              </Button>
            </form>
            
            <div className="mt-8 pt-6 border-t border-gray-200 text-center">
              <p className="text-gray-600">
                Don't have an account?{" "}
                <Link to="/signup" className="text-skreenlab-blue hover:text-skreenlab-blue/80 font-medium">
                  Join for free
                </Link>
              </p>
            </div>
          </div>
        </div>
        
        {/* Right side - Image/Illustration */}
        <div className="hidden lg:block w-1/2 bg-gray-50">
          <div className="h-full flex items-center justify-center">
            <div className="max-w-lg p-8">
              <div className="aspect-square rounded-lg bg-gradient-to-br from-skreenlab-blue/10 to-skreenlab-blue/30 flex items-center justify-center">
                <svg 
                  xmlns="http://www.w3.org/2000/svg"
                  width="120" 
                  height="120" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="1" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                  className="text-skreenlab-blue"
                >
                  <rect x="2" y="3" width="20" height="14" rx="2" />
                  <line x1="8" x2="16" y1="21" y2="21" />
                  <line x1="12" x2="12" y1="17" y2="21" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold mt-6">Discover UI patterns from the best mobile apps</h2>
              <p className="text-gray-600 mt-2">Access the largest collection of mobile design patterns, organized by app, screen type, and component.</p>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default SignIn;
