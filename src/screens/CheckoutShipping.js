import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import EStyleSheet from 'react-native-extended-stylesheet';

import values from 'lodash/values';
import uniqueId from 'lodash/uniqueId';
import flatten from 'lodash/flatten';

// Import actions.
import * as cartActions from '../actions/cartActions';

// Components
import CheckoutSteps from '../components/CheckoutSteps';
import CartFooter from '../components/CartFooter';
import EmptyList from '../components/EmptyList';
import Spinner from '../components/Spinner';
import Icon from '../components/Icon';

import i18n from '../utils/i18n';

import { stripTags, formatPrice } from '../utils';

// theme
import theme from '../config/theme';

const styles = EStyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  contentContainer: {
  },
  shippingItem: {
    padding: 14,
    borderBottomWidth: 1,
    borderTopWidth: 1,
    borderColor: '#F1F1F1',
    backgroundColor: '#fff',
    marginBottom: 6,
  },
  shippingItemText: {
    fontSize: '0.9rem',
    paddingBottom: 6,
    marginLeft: 6,
    marginRight: 6,
  },
  shippingItemDesc: {
    fontSize: '0.8rem',
    paddingBottom: 6,
    color: 'gray'
  },
  shippingTitle: {
    fontSize: '1rem',
    fontWeight: 'bold',
    marginBottom: 14,
    textAlign: 'center',
  },
  shippingItemRate: {
    fontWeight: 'bold',
    color: 'black',
    fontSize: '1rem',
  },
  shippingItemTitleWrap: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
  },
  shippingItemTitle: {
    flex: 1,
    flexDirection: 'row',
  },
  uncheckIcon: {
    fontSize: '1rem',
  },
  checkIcon: {
    fontSize: '1rem',
    opacity: 0.5,
  },
  stepsWrapper: {
    padding: 14,
  },
});

/**
 * Checkout. Shipping screen.
 *
 * @reactProps {object} navigator - Navigator.
 * @reactProps {object} cart - Cart information.
 * @reactProps {object} cartActions - Cart actions.
 */
