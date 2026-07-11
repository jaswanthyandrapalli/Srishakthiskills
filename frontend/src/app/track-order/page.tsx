'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { API_URL } from '@/context/AuthContext';
import { 
  Package, 
  Truck, 
  MapPin, 
  CheckCircle, 
  AlertCircle, 
  Search, 
  Clipboard, 
  Printer, 
  HelpCircle,
  Clock,
  Sparkles
} from 'lucide-react';
import confetti from 'canvas-confetti';

function TrackOrderContent() {
  const searchParams = useSearchParams();
  const successParam = searchParams.get('success');
  const orderIdParam = searchParams.get('orderId');

  const [trackQuery, setTrackQuery] = useState(orderIdParam || '');
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  // Trigger confetti if order placed successfully
  useEffect(() => {
    if (successParam === 'true') {
      confetti({
        particleCount: 150,
        spread: 80,
        origin: { y: 0.6 }
      });
      // Fetch the placed order details
      if (orderIdParam) {
        fetchOrderDetails(orderIdParam);
      }
    }
  }, [successParam, orderIdParam]);

  const fetchOrderDetails = async (id: string) => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_URL}/orders/track/${id}`);
      const data = await res.json();
      if (res.ok) {
        setOrder(data);
      } else {
        setError(data.message || 'No order found with this tracking ID.');
        setOrder(null);
      }
    } catch (err) {
      // Fallback sandbox mockup tracker
      if (id) {
        setOrder({
          _id: id,
          createdAt: new Date().toISOString(),
          orderStatus: 'Pending',
          trackingNumber: `DEL_${Math.floor(100000000 + Math.random() * 900000000)}`,
          trackingCarrier: 'Delhivery',
          totalPrice: 11350,
          items: [
            { name: 'Kanchipuram Silk Bridal Saree', price: 11250, quantity: 1, image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=100&q=80' }
          ]
        });
      } else {
        setError('Server is currently offline. Mock tracking requires an ID.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleTrackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (trackQuery.trim()) {
      fetchOrderDetails(trackQuery.trim());
    }
  };

  const copyToClipboard = () => {
    if (order) {
      navigator.clipboard.writeText(order._id);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const printInvoice = () => {
    window.print();
  };

  // Helper to determine active step in timeline
  const getStatusStep = (status: string) => {
    const steps = ['Pending', 'Processing', 'Shipped', 'Delivered'];
    return steps.indexOf(status);
  };

  const activeStep = order ? getStatusStep(order.orderStatus) : -1;

  return (
    <div className="max-w-4xl mx-auto px-4 py-10 space-y-12 font-sans-lux print:py-0 print:px-0">
      
      {/* SUCCESS BANNER VIEW */}
      {successParam === 'true' && (
        <div className="bg-green-500/10 border border-green-500/20 p-6 rounded-2xl text-center space-y-4 shadow-sm print:hidden">
          <div className="w-14 h-14 bg-green-500 text-white rounded-full flex items-center justify-center mx-auto shadow-md">
            <CheckCircle className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h1 className="font-serif-lux text-2xl font-bold text-fg-custom">Saree Order Placed!</h1>
            <p className="text-xs text-fg-custom/70 font-light">Thank you for shopping at Sri Sakthi Sarees. Your receipt is listed below.</p>
          </div>
        </div>
      )}

      {/* TRACKING SEARCH INPUT BAR */}
      <div className="bg-card-custom border border-card-border p-6 rounded-2xl shadow-sm space-y-4 print:hidden">
        <h2 className="font-serif-lux text-sm font-bold uppercase tracking-wider text-fg-custom flex items-center">
          <Search className="w-4 h-4 text-gold mr-1.5" />
          <span>Track Order Status</span>
        </h2>
        <form onSubmit={handleTrackSubmit} className="flex gap-2">
          <input
            type="text"
            placeholder="Enter Order ID or Delhivery Tracking Code..."
            value={trackQuery}
            onChange={(e) => setTrackQuery(e.target.value)}
            className="w-full text-xs bg-bg-custom border border-card-border rounded-xl px-4 py-3 focus:outline-none focus:border-gold text-fg-custom font-medium"
            required
          />
          <button 
            type="submit" 
            className="gold-gradient text-maroon-950 text-xs font-bold uppercase px-6 rounded-xl hover:opacity-90 transition-opacity flex items-center space-x-1.5"
          >
            <span>Track</span>
          </button>
        </form>
        {error && (
          <p className="text-[10px] text-red-500 font-semibold">{error}</p>
        )}
      </div>

      {loading && (
        <div className="text-center text-xs font-light py-10">
          Fetching shipment tracking info...
        </div>
      )}

      {/* TRACKING DETAILS TIMELINE & RECEIPT */}
      {order && !loading && (
        <div className="space-y-10 animate-in fade-in-25 duration-300">
          
          {/* Timeline Process Status Steps (Hidden on Print) */}
          {order.orderStatus !== 'Cancelled' && (
            <div className="bg-card-custom border border-card-border p-6 rounded-2xl shadow-sm space-y-8 print:hidden">
              <h3 className="font-serif-lux text-xs font-bold uppercase tracking-wider text-fg-custom border-b border-card-border pb-3">Shipment Progress</h3>
              
              <div className="relative flex justify-between items-center max-w-2xl mx-auto pt-4">
                {/* Horizontal line connector */}
                <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-[2px] bg-card-border z-0"></div>
                {/* Active progress color line */}
                <div 
                  className="absolute left-0 top-1/2 -translate-y-1/2 h-[2px] maroon-gradient z-0 transition-all duration-500"
                  style={{ width: `${(activeStep / 3) * 100}%` }}
                ></div>

                {[
                  { label: 'Order Placed', icon: Clock },
                  { label: 'Processing', icon: Package },
                  { label: 'Shipped', icon: Truck },
                  { label: 'Delivered', icon: CheckCircle }
                ].map((step, index) => {
                  const Icon = step.icon;
                  const isDone = index <= activeStep;
                  return (
                    <div key={index} className="relative z-10 flex flex-col items-center space-y-2">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center shadow-md border-2 transition-all ${
                        isDone 
                          ? 'maroon-gradient text-white border-gold' 
                          : 'bg-card-custom text-fg-custom/30 border-card-border'
                      }`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <span className={`text-[10px] font-bold ${isDone ? 'text-gold' : 'text-fg-custom/40'}`}>{step.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Cancelled Alert status */}
          {order.orderStatus === 'Cancelled' && (
            <div className="bg-red-500/10 border border-red-500/20 p-5 rounded-2xl text-center text-red-500 space-y-2 print:hidden">
              <AlertCircle className="w-8 h-8 mx-auto" />
              <h3 className="font-serif-lux text-sm font-bold uppercase tracking-wider">Order Cancelled</h3>
              <p className="text-xs font-light">This order has been cancelled. For refunds/re-orders, please message our showroom support.</p>
            </div>
          )}

          {/* Saree Receipt / Print Invoice Section */}
          <div className="bg-card-custom border border-card-border p-6 rounded-2xl shadow-sm space-y-6 print:border-none print:shadow-none print:p-0">
            <div className="flex justify-between items-start border-b border-card-border pb-4 print:border-b-2">
              <div>
                <h3 className="font-serif-lux text-base font-bold text-gold uppercase tracking-wider">{order.trackingCarrier || 'Sri Sakthi Store Invoice'}</h3>
                <p className="text-[10px] text-fg-custom/60 font-light mt-0.5">Placed on: {new Date(order.createdAt).toLocaleDateString('en-IN')}</p>
                {order.trackingNumber && (
                  <p className="text-[10px] text-fg-custom/60 font-light">Delhivery Code: <span className="font-bold">{order.trackingNumber}</span></p>
                )}
              </div>

              {/* Action buttons (Hidden on Print) */}
              <div className="flex space-x-2 print:hidden">
                <button
                  onClick={copyToClipboard}
                  className="p-2 border border-card-border hover:border-gold rounded-lg transition-colors text-fg-custom/70 hover:text-gold"
                  title="Copy Order ID"
                >
                  <Clipboard className="w-4 h-4" />
                </button>
                <button
                  onClick={printInvoice}
                  className="p-2 border border-card-border hover:border-gold rounded-lg transition-colors text-fg-custom/70 hover:text-gold"
                  title="Print Invoice"
                >
                  <Printer className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Print Header Logo (Visible ONLY during print layout) */}
            <div className="hidden print:flex flex-col border-b border-gray-300 pb-4 mb-6">
              <h1 className="font-serif-lux text-2xl font-black text-center tracking-wider uppercase text-red-800">Sri Sakthi Sarees</h1>
              <p className="text-[10px] text-center text-gray-500 font-light">Raithupeta, Nandigama, NTR District, Andhra Pradesh, India</p>
            </div>

            {/* Order Items Table */}
            <div className="space-y-4">
              <span className="text-[10px] uppercase font-bold text-fg-custom/50 tracking-widest">Items Purchased</span>
              
              <div className="space-y-3">
                {order.items && order.items.map((item: any, index: number) => (
                  <div key={index} className="flex justify-between items-center text-xs text-fg-custom/90">
                    <div className="flex items-center space-x-3">
                      {item.image && <img src={item.image} alt={item.name} className="w-10 aspect-[3/4] object-cover object-top rounded border border-card-border print:hidden" />}
                      <div>
                        <p className="font-bold">{item.name}</p>
                        <p className="text-[9px] text-fg-custom/50">Qty: {item.quantity} | Color: {item.color}</p>
                      </div>
                    </div>
                    <span className="font-bold">₹{Math.round(item.price * item.quantity).toLocaleString('en-IN')}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Price breakdown */}
            <div className="border-t border-card-border pt-4 flex flex-col items-end space-y-1.5 text-xs text-fg-custom/80">
              <div className="flex justify-between w-48 font-light">
                <span>Items Subtotal</span>
                <span>₹{(order.totalPrice - (order.shippingPrice || 0)).toLocaleString('en-IN')}</span>
              </div>
              {order.shippingPrice > 0 && (
                <div className="flex justify-between w-48 font-light">
                  <span>Shipping Fee</span>
                  <span>₹{order.shippingPrice}</span>
                </div>
              )}
              <div className="flex justify-between w-48 font-extrabold border-t border-card-border pt-2 text-gold">
                <span>Total Paid</span>
                <span>₹{order.totalPrice.toLocaleString('en-IN')}</span>
              </div>
            </div>

            {/* Print Bottom Signature Area (Visible ONLY on print) */}
            <div className="hidden print:block pt-10 text-right text-xs">
              <div className="inline-block border-t border-gray-400 pt-1.5 w-40 text-center font-bold">
                Authorized Signatory
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Copy prompt feedback overlay */}
      {copied && (
        <div className="fixed bottom-6 left-6 bg-gold text-maroon-950 text-xs font-bold px-4 py-2.5 rounded-lg shadow-lg border border-gold animate-in fade-in slide-in-from-bottom-2 z-50">
          Order ID Copied!
        </div>
      )}

    </div>
  );
}

export default function TrackOrder() {
  return (
    <Suspense fallback={
      <div className="max-w-7xl mx-auto px-4 py-20 text-center text-xs font-light">
        Loading shipment tracker...
      </div>
    }>
      <TrackOrderContent />
    </Suspense>
  );
}
