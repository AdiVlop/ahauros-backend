import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet-async';
import enTranslations from '../locales/en.json';
import { 
  TrendingDown, 
  DollarSign, 
  ShoppingCart, 
  Package, 
  Truck, 
  BarChart3,
  Zap,
  Target,
  TrendingUp,
  Megaphone,
  Users,
  Brain
} from 'lucide-react';
import logoFull from '@/assets/logos/logo-full.png';
import logoWhite from '@/assets/logos/logo-white.png';
import heroEnterprise from '@/assets/images/hero-enterprise.png';

export default function LandingPage() {
  const { t, i18n } = useTranslation();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-black text-white">
      <Helmet>
        <title>{t("seo.title")}</title>
        <meta name="description" content={t("seo.description")} />
        <meta name="keywords" content={t("seo.keywords")} />
        <meta property="og:title" content={t("seo.title")} />
        <meta property="og:description" content={t("seo.description")} />
        <meta property="og:image" content="/logo-full.png" />
        <meta property="og:url" content="https://ahauros.io" />
        <meta name="twitter:card" content="summary_large_image" />
      </Helmet>
      {/* Navbar */}
      <header className="flex justify-between items-center px-6 py-4 bg-black/80 fixed top-0 w-full z-50">
        <div className="flex items-center space-x-3">
          <img src={logoFull} alt="Ahauros Logo" className="h-10" />
        </div>
        {/* Desktop menu */}
        <div className="hidden md:flex items-center space-x-8">
          <nav className="flex space-x-8">
            <a href="#problems" className="hover:text-[#e0bd40]">{t("problems_title")}</a>
            <a href="#features" className="hover:text-[#e0bd40]">{t("features_title")}</a>
            <a href="#pricing" className="hover:text-[#e0bd40]">{t("pricing_title")}</a>
            <a href="#about" className="hover:text-[#e0bd40]">{t("about_title")}</a>
            <a href="/contact" className="hover:text-[#e0bd40]">{t("contact_title")}</a>
          </nav>
          {/* Login Buttons */}
          <div className="flex items-center space-x-3">
            <a 
              href="https://app.ahauros.io/login" 
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:shadow-lg"
            >
              User Login
            </a>
            <a 
              href="https://admin.ahauros.io/health" 
              className="bg-gradient-to-r from-[#e0bd40] to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-black px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:shadow-lg"
            >
              Admin API
            </a>
          </div>
          <select
            onChange={(e) => i18n.changeLanguage(e.target.value)}
            defaultValue={i18n.language}
            className="bg-gray-800 text-white px-2 py-1 rounded ml-4"
          >
            <option value="en">EN</option>
            <option value="ro">RO</option>
            <option value="fr">FR</option>
            <option value="es">ES</option>
            <option value="pt">PT</option>
          </select>
        </div>
        {/* Mobile menu button */}
        <div className="md:hidden">
          <button onClick={() => setMenuOpen(!menuOpen)}>
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
        {/* Mobile menu items */}
        {menuOpen && (
          <div className="absolute top-16 left-0 w-full bg-black/90 flex flex-col items-center space-y-4 py-6 md:hidden">
            <a href="#problems" onClick={() => setMenuOpen(false)}>{t("problems_title")}</a>
            <a href="#features" onClick={() => setMenuOpen(false)}>{t("features_title")}</a>
            <a href="#pricing" onClick={() => setMenuOpen(false)}>{t("pricing_title")}</a>
            <a href="#about" onClick={() => setMenuOpen(false)}>{t("about_title")}</a>
            <a href="/contact" onClick={() => setMenuOpen(false)}>{t("contact_title")}</a>
            
            {/* Mobile Login Buttons */}
            <div className="flex flex-col space-y-3 pt-4">
              <a 
                href="https://app.ahauros.io/login" 
                onClick={() => setMenuOpen(false)}
                className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-3 rounded-lg text-sm font-medium transition-all duration-200 hover:shadow-lg text-center"
              >
                User Login
              </a>
              <a 
                href="https://admin.ahauros.io/health" 
                onClick={() => setMenuOpen(false)}
                className="bg-gradient-to-r from-[#e0bd40] to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-black px-6 py-3 rounded-lg text-sm font-medium transition-all duration-200 hover:shadow-lg text-center"
              >
                Admin API
              </a>
            </div>
            
            <div className="pt-4">
              <select
                onChange={(e) => i18n.changeLanguage(e.target.value)}
                defaultValue={i18n.language}
                className="bg-gray-800 text-white px-2 py-1 rounded"
              >
                <option value="en">EN</option>
                <option value="ro">RO</option>
                <option value="fr">FR</option>
                <option value="es">ES</option>
                <option value="pt">PT</option>
              </select>
            </div>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section
        id="hero"
        className="relative hero-section flex flex-col items-center justify-center text-center text-white px-4 md:px-6 py-16 md:py-32 pt-24"
        style={{ backgroundImage: `url(${heroEnterprise})` }}
      >
        <div className="absolute inset-0 bg-black/60"></div>
        <div className="relative z-10 hero-content-box">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-6 md:mb-8">{t("hero_title")}</h1>
          <p className="text-gray-300 mb-8 md:mb-12 text-base md:text-xl leading-relaxed">
            {t("hero_sub")}
          </p>
          <a
            href="https://app.ahauros.io/login"
            className="bg-[#e0bd40] text-black font-semibold px-8 py-4 rounded-xl shadow-lg text-lg hover:bg-yellow-400 transition whitespace-nowrap"
          >
            Start Now → User Dashboard
          </a>
        </div>
      </section>

      {/* Problems Section */}
      <section id="problems" className="py-12 md:py-24 bg-gradient-to-b from-black to-gray-900 text-white px-4 md:px-6">
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-center mb-12 md:mb-16">{t("problems_title")}</h2>
        <div className="problems-grid-container">
          <div className="problem-card flex flex-col items-center">
            <TrendingDown className="w-12 h-12 md:w-16 md:h-16 text-[#e0bd40] mb-4 md:mb-6" />
            <h3 className="problem-title mb-4 text-xl md:text-2xl">{t("problems_list.p1_title")}</h3>
            <div className="w-16 h-2 bg-[#e0bd40] rounded-full mb-6"></div>
            <p className="problem-description leading-relaxed text-base md:text-lg">{t("problems_list.p1_desc")}</p>
          </div>
          <div className="problem-card flex flex-col items-center">
            <DollarSign className="w-12 h-12 md:w-16 md:h-16 text-[#e0bd40] mb-4 md:mb-6" />
            <h3 className="problem-title mb-4 text-xl md:text-2xl">{t("problems_list.p2_title")}</h3>
            <div className="w-16 h-2 bg-[#e0bd40] rounded-full mb-6"></div>
            <p className="problem-description leading-relaxed text-base md:text-lg">{t("problems_list.p2_desc")}</p>
          </div>
          <div className="problem-card flex flex-col items-center">
            <ShoppingCart className="w-12 h-12 md:w-16 md:h-16 text-[#e0bd40] mb-4 md:mb-6" />
            <h3 className="problem-title mb-4 text-xl md:text-2xl">{t("problems_list.p3_title")}</h3>
            <div className="w-16 h-2 bg-[#e0bd40] rounded-full mb-6"></div>
            <p className="problem-description leading-relaxed text-base md:text-lg">{t("problems_list.p3_desc")}</p>
          </div>
          <div className="problem-card flex flex-col items-center">
            <Package className="w-12 h-12 md:w-16 md:h-16 text-[#e0bd40] mb-4 md:mb-6" />
            <h3 className="problem-title mb-4 text-xl md:text-2xl">{t("problems_list.p4_title")}</h3>
            <div className="w-16 h-2 bg-[#e0bd40] rounded-full mb-6"></div>
            <p className="problem-description leading-relaxed text-base md:text-lg">{t("problems_list.p4_desc")}</p>
          </div>
          <div className="problem-card flex flex-col items-center">
            <Truck className="w-12 h-12 md:w-16 md:h-16 text-[#e0bd40] mb-4 md:mb-6" />
            <h3 className="problem-title mb-4 text-xl md:text-2xl">{t("problems_list.p5_title")}</h3>
            <div className="w-16 h-2 bg-[#e0bd40] rounded-full mb-6"></div>
            <p className="problem-description leading-relaxed text-base md:text-lg">{t("problems_list.p5_desc")}</p>
          </div>
          <div className="problem-card flex flex-col items-center">
            <BarChart3 className="w-12 h-12 md:w-16 md:h-16 text-[#e0bd40] mb-4 md:mb-6" />
            <h3 className="problem-title mb-4 text-xl md:text-2xl">{t("problems_list.p6_title")}</h3>
            <div className="w-16 h-2 bg-[#e0bd40] rounded-full mb-6"></div>
            <p className="problem-description leading-relaxed text-base md:text-lg">{t("problems_list.p6_desc")}</p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-12 md:py-24 bg-gradient-to-b from-gray-900 to-black text-white px-4 md:px-6">
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-center mb-12 md:mb-16">{t("features_title")}</h2>
        <div className="features-grid-container">
          <div className="feature-card flex flex-col items-center">
            <Zap className="w-12 h-12 md:w-16 md:h-16 text-[#e0bd40] mb-4 md:mb-6" />
            <h3 className="feature-title mb-4 text-xl md:text-2xl">{t("features_list.f1_title")}</h3>
            <div className="w-16 h-2 bg-[#e0bd40] rounded-full mb-6"></div>
            <p className="feature-description leading-relaxed text-base md:text-lg">{t("features_list.f1_desc")}</p>
          </div>
          <div className="feature-card flex flex-col items-center">
            <Target className="w-12 h-12 md:w-16 md:h-16 text-[#e0bd40] mb-4 md:mb-6" />
            <h3 className="feature-title mb-4 text-xl md:text-2xl">{t("features_list.f2_title")}</h3>
            <div className="w-16 h-2 bg-[#e0bd40] rounded-full mb-6"></div>
            <p className="feature-description leading-relaxed text-base md:text-lg">{t("features_list.f2_desc")}</p>
          </div>
          <div className="feature-card flex flex-col items-center">
            <TrendingUp className="w-12 h-12 md:w-16 md:h-16 text-[#e0bd40] mb-4 md:mb-6" />
            <h3 className="feature-title mb-4 text-xl md:text-2xl">{t("features_list.f3_title")}</h3>
            <div className="w-16 h-2 bg-[#e0bd40] rounded-full mb-6"></div>
            <p className="feature-description leading-relaxed text-base md:text-lg">{t("features_list.f3_desc")}</p>
          </div>
          <div className="feature-card flex flex-col items-center">
            <Megaphone className="w-12 h-12 md:w-16 md:h-16 text-[#e0bd40] mb-4 md:mb-6" />
            <h3 className="feature-title mb-4 text-xl md:text-2xl">{t("features_list.f4_title")}</h3>
            <div className="w-16 h-2 bg-[#e0bd40] rounded-full mb-6"></div>
            <p className="feature-description leading-relaxed text-base md:text-lg">{t("features_list.f4_desc")}</p>
          </div>
          <div className="feature-card flex flex-col items-center">
            <Users className="w-12 h-12 md:w-16 md:h-16 text-[#e0bd40] mb-4 md:mb-6" />
            <h3 className="feature-title mb-4 text-xl md:text-2xl">{t("features_list.f5_title")}</h3>
            <div className="w-16 h-2 bg-[#e0bd40] rounded-full mb-6"></div>
            <p className="feature-description leading-relaxed text-base md:text-lg">{t("features_list.f5_desc")}</p>
          </div>
          <div className="feature-card flex flex-col items-center">
            <Brain className="w-12 h-12 md:w-16 md:h-16 text-[#e0bd40] mb-4 md:mb-6" />
            <h3 className="feature-title mb-4 text-xl md:text-2xl">{t("features_list.f6_title")}</h3>
            <div className="w-16 h-2 bg-[#e0bd40] rounded-full mb-6"></div>
            <p className="feature-description leading-relaxed text-base md:text-lg">{t("features_list.f6_desc")}</p>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 bg-black text-white px-6">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
          {t("pricing.title")}
        </h2>
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 text-center">

          {/* Starter Plan */}
          <div className="bg-gray-900 rounded-xl shadow-lg p-10 flex flex-col hover:-translate-y-1 hover:shadow-xl transition">
            <h3 className="text-2xl font-semibold mb-2">{t("pricing.starter")}</h3>
            <p className="text-gray-400 mb-4">{t("pricing.starter_desc")}</p>
            <p className="text-4xl font-bold mb-6 text-[#e0bd40]">
              €199 <span className="text-lg text-gray-400">{t("pricing.price_month")}</span>
            </p>
            <a href="https://app.ahauros.io/login" className="mt-auto bg-[#e0bd40] text-black font-semibold px-6 py-3 rounded-xl shadow-lg hover:bg-yellow-400 transition">
              Start Trial
            </a>
          </div>

          {/* Growth Plan */}
          <div className="bg-gray-900 rounded-xl shadow-lg p-10 flex flex-col hover:-translate-y-1 hover:shadow-xl transition">
            <h3 className="text-2xl font-semibold mb-2">{t("pricing.growth")}</h3>
            <p className="text-gray-400 mb-4">{t("pricing.growth_desc")}</p>
            <p className="text-4xl font-bold mb-6 text-[#e0bd40]">
              €699 <span className="text-lg text-gray-400">{t("pricing.price_month")}</span>
            </p>
            <a href="https://app.ahauros.io/login" className="mt-auto bg-[#e0bd40] text-black font-semibold px-6 py-3 rounded-xl shadow-lg hover:bg-yellow-400 transition">
              Start Trial
            </a>
          </div>

          {/* Enterprise Plan */}
          <div className="bg-gray-900 rounded-xl shadow-lg p-10 flex flex-col hover:-translate-y-1 hover:shadow-xl transition">
            <h3 className="text-2xl font-semibold mb-2">{t("pricing.enterprise")}</h3>
            <p className="text-gray-400 mb-4">{t("pricing.enterprise_desc")}</p>
            <p className="text-4xl font-bold mb-6 text-[#e0bd40]">
              €1499 <span className="text-lg text-gray-400">{t("pricing.price_month")}</span>
            </p>
            <a href="https://app.ahauros.io/login" className="mt-auto bg-[#e0bd40] text-black font-semibold px-6 py-3 rounded-xl shadow-lg hover:bg-yellow-400 transition">
              Start Trial
            </a>
          </div>

        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-12 md:py-24 bg-gradient-to-b from-gray-900 to-black text-white px-4 md:px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6 md:mb-8">{t("about_title")}</h2>
          <p className="text-base md:text-xl text-gray-300 leading-relaxed">{t("about_desc")}</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black text-white py-8 md:py-16 px-4 md:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div className="col-span-1 md:col-span-2">
              <img src={logoWhite} alt="Ahauros Logo" className="h-10 md:h-12 mb-4" />
              <p className="text-gray-400 text-xs md:text-sm">
                {t("about_desc")}
              </p>
            </div>
            <div>
              <h3 className="text-base md:text-lg font-semibold mb-4 text-[#e0bd40]">{t("quick_links")}</h3>
              <ul className="space-y-2">
                <li><a href="#problems" onClick={() => setMenuOpen(false)} className="text-gray-400 hover:text-[#e0bd40] transition text-sm md:text-base">{t("problems")}</a></li>
                <li><a href="#features" onClick={() => setMenuOpen(false)} className="text-gray-400 hover:text-[#e0bd40] transition text-sm md:text-base">{t("features")}</a></li>
                <li><a href="#pricing" onClick={() => setMenuOpen(false)} className="text-gray-400 hover:text-[#e0bd40] transition text-sm md:text-base">{t("pricing_nav")}</a></li>
                <li><a href="#about" onClick={() => setMenuOpen(false)} className="text-gray-400 hover:text-[#e0bd40] transition text-sm md:text-base">{t("about")}</a></li>
                <li><a href="/contact" onClick={() => setMenuOpen(false)} className="text-gray-400 hover:text-[#e0bd40] transition text-sm md:text-base">{t("contact")}</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-base md:text-lg font-semibold mb-4 text-[#e0bd40]">{t("legal")}</h3>
              <ul className="space-y-2">
                <li><a href="/terms" onClick={() => setMenuOpen(false)} className="text-gray-400 hover:text-[#e0bd40] transition text-sm md:text-base">{t("terms_conditions")}</a></li>
                <li><a href="/privacy" onClick={() => setMenuOpen(false)} className="text-gray-400 hover:text-[#e0bd40] transition text-sm md:text-base">{t("privacy_policy")}</a></li>
                <li><a href="/gdpr" onClick={() => setMenuOpen(false)} className="text-gray-400 hover:text-[#e0bd40] transition text-sm md:text-base">{t("gdpr")}</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <p className="text-gray-400 text-xs md:text-sm">
                © 2024 Ahauros AI. {t("copyright")}
              </p>
              <div className="flex space-x-6 mt-4 md:mt-0">
                <a href="mailto:info@ahauros.io" className="text-gray-400 hover:text-[#e0bd40] transition text-xs md:text-sm">
                  info@ahauros.io
                </a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
