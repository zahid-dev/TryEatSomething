import React, {Component} from 'react';
import {
  Text,
  View,
  Button,
  FlatList,
  ScrollView,
  TextInput,
  TouchableWithoutFeedback,
} from 'react-native';
import firebase from 'react-native-firebase';
import {Card, CardSection} from '../components/common';
import {withNavigation} from 'react-navigation';
import axios from 'axios';

class Plans extends React.Component {
  render() {
    return (
      <View>
        <Text>Plans!</Text>
      </View>
    );
  }
}

export default withNavigation(Plans);
