import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: 'en',
    supportedLngs: ['pt', 'fr', 'en', 'de'],
    defaultNS: 'common',
    ns: ['common', 'booking', 'admin', 'home'],

    detection: {
      order: ['querystring', 'localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
    },

    interpolation: {
      escapeValue: false,
    },

    resources: {
      pt: {
        common: require('../../public/locales/pt/common.json'),
        booking: require('../../public/locales/pt/booking.json'),
        home: require('../../public/locales/pt/home.json'),
      },
      fr: {
        common: require('../../public/locales/fr/common.json'),
        booking: require('../../public/locales/fr/booking.json'),
        home: require('../../public/locales/fr/home.json'),
      },
      en: {
        common: require('../../public/locales/en/common.json'),
        booking: require('../../public/locales/en/booking.json'),
        home: require('../../public/locales/en/home.json'),
      },
      de: {
        common: require('../../public/locales/de/common.json'),
        booking: require('../../public/locales/de/booking.json'),
        home: require('../../public/locales/de/home.json'),
      },
    },
  });

export default i18n;
