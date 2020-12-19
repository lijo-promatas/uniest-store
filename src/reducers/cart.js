import {
  CART_SUCCESS,
  CART_FAIL,

  CART_CONTENT_SUCCESS,
  CART_CONTENT_SAVE_REQUEST,
  CART_CONTENT_SAVE_SUCCESS,
  CART_CONTENT_SAVE_FAIL,

  ADD_TO_CART_REQUEST,
  ADD_TO_CART_SUCCESS,
  ADD_TO_CART_FAIL,

  CART_CLEAR_REQUEST,
  CART_CLEAR_SUCCESS,
  CART_CLEAR_FAIL,

  CART_RECALCULATE_SUCCESS,

  CART_ADD_COUPON_CODE,
  CART_REMOVE_COUPON_CODE,

  CHANGE_AMOUNT,
  AUTH_LOGOUT,

  RESTORE_STATE,

  CART_LOADING,
  CART_LOADED
} from '../constants';

const initialState = {
  amount: 0,
  products: [],
  ids: [],
  fetching: false,
  user_data: {},
  coupons: [],
  vendorCarts: [],
  isSeparateCart: null,
  carts: {}
};

let newProducts = [];
let newState = {};

export default function (state = initialState, action) {
  switch (action.type) {
    case CART_LOADING:
      return {
        ...state,
        fetching: true
      };

    case CART_LOADED:
      return {
        ...state,
        fetching: false
      };

    case RESTORE_STATE:
      return {
        ...state,
        ...action.payload.cart,
      };

    case ADD_TO_CART_REQUEST:
      return {
        ...state,
        fetching: true,
      };

    case ADD_TO_CART_SUCCESS:
      return {
        ...state,
        fetching: false,
      };

    case ADD_TO_CART_FAIL:
      return {
        ...state,
        fetching: false,
      };

    case CART_SUCCESS:
      return {
        ...state,
        carts: action.payload.carts,
        isSeparateCart: action.payload.isSeparateCart,
        coupons: [],
      };

    case CART_FAIL:
      return {
        ...state,
        fetching: false,
      };

    case CART_CLEAR_REQUEST:
      return {
        ...state,
        fetching: true,
      };

    case CART_CLEAR_SUCCESS:
      return {
        ...state,
        carts: {},
        fetching: false,
      };

    case CART_CLEAR_FAIL:
      return {
        ...state,
        fetching: false,
      };

    case CART_CONTENT_SUCCESS:
      return {
        ...state,
        user_data: action.payload.user_data,
        fetching: false,
      };

    case CART_CONTENT_SAVE_REQUEST:
    case CART_CONTENT_SAVE_FAIL:
      return {
        ...state,
        fetching: true,
      };

    case CART_CONTENT_SAVE_SUCCESS:
      return {
        ...state,
        user_data: {
          ...state.user_data,
          ...action.payload,
        },
      };

    case CART_RECALCULATE_SUCCESS:
      return {
        ...state,
        total: action.payload.total,
        total_formatted: action.payload.total_formatted,
        subtotal: action.payload.total_formatted,
        subtotal_formatted: action.payload.subtotal_formatted,
        coupons: Object.keys(action.payload.coupons).map(k => k),
      };

    case AUTH_LOGOUT:
      return initialState;

    case CHANGE_AMOUNT:
      newState = JSON.parse(JSON.stringify(state.carts));

      if (state.carts.general) {
        newProducts = JSON.parse(JSON.stringify(state.carts.general.products));
        newProducts[action.payload.cid].amount = action.payload.amount;
        newState.general.products = newProducts;
      } else {
        newProducts = JSON.parse(JSON.stringify(state.carts[action.payload.id].products));
        newProducts[action.payload.cid].amount = action.payload.amount;
        newState[action.payload.id].products = newProducts;
      }

      return {
        ...state,
        carts: newState,
        fetching: false
      };

    case CART_ADD_COUPON_CODE:
      return {
        ...state,
        coupons: [
          ...state.coupons,
          action.payload,
        ],
      };

    case CART_REMOVE_COUPON_CODE:
      return {
        ...state,
        coupons: [...state.coupons].filter(item => item !== action.payload),
      };

    default:
      return state;
  }
}
