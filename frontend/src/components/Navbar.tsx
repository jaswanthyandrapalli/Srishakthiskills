'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { useLanguage } from '@/context/LanguageContext';
import { useTheme } from '@/context/ThemeContext';
import { 
  ShoppingBag, 
  Heart, 
  User, 
  Menu, 
  X, 
  Sun, 
  Moon, 
  Search, 
  Globe 
} from 'lucide-react';

const Navbar: React.FC = () => {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const { cartItems, wishlist } = useCart();
  const { language, setLanguage, t } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/shop?search=${encodeURIComponent(searchQuery)}`);
      setSearchOpen(false);
      setSearchQuery('');
    }
  };

  const navLinks = [
    { href: '/', label: t('nav_home') },
    { href: '/shop', label: t('nav_shop') },
    { href: '/track-order', label: t('nav_track') },
    { href: '/about', label: t('nav_about') },
    { href: '/contact', label: t('nav_contact') },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 transition-all duration-300 glassmorphism border-b border-card-border shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          
          {/* Logo / Brand Name */}
          <Link href="/" className="flex flex-col flex-shrink-0">
            <span className="font-serif-lux text-xl sm:text-2xl font-bold tracking-wider gold-text-gradient">
              {t('brand_name')}
            </span>
            <span className="text-[10px] tracking-[0.2em] uppercase font-sans-lux text-fg-custom/60 text-center">
              Raithupeta, Nandigama
            </span>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex space-x-8">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`font-sans-lux font-medium text-sm tracking-wide transition-colors hover:text-gold ${
                    isActive ? 'text-gold border-b-2 border-gold pb-1' : 'text-fg-custom/80'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
            
            {user && user.role === 'admin' && (
              <Link
                href="/admin"
                className={`font-sans-lux font-bold text-sm tracking-wide text-maroon hover:text-maroon-hover transition-colors ${
                  pathname.startsWith('/admin') ? 'border-b-2 border-maroon pb-1' : ''
                }`}
              >
                {t('nav_admin')}
              </Link>
            )}
          </div>

          {/* Right Action Icons */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            
            {/* Search Toggle */}
            <button 
              onClick={() => setSearchOpen(!searchOpen)} 
              className="p-2 text-fg-custom/80 hover:text-gold transition-colors"
              aria-label="Search"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* Language Switcher */}
            <div className="relative group">
              <button className="flex items-center space-x-1 p-2 text-fg-custom/80 hover:text-gold transition-colors font-sans-lux text-xs uppercase font-semibold">
                <Globe className="w-4 h-4" />
                <span>{language}</span>
              </button>
              <div className="absolute right-0 top-full mt-1 hidden group-hover:block bg-card-custom border border-card-border shadow-lg rounded-md p-1 min-w-[100px] z-50">
                <button
                  onClick={() => setLanguage('en')}
                  className={`w-full text-left px-3 py-1.5 text-xs rounded hover:bg-gold/10 ${
                    language === 'en' ? 'text-gold font-bold' : 'text-fg-custom/80'
                  }`}
                >
                  English
                </button>
                <button
                  onClick={() => setLanguage('te')}
                  className={`w-full text-left px-3 py-1.5 text-xs rounded hover:bg-gold/10 ${
                    language === 'te' ? 'text-gold font-bold' : 'text-fg-custom/80'
                  }`}
                >
                  తెలుగు (Telugu)
                </button>
              </div>
            </div>

            {/* Theme Toggle */}
            <button 
              onClick={toggleTheme} 
              className="p-2 text-fg-custom/80 hover:text-gold transition-colors"
              aria-label="Toggle Theme"
            >
              {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            {/* Wishlist */}
            <Link 
              href="/wishlist" 
              className="relative p-2 text-fg-custom/80 hover:text-gold transition-colors"
              aria-label="Wishlist"
            >
              <Heart className="w-5 h-5" />
              {wishlist.length > 0 && (
                <span className="absolute top-0 right-0 bg-maroon text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                  {wishlist.length}
                </span>
              )}
            </Link>

            {/* Cart */}
            <Link 
              href="/cart" 
              className="relative p-2 text-fg-custom/80 hover:text-gold transition-colors"
              aria-label="Cart"
            >
              <ShoppingBag className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute top-0 right-0 bg-gold text-maroon-950 text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* Account Panel */}
            <div className="relative group">
              {user ? (
                <div className="flex items-center space-x-1 cursor-pointer">
                  <div className="w-8 h-8 rounded-full maroon-gradient text-white flex items-center justify-center text-xs font-bold border border-gold">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="hidden lg:inline text-xs font-semibold max-w-[80px] truncate">
                    {user.name.split(' ')[0]}
                  </span>
                </div>
              ) : (
                <Link href="/login" className="p-2 text-fg-custom/80 hover:text-gold transition-colors" aria-label="Login">
                  <User className="w-5 h-5" />
                </Link>
              )}

              {user && (
                <div className="absolute right-0 top-full mt-1 hidden group-hover:block bg-card-custom border border-card-border shadow-xl rounded-lg p-2 min-w-[160px] z-50">
                  <div className="px-3 py-1.5 border-b border-card-border mb-1">
                    <p className="text-xs font-bold truncate">{user.name}</p>
                    <p className="text-[10px] text-fg-custom/60 truncate">{user.email}</p>
                  </div>
                  {user.role === 'admin' && (
                    <Link
                      href="/admin"
                      className="block px-3 py-2 text-xs rounded hover:bg-gold/10 text-fg-custom/80"
                    >
                      {t('nav_admin')}
                    </Link>
                  )}
                  <Link
                    href="/track-order"
                    className="block px-3 py-2 text-xs rounded hover:bg-gold/10 text-fg-custom/80"
                  >
                    My Orders
                  </Link>
                  <button
                    onClick={logout}
                    className="w-full text-left px-3 py-2 text-xs rounded hover:bg-red-500/10 text-red-500 font-semibold"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>

            {/* Mobile Menu Hamburger */}
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)} 
              className="md:hidden p-2 text-fg-custom/80 hover:text-gold transition-colors"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>

          </div>
        </div>
      </div>

      {/* Floating Search Bar Input Overlay */}
      {searchOpen && (
        <div className="bg-card-custom border-b border-card-border px-4 py-3 shadow-md transition-all duration-300">
          <form onSubmit={handleSearchSubmit} className="max-w-3xl mx-auto flex items-center">
            <input
              type="text"
              placeholder={t('search_placeholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-input-custom text-sm border border-card-border rounded-l-md px-4 py-2.5 focus:outline-none focus:ring-1 focus:ring-gold"
              autoFocus
            />
            <button 
              type="submit" 
              className="gold-gradient text-maroon-950 font-bold text-xs uppercase px-5 py-3 rounded-r-md hover:opacity-90 flex items-center space-x-1"
            >
              <Search className="w-4 h-4" />
              <span className="hidden sm:inline">Search</span>
            </button>
          </form>
        </div>
      )}

      {/* Mobile Sliding Overlay Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-card-custom border-b border-card-border py-4 px-6 space-y-3 transition-transform">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileMenuOpen(false)}
              className={`block text-base font-semibold py-1.5 transition-colors hover:text-gold ${
                pathname === link.href ? 'text-gold' : 'text-fg-custom/80'
              }`}
            >
              {link.label}
            </Link>
          ))}
          {user && user.role === 'admin' && (
            <Link
              href="/admin"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-base font-bold py-1.5 text-maroon"
            >
              {t('nav_admin')}
            </Link>
          )}
          {user ? (
            <button
              onClick={() => {
                logout();
                setMobileMenuOpen(false);
              }}
              className="w-full text-left py-2 text-red-500 font-bold border-t border-card-border mt-2"
            >
              Logout
            </button>
          ) : (
            <Link
              href="/login"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-center gold-gradient text-maroon-950 py-2.5 rounded font-bold text-sm mt-3"
            >
              Login / Signup
            </Link>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
