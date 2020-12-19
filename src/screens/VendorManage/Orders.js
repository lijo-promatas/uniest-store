import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import {
  View,
  FlatList,
} from 'react-native';
import ActionSheet from 'react-native-actionsheet';
import Swipeout from 'react-native-swipeout';
import EStyleSheet from 'react-native-extended-stylesheet';

// Styles
import theme from '../../config/theme';

// Import actions.
import * as notificationsActions from '../../actions/notificationsActions';
import * as ordersActions from '../../actions/vendorManage/ordersActions';

// Components
import Spinner from '../../components/Spinner';
import EmptyList from '../../components/EmptyList';
import OrderListItem from '../../components/OrderListItem';

import i18n from '../../utils/i18n';
import { orderStatuses } from '../../utils';
import { registerDrawerDeepLinks } from '../../utils/deepLinks';

import {
  iconsMap,
  iconsLoaded,
} from '../../utils/navIcons';

const styles = EStyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});

const itemsList = [
  ...orderStatuses.map(item => item.text),
  i18n.t('Cancel'),
];

const CANCEL_INDEX = itemsList.length - 1;

class Orders extends Component {
  static propTypes = {
    ordersActions: PropTypes.shape({
      fetch: PropTypes.func,
    }),
    notifications: PropTypes.shape({
      items: PropTypes.arrayOf(PropTypes.object),
    }),
    notificationsActions: PropTypes.shape({
      hide: PropTypes.func,
    }),
    hasMore: PropTypes.bool,
    page: PropTypes.number,
    orders: PropTypes.shape({
      loading: PropTypes.bool,
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

    this.state = {
      refreshing: false,
    };

    this.orderID = 0;

    props.navigator.setTitle({
      title: i18n.t('Vendor Orders').toUpperCase(),
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
      });
    });
  }

  componentDidMount() {
    const { ordersActions, orders: { page } } = this.props;
    ordersActions.fetch(page);
  }

  componentWillReceiveProps(nextProps) {
    const { notificationsActions } = this.props;
    const { navigator } = nextProps;

    if (nextProps.notifications.items.length) {
      const notify = nextProps.notifications.items[nextProps.notifications.items.length - 1];
      if (notify.closeLastModal) {
        navigator.dismissModal();
      }
      navigator.showInAppNotification({
        screen: 'Notification',
        autoDismissTimerSec: 1,
        passProps: {
          dismissWithSwipe: true,
          title: notify.title,
          type: notify.type,
          text: notify.text,
        },
      });
      notificationsActions.hide(notify.id);
    }

    this.setState({
      refreshing: false,
    });
  }

  onNavigatorEvent(event) {
    const { navigator } = this.props;
    registerDrawerDeepLinks(event, navigator);
    if (event.type === 'NavBarButtonPress') {
      if (event.id === 'sideMenu') {
        navigator.toggleDrawer({ side: 'left' });
      }
    }
  }

  showActionSheet = (id) => {
    this.orderID = id;
    this.ActionSheet.show();
  }

  handleRefresh = () => {
    const { ordersActions } = this.props;
    this.setState({
      refreshing: true,
    });

    ordersActions.fetch(0);
  }

  handleLoadMore = () => {
    const { ordersActions, orders: { hasMore, page } } = this.props;

    if (!hasMore) {
      return;
    }

    ordersActions.fetch(page);
  }

  handleChangeStatus = (index) => {
    const { ordersActions } = this.props;

    if (orderStatuses[index]) {
      ordersActions.updateStatus(this.orderID, orderStatuses[index].code);
    }
  }

  renderItem = ({ item }) => {
    const { navigator } = this.props;
    const swipeoutBtns = [
      {
        text: i18n.t('Status'),
        type: 'delete',
        onPress: () => this.showActionSheet(item.order_id),
      },
    ];

    return (
      <Swipeout
        autoClose
        right={swipeoutBtns}
        backgroundColor={theme.$navBarBackgroundColor}
      >
        <OrderListItem
          key={String(item.order_id)}
          item={item}
          onPress={() => {
            navigator.push({
              screen: 'VendorManageOrderDetail',
              backButtonTitle: '',
              passProps: {
                orderId: item.order_id,
              },
            });
          }}
        />
      </Swipeout>
    );
  }

  render() {
    const { orders } = this.props;
    const { refreshing } = this.state;

    if (orders.loading) {
      return (
        <Spinner visible />
      );
    }

    return (
      <View style={styles.container}>
        <FlatList
          keyExtractor={(item, index) => `order_${index}`}
          data={orders.items}
          ListEmptyComponent={<EmptyList />}
          renderItem={this.renderItem}
          onEndReached={this.handleLoadMore}
          refreshing={refreshing}
          onRefresh={() => this.handleRefresh()}
        />
        <ActionSheet
          ref={(ref) => { this.ActionSheet = ref; }}
          options={itemsList}
          cancelButtonIndex={CANCEL_INDEX}
          onPress={this.handleChangeStatus}
        />
      </View>
    );
  }
}

export default connect(
  state => ({
    orders: state.vendorManageOrders,
    notifications: state.notifications,
  }),
  dispatch => ({
    notificationsActions: bindActionCreators(notificationsActions, dispatch),
    ordersActions: bindActionCreators(ordersActions, dispatch),
  })
)(Orders);
