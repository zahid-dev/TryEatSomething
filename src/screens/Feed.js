import React, {Component} from 'react';
import {
  Text,
  View,
  Button,
  FlatList,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  TouchableWithoutFeedback,
  DeviceEventEmitter,
} from 'react-native';
import firebase from 'react-native-firebase';
import {Card, CardSection} from '../components/common';
import {withNavigation} from 'react-navigation';
import axios from 'axios';
import * as Values from '../res/Values';
import { Colors } from 'react-native/Libraries/NewAppScreen';
import ResturantListItem from '../components/ResturantListItem';

import * as DatabaseHelpers from '../firebase/DatabaseHelpers';
import { switchStatement } from '@babel/types';


class Feed extends React.Component {

  static navigationOptions = ({navigation}) => {
    return ({
      headerTitle:<Image 
        style={styles.imgHeaderBanner}
        resizeMode='contain'
        source={Values.Images.EATSNP_BANNER}
      />
    })
  }


  state = {
    uid: '',
    objectJson: {},
    dataArray: [],
    myid: firebase.auth().currentUser.uid,
    Feed: 'GlobalFeed',
    isLoading:false,
  };


  componentDidMount() {
    this.getGlobalFeed();
    DeviceEventEmitter.addListener('REFRESH_FEED', ()=>{
      this.getGlobalFeed();
    })
  }

  componentWillUnmount(){
    DeviceEventEmitter.removeListener('REFRESH_FEED');
  }

  getGlobalFeed(){
    this.setState({Feed: 'GlobalFeed', dataArray:[], isLoading:true});
    DatabaseHelpers.Feed.getGlobalFeed()
    .then((recommendations)=>{
      this.setState({dataArray:recommendations, isLoading:false})
    })
  }


  async getUserFeed() {
    this.setState({Feed: 'MyFeed', dataArray:[], isLoading:true});
    DatabaseHelpers.Feed.getUserFeed()
      .then((recommendations)=>{
        this.setState({dataArray:recommendations, isLoading:false})
      })
  }


  showUserProfile = (uid) => {
    this.props.navigation.navigate('Profile', {uid});
  }

  showRestaurantDetails = (restaurantKey) => {
    this.props.navigation.navigate('RestaurantDetails', {restaurantKey});
  }


  _renderHeaderTabs(){
    return (
      <View style={styles.feedCardTopBarButtonContainer}>
      <TouchableOpacity
        onPress={() => this.getUserFeed()}>
        <Text
          style={
            this.state.Feed === 'MyFeed'
              ? styles.buttontextStyle
              : styles.buttontextStyleSelected
          }>
          MY CIRCLE
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => this.getGlobalFeed(firebase.auth().currentUser.uid)}>
        <Text
          style={
            this.state.Feed === 'GlobalFeed'
              ? styles.buttontextStyle
              : styles.buttontextStyleSelected
          }>
          EXPLORE
        </Text>
      </TouchableOpacity>
    </View>
    )
  }


  _renderRecommendations(DatArray) {

    return (
      <FlatList
        data={DatArray}
        renderItem={({item, index}) => (
          <ResturantListItem 
            item={item} 
            mode='recommendation'
            onUserPress={this.showUserProfile}
            onRestaurantPress={this.showRestaurantDetails}
            />
        )}
        keyExtractor={item => item.key}
      />
    );
  }


  _renderActivityIndicator(){
    if(!this.state.isLoading)
      return null;

    return (
      <ActivityIndicator
        style={{padding:56}} 
        animating={true}
      />
    )
  }

  render() {
    return (
      <View style={{flex:1}}>
        {this._renderHeaderTabs()}
        {this._renderActivityIndicator()}
        {this._renderRecommendations(this.state.dataArray)}
  
      </View>
    );
  }
}


const styles = {
  imgHeaderBanner:{
    height:40
  },
  feedCardTopBarButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    margin: 12,
  },
  buttontextStyle: {
    alignSelf: 'center',
    color: Values.Colors.COLOR_PRIMARY,
    fontSize: 22,
    fontWeight: '500',
  },
  buttontextStyleSelected: {
    alignSelf: 'center',
    color: Values.Colors.COLOR_BLACK,
    fontSize: 22,
    fontWeight: '300',
  },
  scrollContainer: {
    flex: 1,
    height: 300,
  },
};

export default withNavigation(Feed);
