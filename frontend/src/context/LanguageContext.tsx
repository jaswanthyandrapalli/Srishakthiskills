'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

type Language = 'en' | 'te';

type Dictionary = Record<string, string>;

const translations: Record<Language, Dictionary> = {
  en: {
    brand_name: "Sri Sakthi Sarees",
    hero_title: "Elegance Woven Into Every Saree",
    hero_subtitle: "Discover premium silk, cotton, designer and bridal sarees at Sri Sakthi Sarees.",
    btn_shop_now: "Shop Now",
    btn_contact_us: "Contact Us",
    btn_add_to_cart: "Add To Cart",
    btn_buy_now: "Buy Now",
    btn_wishlist: "Wishlist",
    best_sellers: "Best Sellers",
    new_arrivals: "New Arrivals",
    fabric: "Fabric",
    colors: "Colors",
    stock: "Stock",
    reviews: "Reviews",
    price: "Price",
    category: "Category",
    coupon_applied: "Coupon Applied",
    search_placeholder: "Search for premium sarees...",
    about_us_title: "About Sri Sakthi Sarees",
    about_us_desc: "Sri Sakthi Sarees is a trusted saree store located in Raithupeta, Nandigama, NTR District, Andhra Pradesh, offering premium quality traditional and modern sarees for every occasion.",
    address_label: "Address",
    address_val: "Raithupeta, Nandigama, NTR District, Andhra Pradesh, India",
    nav_home: "Home",
    nav_shop: "Shop",
    nav_about: "About",
    nav_contact: "Contact",
    nav_track: "Track Order",
    nav_admin: "Admin Panel",
    cart_empty: "Your cart is empty",
    wishlist_empty: "Your wishlist is empty",
    dark_mode: "Dark Mode",
    light_mode: "Light Mode",
    telugu: "Telugu",
    english: "English",
  },
  te: {
    brand_name: "శ్రీ శక్తి శారీస్",
    hero_title: "ప్రతి చీరలోనూ నేసిన లాలిత్యం",
    hero_subtitle: "శ్రీ శక్తి శారీస్ లో ప్రీమియం పట్టు, కాటన్, డిజైనర్ మరియు పెళ్లి చీరలను కనుగొనండి.",
    btn_shop_now: "ఇప్పుడే కొనండి",
    btn_contact_us: "మమ్మల్ని సంప్రదించండి",
    btn_add_to_cart: "కార్ట్‌కు జోడించు",
    btn_buy_now: "ఇప్పుడే కొనండి",
    btn_wishlist: "ఇష్టాల జాబితా",
    best_sellers: "అత్యధికంగా అమ్ముడైనవి",
    new_arrivals: "కొత్త మోడల్స్",
    fabric: "ఫ్యాబ్రిక్",
    colors: "రంగులు",
    stock: "స్టాక్ లభ్యత",
    reviews: "సమీక్షలు",
    price: "ధర",
    category: "కేటగిరీ",
    coupon_applied: "కూపన్ వర్తింపజేయబడింది",
    search_placeholder: "ప్రీమియం చీరల కోసం వెతకండి...",
    about_us_title: "శ్రీ శక్తి శారీస్ గురించి",
    about_us_desc: "శ్రీ శక్తి శారీస్ ఆంధ్రప్రదేశ్ లోని ఎన్టీఆర్ జిల్లా, నందిగామ, రైతుపేట లో ఉంది. ఇది అన్ని సందర్భాలకు సరిపోయే అత్యుత్తమ సాంప్రదాయ మరియు ఆధునిక చీరలను అందిస్తుంది.",
    address_label: "చిరునామా",
    address_val: "రైతుపేట, నందిగామ, ఎన్టీఆర్ జిల్లా, ఆంధ్రప్రదేశ్, భారతదేశం",
    nav_home: "హోమ్",
    nav_shop: "షాప్",
    nav_about: "మా గురించి",
    nav_contact: "సంప్రదించండి",
    nav_track: "ఆర్డర్ ట్రాకింగ్",
    nav_admin: "అడ్మిన్ ప్యానెల్",
    cart_empty: "మీ కార్ట్ ఖాళీగా ఉంది",
    wishlist_empty: "మీ ఇష్టాల జాబితా ఖాళీగా ఉంది",
    dark_mode: "నలుపు మోడ్",
    light_mode: "వెలుగు మోడ్",
    telugu: "తెలుగు",
    english: "ఇంగ్లీష్",
  }
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>('en');

  useEffect(() => {
    const savedLang = localStorage.getItem('sri_sakthi_language') as Language;
    if (savedLang === 'en' || savedLang === 'te') {
      setLanguageState(savedLang);
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('sri_sakthi_language', lang);
  };

  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useLanguage must be used within a LanguageProvider');
  return context;
};
