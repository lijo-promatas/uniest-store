import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import * as t from 'tcomb-form-native';
import ActionSheet from 'react-native-actionsheet';
import {
  View,
  Image,
  Text,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
} from 'react-native';
import EStyleSheet from 'react-native-extended-stylesheet';
import uniqueId from 'lodash/uniqueId';

// Components
import Section from '../../components/Section';
import Spinner from '../../components/Spinner';
import Icon from '../../components/Icon';
import BottomActions from '../../components/BottomActions';

// Action
import * as productsActions from '../../actions/vendorManage/productsActions';
import * as imagePickerActions from '../../actions/imagePickerActions';

import i18n from '../../utils/i18n';
import theme from '../../config/theme';
import { registerDrawerDeepLinks } from '../../utils/deepLinks';
import { getProductStatus } from '../../utils';

import {
  iconsMap,
  iconsLoaded,
} from '../../utils/navIcons';

const styles = EStyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '$grayColor',
  },
  scrollContainer: {
    paddingBottom: 14,
  },
  menuItem: {
    borderBottomWidth: 1,
    borderColor: '#F0F0F0',
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingLeft: 20,
    paddingRight: 10,
    paddingTop: 10,
    paddingBottom: 10,
  },
  menuItemTitle: {
    color: '#8f8f8f',
    fontSize: '0.8rem',
    paddingBottom: 4,
  },
  menuItemText: {
    width: '90%',
  },
  btnIcon: {
    color: '#898989',
  },
  horizontalScroll: {
    marginTop: 20,
    marginLeft: 20,
  },
  imgWrapper: {
    backgroundColor: '#fff',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    padding: 4,
    marginRight: 10,
    minWidth: 100,
    minHeight: 100,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  img: {
    width: 100,
    height: 100,
  },
  addImageIcon: {
    fontSize: '3rem',
    color: '$categoryEmptyImage',
  },
});

const Form = t.form.Form;
const formFields = t.struct({
  product: t.String,
  full_description: t.maybe(t.String),
  price: t.Number,
});
const formOptions = {
  disableOrder: true,
  fields: {
    product: {
      label: i18n.t('Name'),
    },
    full_description: {
      label: i18n.t('Full description'),
      numberOfLines: 4,
      multiline: true,
      stylesheet: {
        ...Form.stylesheet,
        textbox: {
          ...Form.stylesheet.textbox,
          normal: {
            ...Form.stylesheet.textbox.normal,
            height: 130,
          }
        }
      },
      clearButtonMode: 'while-editing',
    }
  },
};

const MORE_ACTIONS_LIST = [
  i18n.t('Delete This Product'),
  i18n.t('Cancel'),
];

const STATUS_ACTIONS_LIST = [
  i18n.t('Make Product Active'),
  i18n.t('Make Product Hidden'),
  i18n.t('Make Product Disabled'),
  i18n.t('Cancel'),
];

