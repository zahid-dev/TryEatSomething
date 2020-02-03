/*
@flow
@format
*/
import React, {Component} from 'react';
import {
  StyleSheet,
  Platform,
  Image,
  Text,
  View,
  Button,
  StatusBar,
  ScrollView,
  ActivityIndicator,
} from 'react-native';

import firebase from '@react-native-firebase/app';
import '@react-native-firebase/auth';
import '@react-native-firebase/database';
import '@react-native-firebase/dynamic-links';

import FirebaseLogin from './FirebaseLogin';
import {createAppContainer, createSwitchNavigator} from 'react-navigation';
import {createStackNavigator} from 'react-navigation-stack';
import {
  createBottomTabNavigator,
  createMaterialTopTabNavigator,
} from 'react-navigation-tabs';
import Icon from 'react-native-vector-icons/FontAwesome';
import Feed from './screens/Feed';
import Users from './screens/Users';
import Restaurants from './screens/Restaurants';
import RestaurantDetails from './screens/RestaurantDetails';
import Recommend from './screens/Recommend';
import Plans from './screens/Plans';
import PlanDetailsScreen from './screens/PlanDetailsScreen';
import MakePlanScreen from './screens/MakePlanScreen';
import UserSearchScreen from './screens/UserSearchScreen';
import InviteContactsScreen from './screens/InviteContactsScreen';
import Profile from './screens/Profile';
import * as Values from './res/Values';
import { Colors } from 'react-native/Libraries/NewAppScreen';


console.disableYellowBox = true;

class HomeScreen extends React.Component<{}> {

  state = {
    isLogin: false, 
    uid: 'NotYet', 
    spinner: true
  };

  
  componentDidMount() {
    firebase.auth().onAuthStateChanged(user => {
      if (user) {
        this.props.navigation.navigate('Tabs')
        console.warn(user);
      }else {
        this.props.navigation.navigate('Auth')
      }
    });
  }


  render() {
    console.warn(this.state.uid);
    return (
      <View style={styles.container}>
        <StatusBar backgroundColor="white" barStyle="dark-content" />
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }
}

class AuthScreen extends React.Component<{}> {
  render(){
    return (
      <ScrollView>
        <FirebaseLogin login={user => console.warn(user)} />
      </ScrollView>
    )
  }
}


const RestaurantNavigator = createStackNavigator(
  {
    Restaurants: {screen: Restaurants},
    RestaurantDetails: {screen: RestaurantDetails},
    Recommend: {screen: Recommend},
    InviteContacts:{screen:InviteContactsScreen},
    MakePlan:{screen:MakePlanScreen},
    UserSearch:{screen:UserSearchScreen}

  },
  {
    initialRouteName: 'Restaurants',
  },
);
const FeedNavigator = createStackNavigator(
  {
    Feed: {screen: Feed},
    Profile: {screen: Profile},
    Users: {screen: Users},
    RestaurantDetails: {screen: RestaurantDetails},
    Recommend:{screen:Recommend},
    MakePlan:{screen:MakePlanScreen},
    InviteContacts:{screen:InviteContactsScreen},
    UserSearch:{screen:UserSearchScreen}

  },
  {
    initialRouteName: 'Feed',

  },
);

const PlansNavigator = createStackNavigator({
  Plans:{screen:Plans},
  PlanDetails:{screen:PlanDetailsScreen},
  UserSearch:{screen:UserSearchScreen},
  InviteContacts:{screen:InviteContactsScreen},
})

const ProfileNavigator = createStackNavigator(
  {
    ProfileTab: {screen:Profile},
  }
)

//handles screens in tab navigator
const TabNavigator = createBottomTabNavigator(
  {
    Home: {screen: FeedNavigator},
    Restaurants: {screen: RestaurantNavigator},
    Plans: {screen: PlansNavigator},
    Profile: {screen: ProfileNavigator},
  },
  {
    initialRouteName: 'Home',
    defaultNavigationOptions: ({navigation}) => ({
      tabBarIcon: ({focused, tintColor}) => {
        const {routeName} = navigation.state;
        let iconName;
        if (routeName === 'Home') {
          iconName = Values.Images.LOGO;
        } else if (routeName === 'Restaurants') {
          iconName = Values.Images.RESTAURANTS;
        } else if (routeName === 'Plans') {
          iconName = Values.Images.IC_PLAN
        } else if (routeName === 'Profile') {
          iconName = Values.Images.USER;
        }

        // You can return any component that you like here! We usually use an
        // icon component from react-native-vector-icons
        return (
          <Image
            source={iconName}
            style={{
              width: 28,
              height: 28,
              flex: 1,
              tintColor: tintColor,
              resizeMode: 'contain',
            }}
          />
        );
      },
    }),
    tabBarOptions: {
      activeTintColor:Values.Colors.COLOR_BLACK ,
      inactiveTintColor: 'gray',
      showIcon: true,
      showLabel:false,
    },
  },
);


const RootStack = createSwitchNavigator(
  {
    Main: HomeScreen,
    Auth: AuthScreen,
    Tabs: TabNavigator,
  }
);



const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
  },
  horizontal: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 10,
  },
});
const AppContainer = createAppContainer(RootStack);

export default class App extends Component {

  constructor(props){
    super(props)
  }

  render() {
    return <AppContainer />;
  }
}
