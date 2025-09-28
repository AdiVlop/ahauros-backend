import React from 'react';
import { ArrowLeft } from 'lucide-react';
import logoFull from '@/assets/logos/logo-full.png';

export default function Terms() {
  return (
    <div 
      className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-blue-900 text-white"
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(to bottom, #000000, #1f2937, #1e3a8a)',
        color: '#ffffff'
      }}
    >
      {/* Header */}
      <header className="navbar-module">
        <div className="navbar-backdrop">
          <div className="max-w-7xl mx-auto flex justify-between items-center px-4 py-4 sm:px-6">
            <img src={logoFull} alt="Ahauros Logo" className="app-logo" />
            <nav className="navbar-menu">
              <a href="/" className="navbar-link">Home</a>
              <a href="/#features" className="navbar-link">Features</a>
              <a href="/#pricing" className="navbar-link">Pricing</a>
              <a href="/#about" className="navbar-link">About</a>
              <a href="/contact" className="navbar-link">Contact</a>
            </nav>
          </div>
        </div>
      </header>

      {/* Back Button */}
      <div className="pt-20 px-6">
        <a href="/" className="inline-flex items-center text-[#e0bd40] hover:text-yellow-400 transition-colors">
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Home
        </a>
      </div>

      {/* Terms Content */}
      <div className="px-6 py-20 max-w-4xl mx-auto leading-relaxed space-y-6">
        <h1 className="text-4xl md:text-5xl font-bold mb-8 text-[#e0bd40]">Terms and Conditions</h1>
        <p className="text-lg text-gray-300">Welcome to Ahauros AI. By accessing or using our services, you agree to the following Terms and Conditions. Please read them carefully.</p>

        <h2 className="text-2xl font-semibold mt-8 text-white">1. Use of Services</h2>
        <p className="text-gray-300">You agree to use Ahauros AI services only for lawful purposes and in accordance with these Terms. Misuse, unauthorized access, or attempts to disrupt the platform are strictly prohibited.</p>

        <h2 className="text-2xl font-semibold mt-8 text-white">2. Subscriptions & Payments</h2>
        <p className="text-gray-300">Access to premium features requires a valid subscription. Fees are billed in advance on a monthly or annual basis. All payments are non-refundable unless otherwise stated.</p>

        <h2 className="text-2xl font-semibold mt-8 text-white">3. Intellectual Property</h2>
        <p className="text-gray-300">All content, trademarks, and code provided by Ahauros AI remain our intellectual property. You may not copy, modify, distribute, or resell without written consent.</p>

        <h2 className="text-2xl font-semibold mt-8 text-white">4. Limitation of Liability</h2>
        <p className="text-gray-300">Ahauros AI shall not be held liable for indirect or consequential damages, including lost profits, arising from the use or inability to use the service.</p>

        <h2 className="text-2xl font-semibold mt-8 text-white">5. Termination</h2>
        <p className="text-gray-300">We may suspend or terminate access to our services if you violate these Terms.</p>

        <div className="mt-12 p-6 bg-gray-900/50 rounded-xl border border-gray-700">
          <p className="text-gray-400 text-center">For legal inquiries, please contact <a href="mailto:legal@ahauros.io" className="text-[#e0bd40] hover:text-yellow-400">legal@ahauros.io</a></p>
        </div>
      </div>
    </div>
  );
}
