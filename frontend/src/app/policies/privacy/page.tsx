'use client';

import React from 'react';
import { ShieldCheck, Truck, RotateCcw, AlertTriangle } from 'lucide-react';

export default function PrivacyPolicyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-10 space-y-16 font-sans-lux">
      
      {/* Intro */}
      <div>
        <h1 className="font-serif-lux text-3xl font-extrabold tracking-wide">Store Policies</h1>
        <p className="text-xs text-fg-custom/60 font-light mt-1">Authentic terms, transparent shipping, and return declarations.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 print:hidden">
        <a href="#privacy" className="p-4 border border-card-border bg-card-custom rounded-xl flex items-center justify-between text-xs font-bold hover:border-gold transition-colors">
          <span>Privacy Policy</span>
          <ShieldCheck className="w-4 h-4 text-gold" />
        </a>
        <a href="#return" className="p-4 border border-card-border bg-card-custom rounded-xl flex items-center justify-between text-xs font-bold hover:border-gold transition-colors">
          <span>Return & Refunds</span>
          <RotateCcw className="w-4 h-4 text-gold" />
        </a>
        <a href="#shipping" className="p-4 border border-card-border bg-card-custom rounded-xl flex items-center justify-between text-xs font-bold hover:border-gold transition-colors">
          <span>Shipping Policy</span>
          <Truck className="w-4 h-4 text-gold" />
        </a>
        <a href="#terms" className="p-4 border border-card-border bg-card-custom rounded-xl flex items-center justify-between text-xs font-bold hover:border-gold transition-colors">
          <span>Terms & Conditions</span>
          <AlertTriangle className="w-4 h-4 text-gold" />
        </a>
      </div>

      {/* Sections */}
      <div className="space-y-12">
        
        {/* Privacy Policy */}
        <section id="privacy" className="space-y-4 scroll-mt-24">
          <h2 className="font-serif-lux text-lg font-bold text-gold uppercase tracking-wider flex items-center border-b border-card-border pb-2">
            <ShieldCheck className="w-5 h-5 mr-2 text-gold" />
            <span>Privacy Policy</span>
          </h2>
          <p className="text-xs font-light text-fg-custom/80 leading-relaxed">
            At Sri Sakthi Sarees, we value and respect your privacy. We collect basic account credentials (name, email, shipping address, and phone number) strictly for verifying OTP logins, sending delivery status alerts, and processing package handovers. Your payment credentials are secure: all transactions are processed via Razorpay API checkout and we do not store raw credit cards or bank passwords locally.
          </p>
        </section>

        {/* Return & Refund Policy */}
        <section id="return" className="space-y-4 scroll-mt-24">
          <h2 className="font-serif-lux text-lg font-bold text-gold uppercase tracking-wider flex items-center border-b border-card-border pb-2">
            <RotateCcw className="w-5 h-5 mr-2 text-gold" />
            <span>Return & Refund Policy</span>
          </h2>
          <div className="text-xs font-light text-fg-custom/80 leading-relaxed space-y-2">
            <p>We want you to love your saree. However, since our collections are hand-loomed and delicate, returns are accepted under the following conditions:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Returns must be requested within 7 days of package delivery.</li>
              <li>Sarees must be unworn, unwashed, with all original weaver tags and packaging intact.</li>
              <li>Customized blouse alterations or fall/pico finishes are NOT eligible for returns.</li>
              <li>To start a return, email us at support@srisakthisarees.com or visit our Nandigama showroom with the invoice details.</li>
            </ul>
          </div>
        </section>

        {/* Shipping Policy */}
        <section id="shipping" className="space-y-4 scroll-mt-24">
          <h2 className="font-serif-lux text-lg font-bold text-gold uppercase tracking-wider flex items-center border-b border-card-border pb-2">
            <Truck className="w-5 h-5 mr-2 text-gold" />
            <span>Shipping Policy</span>
          </h2>
          <div className="text-xs font-light text-fg-custom/80 leading-relaxed space-y-2">
            <p>We coordinate secure package dispatches to all locations across India:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Free delivery is automatically applied to orders above ₹2,000. For orders under ₹2,000, a flat fee of ₹100 is charged.</li>
              <li>Standard delivery takes 3 to 5 business days from order confirmation.</li>
              <li>Once shipped, we send you a Delhivery carrier code, which you can track directly on our portal.</li>
            </ul>
          </div>
        </section>

        {/* Terms & Conditions */}
        <section id="terms" className="space-y-4 scroll-mt-24">
          <h2 className="font-serif-lux text-lg font-bold text-gold uppercase tracking-wider flex items-center border-b border-card-border pb-2">
            <AlertTriangle className="w-5 h-5 mr-2 text-gold" />
            <span>Terms & Conditions</span>
          </h2>
          <p className="text-xs font-light text-fg-custom/80 leading-relaxed">
            By purchasing or browsing this catalog, you agree to our Terms and Conditions. Saree fabrics, colors, and textures shown online may vary slightly due to screen resolutions and natural handloom weaving variations. Prices and availability are subject to change. Inventory updates and coupon code adjustments are managed strictly under administrative rules.
          </p>
        </section>

      </div>
    </div>
  );
}
