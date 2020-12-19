import { Platform, AsyncStorage } from 'react-native';
import isDate from 'date-fns/is_date';
import format from 'date-fns/format';
import pickBy from 'lodash/pickBy';
import identity from 'lodash/identity';

import {
  AUTH_LOGIN_REQUEST,
  AUTH_LOGIN_SUCCESS,
  AUTH_LOGIN_FAIL,
  AUTH_RESET_STATE,

  AUTH_REGESTRATION_REQUEST,
  AUTH_REGESTRATION_SUCCESS,
  AUTH_REGESTRATION_FAIL,

  NOTIFICATION_SHOW,

  REGISTER_DEVICE_REQUEST,
  REGISTER_DEVICE_SUCCESS,
  REGISTER_DEVICE_FAIL,

  FETCH_PROFILE_FIELDS_REQUEST,
  FETCH_PROFILE_FIELDS_SUCCESS,
  FETCH_PROFILE_FIELDS_FAIL,

  FETCH_PROFILE_REQUEST,
  FETCH_PROFILE_SUCCESS,
  FETCH_PROFILE_FAIL,

  UPDATE_PROFILE_REQUEST,
  UPDATE_PROFILE_SUCCESS,
  UPDATE_PROFILE_FAIL,
  STORE_KEY,

  AUTH_LOGOUT,
} from '../constants';
import Api from '../services/api';
import i18n, { deviceLanguage } from '../utils/i18n';
import store from '../store';

import * as cartActions from './cartActions';
import * as layoutsActions from './layoutsActions';
import * as wishListActions from './wishListActions';

export function fetchProfile() {
  const params = {
    lang_code: deviceLanguage,
  };

  return (dispatch) => {
    dispatch({ type: FETCH_PROFILE_REQUEST });
    return Api.get('/sra_profile', { params })
      .then((response) => {
        dispatch({
          type: FETCH_PROFILE_SUCCESS,
          payload: {
            ...response.data,
          },
        });
        return response.data;
      })
      .catch((error) => {
        dispatch({
          type: FETCH_PROFILE_FAIL,
          payload: error,
        });
      });
  };
}

export function profileFields(data = {}) {
  const params = {
    location: 'profile',
    action: 'add',
    lang_code: deviceLanguage,
    ...data,
  };

  let method = '/sra_profile';
  if (params.location === 'profile' && params.action === 'add') {
    method = '/sra_profile_fields'; // at Registration.js app has not access to /sra_profile
  }

  return (dispatch) => {
    dispatch({ type: FETCH_PROFILE_FIELDS_REQUEST });
    return Api.get(method, { params })
      .then((response) => {
        dispatch({
          type: FETCH_PROFILE_FIELDS_SUCCESS,
          payload: {
            ...data,
            ...response.data,
          },
        });
        return response.data;
      })
      .catch((error) => {
        dispatch({
          type: FETCH_PROFILE_FIELDS_FAIL,
          payload: error,
        });
      });
  };
}

export function updateProfile(id, params) {
  const data = { ...params };
  Object.keys(data).forEach((key) => {
    if (isDate(data[key])) {
      data[key] = format(data[key], 'MM/DD/YYYY');
    }
  });

  data.b_address = data.s_address;
  data.b_address_2 = data.s_address_2;
  data.b_city = data.s_city;
  data.b_country = data.s_country;
  data.b_firstname = data.s_firstname;
  data.b_lastname = data.s_lastname;
  data.b_phone = data.s_phone;
  data.b_state = data.s_state;
  data.b_zipcode = data.s_zipcode;

  return (dispatch) => {
    dispatch({ type: UPDATE_PROFILE_REQUEST });
    return Api.put(`/sra_profile/${id}`, data)
      .then(() => {
        dispatch({
          type: UPDATE_PROFILE_SUCCESS,
          payload: {},
        });
        dispatch({
          type: NOTIFICATION_SHOW,
          payload: {
            type: 'success',
            title: i18n.t('Profile'),
            text: i18n.t('The profile data has been updated successfully'),
            closeLastModal: true,
          },
        });
      })
      .then(() => cartActions.fetch()(dispatch))
      .catch((error) => {
        dispatch({
          type: UPDATE_PROFILE_FAIL,
          payload: error,
        });
        dispatch({
          type: NOTIFICATION_SHOW,
          payload: {
            type: 'warning',
            title: i18n.t('Profile update fail'),
            text: error.response.data.message,
            closeLastModal: false,
          },
        });
      });
  };
}

