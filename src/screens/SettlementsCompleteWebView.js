import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { View, Platform } from 'react-native';
import EStyleSheet from 'react-native-extended-stylesheet';

// Import actions.
import * as authActions from '../actions/authActions';
import * as cartActions from '../actions/cartActions';

// theme
import theme from '../config/theme';

import { objectToQuerystring } from '../utils/index';

const WebView = Platform.OS === 'ios' ? require('react-native-webview').WebView : require('react-native').WebView;

const styles = EStyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});

class SettlementsCompleteWebView extends Component {
  static navigatorStyle = {
    navBarBackgroundColor: theme.$navBarBackgroundColor,
    navBarButtonColor: theme.$navBarButtonColor,
    navBarButtonFontSize: theme.$navBarButtonFontSize,
    navBarTextColor: theme.$navBarTextColor,
    screenBackgroundColor: theme.$screenBackgroundColor,
  };

  static propTypes = {
    return_url: PropTypes.string,
    payment_url: PropTypes.string,
    orderId: PropTypes.number,
    cartActions: PropTypes.shape({
      clear: PropTypes.func,
    }),
    navigator: PropTypes.shape({
      push: PropTypes.func,
      setOnNavigatorEvent: PropTypes.func,
    })
  };

  onNavigationStateChange = ({ url }, cart) => {
    const {
      return_url,
      cartActions,
      navigator,
      orderId
    } = this.props;

    if (url && return_url) {
      if (url.toLowerCase().startsWith(return_url.toLowerCase())) {
        cartActions.clear(cart);
        navigator.push({
          screen: 'CheckoutComplete',
          backButtonTitle: '',
          backButtonHidden: true,
          passProps: {
            orderId,
          }
        });
      }
    }
  }

  render() {
    const { payment_url, query_parameters, cart } = this.props;
    let url = payment_url;

    if (query_parameters) {
      url = `${url}?${objectToQuerystring(query_parameters)}`;
    }

    return (
      <View style={styles.container}>
        <WebView
          useWebKit
          automaticallyAdjustContentInsets={false}
          javaScriptEnabled
          scalesPageToFit
          startInLoadingState
          source={{
            uri: url,
          }}
          onNavigationStateChange={e => this.onNavigationStateChange(e, cart)}
        />
      </View>
    );
  }
}

export default connect(
  state => ({
    auth: state.auth,
  }),
  dispatch => ({
    authActions: bindActionCreators(authActions, dispatch),
    cartActions: bindActionCreators(cartActions, dispatch),
  })
)(SettlementsCompleteWebView);
