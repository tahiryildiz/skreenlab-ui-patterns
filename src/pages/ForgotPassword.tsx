
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Mail } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // This would connect to authentication service in a real app
    console.log('Password reset requested for:', email);
    setIsSubmitted(true);
    toast({
      title: "Reset link sent",
      description: "If an account exists with that email, you'll receive a password reset link shortly."
    });
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-sm">
          <div>
            <h1 className="text-center text-3xl font-bold">Reset your password</h1>
            <p className="mt-2 text-center text-gray-600">
              {!isSubmitted 
                ? "Enter your email address and we'll send you a link to reset your password." 
                : "Check your email for a link to reset your password."}
            </p>
          </div>
          
          {!isSubmitted ? (
            <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
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
              
              <Button type="submit" className="w-full bg-skreenlab-blue hover:bg-skreenlab-blue/90">
                Send reset link
              </Button>
              
              <div className="text-center">
                <Link to="/signin" className="text-sm text-skreenlab-blue hover:underline">
                  Back to sign in
                </Link>
              </div>
            </form>
          ) : (
            <div className="mt-8 space-y-6">
              <div className="bg-green-50 text-green-800 p-4 rounded-md text-sm">
                If an account exists with the email <strong>{email}</strong>, we've sent instructions to reset your password.
              </div>
              
              <Button 
                onClick={() => setIsSubmitted(false)}
                variant="outline" 
                className="w-full border-skreenlab-blue text-skreenlab-blue hover:bg-skreenlab-blue/10"
              >
                Try another email
              </Button>
              
              <div className="text-center">
                <Link to="/signin" className="text-sm text-skreenlab-blue hover:underline">
                  Back to sign in
                </Link>
              </div>
            </div>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default ForgotPassword;
