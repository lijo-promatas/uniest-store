import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import {
  View,
} from 'react-native';
import EStyleSheet from 'react-native-extended-stylesheet';
import omit from 'lodash/omit';

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
import Spinner from '../components/Spinner';
import ProfileForm from '../components/ProfileForm';

const styles = EStyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});

class Profile extends Component {
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
  };

  constructor(props) {
    super(props);

    this.state = {
      fetching: true,
      profile: {},
      forms: [],
    };
  }

  componentWillMount() {
    const { navigator } = this.props;

    navigator.setOnNavigatorEvent(this.onNavigatorEvent.bind(this));

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

  componentDidMount() {
    const { authActions } = this.props;

    authActions
      .fetchProfile()
      .then((profile) => {
        this.setState({
          profile,
          fetching: false,
          forms: profile.fields,
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

  handleSave = (values) => {
    const { profile } = this.state;
    const { authActions } = this.props;
    if (values) {
      authActions.updateProfile(profile.user_id, values);
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
          fields={omit(forms, 'B')}
          isEdit
          onSubmit={values => this.handleSave(values)}
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
)(Profile);
