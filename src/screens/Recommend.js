import React, {Component, Platform} from 'react';
import {
  Text,
  View,
  Button,
  TextInput,
  StyleSheet,
  Image,
  DeviceEventEmitter,
  TouchableOpacity,
} from 'react-native';
import {withNavigation} from 'react-navigation';
import axios from 'axios';
import firebase from 'react-native-firebase';
import * as Values from '../res/Values';
import * as DatabaseHelpers from '../firebase/DatabaseHelpers';
import RatePanel from '../components/RatePanel';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scrollview'

class Recommend extends React.Component {
  static navigationOptions = {
    headerTitle:"Recommend"
  }

  constructor(props) {
    super(props);
  }

  state = {text: '', rating: '', waittime: ''};

  render() {
    const {navigation} = this.props;

    const restaurant = navigation.getParam('restaurant');

    const makeRecommendation = () => {
            DatabaseHelpers.Recommendation.makeRecommendation(
              restaurant.id,
              this.state.rating,
              this.state.waittime,
              this.state.text,
              restaurant
            ).then((status)=>{
              if(status){
                DeviceEventEmitter.emit("REFRESH_FEED", {});
                alert("Recommendation made successfully");
                this.props.navigation.goBack();
              }
            }).catch((err)=>{
              
            })
    }
    return (
      <KeyboardAwareScrollView style={{flex:1}}>
      <View style={{backgroundColor: '#FFFFFF', flex: 1, padding:16}}>
        {/* <Text>id</Text> */}
        <View style={styles.feedCardHeaderStyle}>
          <Image
            style={styles.imgFeedHeaderStyle}
            source={Values.Images.RESTAURANTS}
          />
          <View style={styles.textviewFeedHeaderStyle}>
            <Text style={styles.text1FeedHeaderStyle}>{restaurant.name}</Text>
            <Text style={styles.text2FeedHeaderStyle}>{restaurant.address}</Text>
          </View>
        </View>
        <View style={styles.textAreaContainer}>
        
          <TextInput
            style={styles.textArea}
            underlineColorAndroid="transparent"
            placeholder="Describe your experience"
            placeholderTextColor="grey"
            numberOfLines={3}
            maxLength={90}
            multiline={true}
            onChangeText={text => this.setState({text})}
            value={this.state.text}
          />
        </View>
        <View style={styles.ratingContainerStyle}>

          <View style={styles.container1Style}>
            <Text style={styles.labelStyle}>Rate Resturant</Text>
            <RatePanel onStarPress={(rating)=>{this.setState({rating})}} />
          </View>

          <View style={styles.container2Style}>
            <Text style={styles.labelStyle}>Wait Time </Text>
            <TextInput
              style={{fontSize:20}}
              placeholder="Minutes"
              autoCorrect={false}
              keyboardType={'numeric'}
              value={String(this.state.waittime)}
              onChangeText={waittime => this.setState({waittime})}
            />
          </View>
        </View>
        <TouchableOpacity
          style={styles.recommendButton}
          onPress={makeRecommendation}>
          <Text style={styles.recommendButtonText}>Make Recommendation</Text>
        </TouchableOpacity>
      </View>
      </KeyboardAwareScrollView>
    );
  }
}
const styles = StyleSheet.create({
  ratingContainerStyle: {
    height: 150,
    borderRadius:16,
    backgroundColor:Values.Colors.COLOR_LIGHT_GRAY,
    padding:16,
    margin: 15,
  },
  recommendButton: {
    backgroundColor: Values.Colors.COLOR_PRIMARY,
    borderRadius:16,
    height: 48,
    margin:16,
    justifyContent: 'center',
  },
  recommendButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    alignSelf: 'center',
    fontWeight:'600'
  },
  parentContainer: {
    flex: 1,
    flexDirection: 'column',
  },
  headerStyle: {
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 50,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    position: 'relative',
    flexDirection: 'row',
    elevation: 5,
    padding: 25,
  },
  imgStyle: {
    width: 25,
    height: 25,
    flex: 1,
    borderRadius: 20,
  },
  searchStyle: {
    height: 25,
    flex: 10,
    borderColor: 'black',
    borderWidth: 1,
    fontSize: 12,
    marginLeft: 10,
    padding: 5,
    textAlign: 'center',
  },
  feedCardStyle: {
    borderWidth: 0.5,
    borderRadius: 5,
    borderColor: '#ddd',
    borderBottomWidth: 0,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,

    elevation: 3,
    marginLeft: 10,
    marginRight: 10,
    marginTop: 10,
    marginBottom: 10,
  },
  feedCardHeaderStyle: {
    padding: 10,
    color: '#000',
    backgroundColor: '#fff',
    justifyContent: 'flex-start',
    flexDirection: 'row',
    alignItems:'center',
    position: 'relative',
  },
  imgFeedHeaderStyle: {
    width: 50,
    height: 50,
    marginLeft: 10,
    marginRight: 5,
    tintColor:Values.Colors.COLOR_GRAY
  },
  text1FeedHeaderStyle: {
    fontSize: 20,
  },
  text2FeedHeaderStyle: {
    fontSize: 12,
    flexWrap: 'wrap',
    color:Values.Colors.COLOR_GRAY,
    width: 250,
  },
  textviewFeedHeaderStyle: {
    flexWrap: 'wrap',
    alignContent: 'flex-start',
    marginLeft: 5,
    marginTop: 2,
    flex: 1,
    textAlign: 'justify',
    lineHeight: 2,
  },
  timeFeedHeaderStyle: {
    flexDirection: 'row',
    alignSelf: 'center',
  },
  imageFeed: {
    height: 176,
    width: '100%',
    resizeMode: 'stretch',
  },
  imagetextHoverLeft: {
    fontSize: 18,
    color: 'white',
    fontWeight: 'bold',
    marginLeft: 10,
    textAlign: 'left',
    flex: 1,
    position: 'relative',
  },
  imagetextHoverRight: {
    fontSize: 14,
    color: 'white',
    fontWeight: 'bold',
    marginRight: 10,
    marginTop: 5,
    textAlign: 'right',
  },

  imageFeedContainer: {
    position: 'absolute',
    top: 125,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    flexDirection: 'row',
  },
  imageFeedSecContainer: {
    position: 'absolute',
    top: 145,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    flexDirection: 'row',
  },
  feedCardBottomBar: {
    padding: 10,
    color: '#000',
    backgroundColor: '#fff',
    justifyContent: 'flex-start',
    borderColor: '#000',
  },
  feedCardBottomBarButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  buttonSideSpacer: {
    flex: 4,
  },
  buttonStyle: {
    backgroundColor: '#fe7002',
    borderRadius: 5,
    borderWidth: 1,
    flex: 6,
    borderColor: '#fe7002',
    marginLeft: 5,
    marginRight: 5,
    marginTop: 5,
    marginBottom: 5,
  },
  buttonStyleSelected: {
    backgroundColor: '#ffffff',
    borderRadius: 7,
    borderWidth: 1,
    flex: 6,
    borderColor: '#fe7002',
    marginLeft: 5,
    marginRight: 5,
    marginTop: 5,
    marginBottom: 5,
  },
  buttonHeaderStyle: {
    flexDirection: 'row',
  },
  buttontextStyle: {
    alignSelf: 'center',
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    paddingTop: 5,
    paddingBottom: 5,
  },
  buttontextStyleSelected: {
    alignSelf: 'center',
    color: '#fe7002',
    fontSize: 12,
    fontWeight: '600',
    paddingTop: 5,
    paddingBottom: 5,
  },
  feedCardBottomBarText: {
    flexWrap: 'wrap',
  },
  scrollContainer: {
    flex: 1,
    height: 300,
  },
  bottomBarContainer: {
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 60,
    position: 'relative',
    flexDirection: 'row',
    elevation: 5,
    paddingLeft: 10,
    paddingRight: 10,
  },
  bottomItemLayout: {
    flexDirection: 'column',
    paddingTop: 5,
  },
  bottomBarTextStyle: {
    fontSize: 12,
  },
  imgbottomStyle: {
    height: 25,
    width: 25,
    borderRadius: 15,
    justifyContent: 'center',
  },
  textAreaContainer: {
    borderColor: '#000000',
    backgroundColor:Values.Colors.COLOR_LIGHT_GRAY,
    borderRadius: 16,
    padding: 16,
    margin: 16,
    position: 'relative',
  },
  textArea: {
    height: 80,
    fontSize: 20,
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
  },
  inputStyle: {
    color: '#000',
    paddingRight: 5,
    paddingLeft: 5,
    fontSize: 18,
    lineHeight: 23,
  },
  labelStyle: {
    color:Values.Colors.COLOR_GRAY,
  },
  container1Style: {
    flexDirection: 'column',
    position: 'relative',
    marginTop: 5,
    paddingLeft: 5,
  },
  container2Style: {
    height: 40,
    flexDirection: 'column',
    position: 'relative',
    marginTop: 15,
    paddingLeft: 5,
  },
});
export default withNavigation(Recommend);
