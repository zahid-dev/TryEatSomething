import React, {Component} from 'react';
import {
  StyleSheet,
  ActivityIndicator,
  Text,
  TouchableOpacity,
} from 'react-native';
import PropTypes from 'prop-types';
import {w, h, totalSize} from '../../api/Dimensions';

export default class GetStarted extends Component {
  render() {
    return (
      <TouchableOpacity
        onPress={this.props.click}
        style={styles.button}
        activeOpacity={0.6}>
        {this.props.isLogin ? (
          <ActivityIndicator
            size="large"
            style={styles.spinner}
            color="#000000"
          />
        ) : (
          <Text style={styles.text}>LOGIN</Text>
        )}
      </TouchableOpacity>
    );
  }
}

GetStarted.propTypes = {
  click: PropTypes.func.isRequired,
  isLogin: PropTypes.bool.isRequired,
};

const styles = StyleSheet.create({
  button: {
    width: '85%',
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: w(2),
    backgroundColor: '#fe7002',
    borderRadius: w(10),
    marginTop: h(8),
  },
  text: {
    color: '#ffffff',
    fontWeight: '700',
    paddingVertical: h(1),
    fontSize: totalSize(2.1),
  },
  spinner: {
    height: h(5),
  },
});
