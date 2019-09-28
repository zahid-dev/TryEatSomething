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
import {createAppContainer} from 'react-navigation';
import {createStackNavigator} from 'react-navigation-stack';
import Restaurants from './components/Restaurants';
import RestaurantDetails from './components/RestaurantDetails';
import Recommend from './components/Recommend';
import Users from './components/Users';

class HomeScreen extends React.Component {
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
          <Restaurants userID={this.state.uid} />
        </ScrollView>
      );
    }
  }
}

const RootStack = createStackNavigator(
  {
    Home: HomeScreen,
    restaurantDetail: RestaurantDetails,
    recommend: Recommend,
    users: Users,
  },
  {
    initialRouteName: 'Home',
    headerMode: 'none',
  },
);

const AppContainer = createAppContainer(RootStack);

export default class App extends Component {
  render() {
    return <AppContainer />;
  }
}
