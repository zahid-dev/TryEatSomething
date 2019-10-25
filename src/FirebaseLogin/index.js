import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {KeyboardAvoidingView, StyleSheet, ImageBackground, View} from 'react-native';
import Login from './screens/Login';
import Register from './screens/Register';
import ForgotPassword from './screens/ForgotPassword';
import {w} from './api/Dimensions';

export default class FirebaseLogin extends Component {
  state = {
    currentScreen: 'login', // can be: 'login' or 'register' or 'forgot'
  };

  changeScreen = screenName => () => {
    this.setState({currentScreen: screenName});
  };

  userSuccessfullyLoggedIn = user => {
    this.props.login(user);
  };

  render() {
    let screenToShow;

    switch (this.state.currentScreen) {
      case 'login':
        screenToShow = (
          <Login
            change={this.changeScreen}
            success={this.userSuccessfullyLoggedIn}
          />
        );
        break;
      case 'register':
        screenToShow = <Register change={this.changeScreen} />;
        break;
      case 'forgot':
        screenToShow = <ForgotPassword change={this.changeScreen} />;
        break;
    }

    return (
      <View style={styles.container}>
        <ImageBackground
          source={this.props.background}
          style={styles.background}
          resizeMode="stretch">
          {screenToShow}
        </ImageBackground>
      </View>
    );
  }
}

FirebaseLogin.propTypes = {
  login: PropTypes.func.isRequired,
};

FirebaseLogin.defaultProps = {
  background: null,
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  background: {
    width: '100%',
    height: '100%',
  },
});
