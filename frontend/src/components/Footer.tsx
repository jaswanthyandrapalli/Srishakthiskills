'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/context/LanguageContext';
import { 
  Mail, 
  Phone, 
  MapPin, 
  MessageSquare,
  ArrowRight
} from 'lucide-react';

const Footer: React.FC = () => {
  const { t } = useLanguage();
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      // Mock newsletter sign-up
      setSubscribed(true);
      setEmail('');
      setTimeout(() => setSubscribed(false), 5000);
    }
  };

  return (
    <footer className="bg-[#24130F] text-[#F4EFEA] border-t border-gold/20 pt-16 pb-8 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          
          {/* Brand Info */}
          <div className="space-y-4">
            <span className="font-serif-lux text-2xl font-bold tracking-wider gold-text-gradient">
              {t('brand_name')}
            </span>
            <p className="text-xs text-[#F4EFEA]/70 leading-relaxed font-light">
              Experience the luxury of premium silks, fine cottons, and handcrafted bridal sarees. Celebrating the artistry of weavers across India.
            </p>
            <div className="flex space-x-4 pt-2">
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="hover:text-gold transition-colors text-[#F4EFEA]/80" aria-label="Facebook">
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c4.56-.93 8-4.96 8-9.75z"/>
                </svg>
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="hover:text-gold transition-colors text-[#F4EFEA]/80" aria-label="Instagram">
                <svg className="w-5 h-5 stroke-current fill-none stroke-2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                </svg>
              </a>
              {/* WhatsApp chat trigger */}
              <a href="https://wa.me/919999999999?text=Hi%20Sri%20Sakthi%20Sarees" target="_blank" rel="noopener noreferrer" className="hover:text-gold transition-colors text-[#F4EFEA]/80">
                <MessageSquare className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="font-serif-lux text-sm uppercase tracking-widest text-gold font-bold">Quick Links</h3>
            <ul className="space-y-2 text-xs font-light text-[#F4EFEA]/80">
              <li><Link href="/" className="hover:text-gold transition-colors">Home</Link></li>
              <li><Link href="/shop" className="hover:text-gold transition-colors">Shop Sarees</Link></li>
              <li><Link href="/track-order" className="hover:text-gold transition-colors">Track Order</Link></li>
              <li><Link href="/about" className="hover:text-gold transition-colors">About Our Heritage</Link></li>
              <li><Link href="/contact" className="hover:text-gold transition-colors">Contact Store</Link></li>
            </ul>
          </div>

          {/* Policies */}
          <div className="space-y-4">
            <h3 className="font-serif-lux text-sm uppercase tracking-widest text-gold font-bold">Store Policies</h3>
            <ul className="space-y-2 text-xs font-light text-[#F4EFEA]/80">
              <li><Link href="/policies/privacy" className="hover:text-gold transition-colors">Privacy Policy</Link></li>
              <li><Link href="/policies/privacy#return" className="hover:text-gold transition-colors">Return & Refund Policy</Link></li>
              <li><Link href="/policies/privacy#shipping" className="hover:text-gold transition-colors">Shipping Policy</Link></li>
              <li><Link href="/policies/privacy#terms" className="hover:text-gold transition-colors">Terms & Conditions</Link></li>
            </ul>
          </div>

          {/* Contact Details & Newsletter */}
          <div className="space-y-5">
            <h3 className="font-serif-lux text-sm uppercase tracking-widest text-gold font-bold">Nandigama Showroom</h3>
            <div className="space-y-2 text-xs text-[#F4EFEA]/80 font-light">
              <p className="flex items-start">
                <MapPin className="w-4 h-4 text-gold mr-2 mt-0.5 flex-shrink-0" />
                <span>Raithupeta, Nandigama, NTR District, Andhra Pradesh, 521185, India</span>
              </p>
              <p className="flex items-center">
                <Phone className="w-4 h-4 text-gold mr-2 flex-shrink-0" />
                <span>+91 99999 88888</span>
              </p>
              <p className="flex items-center">
                <Mail className="w-4 h-4 text-gold mr-2 flex-shrink-0" />
                <span>support@srisakthisarees.com</span>
              </p>
            </div>

            {/* Newsletter */}
            <div className="pt-2">
              <h4 className="text-xs uppercase tracking-widest text-gold font-bold mb-2">Subscribe to Offers</h4>
              <form onSubmit={handleSubscribe} className="flex">
                <input
                  type="email"
                  placeholder="Enter email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-[#3D201A] border border-gold/30 rounded-l text-xs px-3 py-2 w-full focus:outline-none focus:border-gold text-[#F4EFEA]"
                  required
                />
                <button type="submit" className="gold-gradient text-maroon-950 px-3 rounded-r hover:opacity-90 transition-opacity">
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
              {subscribed && (
                <p className="text-[10px] text-green-400 mt-1.5 font-bold">Successfully joined our exclusive updates club!</p>
              )}
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gold/15 mt-12 pt-6 flex flex-col sm:flex-row justify-between items-center text-[10px] text-[#F4EFEA]/60 font-light space-y-3 sm:space-y-0">
          <p>© 2026 Sri Sakthi Sarees. All Rights Reserved. Built with traditional luxury + modern excellence.</p>
          <div className="flex space-x-4">
            <span>Raithupeta, Nandigama</span>
            <span>|</span>
            <span>NTR District, AP</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
