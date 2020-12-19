import {
  VENDOR_ORDERS_REQUEST,
  VENDOR_ORDERS_FAIL,
  VENDOR_ORDERS_SUCCESS,

  VENDOR_ORDER_REQUEST,
  VENDOR_ORDER_FAIL,
  VENDOR_ORDER_SUCCESS,

  VENDOR_ORDER_UPDATE_STATUS_REQUEST,
  VENDOR_ORDER_UPDATE_STATUS_FAIL,
  VENDOR_ORDER_UPDATE_STATUS_SUCCESS,

  NOTIFICATION_SHOW,
} from '../../constants';
import i18n from '../../utils/i18n';
import * as vendorService from '../../services/vendors';

export function fetch(page = 0) {
  return async (dispatch) => {
    dispatch({
      type: VENDOR_ORDERS_REQUEST,
      payload: page,
    });
    const nextPage = page + 1;

    try {
      const result = await vendorService.getOrdersList(nextPage);
      dispatch({
        type: VENDOR_ORDERS_SUCCESS,
        payload: {
          items: result.data.orders,
          page: nextPage,
          hasMore: result.data.orders.length !== 0,
        },
      });
    } catch (error) {
      dispatch({
        type: VENDOR_ORDERS_FAIL,
        error,
      });
    }
  };
}

export function fetchOrder(id) {
  return async (dispatch) => {
    dispatch({
      type: VENDOR_ORDER_REQUEST,
    });

    try {
      const result = await vendorService.getOrder(id);

      if (!result.data.order.order_id) {
        dispatch({
          type: NOTIFICATION_SHOW,
          payload: {
            type: 'info',
            title: i18n.t('Information'),
            text: i18n.t('Order not found.'),
            closeLastModal: false,
          },
        });
        return null;
      }

      dispatch({
        type: VENDOR_ORDER_SUCCESS,
        payload: result.data.order,
      });
    } catch (error) {
      dispatch({
        type: NOTIFICATION_SHOW,
        payload: {
          type: 'info',
          title: i18n.t('Error'),
          text: i18n.t(error.errors.join('\n')),
          closeLastModal: false,
        },
      });

      dispatch({
        type: VENDOR_ORDER_FAIL,
        error,
      });
    }
    return true;
  };
}

export function updateStatus(id, status) {
  return async (dispatch) => {
    dispatch({
      type: VENDOR_ORDER_UPDATE_STATUS_REQUEST,
    });

    try {
      const result = await vendorService.updateStatus(id, status);

      dispatch({
        type: VENDOR_ORDER_UPDATE_STATUS_SUCCESS,
        payload: {
          id,
          status,
        },
      });

      dispatch({
        type: NOTIFICATION_SHOW,
        payload: {
          type: 'success',
          title: i18n.t('Success'),
          text: i18n.t('Status has been changed.'),
          closeLastModal: false,
        },
      });
    } catch (error) {
      dispatch({
        type: NOTIFICATION_SHOW,
        payload: {
          type: 'info',
          title: i18n.t('Error'),
          text: i18n.t(error.errors.join('\n')),
          closeLastModal: false,
        },
      });

      dispatch({
        type: VENDOR_ORDER_UPDATE_STATUS_FAIL,
        error,
      });
    }
    return true;
  };
}
