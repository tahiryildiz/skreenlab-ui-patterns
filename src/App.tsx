
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import Index from "./pages/Index";
import AppDetail from "./pages/AppDetail";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import ForgotPassword from "./pages/ForgotPassword";
import Pricing from "./pages/Pricing";
import NotFound from "./pages/NotFound";
import Upload from "./pages/Upload";
import { AuthProvider } from "./contexts/AuthContext";

const queryClient = new QueryClient();

// Navigation guard to clear upload state when navigating away from upload page
const RouteChangeHandler = () => {
  const location = useLocation();
  
  useEffect(() => {
    // When navigating to a non-upload page, clear upload state
    if (location.pathname !== '/upload') {
      // Only clear if we're not in the middle of an upload
      const isUploadInProgress = sessionStorage.getItem('uploadInProgress') === 'true';
      
      // If user is actively navigating away from upload page while in progress,
      // we want to preserve the state, else clear it
      if (!isUploadInProgress) {
        console.log('Navigated away from upload page, clearing session storage');
        sessionStorage.removeItem('uploadState');
        sessionStorage.removeItem('uploadInProgress');
        sessionStorage.removeItem('preventAuthRedirects');
        sessionStorage.removeItem('tempScreenshots');
        sessionStorage.removeItem('currentUploadPath');
      }
    }
  }, [location.pathname]);
  
  return null;
};

const AppRoutes = () => (
  <>
    <RouteChangeHandler />
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/app/:id" element={<AppDetail />} />
      <Route path="/signin" element={<SignIn />} />
      <Route path="/signup" element={<SignUp />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/pricing" element={<Pricing />} />
      <Route path="/upload" element={<Upload />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  </>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <Toaster />
    <Sonner />
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  </QueryClientProvider>
);

export default App;
