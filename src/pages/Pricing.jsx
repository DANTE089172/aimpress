
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User as UserModel } from '@/api/entities';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { initiateStripeCheckout } from '@/api/functions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Check, Sparkles, Loader2, LogIn } from 'lucide-react';

export default function Pricing() {
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const checkUser = async () => {
      setIsLoading(true);
      try {
        const user = await UserModel.me();
        setCurrentUser(user);
        if (user.subscription_status === 'pro') {
          navigate(createPageUrl('Boards'));
        }
      } catch (error) {
        setCurrentUser(null);
      } finally {
        setIsLoading(false);
      }
    };
    checkUser();
  }, [navigate]);

  const handleSubscribe = async () => {
    // Case 1: User is not logged in. Redirect to login.
    if (!currentUser) {
      await UserModel.loginWithRedirect(window.location.href);
      return;
    }

    // Case 2: User is logged in. Proceed to Stripe checkout.
    setIsSubscribing(true);
    setError('');
    
    try {
      const { data } = await initiateStripeCheckout({
          origin_url: window.location.origin
      });

      if (data.checkout_url) {
        window.location.href = data.checkout_url;
      } else {
        setError('Could not retrieve payment link. Please try again.');
      }
    } catch (err) {
      console.error('Subscription error:', err);
      // Display the new, more detailed error message from the backend
      const errorMessage = err.response?.data?.error || 'An unexpected error occurred.';
      const errorDetail = err.response?.data?.detail || '';
      setError(`${errorMessage} ${errorDetail ? `[${errorDetail}]` : ''}`);
    } finally {
      setIsSubscribing(false);
    }
  };
  
  const features = [
    "Unlimited Boards and Notes",
    "AI-Powered Note Categorization",
    "All Advanced View Modes",
    "Cognitive Frameworks (Eisenhower, etc.)",
    "Cross-Board AI Assistant",
    "Professional & Student Modes"
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-500 via-blue-500 to-teal-500 flex items-center justify-center p-6 text-white">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin" />
          <p className="font-semibold mt-4">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-500 via-blue-500 to-teal-500 flex items-center justify-center p-6 text-white">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md"
      >
        <Card className="bg-white/10 backdrop-blur-2xl border-2 border-white/20 shadow-2xl">
          <CardHeader className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-3xl font-bold text-white">AImpress Pro</CardTitle>
            <CardDescription className="text-white/80 text-lg">Unlock all features and supercharge your productivity.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center my-4">
              <span className="text-5xl font-extrabold text-white">$5</span>
              <span className="text-white/70">/ 6 months</span>
            </div>
            <div className="text-center mb-4">
              <div className="bg-green-500/20 text-green-300 px-3 py-1 rounded-full text-sm font-medium inline-block">That's just $0.83/month!</div>
            </div>
            <ul className="space-y-3">
              {features.map((feature, index) => (
                <li key={index} className="flex items-center gap-3">
                  <div className="w-5 h-5 flex-shrink-0 bg-green-400/30 text-green-300 rounded-full flex items-center justify-center"><Check className="w-3 h-3" /></div>
                  <span className="text-white/90">{feature}</span>
                </li>
              ))}
            </ul>
          </CardContent>
          <CardFooter className="flex flex-col items-center justify-center pt-4">
            <Button
              size="lg"
              className="w-full text-lg font-bold bg-white text-purple-700 hover:bg-white/90 shadow-xl"
              onClick={handleSubscribe}
              disabled={isSubscribing}
            >
              {isSubscribing ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : (currentUser ? null : <LogIn className="mr-2 h-5 w-5" />)}
              {isSubscribing ? 'Processing...' : (currentUser ? 'Subscribe Now' : 'Sign In & Subscribe')}
            </Button>
            {error && <p className="text-red-400 text-sm mt-3 text-center">{error}</p>}
            <p className="text-white/60 text-xs mt-3">
              {currentUser ? 'You will be redirected to our secure payment processor.' : 'You\'ll be asked to sign in before purchasing.'}
            </p>
          </CardFooter>
        </Card>
        <p className="text-center text-xs text-white/50 mt-4">Payments are securely processed by Stripe.</p>
      </motion.div>
    </div>
  );
}