export class CheckoutShipping extends Component {
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
    cart: PropTypes.shape({}),
    navigator: PropTypes.shape({
      push: PropTypes.func,
      setOnNavigatorEvent: PropTypes.func
    }),
    stateCart: PropTypes.shape({}),
    cartActions: PropTypes.shape({})
  };

  constructor(props) {
    super(props);

    this.state = {
      total: 0,
      items: [],
      shipping_id: {},
      isNextDisabled: true,
    };

    props.navigator.setOnNavigatorEvent(this.onNavigatorEvent.bind(this));
  }

  /**
   * Sets shipping methods.
   */
  componentDidMount() {
    const { cart } = this.props;
    this.setDefaults(cart);

    setTimeout(() => this.handleLoadInitial(), 500);
  }

  /**
   * Sets shipping methods.
   */
  componentWillReceiveProps(nextProps) {
    const { cart } = nextProps;
    this.setDefaults(cart);
  }

  /**
   * Shipping screen navigation.
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
   * Set default shipping method.
   *
   * @param {object} cart - Cart information.
   */
  setDefaults(cart) {
    const items = this.normalizeData(cart.product_groups);
    const shippings = [];

    items.forEach((item) => {
      if (item) {
        item.shippings.forEach((shipping) => {
          shippings.push(shipping);
        });
      }
    });

    this.setState({
      items,
      total: cart.total_formatted.price,
      isNextDisabled: shippings.length === 0,
    });
  }

  /**
   * Changes data format.
   *
   * @param {object} blobData - Company information.
   */
  normalizeData = (blobData) => {
    const { shipping_id } = this.state;

    return blobData.map((currentItem) => {
      const item = { ...currentItem };
      item.shippings = values(item.shippings);
      item.shippings = item.shippings.map((i, index) => {
        if (index === 0 && !values(shipping_id).length) {
          this.setState({ shipping_id: { 0: i.shipping_id } });
          return {
            ...i,
            isSelected: true,
          };
        }

        return {
          ...i,
          isSelected: values(shipping_id).includes(i.shipping_id),
        };
      });
      return item;
    });
  }

  /**
   * Calculates the cost including delivery.
   */
  handleLoadInitial() {
    const { cartActions } = this.props;
    const { items } = this.state;
    const shippingsIds = {};
    const shippings = [];

    items.forEach((item) => {
      if (item) {
        item.shippings.forEach((shipping) => {
          shippings.push(shipping);
        });
      }
    });

    shippings.forEach((shipping, index) => {
      if (shipping.isSelected) {
        shippingsIds[index] = shipping.shipping_id;
      }
    });

    cartActions
      .recalculateTotal(shippingsIds)
      .then((data) => {
        this.setState({
          total: data.total_formatted.price,
        });
      });
  }

  /**
   * Redirects to CheckoutPayment.
   */
  handleNextPress() {
    const { navigator, cart } = this.props;
    navigator.push({
      screen: 'CheckoutPayment',
      title: i18n.t('Checkout').toUpperCase(),
      backButtonTitle: '',
      passProps: {
        shipping_id: this.state.shipping_id,
        cart
      },
    });
  }

  /**
   * Switches shipping method.
   *
   * @param {object} shipping - Shipping method information.
   * @param {number} shippingIndex - Shipping index.
   * @param {number} itemIndex - Index of the selected shipping method.
   */
  handleSelect(shipping, shippingIndex, itemIndex) {
    const { cartActions } = this.props;
    if (shipping.isSelected) {
      return;
    }
    // Check shipping
    const newItems = [...this.state.items];
    newItems[itemIndex].shippings = newItems[itemIndex].shippings
      .map(s => ({ ...s, isSelected: false, }));
    newItems[itemIndex].shippings[shippingIndex].isSelected = true;
    // Get selected ids
    const selectedIds = {};
    selectedIds[`${itemIndex}`] = `${shipping.shipping_id}`;

    cartActions
      .recalculateTotal(selectedIds)
      .then((data) => {
        this.setState({
          total: data.total_formatted.price,
        });
      });

    this.setState({
      items: newItems,
      shipping_id: selectedIds,
    });
  }

  /**
   * Renders shipping options.
   *
   * @param {object} shipping - Shipping method information.
   * @param {number} shippingIndex - Shipping index.
   * @param {number} itemIndex - Index of the selected shipping method.
   *
   * @return {JSX.Element}
   */
  renderItem = (shipping, shippingIndex, itemIndex) => {
    return (
      <TouchableOpacity
        key={uniqueId('item_')}
        style={[styles.shippingItem]}
        onPress={() => this.handleSelect(shipping, shippingIndex, itemIndex)}
      >
        <View style={styles.shippingItemTitleWrap}>
          <View style={styles.shippingItemTitle}>
            {shipping.isSelected
              ? <Icon name="radio-button-checked" style={styles.checkIcon} />
              : <Icon name="radio-button-unchecked" style={styles.uncheckIcon} />
            }
            <Text style={styles.shippingItemText}>
              {shipping.shipping} {shipping.delivery_time}
            </Text>
          </View>

          <Text style={styles.shippingItemRate}>
            {shipping.rate_formatted.price}
          </Text>
        </View>
        <Text style={styles.shippingItemDesc}>
          {stripTags(shipping.description)}
        </Text>
      </TouchableOpacity>
    );
  };

  /**
   * Renders checkout steps.
   *
   * @return {JSX.Element}
   */
  renderSteps = () => (
    <View style={styles.stepsWrapper}>
      <CheckoutSteps step={2} />
    </View>
  );

  /**
   * Renders company title.
   *
   * @param {string} title - Company title.
   *
   * @return {JSX.Element}
   */
  renderCompany = (title) => {
    const { items } = this.state;
    if (items.length === 1) {
      return null;
    }
    return (
      <Text style={styles.shippingTitle}>
        {title}
      </Text>
    );
  };

  /**
   * Renders component
   *
   * @return {JSX.Element}
   */
  render() {
    const { items, isNextDisabled, total } = this.state;
    const { stateCart } = this.props;

    if (stateCart.fetching) {
      return (
        <Spinner visible />
      );
    }

    const shippingsCount = flatten(items.map(s => s.shippings)).length;

    return (
      <View style={styles.container}>
        <ScrollView contentContainerStyle={styles.contentContainer}>
          {this.renderSteps()}
          {!shippingsCount && <EmptyList />}
          {items.map((item, itemIndex) => (
            <View key={item.company_id}>
              {this.renderCompany(item.name)}
              {item.shippings
                .map((shipping, shippingIndex) => this
                  .renderItem(shipping, shippingIndex, itemIndex))}
            </View>
          ))}
        </ScrollView>
        <CartFooter
          totalPrice={`${formatPrice(total)}`}
          btnText={i18n.t('Next').toUpperCase()}
          isBtnDisabled={isNextDisabled}
          onBtnPress={() => this.handleNextPress()}
        />
      </View>
    );
  }
}

export default connect(
  state => ({
    stateCart: state.cart,
    shippings: state.shippings,
  }),
  dispatch => ({
    cartActions: bindActionCreators(cartActions, dispatch),
  })
)(CheckoutShipping);
