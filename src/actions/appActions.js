/* eslint-disable global-require */
import { AsyncStorage, I18nManager } from 'react-native';
import { STORE_KEY, RESTORE_STATE } from '../constants';
import API from '../services/api';
import store from '../store';
import i18n, { deviceLanguage } from '../utils/i18n';

const covertLangCodes = (translations = []) => {
  const result = {};

  translations.forEach((translation) => {
    result[`${translation.original_value}`] = translation.value;
  });

  return result;
};

const getLocalTranslations = () => {
  let translation;
  const AVAILABLE_LANGS = ['ar', 'ru', 'en', 'fr', 'it', 'es', 'pt'];

  if (AVAILABLE_LANGS.includes(deviceLanguage)) {
    switch (deviceLanguage) {
      case 'ru':
        translation = require('../config/locales/ru.json');
        break;
      case 'ar':
        translation = require('../config/locales/ar.json');
        break;
      case 'fr':
        translation = require('../config/locales/fr.json');
        break;
      case 'it':
        translation = require('../config/locales/it.json');
        break;
      case 'es':
        translation = require('../config/locales/es.json');
        break;
      case 'pt':
        translation = require('../config/locales/pt.json');
        break;
      default:
        translation = require('../config/locales/en.json');
    }
  }

  return translation;
};

// eslint-disable-next-line import/prefer-default-export
export async function initApp() {
  I18nManager.allowRTL(true);
  I18nManager.forceRTL(['ar', 'he'].includes(deviceLanguage));

  const persist = await AsyncStorage.getItem(STORE_KEY);
  if (persist) {
    store.dispatch({
      type: RESTORE_STATE,
      payload: JSON.parse(persist),
    });
  }

  try {
    // Load remote lang variables
    const transResult = await API.get(`/sra_translations/?name=mobile_app.mobile_&lang_code=${deviceLanguage}`);
    i18n.addResourceBundle(
      deviceLanguage,
      'translation',
      {
        ...getLocalTranslations(),
        ...covertLangCodes(transResult.data.langvars),
      }
    );
  } catch (error) {
    i18n.addResourceBundle(
      deviceLanguage,
      'translation',
      getLocalTranslations(),
    );
    // eslint-disable-next-line no-console
    console.log('Error loading translations', error);
  }
}
