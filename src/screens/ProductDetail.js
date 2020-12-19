import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { bindActionCreators } from 'redux';
import toInteger from 'lodash/toInteger';
import debounce from 'lodash/debounce';
import { connect } from 'react-redux';
import {
  View,
  Text,
  Share,
  Image,
  Platform,
  ScrollView,
  TouchableOpacity,
  InteractionManager,
  KeyboardAvoidingView,
} from 'react-native';
import format from 'date-fns/format';
import EStyleSheet from 'react-native-extended-stylesheet';
import Swiper from 'react-native-swiper';
import get from 'lodash/get';
import { stripTags, formatPrice, getProductImagesPaths, isPriceIncludesTax } from '../utils';

// Import actions.
import * as cartActions from '../actions/cartActions';
import * as productsActions from '../actions/productsActions';
import * as wishListActions from '../actions/wishListActions';
import * as vendorActions from '../actions/vendorActions';

// Components
import DiscussionList from '../components/DiscussionList';
import InAppPayment from '../components/InAppPayment';
import SelectOption from '../components/SelectOption';
import InputOption from '../components/InputOption';
import QtyOption from '../components/QtyOption';
import SwitchOption from '../components/SwitchOption';
import SectionRow from '../components/SectionRow';
import SectionButton from '../components/SectionButton';
import Spinner from '../components/Spinner';
import Section from '../components/Section';
import Rating from '../components/Rating';
import Icon from '../components/Icon';

import i18n from '../utils/i18n';
import theme from '../config/theme';
import config from '../config';


import {
  iconsLoaded,
  iconsMap
} from '../utils/navIcons';

import {
  DISCUSSION_COMMUNICATION_AND_RATING,
  DISCUSSION_RATING,
  DISCUSSION_DISABLED,
  VERSION_MVE,
  FEATURE_TYPE_DATE,
  FEATURE_TYPE_CHECKBOX,
} from '../constants';

const styles = EStyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '$screenBackgroundColor',
  },
  slide: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  productImage: {
    width: '100%',
    height: 300,
    resizeMode: 'contain',
  },
  descriptionBlock: {
    paddingTop: 10,
    paddingBottom: 10,
    marginTop: 10,
    paddingLeft: 14,
    paddingRight: 14,
    borderTopWidth: 1,
    borderTopColor: '#F1F1F1',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F1F1',
  },
  nameText: {
    fontSize: '1.2rem',
    color: '$darkColor',
    marginBottom: 5,
    textAlign: 'left'
  },
  priceText: {
    fontSize: '1rem',
    fontWeight: 'bold',
    color: '$darkColor',
    textAlign: 'left'
  },
  smallText: {
    fontSize: '0.8rem',
    fontWeight: 'normal',
    color: '$darkColor',
  },
  outOfStockText: {
    color: '$dangerColor',
    marginTop: 10,
    fontSize: '0.8rem',
    fontWeight: 'bold',
  },
  listPriceText: {
    textDecorationLine: 'line-through',
    color: '$darkColor',
    textAlign: 'left'
  },
  listPriceWrapperText: {
    textAlign: 'left',
  },
  promoText: {
    marginBottom: 10,
  },
  descText: {
    marginTop: 10,
    color: 'gray',
    textAlign: 'left',
  },
  noFeaturesText: {
    textAlign: 'left',
  },
  addToCartContainer: {
    padding: 8,
    flexDirection: 'row',
    borderTopWidth: 1,
    borderColor: '#F0F0F0',
  },
  addToCartBtn: {
    backgroundColor: '$primaryColor',
    padding: 10,
    flex: 3,
    borderRadius: 3,
    justifyContent: 'center',
    alignItems: 'center'
  },
  addToCartBtnText: {
    textAlign: 'center',
    color: '$primaryColorText',
    fontSize: 16,
  },
  addToWishList: {
    backgroundColor: '$addToWishListColor',
    width: 60,
    marginRight: 10,
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addToWishListIcon: {
    color: '#fff',
  },
  noPadding: {
    padding: 0,
    paddingTop: 6,
    paddingBottom: 6,
  },
  sectionBtn: {
    paddingLeft: 14,
    paddingRight: 14,
    paddingTop: 12,
    paddingBottom: 6,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  sectionBtnText: {
    color: '$primaryColor',
    fontSize: '0.9rem',
    textAlign: 'left',
    maxWidth: 100,
  },
  vendorWrapper: {
    paddingLeft: 14,
    paddingRight: 14,
    paddingTop: 8,
    paddingBottom: 8,
    marginBottom: 10,
  },
  vendorName: {
    fontSize: '1rem',
    fontWeight: 'bold',
    textAlign: 'left',
    marginRight: 100,
  },
  vendorProductCount: {
    fontSize: '0.7rem',
    color: 'gray',
    marginBottom: 13,
    textAlign: 'left',
  },
  vendorDescription: {
    color: 'gray',
    fontSize: '0.9rem',
    textAlign: 'left',
  },
  vendorInfoBtn: {
    position: 'absolute',
    top: 10,
    right: '1rem',
  },
  rating: {
    marginLeft: -10,
    marginRight: -10,
    marginTop: -4
  },
  keyboardAvoidingContainer: {
    marginBottom: Platform.OS === 'ios' ? 122 : 132,
  },
  listDiscountWrapper: {
    backgroundColor: '$productDiscountColor',
    position: 'absolute',
    top: 4,
    right: 4,
    paddingTop: 2,
    paddingBottom: 2,
    paddingLeft: 4,
    paddingRight: 4,
    borderRadius: 2,
  },
  listDiscountText: {
    color: '#fff',
  },
  inAppPaymentWrapper: {
    flex: 2,
    marginRight: 10,
  },
  zeroPrice: {
    paddingTop: 10,
  }
});


