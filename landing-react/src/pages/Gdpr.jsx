import React from 'react';
import { ArrowLeft } from 'lucide-react';
import logoFull from '@/assets/logos/logo-full.png';

export default function Gdpr() {
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

      {/* GDPR Content */}
      <div className="px-6 py-20 max-w-4xl mx-auto leading-relaxed space-y-6">
        <h1 className="text-4xl md:text-5xl font-bold mb-8 text-[#e0bd40]">GDPR Compliance</h1>
        <p className="text-lg text-gray-300">Ahauros AI is fully committed to compliance with the European Union General Data Protection Regulation (GDPR).</p>

        <h2 className="text-2xl font-semibold mt-8 text-white">1. Right of Access</h2>
        <p className="text-gray-300">You have the right to request confirmation of whether your personal data is being processed and to obtain a copy of your data.</p>

        <h2 className="text-2xl font-semibold mt-8 text-white">2. Right to Rectification</h2>
        <p className="text-gray-300">You have the right to correct inaccurate personal data and to have incomplete data completed.</p>

        <h2 className="text-2xl font-semibold mt-8 text-white">3. Right to Erasure</h2>
        <p className="text-gray-300">You may request deletion of your personal data under certain conditions (e.g., withdrawal of consent, unlawful processing).</p>

        <h2 className="text-2xl font-semibold mt-8 text-white">4. Right to Data Portability</h2>
        <p className="text-gray-300">You may request your personal data in a structured, machine-readable format and transfer it to another service provider.</p>

        <h2 className="text-2xl font-semibold mt-8 text-white">5. Right to Object</h2>
        <p className="text-gray-300">You may object to processing of your data for direct marketing or other legitimate interests.</p>

        <div className="mt-12 p-6 bg-gray-900/50 rounded-xl border border-gray-700">
          <p className="text-gray-400 text-center">To exercise your GDPR rights, contact <a href="mailto:dpo@ahauros.io" className="text-[#e0bd40] hover:text-yellow-400">dpo@ahauros.io</a></p>
        </div>
      </div>
    </div>
  );
}
