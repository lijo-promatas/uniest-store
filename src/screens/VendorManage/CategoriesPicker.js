import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import EStyleSheet from 'react-native-extended-stylesheet';

// Components
import Spinner from '../../components/Spinner';

// Styles
import theme from '../../config/theme';

// Action
import * as categoriesActions from '../../actions/vendorManage/categoriesActions';
import { getCategoriesList } from '../../services/vendors';

import i18n from '../../utils/i18n';

import {
  iconsMap,
  iconsLoaded,
} from '../../utils/navIcons';

const styles = EStyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '$grayColor',
  },
  scrollContainer: {
    paddingBottom: 14,
  },
  itemWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderBottomWidth: 1,
    borderColor: '#F0F0F0',
  },
  itemText: {
    paddingLeft: 14,
  },
  selectedIcon: {
    color: '#fff',
    marginRight: 10,
  }
});

class CategoriesPicker extends Component {
  static propTypes = {
    parent: PropTypes.number,
    categoriesActions: PropTypes.shape({
      toggleCategory: PropTypes.func,
      clear: PropTypes.func,
    }),
    categories: PropTypes.arrayOf(PropTypes.shape({})),
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

  static defaultProps = {
    categories: [],
  };

  constructor(props) {
    super(props);

    this.state = {
      loading: true,
      categories: [],
    };

    props.navigator.setOnNavigatorEvent(this.onNavigatorEvent.bind(this));
  }

  async componentWillMount() {
    const {
      categoriesActions,
      categories,
      parent,
      navigator,
    } = this.props;

    iconsLoaded.then(() => {
      navigator.setButtons({
        rightButtons: [
          {
            id: 'close',
            icon: iconsMap.close,
          },
        ],
      });
    });

    if (parent === 0) {
      categoriesActions.clear();
      this.handleLoadCategories();
      return;
    }

    this.setState({
      loading: false,
      categories,
    });
  }

  onNavigatorEvent(event) {
    const { navigator } = this.props;
    if (event.type === 'NavBarButtonPress') {
      if (event.id === 'close') {
        navigator.dismissModal();
      }
    }
  }

  handleLoadCategories = async (parent_id = 0, page = 1) => {
    this.setState({ loading: true });
    try {
      const response = await getCategoriesList(parent_id, page);
      if (response.data.categories) {
        this.setState({
          loading: false,
          categories: response.data.categories,
        });
      }
    } catch (error) {
      this.setState({ loading: false });
    }
  };

  handleToggle = async (item) => {
    const { categoriesActions, navigator, onCategoryPress } = this.props;
    try {
      const response = await getCategoriesList(item.category_id);
      if (response.data.categories.length) {
        navigator.push({
          screen: 'VendorManageCategoriesPicker',
          backButtonTitle: '',
          title: i18n.t(item.category).toUpperCase(),
          passProps: {
            parent: item.category_id,
            categories: response.data.categories,
            onCategoryPress,
          },
        });
        return;
      }

      categoriesActions.toggleCategory(item);

      if (onCategoryPress) {
        onCategoryPress(item);
        navigator.dismissModal();
        return;
      }

      navigator.push({
        screen: 'VendorManageAddProductStep1',
        animated: false,
        backButtonTitle: '',
        passProps: {
          category_ids: [item.category_id],
        }
      });
    } catch (error) {
      this.setState({ loading: false });
    }
  }

  handleLoadMore = () => {};

  renderEmptyList = () => (
    <Text style={styles.emptyList}>
      {i18n.t('There are no categories')}
    </Text>
  );

  renderCategoryItem = ({ item }) => (
    <TouchableOpacity
      style={styles.itemWrapper}
      onPress={() => this.handleToggle(item)}
    >
      <Text style={styles.itemText}>
        {item.category}
      </Text>
    </TouchableOpacity>
  );

  render() {
    const { categories, loading } = this.state;

    if (loading) {
      return (
        <Spinner visible />
      );
    }

    return (
      <View style={styles.container}>
        <FlatList
          contentContainerStyle={styles.scrollContainer}
          data={categories}
          keyExtractor={item => `${item.category_id}`}
          numColumns={1}
          renderItem={this.renderCategoryItem}
          onEndReachedThreshold={1}
          onEndReached={() => this.handleLoadMore()}
          ListEmptyComponent={() => this.renderEmptyList()}
        />
      </View>
    );
  }
}

export default connect(
  state => ({
    selected: state.vendorManageCategories.selected,
  }),
  dispatch => ({
    categoriesActions: bindActionCreators(categoriesActions, dispatch)
  })
)(CategoriesPicker);
