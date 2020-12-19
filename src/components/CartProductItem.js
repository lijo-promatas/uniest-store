import React from 'react';
import PropTypes from 'prop-types';
import {
  View,
  Text,
  Image,
} from 'react-native';
import EStyleSheet from 'react-native-extended-stylesheet';
import Swipeout from 'react-native-swipeout';
import { get } from 'lodash';

// Components
import QtyOption from './QtyOption';

// Links
import i18n from '../utils/i18n';
import { getImagePath, isPriceIncludesTax } from '../utils';

// Theme
import theme from '../config/theme';

// Styles
const styles = EStyleSheet.create({
  productItemWrapper: {
    marginBottom: 15,
  },
  productItem: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#F1F1F1',
    flexDirection: 'row',
    paddingBottom: 8,
    padding: 14,
    width: '100%',
    overflow: 'hidden',
  },
  productItemImage: {
    width: 100,
    height: 100,
    resizeMode: 'contain',
  },
  productItemDetail: {
    marginLeft: 14,
    marginRight: 14,
    width: '70%',
  },
  productItemName: {
    fontSize: '0.9rem',
    color: 'black',
    marginBottom: 5,
    textAlign: 'left',
    fontWeight: 'bold',
  },
  productItemPrice: {
    fontSize: '0.7rem',
    color: 'black',
    textAlign: 'left',
  },
  qtyContainer: {
    position: 'absolute',
    right: 14,
    bottom: 0,
  }
});

const CartProductItem = ({ cartActions, item }) => {
  const handleChangeAmountRequest = (item, amount) => {
    const newItem = { ...item, amount };
    cartActions.change(newItem.cartId, newItem);
  };

  const handleRemoveProduct = (product) => {
    cartActions.remove(product.cartId);
  };

  let productImage = null;
  const imageUri = getImagePath(item);

  if (imageUri) {
    productImage = (
      <Image
        source={{ uri: imageUri }}
        style={styles.productItemImage}
      />);
  }

  const swipeoutBtns = [
    {
      text: i18n.t('Delete'),
      type: 'delete',
      onPress: () => handleRemoveProduct(item),
    },
  ];

  const step = parseInt(item.qty_step, 10) || 1;
  const max = parseInt(item.max_qty, 10) || parseInt(item.in_stock, 10);
  const min = parseInt(item.min_qty, 10) || step;
  const initialValue = parseInt(item.amount, 10);

  const productTaxedPrice = get(item, 'base_price', '');
  const productPrice = productTaxedPrice || get(item, 'base_price', '');
  const showTaxedPrice = isPriceIncludesTax(item);

  return (
    <View style={styles.productItemWrapper}>
      <Swipeout
        autoClose
        right={swipeoutBtns}
        backgroundColor={theme.$navBarBackgroundColor}
      >
        <View style={styles.productItem}>
          {productImage}
          <View style={styles.productItemDetail}>
            <Text
              style={styles.productItemName}
              numberOfLines={1}
            >
              {item.product}
            </Text>
            <Text style={styles.productItemPrice}>
              {`${item.amount} x ${productPrice}`}
              {showTaxedPrice && (
                <Text style={styles.smallText}>
                  {` (${i18n.t('Including tax')})`}
                </Text>
              )}
            </Text>
          </View>
          <View style={styles.qtyContainer}>
            <QtyOption
              max={max}
              min={min}
              initialValue={initialValue}
              step={step}
              onChange={(val) => {
                if (val <= parseInt(item.in_stock, 10)) {
                  cartActions.changeAmount(item.cartId, val, item.company_id);
                  handleChangeAmountRequest(item, val);
                }
              }}
            />
          </View>
        </View>
      </Swipeout>
    </View>
  );
};

CartProductItem.propTypes = {
  cartActions: PropTypes.shape({}),
  item: PropTypes.shape({}),
};

export default CartProductItem;
