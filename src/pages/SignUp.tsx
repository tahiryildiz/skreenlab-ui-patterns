
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Mail, User } from 'lucide-react';

const SignUp = () => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [acceptTerms, setAcceptTerms] = useState(false);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // This would connect to authentication service in a real app
    console.log('Sign up attempt with:', { fullName, email, password, acceptTerms });
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-sm">
          <div>
            <h1 className="text-center text-3xl font-bold">Join Skreenlab</h1>
            <p className="mt-2 text-center text-gray-600">
              Get access to thousands of UI inspirations
            </p>
          </div>
          
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <label htmlFor="full-name" className="block text-sm font-medium text-gray-700">
                  Full name
                </label>
                <div className="mt-1 relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                  <Input
                    id="full-name"
                    type="text"
                    required
                    className="pl-10"
                    placeholder="John Doe"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email address
                </label>
                <div className="mt-1 relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                  <Input
                    id="email"
                    type="email"
                    required
                    className="pl-10"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <div className="mt-1">
                  <Input
                    id="password"
                    type="password"
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  Password must be at least 8 characters
                </p>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="terms" 
                  checked={acceptTerms} 
                  onCheckedChange={(checked) => setAcceptTerms(checked as boolean)}
                />
                <label htmlFor="terms" className="text-sm text-gray-600">
                  I accept the <Link to="/terms" className="text-skreenlab-blue hover:underline">Terms of Service</Link> and <Link to="/privacy" className="text-skreenlab-blue hover:underline">Privacy Policy</Link>
                </label>
              </div>
            </div>
            
            <Button 
              type="submit" 
              className="w-full bg-skreenlab-blue hover:bg-skreenlab-blue/90"
              disabled={!acceptTerms}
            >
              Create account
            </Button>
            
            <div className="text-center">
              <span className="text-sm text-gray-600">
                Already have an account?{" "}
                <Link to="/signin" className="text-skreenlab-blue hover:underline font-medium">
                  Sign in
                </Link>
              </span>
            </div>
          </form>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default SignUp;
