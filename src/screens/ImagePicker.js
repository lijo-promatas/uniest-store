import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import {
  View,
  Image,
  TouchableOpacity,
  CameraRoll,
  FlatList,
  Dimensions,
  Alert,
  Platform,
  PermissionsAndroid,
} from 'react-native';
import { bindActionCreators } from 'redux';
import EStyleSheet from 'react-native-extended-stylesheet';

// Styles
import theme from '../config/theme';

// Actions
import * as imagePickerActions from '../actions/imagePickerActions';

// Components
import Icon from '../components/Icon';
import BottomActions from '../components/BottomActions';

import i18n from '../utils/i18n';

import {
  iconsMap,
  iconsLoaded,
} from '../utils/navIcons';

const styles = EStyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '$grayColor',
  },
  scrollContainer: {
    paddingBottom: 14,
  },
  imageWrapper: {
    position: 'relative',
  },
  selected: {
    position: 'absolute',
    top: 5,
    right: 5,
    backgroundColor: '#fff',
    borderRadius: 15,
  },
  selectedIcon: {
    color: '#0f70e2',
  }
});

const IMAGE_NUM_COLUMNS = 4;

/**
 * Renders image picker modal.
 *
 * @reactProps {object} imagePickerActions - Image picker actions.
 * @reactProps {object} navigator - Navigator.
 */
export class AddProductStep1 extends Component {
  /**
   * @ignore
   */
  static propTypes = {
    imagePickerActions: PropTypes.shape({
      clear: PropTypes.func,
      toggle: PropTypes.func,
    }),
    navigator: PropTypes.shape({
      setTitle: PropTypes.func,
      setButtons: PropTypes.func,
      push: PropTypes.func,
      setOnNavigatorEvent: PropTypes.func,
    }),
    selected: PropTypes.arrayOf(String)
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
      photos: [],
      after: null,
      hasMore: true,
      selected: [],
    };

    props.navigator.setTitle({
      title: i18n.t('Select product image').toUpperCase(),
    });

    props.navigator.setOnNavigatorEvent(this.onNavigatorEvent.bind(this));
  }

  /**
   * Loads icons. Sets selected photos to state.
   */
  componentWillMount() {
    const { navigator, selected } = this.props;
    iconsLoaded.then(() => {
      navigator.setButtons({
        leftButtons: [
          {
            id: 'close',
            icon: iconsMap.close,
          },
        ],
      });
    });
    this.setState({
      selected,
    }, () => this.getImages());
  }

  /**
   * ImagePicker modal navigation.
   *
   * @param {object} event - Information about the element on which the event occurred.
   */
  onNavigatorEvent(event) {
    const { navigator } = this.props;
    if (event.type === 'NavBarButtonPress') {
      if (event.id === 'close') {
        navigator.dismissModal();
      }
    }
  }

  /**
   * Gets permissions to phone photo gallery.
   */
  getImages = async () => {
    const { navigator } = this.props;
    const { photos, hasMore, after } = this.state;

    let granted = false;

    if (Platform.OS === 'android') {
      try {
        granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
          {
            title: i18n.t('Allow to access photos, media on your device?'),
            buttonNegative: i18n.t('Cancel'),
            buttonPositive: i18n.t('OK'),
          },
        );
        if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
          Alert.alert(i18n.t('Photo gallery permission denied'), [
            {
              text: i18n.t('OK'),
              onPress: () => {},
            },
          ]);
        }
      } catch (err) {
        Alert.alert(err);
      }

      if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
        navigator.dismissModal();
      }
    }

    if (!hasMore) {
      return;
    }

    try {
      const params = {
        first: 40,
        // batchSize: 5,
        assetType: 'Photos',
        groupTypes: 'All',
      };

      if (Platform.OS === 'android') {
        delete params.groupTypes;
      }

      if (after) {
        params.after = after;
      }

      const images = await CameraRoll.getPhotos(params);

      if (images) {
        const imagesUris = images.edges
          .filter(item => item.node.group_name !== 'Recently Added')
          .map(edge => edge.node.image.uri);

        this.setState({
          photos: [
            ...photos,
            ...imagesUris,
          ],
          hasMore: images.page_info.has_next_page,
          after: images.page_info.end_cursor,
        });
      }
    } catch (error) {
      console.log(error);
    }
  }

  /**
   * Adds image to selected.
   *
   * @param {object} image - Image information.
   */
  handleToggleImage = (image) => {
    const { selected } = this.state;
    let result = [...selected];

    if (selected.some(item => image.item === item)) {
      result = selected.filter(item => image.item !== item);
    } else {
      result.push(
        image.item,
      );
    }
    this.setState({
      selected: result,
    });
  }

  /**
   * Loads more images from phone photo gallery.
   */
  handleLoadMore = () => this.getImages();

  /**
   * Renders images.
   *
   * @param {object} image - Image information.
   *
   * @return {JSX.Element}
   */
  renderImage = (image) => {
    const { selected } = this.state;
    const isSelected = selected.some(item => item === image.item);
    const IMAGE_WIDTH = Dimensions.get('window').width / IMAGE_NUM_COLUMNS;

    return (
      <TouchableOpacity
        style={styles.imageWrapper}
        onPress={() => this.handleToggleImage(image)}
        key={image}
      >
        <Image
          style={{
            width: IMAGE_WIDTH,
            height: IMAGE_WIDTH,
          }}
          source={{ uri: image.item }}
        />
        {isSelected && (
          <View style={styles.selected}>
            <Icon name="check-circle" style={styles.selectedIcon} />
          </View>
        )}
      </TouchableOpacity>
    );
  }

  /**
   * Renders component
   *
   * @return {JSX.Element}
   */
  render() {
    const { navigator, imagePickerActions } = this.props;
    const { photos, selected } = this.state;
    return (
      <View style={styles.container}>
        <FlatList
          contentContainerStyle={styles.scrollContainer}
          data={photos}
          keyExtractor={item => item}
          numColumns={IMAGE_NUM_COLUMNS}
          renderItem={this.renderImage}
          onEndReachedThreshold={1}
          onEndReached={() => this.handleLoadMore()}
        />
        <BottomActions
          onBtnPress={() => {
            imagePickerActions.toggle(selected);
            navigator.dismissModal();
          }}
          btnText={i18n.t('Select')}
        />
      </View>
    );
  }
}

export default connect(
  state => ({
    selected: state.imagePicker.selected,
  }),
  dispatch => ({
    imagePickerActions: bindActionCreators(imagePickerActions, dispatch),
  })
)(AddProductStep1);
