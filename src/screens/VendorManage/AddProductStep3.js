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
import CheckoutSteps from '../../components/CheckoutSteps';
import BottomActions from '../../components/BottomActions';
import Spinner from '../../components/Spinner';
import { steps } from '../../services/vendors';

// Action
import * as productsActions from '../../actions/vendorManage/productsActions';
import * as imagePickerActions from '../../actions/imagePickerActions';

import i18n from '../../utils/i18n';
import theme from '../../config/theme';
import { registerDrawerDeepLinks } from '../../utils/deepLinks';

const styles = EStyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '$grayColor',
  },
  header: {
    marginLeft: 14,
    marginTop: 14,
  },
  scrollContainer: {
    paddingBottom: 14,
  },
});

const Form = t.form.Form;
const formFields = t.struct({
  price: t.Number,
  in_stock: t.Number,
  list_price: t.Number,
});
const formOptions = {
  disableOrder: true,
};

class AddProductStep4 extends Component {
  static propTypes = {
    stepsData: PropTypes.shape({}),
    productsActions: PropTypes.shape({}),
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

    this.state = {
      loading: false,
    };

    props.navigator.setTitle({
      title: i18n.t('Enter the price').toUpperCase(),
    });
    this.formRef = React.createRef();

    props.navigator.setOnNavigatorEvent(this.onNavigatorEvent.bind(this));
  }

  onNavigatorEvent(event) {
    const { navigator } = this.props;
    registerDrawerDeepLinks(event, navigator);
  }

  handleCreate = async () => {
    const {
      navigator,
      productsActions,
      stepsData,
      imagePickerActions,
    } = this.props;
    const values = this.formRef.current.getValue();

    if (values) {
      this.setState({ loading: true });

      try {
        const newProductID = await productsActions.createProduct({
          product: `${stepsData.name}`,
          price: values.price,
          list_price: values.list_price,
          category_ids: stepsData.category_ids,
          full_description: `${stepsData.description}`,
          amount: values.in_stock,
          images: stepsData.images,
        });

        if (newProductID) {
          imagePickerActions.clear();
          this.setState({ loading: false });
          navigator.push({
            screen: 'VendorManageEditProduct',
            backButtonTitle: '',
            passProps: {
              productID: newProductID,
              showClose: true,
            },
          });
        }
      } catch (error) {
        this.setState({ loading: false });
      }
    }
  };

  renderHeader = () => (
    <View style={styles.header}>
      <CheckoutSteps step={2} steps={steps} />
    </View>
  );

  render() {
    const { loading } = this.state;
    return (
      <View style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          {this.renderHeader()}
          <Section>
            <Form
              ref={this.formRef}
              type={formFields}
              options={formOptions}
            />
          </Section>
        </ScrollView>
        <BottomActions
          onBtnPress={this.handleCreate}
          btnText={i18n.t('Create')}
          disabled={loading}
        />
        <Spinner visible={loading} mode="modal" />
      </View>
    );
  }
}

export default connect(
  state => ({
    nav: state.nav,
  }),
  dispatch => ({
    imagePickerActions: bindActionCreators(imagePickerActions, dispatch),
    productsActions: bindActionCreators(productsActions, dispatch)
  })
)(AddProductStep4);
