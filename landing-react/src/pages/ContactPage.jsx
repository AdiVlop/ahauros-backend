import { useTranslation } from "react-i18next";
import logoFull from "@/assets/logos/logo-full.png";
import logoWhite from "@/assets/logos/logo-white.png";
import { Mail, ArrowLeft } from "lucide-react";

export default function ContactPage() {
  const { t } = useTranslation();
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
              <a href="/" className="navbar-link">{t("home")}</a>
              <a href="/#features" className="navbar-link">{t("features")}</a>
              <a href="/#pricing" className="navbar-link">{t("pricing_nav")}</a>
              <a href="/#about" className="navbar-link">{t("about")}</a>
              <a href="mailto:info@ahauros.io" className="navbar-link">{t("email_us")}</a>
            </nav>
          </div>
        </div>
      </header>

      {/* Back Button */}
      <div className="pt-20 px-6">
        <a href="/" className="inline-flex items-center text-[#e0bd40] hover:text-yellow-400 transition-colors">
          <ArrowLeft className="w-5 h-5 mr-2" />
          {t("back_to_home")}
        </a>
      </div>

      {/* Contact Section */}
      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-bold text-center mb-8">{t("contact_title")}</h1>
          <p className="text-xl text-gray-300 text-center mb-16 max-w-2xl mx-auto">
            {t("contact_subtitle")}
          </p>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Contact Form - Coloana 1 */}
            <div className="lg:col-span-1">
              <form className="bg-gray-900/80 rounded-3xl shadow-2xl p-8 backdrop-blur-sm">
                <h2 className="text-3xl font-bold mb-8">{t("contact_send_message")}</h2>
                
                <div className="space-y-6">
                  <div>
                    <label className="block text-gray-300 mb-3 text-lg">{t("contact_name")}</label>
                    <input 
                      type="text" 
                      placeholder={t("contact_name_placeholder")} 
                      className="w-full bg-transparent border-b border-gray-600 pb-2 outline-none text-white placeholder-gray-400 text-lg"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-gray-300 mb-3 text-lg">{t("email")}</label>
                    <div className="flex items-center border-b border-gray-600 pb-2">
                      <Mail className="w-5 h-5 text-[#e0bd40] mr-3" />
                      <input 
                        type="email" 
                        placeholder={t("contact_email_placeholder")} 
                        className="bg-transparent w-full outline-none text-white placeholder-gray-400 text-lg" 
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-gray-300 mb-3 text-lg">{t("contact_company")}</label>
                    <input 
                      type="text" 
                      placeholder={t("contact_company_placeholder")} 
                      className="w-full bg-transparent border-b border-gray-600 pb-2 outline-none text-white placeholder-gray-400 text-lg"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-gray-300 mb-3 text-lg">{t("contact_message")}</label>
                    <textarea 
                      placeholder={t("contact_message_placeholder")} 
                      className="w-full bg-transparent border-b border-gray-600 pb-2 outline-none text-white placeholder-gray-400 text-lg min-h-[180px] resize-none"
                    ></textarea>
                  </div>
                  
                  <button 
                    type="submit" 
                    className="w-full bg-[#e0bd40] text-black font-semibold px-10 py-5 rounded-xl shadow-lg text-xl hover:bg-yellow-400 transition-all duration-300"
                  >
                    {t("contact_send")}
                  </button>
                </div>
              </form>
            </div>

            {/* Contact Info - Coloanele 2 și 3 */}
            <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Box 1: Get in Touch */}
              <div className="bg-gray-900/80 rounded-3xl shadow-2xl p-8 backdrop-blur-sm">
                <h3 className="text-2xl font-bold mb-6">{t("contact_get_in_touch")}</h3>
                <div className="space-y-6">
                  <div className="flex items-start">
                    <Mail className="w-5 h-5 text-[#e0bd40] mr-4 mt-1" />
                    <div>
                      <h4 className="font-semibold mb-1">{t("email")}</h4>
                      <p className="text-gray-300">contact@ahauros.io</p>
                      <p className="text-gray-300">info@ahauros.io</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="w-5 h-5 bg-[#e0bd40] rounded-full mr-4 mt-1"></div>
                    <div>
                      <h4 className="font-semibold mb-1">{t("contact_response_time")}</h4>
                      <p className="text-gray-300">{t("contact_response_time_desc")}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="w-5 h-5 bg-[#e0bd40] rounded-full mr-4 mt-1"></div>
                    <div>
                      <h4 className="font-semibold mb-1">{t("contact_business_hours")}</h4>
                      <p className="text-gray-300">{t("contact_business_hours_desc")}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Box 2: Why Contact Us */}
              <div className="bg-gray-900/80 rounded-3xl shadow-2xl p-8 backdrop-blur-sm">
                <h3 className="text-2xl font-bold mb-6">{t("contact_why_contact_us")}</h3>
                <ul className="space-y-4 text-gray-300">
                  <li className="flex items-start">
                    <div className="w-2 h-2 bg-[#e0bd40] rounded-full mr-3 mt-2"></div>
                    <span>{t("contact_reason_1")}</span>
                  </li>
                  <li className="flex items-start">
                    <div className="w-2 h-2 bg-[#e0bd40] rounded-full mr-3 mt-2"></div>
                    <span>{t("contact_reason_2")}</span>
                  </li>
                  <li className="flex items-start">
                    <div className="w-2 h-2 bg-[#e0bd40] rounded-full mr-3 mt-2"></div>
                    <span>{t("contact_reason_3")}</span>
                  </li>
                  <li className="flex items-start">
                    <div className="w-2 h-2 bg-[#e0bd40] rounded-full mr-3 mt-2"></div>
                    <span>{t("contact_reason_4")}</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gradient-to-b from-blue-700 to-blue-900 text-white py-12 text-center">
        <img src={logoWhite} alt="Ahauros Logo" className="app-logo mx-auto mb-6" />
        <p className="text-gray-300 text-lg">© {new Date().getFullYear()} Ahauros AI. All rights reserved.</p>
      </footer>
    </div>
  );
}
