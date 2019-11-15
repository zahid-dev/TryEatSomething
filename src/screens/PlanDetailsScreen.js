/*
@flow
@format
*/

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

const PARAM_PLAN_KEY = "planKey";

type Params = {
    planKey:string
}

type Props = {
    navigation:{
        state:{
            params:Params
        },
        getParam:(string)=>any,
        goBack:()=>void,
    }
}

type State = {

}

class Plans extends React.Component<Props, State> {
  render() {
    return (
      <View>
        <Text>Plans Details</Text>
      </View>
    );
  }
}

export default withNavigation(Plans);
