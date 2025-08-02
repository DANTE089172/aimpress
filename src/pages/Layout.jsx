

import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { User as UserModel } from '@/api/entities';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Button } from '@/components/ui/button';
import { Sparkles, Settings, LogOut, User as UserIcon } from 'lucide-react';

const PUBLIC_PAGES = ['Landing', 'Pricing'];
const AUTH_PAGE = 'Boards'; // This is where unauthenticated users are sent. After login, they'll hit this logic.

export default function Layout({ children, currentPageName }) {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);
  const [status, setStatus] = useState('loading'); // loading, authenticated, unauthenticated

  useEffect(() => {
    const checkUserStatus = async () => {
      try {
        const user = await UserModel.me();
        setCurrentUser(user);

        // If user is on a public page, let them stay.
        // If they are on a protected page but not subscribed, redirect to pricing.
        if (!PUBLIC_PAGES.includes(currentPageName)) {
          if (user.subscription_status !== 'pro') {
            navigate(createPageUrl('Pricing'));
            return;
          }
        }
        setStatus('authenticated');
      } catch (error) {
        // User not logged in
        setStatus('unauthenticated');
        // If the page is not public, redirect to the landing page
        if (!PUBLIC_PAGES.includes(currentPageName)) {
          navigate(createPageUrl('Landing'));
        }
      }
    };
    checkUserStatus();
  }, [currentPageName, navigate]);

  const handleLogout = async () => {
    try {
      await UserModel.logout();
      navigate(createPageUrl('Landing'));
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-purple-500 via-blue-500 to-teal-500">
        <div className="text-center text-white">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-4"></div>
          <p className="font-semibold">Loading AImpress Notes...</p>
        </div>
      </div>
    );
  }

  // For public pages, we don't render the main app layout (header, etc.)
  if (PUBLIC_PAGES.includes(currentPageName) || (status === 'unauthenticated' && currentPageName !== 'Boards')) {
    return <>{children}</>;
  }
  
  // After login, if the user lands on "Boards" but is not subscribed, this will redirect them.
  // This handles the case where the user might already be logged in but has no subscription.
  if (currentUser?.subscription_status !== 'pro' && !PUBLIC_PAGES.includes(currentPageName)) {
     navigate(createPageUrl('Pricing'));
     return null; // Render nothing while redirecting
  }


  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-purple-500 via-blue-500 to-teal-500">
      {/* Header */}
      <header className="bg-white/10 backdrop-blur-lg border-b border-white/20 shadow-sm flex-shrink-0 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to={createPageUrl('Boards')} className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-white/30 to-white/10 rounded-lg flex items-center justify-center shadow-lg border border-white/20">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">
                  <span className="font-light">AI</span>mpress Notes
                </h1>
                <p className="text-xs text-white/70 -mt-1">AI-powered organization</p>
              </div>
            </Link>
            
            {/* Navigation */}
            <nav className="hidden md:flex items-center space-x-1">
              <Link 
                to={createPageUrl('Boards')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  currentPageName === 'Boards'
                    ? 'bg-white/20 text-white shadow-md'
                    : 'text-white/80 hover:bg-white/10 hover:text-white'
                }`}
              >
                My Boards
              </Link>
              <Link 
                to={createPageUrl('Archive')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  currentPageName === 'Archive'
                    ? 'bg-white/20 text-white shadow-md'
                    : 'text-white/80 hover:bg-white/10 hover:text-white'
                }`}
              >
                Archive
              </Link>
            </nav>

            {/* User Menu */}
            <div className="flex items-center space-x-3">
              {currentUser ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-10 w-10 rounded-full hover:bg-white/20">
                      <div className="w-9 h-9 bg-gradient-to-r from-white/30 to-white/10 rounded-full flex items-center justify-center border border-white/20">
                        <UserIcon className="w-5 h-5 text-white" />
                      </div>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56 bg-black/50 backdrop-blur-xl border-white/20 text-white" align="end">
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">{currentUser.full_name || 'User'}</p>
                        <p className="text-xs leading-none text-white/70">
                          {currentUser.email}
                        </p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator className="bg-white/20" />
                    <DropdownMenuItem asChild className="focus:bg-white/20 focus:text-white">
                      <Link to={createPageUrl('Profile')}>
                        <Settings className="mr-2 h-4 w-4" />
                        <span>Profile & Settings</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="bg-white/20"/>
                    <DropdownMenuItem onClick={handleLogout} className="focus:bg-white/20 focus:text-white">
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Log out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <div className="w-8 h-8 bg-white/20 rounded-full animate-pulse" />
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}

