import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { View, Alert } from 'react-native';
import EStyleSheet from 'react-native-extended-stylesheet';

// Import actions.
import * as cartActions from '../actions/cartActions';

// Components
import Spinner from '../components/Spinner';
import VendorsCartsList from '../components/VendorsCartsList';
import CartProductList from '../components/CartProductList';

// theme
import theme from '../config/theme';

// links
import { registerDrawerDeepLinks } from '../utils/deepLinks';
import i18n from '../utils/i18n';

import { iconsMap, iconsLoaded } from '../utils/navIcons';
import cart from '../reducers/cart';

// Styles
const styles = EStyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: '#FAFAFA',
	},
	topBtn: {
		padding: 10,
	},
	trashIcon: {
		height: 20,
		fontSize: 20,
	},
});

/**
 * Renders the cart modal.
 *
 * @reactProps {object} navigator - Navigator.
 * @reactProps {object} cartActions - Cart actions.
 * @reactProps {object} auth - Authorization information.
 * @reactProps {object} cart - Cart information.
 */
export class Cart extends Component {
	static navigatorStyle = {
		navBarBackgroundColor: theme.$navBarBackgroundColor,
		navBarButtonColor: theme.$navBarButtonColor,
		navBarButtonFontSize: theme.$navBarButtonFontSize,
		navBarTextColor: theme.$navBarTextColor,
		screenBackgroundColor: theme.$screenBackgroundColor,
	};

	/**
	 * @ignore
	 */
	static propTypes = {
		navigator: PropTypes.shape({
			push: PropTypes.func,
			dismissModal: PropTypes.func,
			setOnNavigatorEvent: PropTypes.func,
		}),
		cartActions: PropTypes.shape({
			fetch: PropTypes.func,
			clear: PropTypes.func,
			remove: PropTypes.func,
			change: PropTypes.func,
			changeAmount: PropTypes.func,
		}),
		auth: PropTypes.shape({
			token: PropTypes.string,
		}),
		cart: PropTypes.shape({}),
		vendorCarts: PropTypes.shape({}),
	};

	constructor(props) {
		super(props);

		this.state = {
			fetching: true,
			refreshing: false,
		};
		props.navigator.setOnNavigatorEvent(this.onNavigatorEvent.bind(this));
	}

	/**
	 * Preloading icons. Sets title.
	 */
	componentWillMount() {
		const { navigator } = this.props;
		iconsLoaded.then(() => {
			navigator.setButtons({
				leftButtons: [
					{
						id: 'close',
						icon: iconsMap.close,
					},
				],
				rightButtons: [
					{
						id: 'clearCart',
						icon: iconsMap.delete,
					},
				],
			});
		});

		navigator.setTitle({
			title: i18n.t('Cart').toUpperCase(),
		});
	}

	/**
	 * Gets cart data.
	 */
	async componentDidMount() {
		const { cartActions } = this.props;
		await cartActions.fetch();
	}

	/**
	 * Updates the number of products in the state.
	 *
	 * @param {object} nextProps - Incoming props.
	 */
	componentWillReceiveProps(nextProps) {
		const { cart } = nextProps;

		if (cart.fetching) {
			return;
		}

		this.setState({
			fetching: false,
			refreshing: false,
		});
	}

	/**
	 * Cart modal navigation.
	 *
	 * @param {object} event - Information about the element on which the event occurred.
	 */
	onNavigatorEvent(event) {
		const { navigator, cartActions } = this.props;
		// handle a deep link
		registerDrawerDeepLinks(event, navigator);
		if (event.type === 'NavBarButtonPress') {
			if (event.id === 'close') {
				navigator.dismissModal();
			} else if (event.id === 'clearCart') {
				Alert.alert(
					i18n.t('Clear all cart ?'),
					'',
					[
						{
							text: i18n.t('Cancel'),
							onPress: () => {},
							style: 'cancel',
						},
						{
							text: i18n.t('Ok'),
							onPress: () => cartActions.clear(),
						},
					],
					{ cancelable: true }
				);
			}
		}
	}

	/**
	 * Refresh cart data.
	 */
	handleRefresh() {
		const { cartActions } = this.props;
		this.setState({ refreshing: true }, () => cartActions.fetch());
	}

	/**
	 * Renders a list of products.
	 *
	 * @return {JSX.Element}
	 */
	renderList() {
		const { refreshing, fetching } = this.state;
		const { cartActions, cart, auth, navigator } = this.props;

		if (fetching) {
			return this.renderSpinner();
		}

		return (
			<CartProductList
				cart={cart.carts.general}
				auth={auth}
				navigator={navigator}
				handleRefresh={this.handleRefresh}
				refreshing={refreshing}
				cartActions={cartActions}
			/>
		);
	}

	/**
	 * Renders a list of vendor carts.
	 *
	 * @return {JSX.Element}
	 */
	renderVendorsList = () => {
		const { fetching, refreshing } = this.state;
		const { cartActions, auth, navigator, cart } = this.props;

		if (fetching) {
			return this.renderSpinner();
		}

		const newCarts = Object.keys(cart.carts).reduce((result, el) => {
			if (el !== 'general') {
				result.push(cart.carts[el]);
			}
			return result;
		}, []);

		return (
			<VendorsCartsList
				carts={newCarts}
				auth={auth}
				navigator={navigator}
				handleRefresh={this.handleRefresh}
				refreshing={refreshing}
				cartActions={cartActions}
			/>
		);
	};

	/**
	 * Renders spinner.
	 *
	 * @return {JSX.Element}
	 */
	renderSpinner = () => {
		const { refreshing } = this.state;
		const { cart } = this.props;

		if (refreshing || !Object.keys(cart.carts).length) {
			return false;
		}

		return <Spinner visible={cart.fetching} />;
	};

	/**
	 * Renders component
	 *
	 * @return {JSX.Element}
	 */
	render() {
		const { cart } = this.props;
		return (
			<View style={styles.container}>
				{cart.isSeparateCart ? this.renderVendorsList() : this.renderList()}
			</View>
		);
	}
}

export default connect(
	(state) => ({
		auth: state.auth,
		cart: state.cart,
	}),
	(dispatch) => ({
		cartActions: bindActionCreators(cartActions, dispatch),
	})
)(Cart);