export function createProfile(params) {
  let data = { ...params };
  Object.keys(data).forEach((key) => {
    if (isDate(data[key])) {
      data[key] = format(data[key], 'MM/DD/YYYY');
    }
  });

  // Remove all null and undefined values.
  data = pickBy(data, identity);

  return (dispatch) => {
    dispatch({ type: AUTH_REGESTRATION_REQUEST });
    return Api.post('/sra_profile', data)
      .then((response) => {
        dispatch({
          type: AUTH_REGESTRATION_SUCCESS,
          payload: {
            token: response.data.auth.token,
            ttl: response.data.auth.ttl,
            profile_id: response.data.profile_id,
            user_id: response.data.user_id,
          },
        });
        dispatch({
          type: NOTIFICATION_SHOW,
          payload: {
            type: 'success',
            title: i18n.t('Registration'),
            text: i18n.t('Registration complete.'),
            closeLastModal: true,
          },
        });
      })
      .then(() => cartActions.fetch()(dispatch))
      .catch((error) => {
        dispatch({
          type: AUTH_REGESTRATION_FAIL,
          payload: error,
        });
        dispatch({
          type: NOTIFICATION_SHOW,
          payload: {
            type: 'warning',
            title: i18n.t('Registration fail'),
            text: error.response.data.message,
            closeLastModal: false,
          },
        });
      });
  };
}

export function deviceInfo(data) {
  return (dispatch) => {
    dispatch({ type: REGISTER_DEVICE_REQUEST });
    return Api.post('/sra_notifications', data)
      .then((response) => {
        dispatch({
          type: REGISTER_DEVICE_SUCCESS,
          payload: {
            ...data,
            ...response.data,
          },
        });
      })
      .catch((error) => {
        dispatch({
          type: REGISTER_DEVICE_FAIL,
          payload: error,
        });
      });
  };
}

export function login(data) {
  return (dispatch) => {
    dispatch({ type: AUTH_LOGIN_REQUEST });

    return Api.post('/auth_tokens', data)
      .then((response) => {
        cartActions.fetch()(dispatch);
        wishListActions.fetch(false)(dispatch);
        dispatch({
          type: AUTH_LOGIN_SUCCESS,
          payload: response.data,
        });
        // Delay send refresh token.
        setTimeout(() => {
          const { auth } = store.getState();
          deviceInfo({
            token: auth.deviceToken,
            platform: Platform.OS,
            locale: deviceLanguage,
            device_id: auth.uuid,
          })(dispatch);
        }, 1000);
      })
      .then(() => fetchProfile()(dispatch))
      .then(() => layoutsActions.fetch()(dispatch))
      .catch((error) => {
        dispatch({
          type: AUTH_LOGIN_FAIL,
          payload: error.response.data,
        });
      });
  };
}

export function registration(token) {
  return (dispatch) => {
    dispatch({
      type: AUTH_REGESTRATION_SUCCESS,
      payload: {
        token,
        ttl: null,
      }
    });
    cartActions.fetch()(dispatch);
    dispatch({
      type: NOTIFICATION_SHOW,
      payload: {
        type: 'success',
        title: i18n.t('Registration'),
        text: i18n.t('Registration complete.'),
        closeLastModal: true,
      },
    });
  };
}

export function logout() {
  return (dispatch) => {
    dispatch({
      type: AUTH_LOGOUT,
    });

    AsyncStorage.removeItem(STORE_KEY);
  };
}

export function resetState() {
  return dispatch => dispatch({ type: AUTH_RESET_STATE });
}
