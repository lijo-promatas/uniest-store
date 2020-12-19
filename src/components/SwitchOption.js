import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  View,
  Text,
  Switch,
} from 'react-native';
import EStyleSheet from 'react-native-extended-stylesheet';

const styles = EStyleSheet.create({
  container: {
    width: '100%',
    marginBottom: 14,
  },
  title: {
    fontSize: '0.9rem',
    fontWeight: 'bold',
    textAlign: 'left',
  },
  wrapper: {
    marginTop: 10,
  }
});

/**
 * Renders the option to switch product properties.
 *
 * @reactProps {object} value - Information about the initial value of the switch.
 * @reactProps {object} option - Information about the option and its variants.
 * @reactProps {function} onChange - Change function.
 */
export default class extends Component {
  /**
   * @ignore
   */
  static propTypes = {
    value: PropTypes.shape({}),
    option: PropTypes.shape({
      option_name: PropTypes.string,
    }),
    onChange: PropTypes.func,
  };

  static defaultProps = {
    onChange() {},
  };

  constructor(props) {
    super(props);

    this.state = {
      value: false,
      title: '',
    };
  }

  /**
   * Sets initial value to state.
   * Sets title.
   */
  componentDidMount() {
    const { value, option } = this.props;
    this.setState({
      value: value.variant_name === 'Yes',
      title: option.option_name,
    });
  }

  /**
   * Re-renders the component if new props are received.
   */
  componentWillReceiveProps(nextProps) {
    const { value, option } = nextProps;
    this.setState({
      value: value.variant_name === 'Yes',
      title: option.option_name,
    });
  }

  /**
   * Switches option value.
   *
   * @param {object} value -  Selected value.
   */
  handleChange(v) {
    const { option, onChange } = this.props;
    return onChange(option.variants[v ? 0 : 1]);
  }

  /**
   * Renders component
   *
   * @return {JSX.Element}
   */
  render() {
    const { value, title } = this.state;
    return (
      <View style={styles.container}>
        <Text style={styles.title}>{title}</Text>
        <View style={styles.wrapper}>
          <Switch
            value={value}
            onValueChange={v => this.handleChange(v)}
          />
        </View>
      </View>
    );
  }
}