class ProductDetail extends Component {
  static navigatorStyle = {
    navBarBackgroundColor: theme.$navBarBackgroundColor,
    navBarButtonColor: theme.$navBarButtonColor,
    navBarButtonFontSize: theme.$navBarButtonFontSize,
    navBarTextColor: theme.$navBarTextColor,
    screenBackgroundColor: theme.$screenBackgroundColor,
  };

  static propTypes = {
    navigator: PropTypes.shape({
      push: PropTypes.func,
      setOnNavigatorEvent: PropTypes.func,
      showInAppNotification: PropTypes.func,
      showModal: PropTypes.func,
      setButtons: PropTypes.func,
    }),
    wishListActions: PropTypes.shape({
      add: PropTypes.func,
    }),
    pid: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.number,
    ]),
    hideSearch: PropTypes.bool,
    hideWishList: PropTypes.bool,
    discussion: PropTypes.shape({
      posts: PropTypes.arrayOf(PropTypes.shape({})),
    }),
    productDetail: PropTypes.shape({
    }),
    productsActions: PropTypes.shape({
      recalculatePrice: PropTypes.func,
    }),
    cartActions: PropTypes.shape({
      add: PropTypes.func,
    }),
    auth: PropTypes.shape({
      token: PropTypes.string,
      logged: PropTypes.bool,
    }),
    cart: PropTypes.shape({
      fetching: PropTypes.bool,
    }),
    vendorActions: PropTypes.shape({
      fetch: PropTypes.func,
    }),
    vendors: PropTypes.shape({}),
  }

  constructor(props) {
    super(props);

    this.isVendorFetchRequestSent = false;

    this.state = {
      images: [],
      product: {},
      discussion: {},
      vendor: null,
      fetching: true,
      selectedOptions: {},
      canWriteComments: false,
      amount: 1,
    };

    props.navigator.setOnNavigatorEvent(this.onNavigatorEvent.bind(this));
  }

  componentWillMount() {
    const buttons = {
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
      ]
    };

    iconsLoaded.then(() => {
      const { hideSearch, navigator } = this.props;
      if (hideSearch) {
        buttons.rightButtons.splice(-1, 1);
      }
      navigator.setButtons(buttons);
    });
  }

  componentDidMount() {
    const { productsActions, pid, } = this.props;
    InteractionManager.runAfterInteractions(() => {
      productsActions
        .fetch(pid)
        .then((product) => {
          const minQty = parseInt(get(product.data, 'min_qty', 0), 10);
          this.setState({
            amount: minQty || 1,
            fetching: minQty !== 0,
          }, () => {
            if (minQty !== 0) {
              this.calculatePrice();
            }
          });
        });
    });
  }

  componentWillReceiveProps(nextProps) {
    const {
      productDetail,
      navigator,
      vendors,
      discussion,
      auth,
      vendorActions,
    } = nextProps;
    const product = productDetail;

    if (!product) {
      return;
    }

    // If we haven't images put main image.
    const images = getProductImagesPaths(product);

    // Fixme
    if (
      config.version === VERSION_MVE &&
      !vendors.items[product.company_id] &&
      !vendors.fetching && product.company_id &&
      !this.isVendorFetchRequestSent
    ) { 
      this.isVendorFetchRequestSent = true;
      vendorActions.fetch(product.company_id);
    }

    const defaultOptions = { ...this.state.selectedOptions };
    if (!Object.keys(defaultOptions).length) {
      product.options.forEach((option) => {
        // Fixme: Server returned inconsistent data.
        if (!option.variants) {
          option.variants = [];
        }

        if (option.variants[option.value]) {
          defaultOptions[option.option_id] = option.variants[option.value];
        } else if (Object.values(option.variants).length) {
          defaultOptions[option.option_id] = Object.values(option.variants)[0];
        }
      });
    }

    // Get active discussion.
    let activeDiscussion = discussion.items[`p_${product.product_id}`];
    if (!activeDiscussion) {
      activeDiscussion = {
        average_rating: 0,
        disable_adding: true,
        posts: [],
        search: {
          page: 1,
          total_items: 0,
        },
      };
    }

    this.setState({
      images,
      product,
      discussion: activeDiscussion,
      selectedOptions: defaultOptions,
      vendor: vendors.items[product.company_id] || null,
      canWriteComments: (!activeDiscussion.disable_adding
        && productDetail.discussion_type !== DISCUSSION_DISABLED) && auth.logged,
    });

    navigator.setTitle({
      title: product.product,
    });
  }

  onNavigatorEvent(event) {
    const { navigator, hideSearch } = this.props;
    if (event.type === 'NavBarButtonPress') {
      if (event.id === 'search') {
        if (hideSearch) {
          navigator.pop();
          return;
        }
        navigator.showModal({
          screen: 'Search',
          animated: false,
        });
      } else if (event.id === 'back') {
        navigator.pop();
      }
    }
  }

  calculatePrice = () => {
    const { productsActions } = this.props;
    const { product, amount, selectedOptions } = this.state;
    productsActions.recalculatePrice(
      product.product_id,
      amount,
      selectedOptions
    ).then(() => this.setState({ fetching: false }));
  }

  handleApplePay = async (next) => {
    const { cartActions } = this.props;

    try {
      await cartActions.clear();
      const cartData = await this.handleAddToCart(false);

      if (!cartData.data.message) {
        setTimeout(() => next(), 400);
      }
    } catch (error) {
      console.log('error', error);
    }
  }

  handleAddToCart = (showNotification = true) => {
    const productOptions = {};
    const { product, selectedOptions, amount } = this.state;
    const { auth, navigator, cartActions } = this.props;

    if (!auth.logged) {
      return navigator.showModal({
        screen: 'Login',
      });
    }

    // Convert product options to the option_id: variant_id array.
    Object.keys(selectedOptions).forEach((k) => {
      productOptions[k] = selectedOptions[k];
      if (selectedOptions[k].variant_id) {
        productOptions[k] = selectedOptions[k].variant_id;
      }
    });

    const products = {
      [product.product_id]: {
        product_id: product.product_id,
        amount,
        product_options: productOptions,
      },
    };

    return cartActions.add({ products }, showNotification);
  }

  handleAddToWishList() {
    const productOptions = {};
    const { product, selectedOptions } = this.state;
    const { auth, navigator, wishListActions } = this.props;

    if (!auth.logged) {
      return navigator.showModal({
        screen: 'Login',
      });
    }

    // Convert product options to the option_id: variant_id array.
    Object.keys(selectedOptions).forEach((k) => {
      productOptions[k] = selectedOptions[k];
      if (selectedOptions[k].variant_id) {
        productOptions[k] = selectedOptions[k].variant_id;
      }
    });

    const products = {
      [product.product_id]: {
        product_id: product.product_id,
        amount: product.selectedAmount,
        product_options: productOptions,
      },
    };
    return wishListActions.add({ products });
  }

  handleOptionChange(name, val) {
    const { selectedOptions } = this.state;
    const newOptions = { ...selectedOptions };
    newOptions[name] = val;

    this.setState({
      selectedOptions: newOptions,
    }, debounce(this.calculatePrice, 1000, { trailing: true }));
  }

  renderDiscountLabel() {
    const { product } = this.state;

    if (!product.list_discount_prc && !product.discount_prc) {
      return null;
    }

    const discount = product.list_discount_prc || product.discount_prc;

    return (
      <View style={styles.listDiscountWrapper}>
        <Text style={styles.listDiscountText}>
          {`${i18n.t('Discount')} ${discount}%`}
        </Text>
      </View>
    );
  }

  renderImage() {
    const { images } = this.state;
    const { navigator } = this.props;
    const productImages = images.map((img, index) => (
      <TouchableOpacity
        style={styles.slide}
        key={index}
        onPress={() => {
          navigator.showModal({
            screen: 'Gallery',
            animationType: 'fade',
            passProps: {
              images: [...images],
              activeIndex: index,
            },
          });
        }}
      >
        <Image source={{ uri: img }} style={styles.productImage} />
      </TouchableOpacity>
    ));

    return (
      <View>
        <Swiper
          horizontal
          height={300}
          style={styles.wrapper}
          removeClippedSubviews={false}
        >
          {productImages}
        </Swiper>
        {this.renderDiscountLabel()}
      </View>
    );
  }

  renderName() {
    const { product } = this.state;
    if (!product.product) {
      return null;
    }
    return (
      <Text style={styles.nameText}>
        {product.product}
      </Text>
    );
  }

  renderRating() {
    const { discussion } = this.state;

    if (discussion.type !== DISCUSSION_RATING
        && discussion.type !== DISCUSSION_COMMUNICATION_AND_RATING) {
      return null;
    }

    return (
      <Rating
        containerStyle={styles.rating}
        value={discussion.average_rating}
        count={discussion.search.total_items}
      />
    );
  }

  renderDesc() {
    const { product } = this.state;
    if (product.full_description) {
      return (
        <Text style={styles.descText}>
          {stripTags(product.full_description)}
        </Text>
      );
    }
    return null;
  }

  renderPrice() {
    const { product } = this.state;
    let discountPrice = null;
    let discountTitle = null;
    let showDiscount = false;

    if (toInteger(product.discount)) {
      discountPrice = product.base_price_formatted.price;
      discountTitle = `${i18n.t('Old price')}: `;
      showDiscount = true;
    } else if (toInteger(product.list_price)) {
      discountPrice = product.list_price_formatted.price;
      discountTitle = `${i18n.t('List price')}: `;
      showDiscount = true;
    }

    const inStock = !Number(product.amount);
    const isProductPriceZero = Math.ceil(product.price) !== 0;
    const productTaxedPrice = get(product, 'taxed_price_formatted.price', '');
    const productPrice = productTaxedPrice || get(product, 'price_formatted.price', '');
    const showTaxedPrice = isPriceIncludesTax(product);

    return (
      <View>
        {(showDiscount && isProductPriceZero) && (
          <Text style={styles.listPriceWrapperText}>
            {discountTitle}
            <Text style={styles.listPriceText}>
              {formatPrice(discountPrice)}
            </Text>
          </Text>
        )}
        {isProductPriceZero ? (
          <>
            <Text style={styles.priceText}>
              {formatPrice(productPrice)}
              {showTaxedPrice && (
                <Text style={styles.smallText}>
                  {` (${i18n.t('Including tax')})`}
                </Text>
              )}
            </Text>
          </>
        ) : (
          <Text style={styles.zeroPrice}>
            {i18n.t('Contact us for a price')}
          </Text>
        )}
        {inStock && (
          <Text style={styles.outOfStockText}>
            {i18n.t('Out of stock')}
          </Text>
        )}
      </View>
    );
  }

  renderDiscussion() {
    const { navigator, productDetail } = this.props;
    const { discussion, canWriteComments } = this.state;
    if (
      discussion.average_rating === ''
      || discussion.type === DISCUSSION_DISABLED
      || productDetail.discussion_type === DISCUSSION_DISABLED
      || !productDetail.discussion_type
    ) {
      return null;
    }

    const masMore = discussion.search.total_items > 10;
    let title = i18n.t('Reviews');
    if (discussion.search.total_items != 0) { // eslint-disable-line
      title = i18n.t('Reviews ({{count}})', { count: discussion.search.total_items});
    }
    return (
      <Section
        title={title}
        wrapperStyle={styles.noPadding}
        showRightButton={canWriteComments}
        rightButtonText={i18n.t('Write a Review')}
        onRightButtonPress={() => {
          navigator.showModal({
            screen: 'WriteReview',
            passProps: {
              type: 'modal',
              activeDiscussion: discussion,
              discussionType: 'P',
              discussionId: productDetail.product_id,
            }
          });
        }}
      >
        <DiscussionList
          items={discussion.posts.slice(0, 4)}
          type={discussion.type}
        />
        {masMore && (
          <TouchableOpacity
            style={styles.sectionBtn}
            onPress={() => {
              navigator.showModal({
                screen: 'Discussion',
              });
            }}
          >
            <Text style={styles.sectionBtnText}>
              {i18n.t('View All')}
            </Text>
          </TouchableOpacity>
        )}
      </Section>
    );
  }

  renderOptionItem = (item) => {
    const option = { ...item };
    const { selectedOptions } = this.state;
    // FIXME: Brainfuck code to convert object to array.
    option.variants = Object.keys(option.variants).map(k => option.variants[k]);
    const defaultValue = selectedOptions[option.option_id];

    switch (item.option_type) {
      case 'I':
      case 'T':
        return (
          <InputOption
            option={option}
            value={defaultValue}
            key={item.option_id}
            onChange={val => this.handleOptionChange(option.option_id, val)}
          />
        );

      case 'S':
      case 'R':
        return (
          <SelectOption
            option={option}
            value={defaultValue}
            key={item.option_id}
            onChange={val => this.handleOptionChange(option.option_id, val)}
          />
        );

      case 'C':
        return (
          <SwitchOption
            option={option}
            value={defaultValue}
            key={item.option_id}
            onChange={val => this.handleOptionChange(option.option_id, val)}
          />
        );
      default:
        return null;
    }
  }

  renderOptions() {
    const { product } = this.state;

    const step = parseInt(product.qty_step, 10) || 1;
    const max = parseInt(product.max_qty, 10) || parseInt(product.amount, 10);
    const min = parseInt(product.min_qty, 10) || step;

    return (
      <Section>
        {product.options.map(o => this.renderOptionItem(o))}
        <QtyOption
          max={max}
          min={min}
          initialValue={min}
          step={step}
          onChange={(val) => {
            this.setState(
              { amount: val },
              this.calculatePrice,
            );
          }}
        />
      </Section>
    );
  }

  renderFeatureItem = (feature, index) => {
    const {
      description,
      feature_type, // eslint-disable-line
      value_int, // eslint-disable-line
      value,
      variant
    } = feature;

    let newValue = null;
    switch (feature_type) { // eslint-disable-line
      case FEATURE_TYPE_DATE:
        newValue = format(value_int * 1000, 'MM/DD/YYYY'); // eslint-disable-line
        break;
      case FEATURE_TYPE_CHECKBOX:
        newValue = feature.value === 'Y' ? i18n.t('Yes') : i18n.t('No');
        break;
      default:
        newValue = value || variant;
    }

    return (
      <SectionRow
        name={description}
        value={newValue}
        key={index}
      />
    );
  }

  renderFeatures() {
    const { product } = this.state;
    const features = Object.keys(product.product_features)
      .map(k => product.product_features[k]);

    return (
      <Section title={i18n.t('Features')}>
        {(features.length !== 0)
          ? features.map((item, index) => this.renderFeatureItem(item, index))
          : (
            <Text style={styles.noFeaturesText}>
              {` ${i18n.t('There are no features.')} `}
            </Text>
          )}
      </Section>
    );
  }

  renderVendorInfo() {
    const { vendor } = this.state;
    const { navigator } = this.props;

    if (config.version !== VERSION_MVE || !vendor) {
      return null;
    }

    return (
      <Section
        title={i18n.t('Vendor')}
        wrapperStyle={styles.noPadding}
      >
        <View style={styles.vendorWrapper}>
          <Text style={styles.vendorName}>
            {vendor.company}
          </Text>
          <Text style={styles.vendorProductCount}>
            {i18n.t('{{count}} item(s)', { count: vendor.products_count })}
          </Text>
          <Text style={styles.vendorDescription}>
            {stripTags(vendor.description)}
          </Text>
          <TouchableOpacity
            style={styles.vendorInfoBtn}
            onPress={() => {
              navigator.showModal({
                screen: 'VendorDetail',
                passProps: {
                  vendorId: vendor.company_id,
                },
              });
            }}
          >
            <Text style={styles.sectionBtnText} numberOfLines={1} ellipsizeMode="tail">
              {i18n.t('Details')}
            </Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity
          style={styles.sectionBtn}
          onPress={() => {
            navigator.showModal({
              screen: 'Vendor',
              title: vendor.company,
              passProps: {
                companyId: vendor.company_id,
              },
            });
          }}
        >
          <Text style={styles.sectionBtnText}>
            {i18n.t('Go To Store')}
          </Text>
        </TouchableOpacity>
      </Section>
    );
  }

  renderShare() {
    const { product } = this.state;
    const url = `${config.siteUrl}index.php?dispatch=products.view&product_id=${product.product_id}`;
    return (
      <SectionButton
        text={i18n.t('Share product')}
        onPress={() => {
          Share.share({
            message: url,
            title: product.product,
            url,
          }, {
            dialogTitle: product.product,
            tintColor: 'black'
          });
        }}
      />
    );
  }

  renderAddToCart() {
    const { hideWishList, navigator } = this.props;

    return (
      <View style={styles.addToCartContainer}>
        {!hideWishList
          && (
            <TouchableOpacity
              style={styles.addToWishList}
              onPress={() => this.handleAddToWishList()}
            >
              <Icon name="favorite" size={24} style={styles.addToWishListIcon} />
            </TouchableOpacity>
          )}

        {(Platform.OS === 'ios' && config.applePay) && (
          <View style={styles.inAppPaymentWrapper}>
            <InAppPayment
              navigator={navigator}
              onPress={this.handleApplePay}
            />
          </View>
        )}

        <TouchableOpacity
          style={styles.addToCartBtn}
          onPress={() => {
            this.handleAddToCart();
          }}
        >
          <Text style={styles.addToCartBtnText}>
            {i18n.t('Add to cart').toUpperCase()}
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  render() {
    const { fetching } = this.state;

    if (fetching) {
      return (<Spinner visible />);
    }

    return (
      <View style={styles.container}>
        <KeyboardAvoidingView
          contentContainerStyle={styles.keyboardAvoidingContainer}
          behavior="position"
        >
          <ScrollView>
            {this.renderImage()}
            <View style={styles.descriptionBlock}>
              {this.renderName()}
              {this.renderRating()}
              {this.renderPrice()}
              {this.renderDesc()}
            </View>
            {this.renderOptions()}
            {this.renderDiscussion()}
            {this.renderFeatures()}
            {this.renderVendorInfo()}
            {this.renderShare()}
          </ScrollView>
          {this.renderAddToCart()}
        </KeyboardAvoidingView>
      </View>
    );
  }
}

export default connect(
  state => ({
    cart: state.cart,
    auth: state.auth,
    vendors: state.vendors,
    wishList: state.wishList,
    discussion: state.discussion,
    productDetail: state.productDetail,
  }),
  dispatch => ({
    cartActions: bindActionCreators(cartActions, dispatch),
    vendorActions: bindActionCreators(vendorActions, dispatch),
    productsActions: bindActionCreators(productsActions, dispatch),
    wishListActions: bindActionCreators(wishListActions, dispatch),
  })
)(ProductDetail);
