import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { CartProvider } from "@/context/CartContext";
import { AuthProvider } from "@/context/AuthContext";
import CartHeader from "@/components/CartHeader";
import AuthNav from "@/components/AuthNav";
import NavLinks from "@/components/NavLinks";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "Health Nexus | National Pharmacy Grid",
  description: "Official Portal for the National Pharmacy Grid and AI Health Vault",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} antialiased min-h-screen flex flex-col`}>
        <AuthProvider>
        <CartProvider>
          {/* Top Government Bar */}
          <div className="w-full bg-slate-900 text-slate-300 py-1 px-4 sm:px-6 lg:px-8 text-xs flex justify-between items-center z-50 relative border-b-4 border-saffron">
            <div className="flex space-x-4">
              <span>GOVERNMENT OF INDIA</span>
              <span className="hidden sm:inline">MINISTRY OF HEALTH AND FAMILY WELFARE</span>
            </div>
            <div className="flex space-x-4 items-center">
              <button className="hover:text-white">Skip to main content</button>
              <div className="flex space-x-1">
                <button className="px-1 border border-slate-600 hover:bg-slate-700">A-</button>
                <button className="px-1 border border-slate-600 hover:bg-slate-700">A</button>
                <button className="px-1 border border-slate-600 hover:bg-slate-700">A+</button>
              </div>
              <button className="hover:text-white flex items-center">
                 English
              </button>
            </div>
          </div>

          {/* Main Header */}
          <header className="bg-white shadow relative z-40">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
              <div className="flex items-center space-x-4">
                <img src="https://upload.wikimedia.org/wikipedia/commons/5/55/Emblem_of_India.svg" alt="Emblem of India" className="h-16" />
                <div>
                  <h1 className="text-2xl font-bold text-navy leading-tight">Health Nexus</h1>
                  <p className="text-sm text-slate-600 font-medium">National Pharmacy Grid & AI Evaluation</p>
                </div>
              </div>
              <div className="hidden md:flex space-x-4 items-center">
                <img src="https://upload.wikimedia.org/wikipedia/en/thumb/9/95/Digital_India_logo.svg/1200px-Digital_India_logo.svg.png" alt="Digital India" className="h-12 object-contain" />
                <img src="/pmbjp-logo.svg" alt="PMBJP Logo" className="h-14 object-contain ml-2 px-2 hidden lg:block" />
              </div>
            </div>
          </header>

          {/* Navigation */}
          <nav className="bg-navy text-white sticky top-0 z-30 shadow-md">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between">
              <NavLinks />
              <div className="py-3 text-sm font-semibold uppercase tracking-wider flex items-center pr-2 space-x-6">
                 <AuthNav />
                 <CartHeader />
              </div>
            </div>
          </nav>
          
          {/* Tricolor decorative line */}
          <div className="h-1 w-full gov-gradient"></div>

          <main className="flex-grow page-enter">
              {children}
          </main>

          <footer className="bg-slate-900 border-t-4 border-saffron text-slate-300 py-12 mt-12 animate-fade-in">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-8">
              <div>
                <h3 className="text-white font-bold mb-4">Health Nexus</h3>
                <p className="text-sm">Initiative by Ministry of Health and Family Welfare to deliver affordable generics and AI-powered prescription validation.</p>
              </div>
              <div>
                <h3 className="text-white font-bold mb-4">Quick Links</h3>
                <ul className="space-y-2 text-sm">
                  <li><a href="#" className="hover:text-white">Directory Search</a></li>
                  <li><a href="#" className="hover:text-white">Generic Substitution</a></li>
                  <li><a href="#" className="hover:text-white">System Architecture</a></li>
                </ul>
              </div>
              <div>
                <h3 className="text-white font-bold mb-4">Policies</h3>
                <ul className="space-y-2 text-sm">
                  <li><a href="#" className="hover:text-white">Privacy Policy</a></li>
                  <li><a href="#" className="hover:text-white">Terms of Use</a></li>
                  <li><a href="#" className="hover:text-white">Disclaimer</a></li>
                </ul>
              </div>
              <div>
                <h3 className="text-white font-bold mb-4">Contact</h3>
                <p className="text-sm">Toll-Free: 1800-111-222</p>
                <p className="text-sm">Email: support@nexus.gov.in</p>
              </div>
            </div>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 text-center text-xs text-slate-500 border-t border-slate-700 pt-8">
              <p>Designed, Developed and Hosted by National Informatics Centre.</p>
              <p className="mt-2 text-saffron">&copy; {new Date().getFullYear()} Government of India. All rights reserved.</p>
            </div>
          </footer>
        </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
