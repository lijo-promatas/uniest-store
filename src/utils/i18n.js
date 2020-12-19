import { NativeModules, Platform } from 'react-native';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const platformLanguage = Platform.OS === 'ios'
  ? NativeModules.SettingsManager.settings.AppleLocale
    || NativeModules.SettingsManager.settings.AppleLanguages[0]
  : NativeModules.I18nManager.localeIdentifier;

export const deviceLanguage = platformLanguage.split('_')[0];

i18n
  .use(initReactI18next)
  .init({
    debug: false,
    nsSeparator: ':::',
    keySeparator: false,
    lng: deviceLanguage,
    fallbackLng: deviceLanguage,
  });

export default i18n;
