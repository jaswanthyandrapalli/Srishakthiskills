'use client';

import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Send, User } from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  timestamp: Date;
}

const LiveChat: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize with greeting message
  useEffect(() => {
    setMessages([
      {
        id: 'greet-1',
        sender: 'bot',
        text: 'Namaste! Welcome to Sri Sakthi Sarees support. How can I help you choose the perfect saree today?',
        timestamp: new Date(),
      },
    ]);
  }, []);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isTyping]);

  const handleSendMessage = (text: string) => {
    if (!text.trim()) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputValue('');
    setIsTyping(true);

    // Simulate bot response
    setTimeout(() => {
      let botResponse = "Thank you for reaching out. A sales associate from our Nandigama store will connect with you shortly, or you can message us directly on WhatsApp at +91 99999 88888.";
      
      const lowerText = text.toLowerCase();
      if (lowerText.includes('locate') || lowerText.includes('address') || lowerText.includes('where')) {
        botResponse = "Our physical showroom is located at Raithupeta, Nandigama, NTR District, Andhra Pradesh. We are open from 10:00 AM to 9:00 PM daily!";
      } else if (lowerText.includes('ship') || lowerText.includes('delivery')) {
        botResponse = "We ship to almost all pincodes across India! Delivery is FREE on orders above ₹2000. It typically takes 3 to 5 business days for shipping.";
      } else if (lowerText.includes('whatsapp')) {
        botResponse = "Yes! You can complete your shopping directly via WhatsApp. Select 'WhatsApp Order' during checkout or message us at +91 99999 88888.";
      } else if (lowerText.includes('pattu') || lowerText.includes('silk')) {
        botResponse = "We specialize in premium Kanchipuram and Dharmavaram pure silk sarees with high-quality gold zari. Check out our 'Silk Sarees' category in the Shop!";
      } else if (lowerText.includes('track')) {
        botResponse = "To track your order, please copy your Order ID or Tracking Code and head over to our 'Track Order' page in the top menu.";
      }

      const botMsg: ChatMessage = {
        id: `bot-${Date.now()}`,
        sender: 'bot',
        text: botResponse,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, botMsg]);
      setIsTyping(false);
    }, 1200);
  };

  const quickReplies = [
    'Where is the store located?',
    'What are the delivery terms?',
    'Can I order via WhatsApp?',
    'How do I track my order?',
  ];

  return (
    <div className="fixed bottom-6 right-6 z-50 font-sans-lux">
      {/* Floating Action Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="gold-gradient text-maroon-950 p-4 rounded-full shadow-2xl hover:scale-110 active:scale-95 transition-all duration-300 flex items-center justify-center border border-gold"
          aria-label="Open Chat"
        >
          <MessageCircle className="w-6 h-6 animate-pulse" />
        </button>
      )}

      {/* Chat Box Container */}
      {isOpen && (
        <div className="bg-card-custom border border-card-border rounded-2xl shadow-2xl w-[320px] sm:w-[360px] h-[480px] flex flex-col overflow-hidden animate-in slide-in-from-bottom-5">
          {/* Header */}
          <div className="maroon-gradient text-white px-4 py-3.5 flex justify-between items-center border-b border-gold/20">
            <div className="flex items-center space-x-2">
              <div className="relative">
                <div className="w-8 h-8 rounded-full bg-white/20 border border-gold flex items-center justify-center font-bold text-sm">
                  SS
                </div>
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border border-[#800000] rounded-full"></span>
              </div>
              <div>
                <h3 className="font-serif-lux text-sm font-bold tracking-wide">Sri Sakthi Help</h3>
                <span className="text-[9px] text-white/70 font-light">Online & Ready to Assist</span>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white/80 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Chat Messages Area */}
          <div className="flex-grow p-4 overflow-y-auto space-y-3 bg-bg-custom/50">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-3 py-2 text-xs leading-relaxed ${
                    msg.sender === 'user'
                      ? 'gold-gradient text-maroon-950 font-medium rounded-tr-none'
                      : 'bg-card-custom border border-card-border text-fg-custom rounded-tl-none'
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
            
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-card-custom border border-card-border text-fg-custom rounded-2xl rounded-tl-none px-4 py-2.5 text-xs flex space-x-1.5 items-center">
                  <span className="w-1.5 h-1.5 bg-fg-custom/40 rounded-full animate-bounce"></span>
                  <span className="w-1.5 h-1.5 bg-fg-custom/40 rounded-full animate-bounce delay-100"></span>
                  <span className="w-1.5 h-1.5 bg-fg-custom/40 rounded-full animate-bounce delay-200"></span>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Replies Options */}
          {messages.length === 1 && (
            <div className="px-4 py-2 flex flex-wrap gap-1.5 border-t border-card-border bg-bg-custom/30">
              {quickReplies.map((reply, index) => (
                <button
                  key={index}
                  onClick={() => handleSendMessage(reply)}
                  className="bg-card-custom border border-card-border text-[10px] text-gold font-bold px-2 py-1 rounded-full hover:bg-gold/10 hover:border-gold transition-colors text-left"
                >
                  {reply}
                </button>
              ))}
            </div>
          )}

          {/* Input Footer */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage(inputValue);
            }}
            className="p-3 border-t border-card-border bg-card-custom flex items-center space-x-2"
          >
            <input
              type="text"
              placeholder="Ask a question..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              className="flex-grow bg-bg-custom border border-card-border rounded-xl px-3 py-1.5 text-xs focus:outline-none focus:border-gold text-fg-custom"
            />
            <button
              type="submit"
              className="maroon-gradient text-white p-2 rounded-xl hover:opacity-90 active:scale-95 transition-all flex items-center justify-center border border-gold/10"
              aria-label="Send Message"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default LiveChat;
