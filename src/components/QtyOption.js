import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  View,
  Text,
  TouchableOpacity,
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
  },
  btnGroup: {
    alignItems: 'center',
    flexDirection: 'row',
    marginTop: 15,
  },
  btn: {
    backgroundColor: '#EBEBEB',
    borderRadius: 20,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnText: {
    backgroundColor: 'transparent',
    color: '#989898',
    fontSize: '1.4rem',
    marginTop: -4,
    marginRight: -1,
  },
  valueText: {
    color: '#989898',
    fontSize: '1rem',
    fontWeight: 'bold',
    width: 36,
    textAlign: 'center',
  }
});

/**
 * Renders the option to select the quantity of products.
 *
 * @reactProps {number} step - Quantity change step.
 * @reactProps {number} min - Minimum order quantity.
 * @reactProps {number} initialValue - The initial quantity of items in the cart.
 * @reactProps {number} max - Maximum order quantity.
 * @reactProps {function} oChange - Changes the quantity of products.
 */
export default class extends Component {
  /**
   * @ignore
   */
  static propTypes = {
    step: PropTypes.number,
    min: PropTypes.number,
    initialValue: PropTypes.number,
    max: PropTypes.number,
    onChange: PropTypes.func,
  };

  static defaultProps = {
    step: 1,
    min: 1,
    max: 1,
    initialValue: 1,
    onChange() {},
  };

  state = {
    total: 1,
  };

  /**
   * Sets the initial quantity of items in the cart.
   */
  componentDidMount() {
    const { initialValue } = this.props;
    this.setState({
      total: initialValue,
    });
  }

  /**
   * Increases the quantity of products.
   */
  increment = () => {
    const { total } = this.state;
    const { step, onChange, max } = this.props;
    const newTotal = total + step;

    if (max !== 1 && newTotal > max) {
      return;
    }

    this.setState({
      total: newTotal,
    });
    onChange(newTotal);
  }

  /**
   * Reduces the quantity of products.
   */
  dicrement = () => {
    const { total } = this.state;
    const { step, onChange, min } = this.props;
    const newTotal = total - step;

    if (min !== 0 && newTotal < min) {
      return;
    }

    this.setState({
      total: newTotal,
    });
    onChange(newTotal);
  }

  /**
   * Renders component
   *
   * @return {JSX.Element}
   */
  render() {
    const { total } = this.state;

    return (
      <View style={styles.container}>
        <View style={styles.btnGroup}>
          <TouchableOpacity
            style={styles.btn}
            onPress={this.dicrement}
          >
            <Text style={styles.btnText}>-</Text>
          </TouchableOpacity>
          <Text style={styles.valueText}>
            {total}
          </Text>
          <TouchableOpacity
            style={styles.btn}
            onPress={this.increment}
          >
            <Text style={styles.btnText}>+</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }
}
