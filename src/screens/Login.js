import React, { Component } from 'react';
import PropTypes from 'prop-types';
var _ = require('lodash');
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { View, TouchableOpacity, Text, Image, ScrollView } from 'react-native';
import * as t from 'tcomb-form-native';
import EStyleSheet from 'react-native-extended-stylesheet';

// Import actions.
import * as authActions from '../actions/authActions';

// theme
import theme from '../config/theme';

// Components
import Spinner from '../components/Spinner';
import i18n from '../utils/i18n';

import { iconsMap, iconsLoaded } from '../utils/navIcons';

import config from '../config';

// clone the default stylesheet
const stylesheet = _.cloneDeep(t.form.Form.stylesheet);

// overriding the text field
stylesheet.textbox.normal.height = 45;
stylesheet.textbox.error.height = 45;
stylesheet.textbox.normal.paddingHorizontal = 20;
stylesheet.textbox.error.paddingHorizontal = 20;

const styles = EStyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: '#fff',
		// paddingHorizontal: 20,
	},
	btn: {
		alignSelf: 'flex-end',
		width: 150,
		backgroundColor: '#0091EA',
		padding: 10,
		borderRadius: 3,
	},
	btnText: {
		color: '#fff',
		fontSize: '1rem',
		textAlign: 'center',
	},
	btnRegistration: {
		marginBottom: 10,
		marginLeft: 10,
	},
	btnRegistrationText: {
		color: '$navBarBackgroundColor',
		fontSize: '0.8rem',
		textAlign: 'center',
		fontWeight: 'bold',
	},
	registerLayout: {
		flex: 1,
		flexDirection: 'row',
		justifyContent: 'center',
		marginTop: 30,
		marginBottom: 10,
	},
});

const Form = t.form.Form;
const FormFields = t.struct({
	email: t.String,
	password: t.String,
});

class Login extends Component {
	static navigatorStyle = {
		navBarBackgroundColor: theme.$navBarBackgroundColor,
		navBarButtonColor: theme.$navBarButtonColor,
		navBarButtonFontSize: theme.$navBarButtonFontSize,
		navBarTextColor: theme.$navBarTextColor,
		screenBackgroundColor: theme.$screenBackgroundColor,
	};

	static propTypes = {
		authActions: PropTypes.shape({
			login: PropTypes.func,
		}),
		navigator: PropTypes.shape({
			setOnNavigatorEvent: PropTypes.func,
			setTitle: PropTypes.func,
			setStyle: PropTypes.func,
			dismissModal: PropTypes.func,
			showInAppNotification: PropTypes.func,
			push: PropTypes.func,
		}),
		auth: PropTypes.shape({
			logged: PropTypes.bool,
			error: PropTypes.shape({}),
			fetching: PropTypes.bool,
		}),
	};

	constructor(props) {
		super(props);

		props.navigator.setOnNavigatorEvent(this.onNavigatorEvent.bind(this));
	}

	componentWillMount() {
		const { navigator } = this.props;
		navigator.setTitle({
			title: i18n.t('Login').toUpperCase(),
		});
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
	}

	componentWillReceiveProps(nextProps) {
		const { navigator } = this.props;
		if (nextProps.auth.logged) {
			setTimeout(() => navigator.dismissModal(), 1500);
		}
		if (nextProps.auth.error && !nextProps.auth.fetching) {
			navigator.showInAppNotification({
				screen: 'Notification',
				passProps: {
					type: 'warning',
					title: i18n.t('Error'),
					text: i18n.t('Wrong password.'),
				},
			});
		}
	}

	onNavigatorEvent(event) {
		const { navigator } = this.props;
		if (event.type === 'NavBarButtonPress') {
			if (event.id === 'close') {
				navigator.dismissModal();
			}
		}
	}

	handleLogin() {
		const { authActions } = this.props;
		const value = this.refs.form.getValue();
		if (value) {
			authActions.login(value);
		}
	}

	render() {
		const { auth, navigator } = this.props;
		const values = {};

		if (config.demo) {
			values.email = config.demoUsername;
			values.password = config.demoPassword;
		}

		const options = {
			disableOrder: true,
			fields: {
				email: {
					placeholder: i18n.t('Email'),
					keyboardType: 'email-address',
					clearButtonMode: 'while-editing',
					stylesheet: stylesheet,
				},
				password: {
					placeholder: i18n.t('Password'),
					secureTextEntry: true,
					clearButtonMode: 'while-editing',
					stylesheet: stylesheet,
				},
			},
		};

		return (
			<View style={styles.container}>
				<ScrollView>
					<View
						style={{
							height: 300,
							width: '100%',
							backgroundColor: '#0091EA',
							justifyContent: 'flex-start',
							alignItems: 'baseline',
						}}>
						<Image
							style={{
								height: 150,
								width: '50%',
								position: 'absolute',
								bottom: 100,
								left: 15,
							}}
							source={{
								uri:
									'https://uniest.s3.ap-south-1.amazonaws.com/undraw_shopping_app_flsj%403x.png',
							}}
						/>
					</View>
					<Text
						style={{
							fontWeight: 'bold',
							color: 'white',
							position: 'absolute',
							top: 10,
							right: 15,
							fontSize: 18,
						}}>
						Welcome to Uniest
					</Text>
					<Text
						style={{
							fontWeight: 'bold',
							color: 'white',
							position: 'absolute',
							top: 30,
							right: 15,
							fontSize: 15,
						}}>
						Sign in to continue
					</Text>
					<View
						style={{
							backgroundColor: 'white',
							borderRadius: 12,
							padding: 20,
							shadowColor: '#000',
							shadowOffset: {
								width: 0,
								height: 3,
							},
							shadowOpacity: 0.26,
							shadowRadius: 3,
							elevation: 5,
							marginTop: -80,
							marginHorizontal: 20,
							marginBottom: 20,
						}}>
						<Image
							resizeMode={'cover'}
							style={{
								height: 100,
								width: '50%',
								alignSelf: 'center',
								marginBottom: 15,
							}}
							source={{
								uri:
									'https://uniest.s3.ap-south-1.amazonaws.com/uniest_logo.png',
							}}
						/>
						<Form
							ref='form'
							type={FormFields}
							options={options}
							value={values}
						/>
						<TouchableOpacity
							style={styles.btn}
							onPress={() => this.handleLogin()}
							disabled={auth.fetching}>
							<Text style={styles.btnText}>
								{i18n.t('Login').toUpperCase()}
							</Text>
						</TouchableOpacity>
						<View style={styles.registerLayout}>
							<Text>Don't have an account?</Text>
							<TouchableOpacity
								activeOpacity={0.7}
								style={styles.btnRegistration}
								onPress={() =>
									navigator.push({
										screen: 'Registration',
										backButtonTitle: '',
									})
								}>
								<Text style={styles.btnRegistrationText}>
									{i18n.t('Create an Account')}
								</Text>
							</TouchableOpacity>
						</View>
					</View>
					<Spinner visible={auth.fetching} mode='modal' />
				</ScrollView>
			</View>
		);
	}
}

export default connect(
	(state) => ({
		auth: state.auth,
	}),
	(dispatch) => ({
		authActions: bindActionCreators(authActions, dispatch),
	})
)(Login);
