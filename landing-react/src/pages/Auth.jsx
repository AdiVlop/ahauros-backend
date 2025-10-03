import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";

export default function Auth() {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();

  // Redirect to app.ahauros.io/login
  useEffect(() => {
    // Get any query parameters to preserve them in the redirect
    const queryString = searchParams.toString();
    const redirectUrl = queryString 
      ? `https://app.ahauros.io/login?${queryString}`
      : 'https://app.ahauros.io/login';
    
    // Redirect immediately
    window.location.href = redirectUrl;
  }, [searchParams]);

  // Show loading message while redirecting
  return (
    <div className="min-h-screen bg-gradient-to-b from-black to-gray-900 text-white px-6 flex items-center justify-center">
      <div className="max-w-md w-full bg-gray-900 rounded-xl shadow-lg p-10 space-y-6 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#e0bd40] mx-auto mb-4"></div>
        <h2 className="text-xl font-semibold text-[#e0bd40] mb-2">
          {t("redirecting") || "Redirecting..."}
        </h2>
        <p className="text-gray-300 text-sm">
          {t("redirecting_to_login") || "Taking you to the login page..."}
        </p>
        <p className="text-gray-400 text-xs mt-4">
          <a href="https://app.ahauros.io/login" className="text-[#e0bd40] hover:text-yellow-400">
            {t("click_here_if_not_redirected") || "Click here if you're not redirected automatically"}
          </a>
        </p>
      </div>
    </div>
  );
}