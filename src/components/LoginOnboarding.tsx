import { useState } from 'react';
import { motion } from 'motion/react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card } from './ui/card';
import { Shield, Brain, Mic, ArrowRight, ArrowLeft, Loader2, AlertCircle } from 'lucide-react';
import { ImageWithFallback } from './image/ImageWithFallback';
import { getSupabaseClient } from '../utils/supabase/client';
import { projectId, publicAnonKey } from '../utils/supabase/info';

const onboardingSlides = [
  {
    icon: Shield,
    title: 'Your Privacy Matters',
    description: 'Bank-level encryption and federated learning keep your data secure and private.',
    image: 'https://images.unsplash.com/photo-1654574111854-be9994f3c265?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmaW5hbmNpYWwlMjBzZWN1cml0eSUyMHNoaWVsZHxlbnwxfHx8fDE3NjEzMDg1OTh8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral'
  },
  {
    icon: Brain,
    title: 'AI-Powered Insights',
    description: 'Get personalized financial advice powered by advanced AI that learns your spending patterns.',
    image: 'https://images.unsplash.com/photo-1673255745677-e36f618550d1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxBSSUyMHRlY2hub2xvZ3klMjBicmFpbnxlbnwxfHx8fDE3NjEzMDg1OTl8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral'
  },
  {
    icon: Mic,
    title: 'Voice Assistant',
    description: 'Ask questions and manage finances naturally with our conversational AI assistant.',
    image: 'https://images.unsplash.com/photo-1620245446020-879dc5cf2414?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx2b2ljZSUyMGFzc2lzdGFudCUyMG1pY3JvcGhvbmV8ZW58MXx8fHwxNzYxMjI1NTM0fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral'
  }
];

interface LoginOnboardingProps {
  onComplete: () => void;
}

