import {
  FETCH_ONE_PRODUCT_REQUEST,
  FETCH_ONE_PRODUCT_FAIL,
  FETCH_ONE_PRODUCT_SUCCESS,

  RECALCULATE_PRODUCT_PRICE_SUCCESS,

  CHANGE_PRODUCTS_AMOUNT,
} from '../constants';

const initialState = {
  fetching: true,
  amount: 1,
  options: [],
  price_formatted: {
    price: '',
  },
  list_price_formatted: {
    price: '',
  },
  taxed_price_formatted: {
    price: '',
  }
};

export default function (state = initialState, action) {
  switch (action.type) {
    case FETCH_ONE_PRODUCT_REQUEST:
      return {
        ...state,
        fetching: true,
        options: [],
        list_discount_prc: 0,
        amount: 1,
        qty_step: 1,
        selectedAmount: 1,
        discount_prc: 0,
        discount: null,
      };

    case FETCH_ONE_PRODUCT_SUCCESS:
    case RECALCULATE_PRODUCT_PRICE_SUCCESS:
      return {
        ...initialState,
        ...action.payload.product,
        options: Object.keys(action.payload.product.product_options)
          .map(k => action.payload.product.product_options[k]),
        fetching: false,
        qty_step: parseInt(action.payload.product.qty_step, 10) || 1,
        amount: parseInt(action.payload.product.amount, 10) || 0,
        selectedAmount: parseInt(action.payload.product.qty_step, 10) || 1,
      };

    case FETCH_ONE_PRODUCT_FAIL:
      return {
        ...state,
        fetching: false,
      };

    case CHANGE_PRODUCTS_AMOUNT:
      return {
        ...state,
        selectedAmount: action.payload,
      };

    default:
      return state;
  }
}
