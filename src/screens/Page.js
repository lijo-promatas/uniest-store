import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { View, Platform } from 'react-native';
import EStyleSheet from 'react-native-extended-stylesheet';

// theme
import theme from '../config/theme';

const WebView = Platform.OS === 'ios' ? require('react-native-webview').WebView : require('react-native').WebView;

const styles = EStyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '$screenBackgroundColor',
  },
});

class Page extends Component {
  static propTypes = {
    uri: PropTypes.string,
  };

  static navigatorStyle = {
    navBarBackgroundColor: theme.$navBarBackgroundColor,
    navBarButtonColor: theme.$navBarButtonColor,
    navBarButtonFontSize: theme.$navBarButtonFontSize,
    navBarTextColor: theme.$navBarTextColor,
    screenBackgroundColor: theme.$screenBackgroundColor,
  };

  render() {
    const { uri } = this.props;
    return (
      <View style={styles.container}>
        <WebView
          useWebKit={true}
          automaticallyAdjustContentInsets={false}
          javaScriptEnabled
          scalesPageToFit
          startInLoadingState
          userAgent="Mozilla/5.0 (Linux; Android 6.0.1; SM-G920V Build/MMB29K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/52.0.2743.98 Mobile Safari/537.36"
          source={{
            uri,
          }}
        />
      </View>
    );
  }
}

export default connect(
  state => ({
    auth: state.auth,
  })
)(Page);
