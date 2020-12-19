import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { uniqueId } from 'lodash';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  FlatList,
  Dimensions,
} from 'react-native';
import EStyleSheet from 'react-native-extended-stylesheet';

// Styles
import theme from '../../config/theme';

// Components
import CheckoutSteps from '../../components/CheckoutSteps';
import Section from '../../components/Section';
import BottomActions from '../../components/BottomActions';

import * as imagePickerActions from '../../actions/imagePickerActions';

import { steps } from '../../services/vendors';

import i18n from '../../utils/i18n';
import { registerDrawerDeepLinks } from '../../utils/deepLinks';


const styles = EStyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '$grayColor',
  },
  scrollContainer: {
    paddingBottom: 14,
  },
  emptyList: {
    textAlign: 'center',
  },
  header: {
    marginLeft: 14,
    marginTop: 14,
  },
  imageWrapper: {
    position: 'relative',
  },
  containerStyle: {
    marginTop: 0,
    marginBottom: 22,
  },
  sectionText: {
    color: '$primaryColor',
  }
});

const IMAGE_NUM_COLUMNS = 4;

class AddProductStep1 extends Component {
  static propTypes = {
    images: PropTypes.arrayOf(PropTypes.string),
    navigator: PropTypes.shape({
      setTitle: PropTypes.func,
      setButtons: PropTypes.func,
      push: PropTypes.func,
      setOnNavigatorEvent: PropTypes.func,
    }),
    imagePickerActions: PropTypes.shape({
      clear: PropTypes.func,
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

    props.navigator.setTitle({
      title: i18n.t('Select product image').toUpperCase(),
    });

    props.navigator.setOnNavigatorEvent(this.onNavigatorEvent.bind(this));
  }

  componentDidMount() {
    const { imagePickerActions } = this.props;
    imagePickerActions.clear();
  }

  onNavigatorEvent(event) {
    const { navigator } = this.props;
    registerDrawerDeepLinks(event, navigator);
    if (event.type === 'NavBarButtonPress') {
      if (event.id === 'sideMenu') {
        navigator.toggleDrawer({ side: 'left' });
      }
    }
  }

  handleGoNext = () => {
    const { navigator, images, category_ids } = this.props;

    navigator.push({
      screen: 'VendorManageAddProductStep2',
      backButtonTitle: '',
      passProps: {
        stepsData: {
          images,
          category_ids,
        },
      },
    });
  }

  handleRemoveImage = (imageIndex) => {
    const { imagePickerActions, navigator, images } = this.props;
    const newImages = [
      ...images,
    ];
    newImages.splice(imageIndex, 1);
    imagePickerActions.toggle(newImages);
    navigator.dismissModal();
  }

  renderHeader = () => {
    const { navigator } = this.props;
    return (
      <View>
        <View style={styles.header}>
          <CheckoutSteps step={0} steps={steps} />
        </View>
        <Section containerStyle={styles.containerStyle}>
          <TouchableOpacity
            onPress={() => {
              navigator.showModal({
                screen: 'ImagePicker',
                passProps: {},
              });
            }}
          >
            <Text style={styles.sectionText}>
              {i18n.t('Select image')}
            </Text>
          </TouchableOpacity>
        </Section>
      </View>
    );
  };

  renderEmptyList = () => (
    <Text style={styles.emptyList}>
      {i18n.t('There are no images')}
    </Text>
  );

  renderImage = (image) => {
    const { navigator } = this.props;
    const IMAGE_WIDTH = Dimensions.get('window').width / IMAGE_NUM_COLUMNS;

    return (
      <TouchableOpacity
        style={styles.imageWrapper}
        key={uniqueId('image-')}
        onPress={() => {
          navigator.showModal({
            screen: 'Gallery',
            animationType: 'fade',
            passProps: {
              images: [image.item],
              activeIndex: 1,
              onRemove: () => this.handleRemoveImage(image.index),
            },
          });
        }}
      >
        <Image
          style={{
            width: IMAGE_WIDTH,
            height: IMAGE_WIDTH,
          }}
          source={{ uri: image.item }}
        />
      </TouchableOpacity>
    );
  }

  render() {
    const { images } = this.props;
    return (
      <View style={styles.container}>
        <FlatList
          contentContainerStyle={styles.scrollContainer}
          data={images}
          keyExtractor={item => item}
          ListHeaderComponent={() => this.renderHeader()}
          numColumns={IMAGE_NUM_COLUMNS}
          renderItem={this.renderImage}
          ListEmptyComponent={() => this.renderEmptyList()}
        />
        <BottomActions
          onBtnPress={this.handleGoNext}
          btnText={i18n.t('Next')}
        />
      </View>
    );
  }
}

export default connect(
  state => ({
    images: state.imagePicker.selected,
  }),
  dispatch => ({
    imagePickerActions: bindActionCreators(imagePickerActions, dispatch),
  })
)(AddProductStep1);
