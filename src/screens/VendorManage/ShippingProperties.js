import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import * as t from 'tcomb-form-native';
import {
  View,
  ScrollView,
} from 'react-native';
import EStyleSheet from 'react-native-extended-stylesheet';

// Components
import Section from '../../components/Section';
import BottomActions from '../../components/BottomActions';

// Actions
import * as productsActions from '../../actions/vendorManage/productsActions';

import i18n from '../../utils/i18n';
import theme from '../../config/theme';
import { registerDrawerDeepLinks } from '../../utils/deepLinks';

const styles = EStyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '$grayColor',
  },
  scrollContainer: {
    paddingBottom: 14,
  },
});

const Form = t.form.Form;
const formFields = t.struct({
  weight: t.Number,
  free_shipping: t.Boolean,
});
const formOptions = {
  disableOrder: true,
  fields: {
    weight: {
      label: i18n.t('Weight (lbs)'),
    },
    free_shipping: {
      label: i18n.t('Free shipping'),
    },
  }
};

class ShippingProperties extends Component {
  static propTypes = {
    values: PropTypes.shape({}),
    navigator: PropTypes.shape({
      setTitle: PropTypes.func,
      setButtons: PropTypes.func,
      push: PropTypes.func,
      setOnNavigatorEvent: PropTypes.func,
    }),
    productsActions: PropTypes.shape({}),
    product: PropTypes.shape({}),
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

    props.navigator.setTitle({
      title: i18n.t('Shipping Properties').toUpperCase(),
    });

    this.formRef = React.createRef();
    props.navigator.setOnNavigatorEvent(this.onNavigatorEvent.bind(this));
  }

  onNavigatorEvent(event) {
    const { navigator } = this.props;
    registerDrawerDeepLinks(event, navigator);
  }

  handleSave = () => {
    const { product, productsActions } = this.props;
    const values = this.formRef.current.getValue();

    if (!values) { return; }

    productsActions.updateProduct(
      product.product_id,
      { ...values }
    );
  };

  render() {
    const { product } = this.props;

    return (
      <View style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <Section>
            <Form
              ref={this.formRef}
              type={formFields}
              options={formOptions}
              value={product}
            />
          </Section>
        </ScrollView>
        <BottomActions onBtnPress={this.handleSave} />
      </View>
    );
  }
}

export default connect(
  state => ({
    product: state.vendorManageProducts.current,
  }),
  dispatch => ({
    productsActions: bindActionCreators(productsActions, dispatch),
  })
)(ShippingProperties);
