
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Mail } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { toast } from '@/components/ui/sonner';
import { useForm } from 'react-hook-form';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

const emailSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
});

const otpSchema = z.object({
  otp: z.string().length(6, { message: "Code must be exactly 6 characters" }),
});

type EmailFormValues = z.infer<typeof emailSchema>;
type OtpFormValues = z.infer<typeof otpSchema>;

const SignIn = () => {
  const [codeSent, setCodeSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  
  // Email form
  const emailForm = useForm<EmailFormValues>({
    resolver: zodResolver(emailSchema),
    defaultValues: {
      email: '',
    },
  });
  
  // OTP form
  const otpForm = useForm<OtpFormValues>({
    resolver: zodResolver(otpSchema),
    defaultValues: {
      otp: '',
    },
  });

  // Sign in with Google
  const handleGoogleSignIn = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/signin`,
        }
      });
      
      if (error) throw error;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to sign in with Google';
      toast.error(message);
    }
  };
  
  // Request one-time code
  const handleEmailSignIn = async (values: EmailFormValues) => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: values.email,
        options: {
          emailRedirectTo: `${window.location.origin}/signin`,
        }
      });
      
      if (error) throw error;
      
      setCodeSent(true);
      toast.success("Verification code sent to your email");
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to send verification code';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Verify one-time code
  const verifyOtp = async (values: OtpFormValues) => {
    setIsLoading(true);
    try {
      const email = emailForm.getValues('email');
      
      const { error, data } = await supabase.auth.verifyOtp({
        email,
        token: values.otp,
        type: 'email',
      });
      
      if (error) throw error;
      
      toast.success("Successfully signed in");
      navigate('/');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Invalid verification code';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
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

            {!codeSent ? (
              // Step 1: Email Input Form
              <>
                <Form {...emailForm}>
                  <form className="space-y-6" onSubmit={emailForm.handleSubmit(handleEmailSignIn)}>
                    <FormField
                      control={emailForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <div className="space-y-1">
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                              Email
                            </label>
                            <div className="relative">
                              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                              <FormControl>
                                <Input
                                  {...field}
                                  id="email"
                                  type="email"
                                  className="pl-10 h-12 text-base border-gray-300"
                                  placeholder="you@example.com"
                                  disabled={isLoading}
                                  autoComplete="email"
                                />
                              </FormControl>
                            </div>
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <Button 
                      type="submit" 
                      className="w-full h-12 text-base font-medium bg-skreenlab-blue hover:bg-skreenlab-blue/90"
                      disabled={isLoading}
                    >
                      {isLoading ? "Sending code..." : "Send verification code"}
                    </Button>
                  </form>
                </Form>
                
                <div className="mt-6 relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-200"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-gray-500">Or continue with</span>
                  </div>
                </div>
                
                <div className="mt-6">
                  <Button 
                    type="button"
                    variant="outline"
                    className="w-full h-12 text-base font-medium border border-gray-300 flex items-center justify-center gap-3"
                    onClick={handleGoogleSignIn}
                    disabled={isLoading}
                  >
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                      <path d="M19.7874 10.2245C19.7874 9.5442 19.7291 8.86721 19.6126 8.21094H10.2084V11.9885H15.6038C15.3834 13.1993 14.6701 14.2262 13.6185 14.8837V17.3344H16.8391C18.7289 15.6122 19.7874 13.1413 19.7874 10.2245Z" fill="#4285F4"/>
                      <path d="M10.2084 20C12.9498 20 15.2398 19.1152 16.8459 17.3343L13.6253 14.8837C12.7287 15.4924 11.5663 15.8479 10.2152 15.8479C7.58757 15.8479 5.37307 14.1257 4.58266 11.7705H1.26562V14.2942C2.91244 17.8661 6.4034 20 10.2084 20Z" fill="#34A853"/>
                      <path d="M4.57594 11.7705C4.15675 10.5597 4.15675 9.24711 4.57594 8.03629V5.51263H1.26572C-0.154526 8.3361 -0.154526 11.4708 1.26572 14.2942L4.57594 11.7705Z" fill="#FBBC04"/>
                      <path d="M10.2084 4.15214C11.6398 4.13079 13.0253 4.66849 14.0839 5.64892L16.9456 2.78721C15.1331 1.06846 12.7142 0.0755512 10.2084 0.0969028C6.4034 0.0969028 2.91244 2.23077 1.26562 5.81268L4.57584 8.33634C5.35944 5.97431 7.58075 4.15214 10.2084 4.15214Z" fill="#EA4335"/>
                    </svg>
                    Continue with Google
                  </Button>
                </div>
              </>
            ) : (
              // Step 2: OTP Verification Form
              <Form {...otpForm}>
                <form className="space-y-6" onSubmit={otpForm.handleSubmit(verifyOtp)}>
                  <div className="space-y-4">
                    <div className="text-center mb-4">
                      <p className="text-gray-700">Enter the 6-digit code sent to</p>
                      <p className="font-medium">{emailForm.getValues('email')}</p>
                    </div>
                    
                    <FormField
                      control={otpForm.control}
                      name="otp"
                      render={({ field }) => (
                        <FormItem className="space-y-2">
                          <FormControl>
                            <InputOTP maxLength={6} {...field}>
                              <InputOTPGroup className="gap-2 justify-center">
                                {Array.from({ length: 6 }).map((_, i) => (
                                  <InputOTPSlot key={i} index={i} className="h-12 w-12 text-lg" />
                                ))}
                              </InputOTPGroup>
                            </InputOTP>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="w-full h-12 text-base font-medium bg-skreenlab-blue hover:bg-skreenlab-blue/90"
                    disabled={isLoading}
                  >
                    {isLoading ? "Verifying..." : "Verify Code"}
                  </Button>
                  
                  <div className="text-center">
                    <Button 
                      type="button" 
                      variant="link"
                      onClick={() => setCodeSent(false)}
                      className="text-gray-600"
                    >
                      Try a different method
                    </Button>
                  </div>
                </form>
              </Form>
            )}
            
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
