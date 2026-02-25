import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

// Import translations
import en from './locales/en.json'
import fr from './locales/fr.json'
import es from './locales/es.json'
import zh from './locales/zh.json'
import hi from './locales/hi.json'

const resources = {
  en: { translation: en },
  fr: { translation: fr },
  es: { translation: es },
  zh: { translation: zh },
  hi: { translation: hi },
}

void i18n
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en', // Langue par défaut si détection échoue
    supportedLngs: ['en', 'fr', 'es', 'zh', 'hi'],
    interpolation: {
      escapeValue: false, // React échappe déjà les valeurs
    },
    // La langue sera gérée manuellement dans App.tsx
    // pour respecter le choix utilisateur dans les settings
  })

export default i18n
