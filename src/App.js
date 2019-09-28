import React, {Component} from 'react';
import {
  StyleSheet,
  Platform,
  Image,
  Text,
  View,
  Button,
  ScrollView,
} from 'react-native';
import FirebaseLogin from './FirebaseLogin';
import firebase from './components/FirebaseConfig';
import Navigator from './components/Navigator';

class App extends React.Component {
  state = {isLogin: false, uid: ''};

  componentDidMount() {
    firebase.auth().onAuthStateChanged(user => {
      if (user) {
        this.setState({isLogin: true});
        this.setState({uid: user.uid});
        console.warn(user);
      } else {
        this.setState({isLogin: false});
      }
    });
  }
  render() {
    console.warn(this.state.uid);
    if (!this.state.isLogin) {
      return (
        <ScrollView>
          <FirebaseLogin login={user => console.warn(user)} />
        </ScrollView>
      );
    }
    if (this.state.isLogin) {
      return (
        <ScrollView>
          <Navigator userID={this.state.uid} />
        </ScrollView>
      );
    }
  }
}

export default App;
