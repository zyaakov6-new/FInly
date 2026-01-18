import i18n from 'i18n-js';
import * as Localization from 'expo-localization';
import he from './he';

// Set up translations
i18n.translations = {
    he: he,
    en: he // Fallback
};

// Set locale
i18n.locale = Localization.getLocales()[0].languageCode ?? 'he';
i18n.fallbacks = true;
i18n.defaultLocale = 'he';

export default i18n;
