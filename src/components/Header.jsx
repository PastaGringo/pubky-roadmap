'use client';

import { useRouter } from 'next/navigation';
import { TrendingUpIcon, LogOut, User, Menu, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useState, useEffect } from 'react';

export default function Header({ onShowLoginModal, onShowCreateModal }) {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [avatarUrl, setAvatarUrl] = useState(null);
  const [avatarLoading, setAvatarLoading] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
  };

  // Fetch user avatar when user is authenticated
  useEffect(() => {
    const fetchUserAvatar = async () => {
      if (!user?.pubkey) {
        setAvatarUrl(null);
        return;
      }

      try {
        setAvatarLoading(true);
        
        // Use the Nexus avatar endpoint
        const avatarEndpoint = `https://nexus.pubky.app/static/avatar/${user.pubkey}`;
        console.log('🖼️ Loading header avatar:', avatarEndpoint);
        
        const response = await fetch(avatarEndpoint);
        
        if (response.ok) {
          setAvatarUrl(avatarEndpoint);
          console.log('✅ Header avatar loaded successfully');
        } else {
          console.log('⚠️ Header avatar failed:', response.status);
          setAvatarUrl(null);
        }
      } catch (error) {
        console.error('❌ Error loading header avatar:', error);
        setAvatarUrl(null);
      } finally {
        setAvatarLoading(false);
      }
    };

    fetchUserAvatar();
  }, [user?.pubkey]);

  return (
    <header className="border-b border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          {/* Logo */}
          <div 
            className="flex items-center space-x-3 cursor-pointer"
            onClick={() => router.push('/')}
          >
            <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <TrendingUpIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">Roadky</h1>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 hidden sm:block">Vote for the future of Pubky ecosystem</p>
            </div>
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <button
              onClick={() => router.push('/how-it-works')}
              className="text-slate-700 dark:text-slate-300 hover:text-purple-600 dark:hover:text-purple-400 font-medium transition-all duration-200 hover:scale-105"
            >
              HOW IT WORKS
            </button>
          </div>

          {/* Desktop User Actions */}
          <div className="hidden md:flex items-center">
            {user ? (
              <div className="flex items-center gap-3">
                <button
                  onClick={() => router.push('/profile')}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 shadow-lg flex items-center gap-2"
                >
                  <User className="w-4 h-4" />
                  My Profile
                </button>
                <button
                  onClick={() => router.push('/admin')}
                  className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 shadow-lg"
                >
                  My Features
                </button>
                <button
                  onClick={handleLogout}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 shadow-lg flex items-center gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
                
                {/* User Avatar */}
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm overflow-hidden border-2 border-white/30">
                  {avatarLoading ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : avatarUrl ? (
                    <img 
                      src={avatarUrl} 
                      alt="User Avatar" 
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none'
                        const parent = e.currentTarget.parentElement
                        if (parent) {
                          const fallbackIcon = parent.querySelector('.fallback-icon')
                          if (fallbackIcon) {
                            fallbackIcon.style.display = 'block'
                          }
                        }
                      }}
                    />
                  ) : null}
                  <User 
                    className={`w-5 h-5 text-white fallback-icon ${
                      avatarUrl && !avatarLoading ? 'hidden' : 'block'
                    }`} 
                  />
                </div>
              </div>
            ) : (
              <button
                onClick={onShowLoginModal}
                className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-2 sm:px-6 sm:py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-blue-700 transition-all shadow-lg hover:shadow-xl text-sm sm:text-base"
              >
                🔐 Connect with Pubky Ring
              </button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-2">
            {/* User Avatar on Mobile */}
            {user && (
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm overflow-hidden border-2 border-white/30">
                {avatarLoading ? (
                  <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : avatarUrl ? (
                  <img 
                    src={avatarUrl} 
                    alt="User Avatar" 
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none'
                      const parent = e.currentTarget.parentElement
                      if (parent) {
                        const fallbackIcon = parent.querySelector('.fallback-icon')
                        if (fallbackIcon) {
                          fallbackIcon.style.display = 'block'
                        }
                      }
                    }}
                  />
                ) : null}
                <User 
                  className={`w-4 h-4 text-white fallback-icon ${
                    avatarUrl && !avatarLoading ? 'hidden' : 'block'
                  }`} 
                />
              </div>
            )}
            
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              {isMobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-slate-200 dark:border-slate-700 py-4 space-y-4">
            {/* Navigation Links */}
            <button
              onClick={() => {
                router.push('/how-it-works');
                setIsMobileMenuOpen(false);
              }}
              className="block w-full text-left px-4 py-2 text-slate-700 dark:text-slate-300 hover:text-purple-600 dark:hover:text-purple-400 font-medium transition-colors"
            >
              HOW IT WORKS
            </button>

            {/* User Actions */}
            {user ? (
              <div className="space-y-2 px-4">
                <button
                  onClick={() => {
                    router.push('/profile');
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-4 py-3 rounded-lg font-medium transition-all duration-200 shadow-lg flex items-center gap-2 justify-center"
                >
                  <User className="w-4 h-4" />
                  My Profile
                </button>
                <button
                  onClick={() => {
                    router.push('/admin');
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-4 py-3 rounded-lg font-medium transition-all duration-200 shadow-lg justify-center flex"
                >
                  My Features
                </button>
                <button
                  onClick={() => {
                    handleLogout();
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full bg-red-600 hover:bg-red-700 text-white px-4 py-3 rounded-lg font-medium transition-all duration-200 shadow-lg flex items-center gap-2 justify-center"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </div>
            ) : (
              <div className="px-4">
                <button
                  onClick={() => {
                    onShowLoginModal();
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-blue-700 transition-all shadow-lg hover:shadow-xl"
                >
                  🔐 Connect with Pubky Ring
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
