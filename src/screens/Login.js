import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import {
  View,
  TouchableOpacity,
  Text,
} from 'react-native';
import * as t from 'tcomb-form-native';
import EStyleSheet from 'react-native-extended-stylesheet';

// Import actions.
import * as authActions from '../actions/authActions';

// theme
import theme from '../config/theme';

// Components
import Spinner from '../components/Spinner';
import i18n from '../utils/i18n';

import {
  iconsMap,
  iconsLoaded,
} from '../utils/navIcons';

import config from '../config';

const styles = EStyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 12,
  },
  btn: {
    backgroundColor: '#4fbe31',
    padding: 12,
    borderRadius: 3,
  },
  btnText: {
    color: '#fff',
    fontSize: '1rem',
    textAlign: 'center',
  },
  btnRegistration: {
    marginTop: 20,
  },
  btnRegistrationText: {
    color: 'black',
    fontSize: '1rem',
    textAlign: 'center'
  }
});

const Form = t.form.Form;
const FormFields = t.struct({
  email: t.String,
  password: t.String,
});

class Login extends Component {
  static navigatorStyle = {
    navBarBackgroundColor: theme.$navBarBackgroundColor,
    navBarButtonColor: theme.$navBarButtonColor,
    navBarButtonFontSize: theme.$navBarButtonFontSize,
    navBarTextColor: theme.$navBarTextColor,
    screenBackgroundColor: theme.$screenBackgroundColor,
  };

  static propTypes = {
    authActions: PropTypes.shape({
      login: PropTypes.func,
    }),
    navigator: PropTypes.shape({
      setOnNavigatorEvent: PropTypes.func,
      setTitle: PropTypes.func,
      setStyle: PropTypes.func,
      dismissModal: PropTypes.func,
      showInAppNotification: PropTypes.func,
      push: PropTypes.func,
    }),
    auth: PropTypes.shape({
      logged: PropTypes.bool,
      error: PropTypes.shape({}),
      fetching: PropTypes.bool,
    }),
  };

  constructor(props) {
    super(props);

    props.navigator.setOnNavigatorEvent(this.onNavigatorEvent.bind(this));
  }

  componentWillMount() {
    const { navigator } = this.props;
    navigator.setTitle({
      title: i18n.t('Login').toUpperCase(),
    });
    iconsLoaded.then(() => {
      navigator.setButtons({
        leftButtons: [
          {
            id: 'close',
            icon: iconsMap.close,
          },
        ],
      });
    });
  }

  componentWillReceiveProps(nextProps) {
    const { navigator } = this.props;
    if (nextProps.auth.logged) {
      setTimeout(() => navigator.dismissModal(), 1500);
    }
    if (nextProps.auth.error && !nextProps.auth.fetching) {
      navigator.showInAppNotification({
        screen: 'Notification',
        passProps: {
          type: 'warning',
          title: i18n.t('Error'),
          text: i18n.t('Wrong password.')
        }
      });
    }
  }

  onNavigatorEvent(event) {
    const { navigator } = this.props;
    if (event.type === 'NavBarButtonPress') {
      if (event.id === 'close') {
        navigator.dismissModal();
      }
    }
  }

  handleLogin() {
    const { authActions } = this.props;
    const value = this.refs.form.getValue();
    if (value) {
      authActions.login(value);
    }
  }

  render() {
    const { auth, navigator } = this.props;
    const values = {};

    if (config.demo) {
      values.email = config.demoUsername;
      values.password = config.demoPassword;
    }

    const options = {
      disableOrder: true,
      fields: {
        email: {
          label: i18n.t('Email'),
          keyboardType: 'email-address',
          clearButtonMode: 'while-editing',
        },
        password: {
          label: i18n.t('Password'),
          secureTextEntry: true,
          clearButtonMode: 'while-editing',
        },
      }
    };

    return (
      <View style={styles.container}>
        <Form
          ref="form"
          type={FormFields}
          options={options}
          value={values}
        />
        <TouchableOpacity
          style={styles.btn}
          onPress={() => this.handleLogin()}
          disabled={auth.fetching}
        >
          <Text style={styles.btnText}>
            {i18n.t('Login')}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.btnRegistration}
          onPress={() => navigator.push({
            screen: 'Registration',
            backButtonTitle: '',
          })}
        >
          <Text style={styles.btnRegistrationText}>
            {i18n.t('Registration')}
          </Text>
        </TouchableOpacity>
        <Spinner visible={auth.fetching} mode="modal" />
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
  })
)(Login);
