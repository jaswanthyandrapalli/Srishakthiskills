'use client';

import React, { useState } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { Mail, Phone, MapPin, MessageSquare, AlertCircle } from 'lucide-react';

export default function ContactPage() {
  const { t } = useLanguage();

  // Contact Form States
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    if (!name || !email || !phone || !message) {
      setError('Please fill in all input fields.');
      return;
    }

    // Mock form submit
    setSuccess(true);
    setName('');
    setEmail('');
    setPhone('');
    setMessage('');
    setTimeout(() => setSuccess(false), 5000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-16 font-sans-lux">
      
      <div>
        <h1 className="font-serif-lux text-3xl font-extrabold tracking-wide">Contact Us</h1>
        <p className="text-xs text-fg-custom/60 font-light mt-1">Get in touch with our showroom associates or order query helpline.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        
        {/* Left Side: Contact Information & Showroom Details */}
        <div className="space-y-8">
          
          <div className="space-y-6 bg-card-custom border border-card-border p-6 rounded-2xl shadow-sm">
            <h2 className="font-serif-lux text-sm font-bold uppercase tracking-wider text-gold">Nandigama Flagship Store</h2>

            <div className="space-y-4 text-xs font-light text-fg-custom/80 leading-relaxed">
              <div className="flex items-start">
                <MapPin className="w-5 h-5 text-gold mr-3 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-bold text-fg-custom">Sri Sakthi Sarees</p>
                  <p>Raithupeta, Nandigama, NTR District,</p>
                  <p>Andhra Pradesh, 521185, India</p>
                </div>
              </div>

              <div className="flex items-center">
                <Phone className="w-5 h-5 text-gold mr-3 flex-shrink-0" />
                <a href="tel:+918125106553" className="hover:underline font-bold text-fg-custom">
                  +91 8125106553
                </a>
              </div>

              <div className="flex items-center">
                <Mail className="w-5 h-5 text-gold mr-3 flex-shrink-0" />
                <a href="mailto:support@srisakthisarees.com" className="hover:underline font-bold text-[#800000]">
                 srishakthi6699@gmail.com
                </a>
              </div>
            </div>

            {/* Helpline quick buttons */}
            <div className="flex flex-wrap gap-3 pt-3 border-t border-card-border/60">
              <a
                href="tel:+918125106553"
                className="flex items-center space-x-1.5 bg-maroon text-white font-bold uppercase text-[10px] tracking-wider px-5 py-3 rounded-lg hover:opacity-90 transition-opacity"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>Call Store</span>
              </a>
              <a
                href="https://wa.me/918125106553?text=Hi%20Sri%20Sakthi%20Sarees%2C%20I%20have%20an%20inquiry%20about..."
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-1.5 bg-green-600 text-white font-bold uppercase text-[10px] tracking-wider px-5 py-3 rounded-lg hover:bg-green-700 transition-colors"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>WhatsApp Helpline</span>
              </a>
            </div>
          </div>

          {/* Embedded Google Maps locator iframe */}
          <div className="h-60 rounded-2xl overflow-hidden border border-card-border shadow-sm">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15286.079237694377!2d80.28186175541992!3d16.700877999999998!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3a35ee7f8a1fd809%3A0xe54ef6e39572d421!2sNandigama%2C%20Andhra%20Pradesh!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen={true}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            ></iframe>
          </div>

        </div>

        {/* Right Side: Message Submission Form */}
        <div className="bg-card-custom border border-card-border p-6 rounded-2xl shadow-sm space-y-6">
          <h2 className="font-serif-lux text-sm font-bold uppercase tracking-wider text-fg-custom border-b border-card-border pb-3">Send a Message</h2>

          {error && (
            <div className="p-3 bg-red-500/10 text-red-500 rounded-lg text-xs flex items-center space-x-1.5 font-medium">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="p-3 bg-green-500/10 text-green-500 rounded-lg text-xs font-bold">
              Message sent successfully! We will get back to you shortly.
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold text-fg-custom/60">Your Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full text-xs bg-bg-custom border border-card-border rounded-lg px-3 py-2.5 focus:outline-none focus:border-gold text-fg-custom"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold text-fg-custom/60">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full text-xs bg-bg-custom border border-card-border rounded-lg px-3 py-2.5 focus:outline-none focus:border-gold text-fg-custom"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold text-fg-custom/60">Phone Number</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full text-xs bg-bg-custom border border-card-border rounded-lg px-3 py-2.5 focus:outline-none focus:border-gold text-fg-custom"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] uppercase font-bold text-fg-custom/60">Message</label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={5}
                className="w-full bg-bg-custom text-xs border border-card-border rounded-xl p-3 focus:outline-none focus:border-gold text-fg-custom leading-relaxed"
                required
              />
            </div>

            <button 
              type="submit" 
              className="w-full gold-gradient text-maroon-950 font-bold uppercase text-xs tracking-wider py-3.5 rounded-lg shadow hover:opacity-90 transition-opacity"
            >
              Send Message
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}
