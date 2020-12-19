import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { View } from 'react-native';
import EStyleSheet from 'react-native-extended-stylesheet';

// Import components
import CheckoutSteps from '../components/CheckoutSteps';
import Spinner from '../components/Spinner';

// Import actions.
import * as authActions from '../actions/authActions';
import * as cartActions from '../actions/cartActions';

import i18n from '../utils/i18n';
import { formatPrice } from '../utils';

// theme
import theme from '../config/theme';
import ProfileForm from '../components/ProfileForm';

const styles = EStyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  contentContainer: {
    paddingTop: 14,
    paddingBottom: 0,
    paddingLeft: 14,
    paddingRight: 14
  },
});

/**
 * Checkout. Delivery screen.
 *
 * @reactProps {object} navigator - Navigator.
 * @reactProps {object} cart - Cart information.
 * @reactProps {object} authActions - Auth actions.
 */
export class Checkout extends Component {
  static navigatorStyle = {
    navBarBackgroundColor: theme.$navBarBackgroundColor,
    navBarButtonColor: theme.$navBarButtonColor,
    navBarButtonFontSize: theme.$navBarButtonFontSize,
    navBarTextColor: theme.$navBarTextColor,
    screenBackgroundColor: theme.$screenBackgroundColor,
  };

  /**
   * @ignore
   */
  static propTypes = {
    navigator: PropTypes.shape({
      push: PropTypes.func,
      pop: PropTypes.func,
      setOnNavigatorEvent: PropTypes.func,
    }),
    cart: PropTypes.shape(),
    cartActions: PropTypes.shape(),
    authActions: PropTypes.shape(),
  };

  constructor(props) {
    super(props);
    this.state = {
      fieldsFetching: true
    };
    props.navigator.setOnNavigatorEvent(this.onNavigatorEvent.bind(this));
  }

  /**
   * Gets fields and puts them in the state.
   */
  componentDidMount() {
    const { authActions } = this.props;
    const { fieldsFetching } = this.state;

    if (fieldsFetching) {
      authActions
        .profileFields({
          location: 'checkout',
          action: 'update'
        })
        .then(({ fields }) => {
          // eslint-disable-next-line no-param-reassign
          delete fields.E;

          this.setState({
            fields,
            fieldsFetching: false,
          });
        });
    }
  }

  /**
   * Delivery screen navigation.
   *
   * @param {object} event - Information about the element on which the event occurred.
   */
  onNavigatorEvent(event) {
    const { navigator } = this.props;
    if (event.type === 'NavBarButtonPress') {
      if (event.id === 'back') {
        navigator.pop();
      }
    }
  }

  /**
   * Saves user data, redirects to next screen.
   *
   * @param {object} values - Form data.
   */
  handleNextPress(values) {
    const { navigator, cart, cartActions } = this.props;

    cartActions.saveUserData({
      ...cart.user_data,
      ...values
    });

    navigator.push({
      screen: 'CheckoutShipping',
      backButtonTitle: '',
      title: i18n.t('Checkout').toUpperCase(),
      passProps: {
        total: cart.subtotal,
        cart
      },
    });
  }

  /**
   * Renders component
   *
   * @return {JSX.Element}
   */
  render() {
    const { cart } = this.props;
    const { fieldsFetching, fields } = this.state;

    if (fieldsFetching) {
      return (
        <View style={styles.container}>
          <Spinner visible />
        </View>
      );
    }

    return (
      <View style={styles.container}>
        <View style={styles.contentContainer}>
          <CheckoutSteps step={1} />
        </View>

        <ProfileForm
          fields={fields}
          cartFooterEnabled
          showTitles
          totalPrice={formatPrice(cart.total_formatted.price)}
          btnText={i18n.t('Next').toUpperCase()}
          onBtnPress={(values, validateCb) => { validateCb(); }}
          onSubmit={(values) => { this.handleNextPress(values); }}
        />
      </View>
    );
  }
}

export default connect(
  state => ({
    auth: state.auth,
    state,
  }),
  dispatch => ({
    authActions: bindActionCreators(authActions, dispatch),
    cartActions: bindActionCreators(cartActions, dispatch),
  })
)(Checkout);
