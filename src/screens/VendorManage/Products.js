import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import {
  View,
  Text,
  Image,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import Swipeout from 'react-native-swipeout';
import EStyleSheet from 'react-native-extended-stylesheet';
import ActionSheet from 'react-native-actionsheet';

// Styles
import theme from '../../config/theme';

// Import actions.
import * as notificationsActions from '../../actions/notificationsActions';
import * as productsActions from '../../actions/vendorManage/productsActions';

// Components
import Spinner from '../../components/Spinner';
import EmptyList from '../../components/EmptyList';

import { getImagePath, getProductStatus } from '../../utils';

import i18n from '../../utils/i18n';
import { registerDrawerDeepLinks } from '../../utils/deepLinks';

import {
  iconsMap,
  iconsLoaded,
} from '../../utils/navIcons';

const STATUS_ACTIONS_LIST = [
  i18n.t('Make Product Active'),
  i18n.t('Make Product Hidden'),
  i18n.t('Make Product Disabled'),
  i18n.t('Cancel'),
];

const styles = EStyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  listItem: {
    flex: 1,
    flexDirection: 'row',
    padding: 14,
    borderBottomWidth: 1,
    borderColor: '#f1f1f1',
    backgroundColor: '#fff',
  },
  listItemImage: {
    width: 50,
    marginRight: 14,
  },
  productImage: {
    width: 50,
    height: 50,
  },
  listItemHeaderText: {
    fontWeight: 'bold',
    paddingRight: 50,
    maxWidth: '90%',
  },
  listItemText: {
    color: '#8c8c8c',
  },
  listItemStatus: {
    fontSize: '0.7rem',
    position: 'absolute',
    right: 10,
    top: 10,
  }
});

class Products extends Component {
  static propTypes = {
    navigator: PropTypes.shape({
      setTitle: PropTypes.func,
      setButtons: PropTypes.func,
      push: PropTypes.func,
      setOnNavigatorEvent: PropTypes.func,
    }),
    notifications: PropTypes.shape({
      items: PropTypes.arrayOf(PropTypes.object),
    }),
    notificationsActions: PropTypes.shape({
      hide: PropTypes.func,
    }),
    productsActions: PropTypes.shape({}),
    hasMore: PropTypes.bool,
    loading: PropTypes.bool,
    page: PropTypes.number,
    products: PropTypes.arrayOf(PropTypes.shape({})),
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

    props.navigator.setTitle({
      title: i18n.t('Vendor products').toUpperCase(),
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
            id: 'add',
            icon: iconsMap.add,
          }
        ],
      });
    });
  }

  componentDidMount() {
    this.handleLoadMore();
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
      if (event.id === 'add') {
        navigator.showModal({
          screen: 'VendorManageCategoriesPicker',
          backButtonTitle: '',
          title: i18n.t('Categories').toUpperCase(),
          passProps: {
            parent: 0,
          },
        });
      }
    }
  }

  handleLoadMore = () => {
    const { productsActions, hasMore, page } = this.props;
    if (!hasMore) {
      return;
    }

    productsActions.fetchProducts(page);
  }

  handleRefresh = () => {
    const { productsActions } = this.props;
    this.setState({
      refreshing: true,
    });

    productsActions.fetchProducts(0);
  }

  handleStatusActionSheet = (index) => {
    const { productsActions } = this.props;
    const statuses = [
      'A',
      'H',
      'D',
    ];
    const activeStatus = statuses[index];
    productsActions.updateProduct(
      this.product_id, {
        status: activeStatus,
      }
    );
  }

  renderItem = (item) => {
    const { navigator, productsActions } = this.props;
    const swipeoutBtns = [
      {
        text: i18n.t('Status'),
        type: 'status',
        backgroundColor: '#ff6002',
        onPress: () => {
          this.product_id = item.product_id;
          this.StatusActionSheet.show();
        },
      },
      {
        text: i18n.t('Delete'),
        type: 'delete',
        backgroundColor: '#ff362b',
        onPress: () => productsActions.deleteProduct(item.product_id),
      },
    ];
    const imageUri = getImagePath(item);
    const status = getProductStatus(item.status);

    return (
      <Swipeout
        autoClose
        right={swipeoutBtns}
        backgroundColor={theme.$navBarBackgroundColor}
      >
        <TouchableOpacity
          onPress={() => navigator.push({
            screen: 'VendorManageEditProduct',
            backButtonTitle: '',
            passProps: {
              productID: item.product_id,
              showBack: true,
            },
          })}
        >
          <View style={styles.listItem}>
            <Text
              style={{
                ...styles.listItemStatus,
                ...status.style
              }}
            >
              {status.text}
            </Text>
            <View style={styles.listItemImage}>
              {imageUri !== null && (
                <Image
                  style={styles.productImage}
                  source={{ uri: imageUri }}
                  resizeMode="contain"
                  resizeMethod="resize"
                />
              )}
            </View>
            <View style={styles.listItemContent}>
              <View style={styles.listItemHeader}>
                <Text style={styles.listItemHeaderText} numberOfLines={1} ellipsizeMode="tail">
                  {item.product}
                </Text>
              </View>
              <View>
                <Text style={styles.listItemText}>
                  {item.product_code}
                </Text>
                <Text style={styles.listItemText}>
                  {`${i18n.t('Price')}: ${item.price} ${item.amount !== 0 && '|'} ${i18n.t('In stock')}: ${item.amount}`}
                </Text>
              </View>
            </View>
          </View>
        </TouchableOpacity>
      </Swipeout>
    );
  };

  render() {
    const { loading, products } = this.props;
    const { refreshing } = this.state;

    if (loading) {
      return (
        <Spinner visible />
      );
    }

    return (
      <View style={styles.container}>
        <FlatList
          keyExtractor={(item, index) => `order_${index}`}
          data={products}
          ListEmptyComponent={<EmptyList />}
          renderItem={({ item }) => this.renderItem(item)}
          onEndReached={this.handleLoadMore}
          refreshing={refreshing}
          onRefresh={() => this.handleRefresh()}
        />
        <ActionSheet
          ref={(ref) => { this.StatusActionSheet = ref; }}
          options={STATUS_ACTIONS_LIST}
          cancelButtonIndex={3}
          destructiveButtonIndex={2}
          onPress={this.handleStatusActionSheet}
        />
      </View>
    );
  }
}

export default connect(
  state => ({
    notifications: state.notifications,
    products: state.vendorManageProducts.items,
    hasMore: state.vendorManageProducts.hasMore,
    loading: state.vendorManageProducts.loading,
    page: state.vendorManageProducts.page,
  }),
  dispatch => ({
    productsActions: bindActionCreators(productsActions, dispatch),
    notificationsActions: bindActionCreators(notificationsActions, dispatch),
  })
)(Products);
