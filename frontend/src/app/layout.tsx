import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { CartProvider } from "@/context/CartContext";
import { ThemeProvider } from "@/context/ThemeContext";
import { LanguageProvider } from "@/context/LanguageContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import LiveChat from "@/components/LiveChat";

export const metadata: Metadata = {
  title: "Sri Sakthi Sarees | Premium Silk, Cotton & Bridal Sarees",
  description: "Experience modern luxury woven into Indian heritage. Explore our exquisite collection of Silk, Cotton, Bridal, and Handloom sarees at Sri Sakthi Sarees. Located in Raithupeta, Nandigama.",
  keywords: "saree store Nandigama, Sri Sakthi Sarees Raithupeta, traditional bridal sarees, silk sarees online, cotton sarees Andhra Pradesh, wedding wear",
  authors: [{ name: "Sri Sakthi Sarees" }],
  openGraph: {
    title: "Sri Sakthi Sarees | Traditional & Modern Elegance",
    description: "Premium handcrafted silk and bridal sarees from Nandigama, NTR District, Andhra Pradesh.",
    url: "https://srisakthisarees.com",
    siteName: "Sri Sakthi Sarees",
    images: [
      {
        url: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1200&q=80",
        width: 1200,
        height: 630,
        alt: "Sri Sakthi Sarees Collection Showcase",
      },
    ],
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Sri Sakthi Sarees",
    description: "Premium silk and traditional wedding wear sarees.",
    images: ["https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1200&q=80"],
  },
  robots: {
    index: true,
    follow: true,
  },
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <meta name="theme-color" content="#800000" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.svg" />
      </head>
      <body className="antialiased">
        <AuthProvider>
          <CartProvider>
            <ThemeProvider>
              <LanguageProvider>
                <div className="flex flex-col min-h-screen bg-bg-custom text-fg-custom">
                  <Navbar />
                  <main className="flex-grow pt-20">
                    {children}
                  </main>
                  <Footer />
                  <LiveChat />
                </div>
              </LanguageProvider>
            </ThemeProvider>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
