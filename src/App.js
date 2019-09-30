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
import {createAppContainer, createSwitchNavigator} from 'react-navigation';
import {createBottomTabNavigator} from 'react-navigation-tabs';
import Icon from 'react-native-vector-icons/FontAwesome';
import Feed from './screens/Feed';
import Users from './screens/Users';
import Restaurants from './screens/Restaurants';
import Plans from './screens/Plans';

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
        <ScrollView style={{flex: 1}}>
          {this.props.navigation.navigate('Tabs', {userID: this.state.uid})}
        </ScrollView>
      );
    }
  }
}

const TabNavigator = createBottomTabNavigator(
  {
    Feed: {screen: Feed},
    Restaurants: {screen: Restaurants},
    Plans: {screen: Plans},
    Users: {screen: Users},
  },
  {
    defaultNavigationOptions: ({navigation}) => ({
      tabBarIcon: ({focused, tintColor}) => {
        const {routeName} = navigation.state;
        let iconName;
        if (routeName === 'Feed') {
          iconName = 'adjust';
        } else if (routeName === 'Restaurants') {
          iconName = 'adjust';
        } else if (routeName === 'Plans') {
          iconName = 'adjust';
        } else if (routeName === 'Users') {
          iconName = 'adjust';
        }

        // You can return any component that you like here! We usually use an
        // icon component from react-native-vector-icons
        return <Icon name={iconName} size={25} color={tintColor} />;
      },
    }),
    tabBarOptions: {
      activeTintColor: 'black',
      inactiveTintColor: 'gray',
      showIcon: true,
    },
  },
);

const RootStack = createSwitchNavigator(
  {
    Home: HomeScreen,
    Tabs: TabNavigator,
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