export function LoginOnboarding({ onComplete }: LoginOnboardingProps) {
  const [showLogin, setShowLogin] = useState(true);
  const [isSignup, setIsSignup] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Use singleton Supabase client
  const supabase = getSupabaseClient();

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (data.session) {
        localStorage.setItem('access_token', data.session.access_token);
        localStorage.setItem('user_id', data.user.id);
        setShowLogin(false);
      }
    } catch (err: any) {
      console.error('Sign in error:', err);
      setError(err.message || 'Failed to sign in');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-fe8ebde8/signup`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email, password, name }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to sign up');
      }

      // Now sign in
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (data.session) {
        localStorage.setItem('access_token', data.session.access_token);
        localStorage.setItem('user_id', data.user.id);
        setShowLogin(false);
      }
    } catch (err: any) {
      console.error('Sign up error:', err);
      setError(err.message || 'Failed to sign up');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialLogin = async (provider: 'google' | 'github') => {
    try {
      setError('');
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: window.location.origin,
        },
      });

      if (error) throw error;
    } catch (err: any) {
      console.error('Social login error:', err);
      setError(err.message || `Failed to sign in with ${provider}`);
    }
  };

  // Check for existing session on mount
  useState(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.access_token) {
        localStorage.setItem('access_token', session.access_token);
        localStorage.setItem('user_id', session.user.id);
        setShowLogin(false);
      }
    });
  });

  if (!showLogin) {
    const slide = onboardingSlides[currentSlide];
    const Icon = slide.icon;
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-600 via-teal-500 to-emerald-400 dark:from-teal-900 dark:via-teal-800 dark:to-emerald-900 flex items-center justify-center p-4">
        <motion.div
          key={currentSlide}
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -50 }}
          className="max-w-md w-full"
        >
          <Card className="p-8 bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm rounded-3xl shadow-2xl">
            <div className="relative h-48 mb-6 rounded-2xl overflow-hidden">
              <ImageWithFallback 
                src={slide.image}
                alt={slide.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent flex items-end justify-center pb-4">
                <div className="w-16 h-16 bg-white dark:bg-slate-700 rounded-full flex items-center justify-center">
                  <Icon className="w-8 h-8 text-teal-600 dark:text-teal-400" />
                </div>
              </div>
            </div>
            
            <h2 className="text-center mb-3">{slide.title}</h2>
            <p className="text-center text-muted-foreground mb-8">
              {slide.description}
            </p>
            
            <div className="flex gap-2 justify-center mb-6">
              {onboardingSlides.map((_, idx) => (
                <div
                  key={idx}
                  className={`h-2 rounded-full transition-all ${
                    idx === currentSlide 
                      ? 'w-8 bg-teal-600 dark:bg-teal-400' 
                      : 'w-2 bg-gray-300 dark:bg-gray-600'
                  }`}
                />
              ))}
            </div>
            
            <div className="flex gap-3">
              {currentSlide > 0 && (
                <Button
                  variant="outline"
                  onClick={() => setCurrentSlide(prev => prev - 1)}
                  className="flex-1"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
              )}
              <Button
                onClick={() => {
                  if (currentSlide < onboardingSlides.length - 1) {
                    setCurrentSlide(prev => prev + 1);
                  } else {
                    onComplete();
                  }
                }}
                className="flex-1 bg-teal-600 hover:bg-teal-700 dark:bg-teal-500 dark:hover:bg-teal-600"
              >
                {currentSlide < onboardingSlides.length - 1 ? 'Next' : 'Get Started'}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-600 via-teal-500 to-emerald-400 dark:from-teal-900 dark:via-teal-800 dark:to-emerald-900 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full"
      >
        <Card className="p-8 bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm rounded-3xl shadow-2xl">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-teal-600 to-emerald-400 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <h1 className="mb-2">{isSignup ? 'Create Account' : 'Welcome Back'}</h1>
            <p className="text-muted-foreground">
              {isSignup ? 'Start your financial wellness journey' : 'Sign in to your financial wellness hub'}
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-950 rounded-xl flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-600" />
              <p className="text-red-700 dark:text-red-300">{error}</p>
            </div>
          )}

          <form onSubmit={isSignup ? handleSignUp : handleSignIn} className="space-y-4 mb-6">
            {isSignup && (
              <div>
                <Input 
                  type="text"
                  placeholder="Full name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="h-12 rounded-xl"
                  required
                />
              </div>
            )}
            <div>
              <Input 
                type="email" 
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-12 rounded-xl"
                required
              />
            </div>
            <div>
              <Input 
                type="password" 
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-12 rounded-xl"
                required
                minLength={6}
              />
            </div>

            <Button 
              type="submit"
              className="w-full h-12 rounded-xl bg-teal-600 hover:bg-teal-700 dark:bg-teal-500 dark:hover:bg-teal-600"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  {isSignup ? 'Creating account...' : 'Signing in...'}
                </>
              ) : (
                isSignup ? 'Sign Up' : 'Sign In'
              )}
            </Button>
          </form>

          <div className="relative mb-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
            </div>
            <div className="relative flex justify-center">
              <span className="bg-white dark:bg-slate-800 px-4 text-muted-foreground">Or continue with</span>
            </div>
          </div>

          <div className="space-y-3">
            <Button 
              type="button"
              variant="outline" 
              className="w-full h-12 rounded-xl"
              onClick={() => handleSocialLogin('google')}
            >
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Google
            </Button>
            <Button 
              type="button"
              variant="outline" 
              className="w-full h-12 rounded-xl"
              onClick={() => handleSocialLogin('github')}
            >
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
              </svg>
              GitHub
            </Button>
          </div>

          <p className="text-center text-muted-foreground mt-6">
            {isSignup ? 'Already have an account?' : "Don't have an account?"}{' '}
            <button 
              type="button"
              onClick={() => {
                setIsSignup(!isSignup);
                setError('');
              }}
              className="text-teal-600 dark:text-teal-400 hover:underline"
            >
              {isSignup ? 'Sign in' : 'Sign up'}
            </button>
          </p>

          <p className="text-center text-muted-foreground mt-4 text-xs">
            Note: For social login to work, you must configure providers at{' '}
            <a 
              href="https://supabase.com/docs/guides/auth/social-login" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-teal-600 dark:text-teal-400 hover:underline"
            >
              Supabase Dashboard
            </a>
          </p>
        </Card>
      </motion.div>
    </div>
  );
}