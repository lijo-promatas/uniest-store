import React, { Component } from 'react';
import uniqueId from 'lodash/uniqueId';
import PropTypes from 'prop-types';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import {
  View,
  FlatList,
  InteractionManager,
} from 'react-native';
import EStyleSheet from 'react-native-extended-stylesheet';

// Styles
import theme from '../config/theme';

// Import actions.
import * as authActions from '../actions/authActions';
import * as ordersActions from '../actions/ordersActions';

// Components
import Spinner from '../components/Spinner';
import EmptyList from '../components/EmptyList';
import OrderListItem from '../components/OrderListItem';

import i18n from '../utils/i18n';
import { registerDrawerDeepLinks } from '../utils/deepLinks';

import {
  iconsMap,
  iconsLoaded,
} from '../utils/navIcons';

const styles = EStyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});

class Orders extends Component {
  static propTypes = {
    ordersActions: PropTypes.shape({
      login: PropTypes.func,
    }),
    orders: PropTypes.shape({
      fetching: PropTypes.bool,
      items: PropTypes.arrayOf(PropTypes.object),
    }),
    navigator: PropTypes.shape({
      setTitle: PropTypes.func,
      setButtons: PropTypes.func,
      push: PropTypes.func,
      setOnNavigatorEvent: PropTypes.func,
    }),
  };

  static navigatorStyle = {
    navBarBackgroundColor: theme.$navBarBackgroundColor,
    navBarButtonColor: theme.$navBarButtonColor,
    navBarButtonFontSize: theme.$navBarButtonFontSize,
    navBarTextColor: theme.$navBarTextColor,
    screenBackgroundColor: theme.$screenBackgroundColor,
  };

  constructor(props) {
    super(props);

    props.navigator.setTitle({
      title: i18n.t('Orders').toUpperCase(),
    });

    props.navigator.setOnNavigatorEvent(this.onNavigatorEvent.bind(this));
  }

  componentWillMount() {
    const { navigator } = this.props;
    iconsLoaded.then(() => {
      navigator.setButtons({
        leftButtons: [
          {
            id: 'sideMenu',
            icon: iconsMap.menu,
          },
        ],
        rightButtons: [
          {
            id: 'cart',
            component: 'CartBtn',
            passProps: {},
          },
          {
            id: 'search',
            icon: iconsMap.search,
          },
        ],
      });
    });
  }

  componentDidMount() {
    const { ordersActions } = this.props;
    InteractionManager.runAfterInteractions(() => {
      ordersActions.fetch();
    });
  }

  onNavigatorEvent(event) {
    const { navigator } = this.props;
    registerDrawerDeepLinks(event, navigator);
    if (event.type === 'NavBarButtonPress') {
      if (event.id === 'sideMenu') {
        navigator.toggleDrawer({ side: 'left' });
      } else if (event.id === 'cart') {
        navigator.showModal({
          screen: 'Cart',
        });
      } else if (event.id === 'search') {
        navigator.showModal({
          screen: 'Search',
          title: i18n.t('Search'),
        });
      }
    }
  }

  renderList = () => {
    const { navigator, orders } = this.props;

    if (orders.fetching) {
      return null;
    }

    return (
      <FlatList
        keyExtractor={(item, index) => `order_${index}`}
        data={orders.items}
        ListEmptyComponent={<EmptyList />}
        renderItem={({ item }) => (
          <OrderListItem
            key={uniqueId('oreder-i')}
            item={item}
            onPress={() => {
              navigator.push({
                screen: 'OrderDetail',
                backButtonTitle: '',
                passProps: {
                  orderId: item.order_id,
                },
              });
            }}
          />
        )}
      />
    );
  };

  render() {
    const { orders } = this.props;
    if (orders.fetching) {
      return (
        <Spinner visible />
      );
    }

    return (
      <View style={styles.container}>
        {this.renderList()}
      </View>
    );
  }
}

export default connect(
  state => ({
    nav: state.nav,
    auth: state.auth,
    flash: state.flash,
    orders: state.orders,
  }),
  dispatch => ({
    authActions: bindActionCreators(authActions, dispatch),
    ordersActions: bindActionCreators(ordersActions, dispatch),
  })
)(Orders);
