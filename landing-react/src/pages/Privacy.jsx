import React from 'react';
import { ArrowLeft } from 'lucide-react';
import logoFull from '@/assets/logos/logo-full.png';

export default function Privacy() {
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

      {/* Privacy Content */}
      <div className="px-6 py-20 max-w-4xl mx-auto leading-relaxed space-y-6">
        <h1 className="text-4xl md:text-5xl font-bold mb-8 text-[#e0bd40]">Privacy Policy</h1>
        <p className="text-lg text-gray-300">This Privacy Policy explains how Ahauros AI collects, uses, and protects your personal data.</p>

        <h2 className="text-2xl font-semibold mt-8 text-white">1. Information We Collect</h2>
        <p className="text-gray-300">We may collect personal information such as your name, email, payment details, and usage analytics.</p>

        <h2 className="text-2xl font-semibold mt-8 text-white">2. Use of Information</h2>
        <p className="text-gray-300">We use your data to provide services, improve AI models, manage billing, and enhance user experience.</p>

        <h2 className="text-2xl font-semibold mt-8 text-white">3. Data Sharing</h2>
        <p className="text-gray-300">We do not sell your personal data. Limited data may be shared with trusted third-party processors (e.g., payment providers) under strict agreements.</p>

        <h2 className="text-2xl font-semibold mt-8 text-white">4. Data Security</h2>
        <p className="text-gray-300">We implement industry-standard measures to protect your data against unauthorized access, disclosure, or destruction.</p>

        <h2 className="text-2xl font-semibold mt-8 text-white">5. Your Rights</h2>
        <p className="text-gray-300">You may request access, correction, or deletion of your data at any time.</p>

        <div className="mt-12 p-6 bg-gray-900/50 rounded-xl border border-gray-700">
          <p className="text-gray-400 text-center">For privacy concerns, contact <a href="mailto:privacy@ahauros.io" className="text-[#e0bd40] hover:text-yellow-400">privacy@ahauros.io</a></p>
        </div>
      </div>
    </div>
  );
}
