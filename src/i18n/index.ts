import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import en from "./en.json";
import he from "./he.json";

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: { en: { translation: en }, he: { translation: he } },
    fallbackLng: "en",
    supportedLngs: ["en", "he"],
    interpolation: { escapeValue: false },
  });

// Set initial dir attribute
document.documentElement.dir = i18n.language === "he" ? "rtl" : "ltr";

// Update dir on language change
i18n.on("languageChanged", (lng) => {
  document.documentElement.dir = lng === "he" ? "rtl" : "ltr";
});

export default i18n;
