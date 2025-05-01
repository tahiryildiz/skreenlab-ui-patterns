
import React from 'react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Check } from 'lucide-react';

const PricingTier = ({ 
  title, 
  price, 
  description, 
  features, 
  buttonText, 
  highlighted = false 
}: { 
  title: string; 
  price: string; 
  description: string; 
  features: string[]; 
  buttonText: string; 
  highlighted?: boolean; 
}) => {
  return (
    <div className={`rounded-xl p-6 shadow-lg flex flex-col h-full ${highlighted ? 'bg-skreenlab-blue/5 border-2 border-skreenlab-blue' : 'bg-white border border-gray-200'}`}>
      <h3 className="text-xl font-bold mb-2">{title}</h3>
      <div className="mb-4">
        <span className="text-3xl font-bold">{price}</span>
        {price !== 'Free' && <span className="text-gray-500 ml-1">/month</span>}
      </div>
      <p className="text-gray-600 mb-6">{description}</p>
      <div className="space-y-3 mb-8 flex-1">
        {features.map((feature, index) => (
          <div key={index} className="flex items-center">
            <Check size={18} className="text-green-500 mr-2 flex-shrink-0" />
            <span className="text-sm text-gray-700">{feature}</span>
          </div>
        ))}
      </div>
      <Button 
        className={`w-full ${highlighted ? 'bg-skreenlab-blue hover:bg-skreenlab-blue/90' : 'bg-gray-800 hover:bg-gray-700'}`}
      >
        {buttonText}
      </Button>
    </div>
  );
};

const Pricing = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      
      <main className="flex-1 py-16">
        <div className="container px-4 md:px-6">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <h1 className="text-4xl font-bold tracking-tight mb-4">Simple, transparent pricing</h1>
            <p className="text-xl text-gray-600">
              Get access to thousands of UI patterns from the world's best apps.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <PricingTier
              title="Free"
              price="Free"
              description="Perfect for getting started with UI inspiration."
              features={[
                "Limited app access",
                "5 screenshots per app",
                "Basic search functionality",
                "Community support"
              ]}
              buttonText="Get Started"
            />
            
            <PricingTier
              title="Pro"
              price="$19"
              description="Great for designers and developers seeking deeper insights."
              features={[
                "Full app library access",
                "Unlimited screenshots",
                "Advanced filtering",
                "Download screenshots",
                "Save favorites",
                "Priority support"
              ]}
              highlighted={true}
              buttonText="Start Pro Trial"
            />
            
            <PricingTier
              title="Team"
              price="$49"
              description="Ideal for design teams working together on projects."
              features={[
                "Everything in Pro",
                "5 team members",
                "Team libraries",
                "Collaborative collections",
                "API access",
                "Custom exports",
                "Dedicated support"
              ]}
              buttonText="Contact Sales"
            />
          </div>
          
          <div className="mt-16 max-w-3xl mx-auto text-center bg-white p-8 rounded-lg shadow-sm">
            <h2 className="text-2xl font-bold mb-4">Need a custom plan?</h2>
            <p className="mb-6 text-gray-600">
              For larger teams or specialized requirements, we offer custom enterprise solutions.
            </p>
            <Button variant="outline" className="border-skreenlab-blue text-skreenlab-blue hover:bg-skreenlab-blue/10">
              Contact Us
            </Button>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Pricing;
