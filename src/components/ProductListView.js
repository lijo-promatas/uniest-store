import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import toInteger from 'lodash/toInteger';
import get from 'lodash/get';
import EStyleSheet from 'react-native-extended-stylesheet';
import Rating from './Rating';
import { PRODUCT_IMAGE_WIDTH, formatPrice, getImagePath } from '../utils';
import i18n from '../utils/i18n';

const styles = EStyleSheet.create({
	container: {
		height: 220,
		borderWidth: 1,
		borderColor: '$productBorderColor',
		backgroundColor: '#fff',
		padding: 15,
		margin: 5,
		flexDirection: 'column',
		justifyContent: 'flex-start',
		alignItems: 'flex-start',
		flex: 2,
		maxWidth: '50%',
		shadowColor: '#000',
		shadowOffset: {
			width: 0,
			height: 1,
		},
		shadowOpacity: 0.25,
		shadowRadius: 0.84,
		elevation: 1,
	},
	productImage: {
		width: PRODUCT_IMAGE_WIDTH,
		height: PRODUCT_IMAGE_WIDTH,
	},
	description: {
		paddingTop: 8,
		paddingBottom: 8,
	},
	productName: {
		color: 'black',
		// fontWeight: 'bold',
		fontSize: 12,
		marginBottom: 3,
		textAlign: 'left',
	},
	productPrice: {
		// color: '#73626B',
		color: 'tomato',
		fontWeight: 'bold',
		textAlign: 'left',
	},
	listDiscountWrapper: {
		// backgroundColor: '$productDiscountColor',
		backgroundColor: '#32bbfa',
		position: 'absolute',
		top: 4,
		right: 4,
		paddingTop: 2,
		paddingBottom: 2,
		paddingLeft: 4,
		paddingRight: 4,
		borderRadius: 2,
	},
	priceWrapper: {
		flex: 1,
		flexDirection: 'row',
	},
	listPriceText: {
		textDecorationLine: 'line-through',
		color: '$darkColor',
		textAlign: 'left',
		paddingRight: 4,
		paddingTop: 2,
		fontSize: 12,
	},
	listDiscountText: {
		color: '#fff',
		textAlign: 'left',
		fontSize: 11,
	},
	rating: {
		marginLeft: -10,
		marginRight: -10,
		marginTop: 0,
	},
});

/**
 * Renders a product card.
 *
 * @reactProps {object} product - Product information.
 * @reactProps {function} onPress - Opens product screen.
 */
class ProductListView extends PureComponent {
	/**
	 * @ignore
	 */
	static propTypes = {
		product: PropTypes.shape({
			item: PropTypes.object,
		}),
		onPress: PropTypes.func,
	};

	/**
	 * Renders discount.
	 *
	 * @return {JSX.Element}
	 */
	renderDiscount = () => {
		const { product } = this.props;
		const { item } = product;

		if (!item.list_discount_prc && !item.discount_prc) {
			return null;
		}

		const discount = item.list_discount_prc || item.discount_prc;

		return (
			<View style={styles.listDiscountWrapper}>
				<Text style={styles.listDiscountText}>
					{`${discount}%`} {i18n.t('Off')}
				</Text>
			</View>
		);
	};

	/**
	 * Renders price.
	 *
	 * @return {JSX.Element}
	 */
	renderPrice = () => {
		const { product } = this.props;
		const { item } = product;
		const productTaxedPrice = get(item, 'taxed_price_formatted.price', '');
		const productPrice =
			productTaxedPrice || get(item, 'price_formatted.price', product.price);
		let discountPrice = null;

		if (toInteger(item.discount_prc)) {
			discountPrice = item.base_price_formatted.price;
		} else if (toInteger(item.list_price)) {
			discountPrice = item.list_price_formatted.price;
		}

		const isProductPriceZero = Math.ceil(item.price) === 0;
		const showDiscount =
			isProductPriceZero && (item.discount_prc || item.list_discount_prc);

		return (
			<View style={styles.priceWrapper}>
				{showDiscount && (
					<Text style={styles.listPriceText}>{discountPrice}</Text>
				)}
				{isProductPriceZero ? (
					<Text>{i18n.t('Contact us for a price')}</Text>
				) : (
					<Text numberOfLines={2} style={styles.productPrice}>
						{formatPrice(productPrice)}
					</Text>
				)}
			</View>
		);
	};

	/**
	 * Renders rating.
	 *
	 * @return {JSX.Element}
	 */
	renderRating = () => {
		const {
			product: { item },
		} = this.props;
		return (
			<Rating containerStyle={styles.rating} value={item.average_rating} />
		);
	};

	/**
	 * Renders component
	 *
	 * @return {JSX.Element}
	 */
	render() {
		const { product, onPress } = this.props;
		const { item } = product;
		const imageUri = getImagePath(item);

		return (
			<TouchableOpacity
				activeOpacity={0.7}
				style={styles.container}
				onPress={() => onPress(item)}>
				<View>
					{imageUri !== null && (
						<Image
							style={styles.productImage}
							source={{ uri: imageUri }}
							resizeMode='contain'
							resizeMethod='resize'
						/>
					)}
				</View>
				{this.renderDiscount()}
				<View style={styles.description}>
					<Text numberOfLines={2} style={styles.productName}>
						{item.product}
					</Text>
					{this.renderRating()}
					{this.renderPrice()}
				</View>
			</TouchableOpacity>
		);
	}
}

export default ProductListView;
