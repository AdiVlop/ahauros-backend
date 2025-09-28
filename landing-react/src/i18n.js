import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import en from "./locales/en.json";
import ro from "./locales/ro.json";
import fr from "./locales/fr.json";
import es from "./locales/es.json";
import pt from "./locales/pt.json";

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    ro: { translation: ro },
    fr: { translation: fr },
    es: { translation: es },
    pt: { translation: pt }
  },
  lng: "en",
  fallbackLng: "en",
  debug: true,
  interpolation: { 
    escapeValue: false,
    formatSeparator: ","
  },
  react: {
    useSuspense: false
  }
});

export default i18n;
