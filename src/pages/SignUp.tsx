
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Mail } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/sonner';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';

const formSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
  acceptTerms: z.boolean().refine(val => val === true, {
    message: "You must accept the terms of service and privacy policy"
  })
});

type FormValues = z.infer<typeof formSchema>;

const SignUp = () => {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      acceptTerms: false
    }
  });

  // Sign up with email
  const handleSignUp = async (values: FormValues) => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: values.email,
        options: {
          emailRedirectTo: `${window.location.origin}/signin`,
        }
      });
      
      if (error) throw error;
      
      toast.success("Verification code sent to your email");
      navigate('/signin');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to sign up';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  // Sign up with Google
  const handleGoogleSignUp = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/signin`,
        }
      });
      
      if (error) throw error;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to sign up with Google';
      toast.error(message);
    }
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
          
          <Form {...form}>
            <form className="mt-8 space-y-6" onSubmit={form.handleSubmit(handleSignUp)}>
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                        Email address
                      </label>
                      <div className="mt-1 relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                        <FormControl>
                          <Input
                            {...field}
                            id="email"
                            type="email"
                            required
                            className="pl-10"
                            placeholder="you@example.com"
                            disabled={isLoading}
                          />
                        </FormControl>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="acceptTerms"
                  render={({ field }) => (
                    <FormItem className="flex items-start space-x-2">
                      <FormControl>
                        <Checkbox 
                          id="terms" 
                          checked={field.value} 
                          onCheckedChange={field.onChange}
                          disabled={isLoading}
                        />
                      </FormControl>
                      <label htmlFor="terms" className="text-sm text-gray-600">
                        I accept the <Link to="/terms" className="text-skreenlab-blue hover:underline">Terms of Service</Link> and <Link to="/privacy" className="text-skreenlab-blue hover:underline">Privacy Policy</Link>
                      </label>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <Button 
                type="submit" 
                className="w-full bg-skreenlab-blue hover:bg-skreenlab-blue/90"
                disabled={isLoading || !form.formState.isValid}
              >
                {isLoading ? "Creating account..." : "Create account"}
              </Button>
              
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">Or continue with</span>
                </div>
              </div>
              
              <Button 
                type="button"
                variant="outline"
                className="w-full h-12 text-base font-medium border border-gray-300 flex items-center justify-center gap-3"
                onClick={handleGoogleSignUp}
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
              
              <div className="text-center">
                <span className="text-sm text-gray-600">
                  Already have an account?{" "}
                  <Link to="/signin" className="text-skreenlab-blue hover:underline font-medium">
                    Sign in
                  </Link>
                </span>
              </div>
            </form>
          </Form>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default SignUp;
