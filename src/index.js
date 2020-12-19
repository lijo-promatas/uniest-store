import {
  Dimensions,
  Platform,
  I18nManager,
} from 'react-native';
import * as t from 'tcomb-form-native';
import { Navigation } from 'react-native-navigation';
import EStyleSheet from 'react-native-extended-stylesheet';

import './config';
import store from './store';
import theme from './config/theme';
import * as appActions from './actions/appActions';
import registerScreens from './screens';

// Calcuate styles
const { width } = Dimensions.get('window');
EStyleSheet.build({
  $rem: width > 340 ? 18 : 16,
  // $outline: 1,
  ...theme,
});

// TODO: RTL Ovveride form global styles.
t.form.Form.defaultProps.stylesheet = {
  ...t.form.Form.stylesheet,
  controlLabel: {
    ...t.form.Form.stylesheet.controlLabel,
    normal: {
      ...t.form.Form.stylesheet.controlLabel.normal,
      textAlign: 'left',
    },
    error: {
      ...t.form.Form.stylesheet.controlLabel.error,
      textAlign: 'left',
    },
  },
  textbox: {
    normal: {
      ...t.form.Form.stylesheet.textbox.normal,
      textAlign: I18nManager.isRTL ? 'right' : 'left',
      writingDirection: I18nManager.isRTL ? 'rtl' : 'ltr',
    },
    error: {
      ...t.form.Form.stylesheet.textbox.error,
      textAlign: I18nManager.isRTL ? 'right' : 'left',
      writingDirection: I18nManager.isRTL ? 'rtl' : 'ltr',
    }
  },
  helpBlock: {
    ...t.form.Form.stylesheet.helpBlock,
    normal: {
      ...t.form.Form.stylesheet.helpBlock.normal,
      textAlign: 'left',
    },
    error: {
      ...t.form.Form.stylesheet.helpBlock.error,
      textAlign: 'left',
    },
  },
};

async function Start() {
  registerScreens(store);

  await appActions.initApp();

  Navigation.startSingleScreenApp({
    screen: {
      screen: 'Layouts',
      navigatorStyle: {
        navBarBackgroundColor: theme.$navBarBackgroundColor,
        navBarButtonColor: theme.$navBarButtonColor,
        navBarButtonFontSize: theme.$navBarButtonFontSize,
        navBarTextColor: theme.$navBarTextColor,
        screenBackgroundColor: theme.$screenBackgroundColor,
      },
    },
    appStyle: {
      orientation: 'portrait',
      statusBarColor: theme.$statusBarColor,
    },
    drawer: {
      left: {
        screen: 'Drawer',
      },
      style: {
        drawerShadow: 'NO',
        leftDrawerWidth: Platform.OS === 'ios' ? 84 : 100,
        contentOverlayColor: theme.$contentOverlayColor,
      },
    },
  });
}

export default Start;
