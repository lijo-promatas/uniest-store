import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import {
  View,
} from 'react-native';
import EStyleSheet from 'react-native-extended-stylesheet';

// Import actions.
import * as authActions from '../actions/authActions';

// Theme
import theme from '../config/theme';

// Icons
import {
  iconsMap,
  iconsLoaded,
} from '../utils/navIcons';

// Components
import i18n from '../utils/i18n';
import Spinner from '../components/Spinner';
import ProfileForm from '../components/ProfileForm';

const styles = EStyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});

class Registration extends Component {
  static navigatorStyle = {
    navBarBackgroundColor: theme.$navBarBackgroundColor,
    navBarButtonColor: theme.$navBarButtonColor,
    navBarButtonFontSize: theme.$navBarButtonFontSize,
    navBarTextColor: theme.$navBarTextColor,
    screenBackgroundColor: theme.$screenBackgroundColor,
  };

  static propTypes = {
    authActions: PropTypes.shape({
      registration: PropTypes.func,
    }),
    navigator: PropTypes.shape({
      setOnNavigatorEvent: PropTypes.func,
      setTitle: PropTypes.func,
      dismissModal: PropTypes.func,
      showInAppNotification: PropTypes.func,
      push: PropTypes.func,
    }),
    showClose: PropTypes.bool,
  };

  constructor(props) {
    super(props);

    this.state = {
      fetching: true,
      forms: [],
    };
  }

  componentWillMount() {
    const { navigator, showClose } = this.props;

    navigator.setTitle({
      title: i18n.t('Registration')
    });
    navigator.setOnNavigatorEvent(this.onNavigatorEvent.bind(this));

    if (showClose) {
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
  }

  componentDidMount() {
    const { navigator, authActions } = this.props;
    navigator.setTitle({
      title: i18n.t('Registration').toUpperCase(),
    });
    authActions
      .profileFields()
      .then((fields) => {
        this.setState({
          fetching: false,
          forms: fields,
        });
      });
  }

  onNavigatorEvent(event) {
    const { navigator } = this.props;
    if (event.type === 'NavBarButtonPress') {
      if (event.id === 'close') {
        navigator.dismissModal();
      }
    }
  }

  handleRegister = (values) => {
    const { authActions } = this.props;
    if (values) {
      authActions.createProfile(values);
    }
  }

  render() {
    const { fetching, forms } = this.state;

    if (fetching) {
      return (
        <View style={styles.container}>
          <Spinner visible />
        </View>
      );
    }

    return (
      <View style={styles.container}>
        <ProfileForm
          showTitles
          fields={forms}
          onSubmit={values => this.handleRegister(values)}
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
  })
)(Registration);
