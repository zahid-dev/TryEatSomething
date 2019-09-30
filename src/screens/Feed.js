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
import firebase from '../components/FirebaseConfig';
import {Card, CardSection} from '../components/common';
import {withNavigation} from 'react-navigation';
import axios from 'axios';

class Feed extends React.Component {
  render() {
    return (
      <View>
        <Text>Feed!</Text>
      </View>
    );
  }
}

export default withNavigation(Feed);