class EditProduct extends Component {
  static propTypes = {
    productID: PropTypes.number,
    stepsData: PropTypes.shape({}),
    productsActions: PropTypes.shape({}),
    product: PropTypes.shape({}),
    categories: PropTypes.arrayOf(PropTypes.shape({})),
    loading: PropTypes.bool,
    showClose: PropTypes.bool,
    isUpdating: PropTypes.bool,
    selectedImages: PropTypes.arrayOf(PropTypes.string),
    imagePickerActions: PropTypes.shape({
      clear: PropTypes.func,
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

    this.formRef = React.createRef();
    props.navigator.setOnNavigatorEvent(this.onNavigatorEvent.bind(this));
  }

  componentWillMount() {
    const {
      navigator,
      productID,
      productsActions,
      showClose,
    } = this.props;
    productsActions.fetchProduct(productID);

    iconsLoaded.then(() => {
      const buttons = {
        rightButtons: [
          {
            id: 'more',
            icon: iconsMap['more-horiz'],
          },
        ],
      };

      if (showClose) {
        buttons.leftButtons = [
          {
            id: 'close',
            icon: iconsMap.close,
          }
        ];
      }

      navigator.setButtons(buttons);
    });
  }

  componentDidMount() {
    const { imagePickerActions } = this.props;
    imagePickerActions.clear();
  }

  componentWillReceiveProps() {
    const { navigator, product } = this.props;
    navigator.setTitle({
      title: i18n.t(product.product || '').toUpperCase(),
    });
  }

  onNavigatorEvent(event) {
    const { navigator } = this.props;
    registerDrawerDeepLinks(event, navigator);
    if (event.type === 'NavBarButtonPress') {
      if (event.id === 'more') {
        this.ActionSheet.show();
      }
      if (event.id === 'close') {
        navigator.dismissAllModals();
      }
    }
  }

  handleMoreActionSheet = (index) => {
    const { navigator, product, productsActions } = this.props;
    if (index === 0) {
      productsActions.deleteProduct(product.product_id);
      navigator.pop();
    }
  }

  handleStatusActionSheet = (index) => {
    const { product, productsActions } = this.props;
    const statuses = [
      'A',
      'H',
      'D',
    ];
    const activeStatus = statuses[index];

    if (activeStatus) {
      productsActions.updateProduct(
        product.product_id,
        {
          status: activeStatus,
        }
      );
    }
  }

  handleSave = () => {
    const {
      product,
      productsActions,
      productID,
      categories,
      selectedImages,
      imagePickerActions,
    } = this.props;
    const values = this.formRef.current.getValue();

    if (!values) { return; }

    const data = {
      images: selectedImages,
      ...values,
    };

    if (categories.length) {
      data.category_ids = categories[0].category_id;
    }

    productsActions.updateProduct(product.product_id, data)
      .then(() => productsActions.fetchProduct(productID, false))
      .then(() => imagePickerActions.clear());
  };

  handleRemoveImage = (imageIndex) => {
    const { imagePickerActions, navigator, selectedImages } = this.props;
    const newImages = [
      ...selectedImages,
    ];
    newImages.splice(imageIndex, 1);
    imagePickerActions.toggle(newImages);
    navigator.dismissModal();
  }

  renderImages = () => {
    const { product, navigator, selectedImages } = this.props;
    const images = [];

    if (product.main_pair) {
      images.push(product.main_pair.icon.image_path);
    }

    if (product.image_pairs) {
      product.image_pairs.forEach((item) => {
        images.push(item.icon.image_path);
      });
    }

    return (
      <ScrollView contentContainerStyle={styles.horizontalScroll} horizontal>
        <View style={styles.imgWrapper}>
          <TouchableOpacity
            onPress={() => {
              navigator.showModal({
                screen: 'ImagePicker',
                passProps: {},
              });
            }}
          >
            <Icon name="add" style={styles.addImageIcon} />
          </TouchableOpacity>
        </View>
        {selectedImages.map(image => (
          <View style={styles.imgWrapper} key={uniqueId('image-')}>
            <TouchableOpacity
              onPress={() => {
                navigator.showModal({
                  screen: 'Gallery',
                  animationType: 'fade',
                  passProps: {
                    images: [image],
                    activeIndex: 1,
                    onRemove: () => this.handleRemoveImage(image),
                  },
                });
              }}
            >
              <Image
                style={styles.img}
                source={{ uri: image }}
              />
            </TouchableOpacity>
          </View>
        ))}
        {images.map((item, index) => (
          <View style={styles.imgWrapper} key={index}>
            <TouchableOpacity
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
              <Image source={{ uri: item }} style={styles.img} />
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>
    );
  }

  renderMenuItem = (title, subTitle, fn = () => {}) => (
    <TouchableOpacity style={styles.menuItem} onPress={fn}>
      <View style={styles.menuItemText}>
        <Text style={styles.menuItemTitle}>{title}</Text>
        <Text
          style={styles.menuItemSubTitle}
        >
          {subTitle}
        </Text>
      </View>
      <Icon name="keyboard-arrow-right" style={styles.btnIcon} />
    </TouchableOpacity>
  );

  render() {
    const {
      navigator,
      loading,
      product,
      productsActions,
      isUpdating,
    } = this.props;

    if (loading) {
      return (
        <Spinner visible />
      );
    }

    return (
      <SafeAreaView style={{ flex: 1 }}>
        <View style={styles.container}>
          <ScrollView contentContainerStyle={styles.scrollContainer}>
            {this.renderImages()}
            <Section>
              <Form
                ref={this.formRef}
                type={formFields}
                value={product}
                options={formOptions}
              />
            </Section>
            <Section wrapperStyle={{ padding: 0 }}>
              {this.renderMenuItem(
                i18n.t('Status'),
                getProductStatus(product.status).text,
                () => {
                  this.StatusActionSheet.show();
                }
              )}
              {this.renderMenuItem(
                i18n.t('Pricing / Inventory'),
                i18n.t('{{code}}, List price: {{list}}, In stock: {{stock}}', { code: product.product_code, list: product.list_price, stock: product.amount }),
                () => {
                  navigator.push({
                    screen: 'VendorManagePricingInventory',
                    backButtonTitle: '',
                  });
                }
              )}
              {this.renderMenuItem(
                i18n.t('Categories'),
                product.categories.map(item => item.category).join(', '),
                () => {
                  navigator.showModal({
                    screen: 'VendorManageCategoriesPicker',
                    backButtonTitle: '',
                    title: i18n.t('Categories').toUpperCase(),
                    passProps: {
                      selected: product.categories,
                      parent: 0,
                      onCategoryPress: (item) => {
                        productsActions.changeProductCategory(item);
                      }
                    },
                  });
                }
              )}
              {this.renderMenuItem(
                i18n.t('Shipping properties'),
                `${i18n.t('Weight: {{count}} ', { count: product.weight })} ${product.free_shipping ? i18n.t('Free shipping') : ''}`,
                () => {
                  navigator.push({
                    screen: 'VendorManageShippingProperties',
                    backButtonTitle: '',
                    passProps: {
                      values: {
                        ...product
                      }
                    },
                  });
                }
              )}
            </Section>
          </ScrollView>
          <BottomActions onBtnPress={this.handleSave} />
          <ActionSheet
            ref={(ref) => { this.ActionSheet = ref; }}
            options={MORE_ACTIONS_LIST}
            cancelButtonIndex={1}
            destructiveButtonIndex={0}
            onPress={this.handleMoreActionSheet}
          />
          <ActionSheet
            ref={(ref) => { this.StatusActionSheet = ref; }}
            options={STATUS_ACTIONS_LIST}
            cancelButtonIndex={3}
            destructiveButtonIndex={2}
            onPress={this.handleStatusActionSheet}
          />
        </View>
        {isUpdating && (<Spinner visible mode="modal" />)}
      </SafeAreaView>
    );
  }
}

export default connect(
  state => ({
    loading: state.vendorManageProducts.loadingCurrent,
    isUpdating: state.vendorManageProducts.loading,
    product: state.vendorManageProducts.current,
    categories: state.vendorManageCategories.selected,
    selectedImages: state.imagePicker.selected,
  }),
  dispatch => ({
    productsActions: bindActionCreators(productsActions, dispatch),
    imagePickerActions: bindActionCreators(imagePickerActions, dispatch),
  })
)(EditProduct);
