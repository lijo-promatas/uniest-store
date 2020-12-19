import {
  VENDOR_ORDERS_FAIL,
  VENDOR_ORDERS_SUCCESS,

  VENDOR_ORDER_REQUEST,
  VENDOR_ORDER_FAIL,
  VENDOR_ORDER_SUCCESS,

  VENDOR_ORDER_UPDATE_STATUS_SUCCESS,
} from '../../constants';

const initialState = {
  items: [],
  loading: true,
  hasMore: true,
  page: 0,
  loadingCurrent: true,
  current: {},
};

let items = [];
let index = 0;

export default function (state = initialState, action) {
  switch (action.type) {
    case VENDOR_ORDERS_FAIL:
      return {
        ...state,
        loading: false,
        ...action.payload,
      };

    case VENDOR_ORDERS_SUCCESS:
      return {
        ...state,
        loading: false,
        hasMore: action.payload.hasMore,
        page: action.payload.page,
        items: action.payload.page === 1
          ? action.payload.items
          : [...state.items, ...action.payload.items],
      };

    case VENDOR_ORDER_REQUEST:
      return {
        ...state,
        loadingCurrent: true,
      };

    case VENDOR_ORDER_SUCCESS:
      return {
        ...state,
        loadingCurrent: false,
        current: action.payload,
      };

    case VENDOR_ORDER_FAIL:
      return {
        ...state,
        loadingCurrent: false,
      };

    case VENDOR_ORDER_UPDATE_STATUS_SUCCESS:
      items = [
        ...state.items,
      ];
      index = items.findIndex(item => item.order_id === action.payload.id) || 0;
      items[index].status = action.payload.status;

      return {
        ...state,
        items,
        current: action.payload.status,
      };

    default:
      return state;
  }
}
