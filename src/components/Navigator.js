import Ionicons from 'react-native-vector-icons/Ionicons';
import React, {Component} from 'react';
import {createAppContainer} from 'react-navigation';
import {createBottomTabNavigator} from 'react-navigation-tabs';
import Restaurants from './Restaurants';
import Users from './Users';
import Feed from './Feed';
import Plans from './Plans';

const getTabBarIcon = (navigation, focused, tintColor) => {
  const {routeName} = navigation.state;
  let IconComponent = Ionicons;
  let iconName;
  if (routeName === 'Home') {
    iconName = `ios-information-circle${focused ? '' : '-outline'}`;
    // We want to add badges to home tab icon
  } else if (routeName === 'Settings') {
    iconName = `ios-options${focused ? '' : '-outline'}`;
  }

  // You can return any component that you like here!
  return <IconComponent name={iconName} size={25} color={tintColor} />;
};

export default createAppContainer(
  createBottomTabNavigator(
    {
      feed: {screen: Feed},
      restaurantsHome: {screen: Restaurants},
      plans: {screen: Plans},
      users: {screen: Users},
    },
    {
      defaultNavigationOptions: ({navigation}) => ({
        tabBarIcon: ({focused, tintColor}) =>
          getTabBarIcon(navigation, focused, tintColor),
      }),
      tabBarOptions: {
        activeTintColor: 'tomato',
        inactiveTintColor: 'gray',
      },
    },
  ),
);
