/* eslint-disable prettier/prettier */
import React, {Component} from 'react';
import {
  Text,
  View,
  Button,
  FlatList,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  PermissionsAndroid,
} from 'react-native';
import firebase from 'react-native-firebase';
import {Card, CardSection} from '../components/common';
import {withNavigation} from 'react-navigation';
import * as Values from '../res/Values';
import ResturantListItem from '../components/ResturantListItem';
import * as DatabaseHelpers from '../firebase/DatabaseHelpers';
import ProfileHeader from '../components/ProfileHeader';


class Profile extends React.Component {

  static navigationOptions = ({navigation}) => {
    const logOut = () => {
      firebase.auth().signOut();
      navigation.navigate('Auth');
    }

    currentUid = firebase.auth().currentUser.uid
    const uid = navigation.getParam('uid', currentUid);
    
    headerRight = uid === currentUid? <Button title="Logout" onPress={logOut} color={Values.Colors.COLOR_PRIMARY}/> : null

    return ({
      headerTitle:"Profile",
      headerRight
    })
  }

  state = {
    user: {},
    data2Array: [],
  };

  componentDidMount() {
    const uid = this.props.navigation.getParam('uid', firebase.auth().currentUser.uid)

    this.setState({isLoading:true})
    DatabaseHelpers.User.getUser(uid)
    .then((user)=>{
      this.setState({user});
    });

    DatabaseHelpers.UserData.getRecommendations(uid)
    .then((recommendations)=>{
      this.setState({
        data2Array:recommendations,
        isLoading:false,
      })
    });
  }
  
  showRestaurantDetails = (restaurantKey) => {
    
  }


  plotUserRecommends(DatArray) {
    //console.log(DatArray);
    if(this.state.isLoading){
      return <ActivityIndicator animating={true} style={{marginTop:56}}/>
    }
    return (
      <FlatList
        // eslint-disable-next-line prettier/prettier
        // eslint-disable-next-line react-native/no-inline-styles
        style={{flex: 1}}
        data={DatArray}
        renderItem={({item, index}) => {
          return (
            <ResturantListItem 
              item={item} mode={'recommendation'} 
              onUserPress={()=>{}}
              onRestaurantPress={this.showRestaurantDetails}
              />
          )
        }}
        keyExtractor={DatumArray => DatumArray}
      />
    );
  }


  render() {
    const uid = this.props.navigation.getParam('uid', firebase.auth().currentUser.uid)
    return (
 
      <ScrollView style={{flex: 1}}>
          <ProfileHeader
            uid={uid}
            user={this.state.user}
          />
         
          <Text style={styles.recommendText}>RECOMMENDATIONS </Text>
          {this.plotUserRecommends(this.state.data2Array)}

      </ScrollView>
    );
  }
}

const styles = {
  headerStyle: {
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    height: 50,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    flexDirection: 'row',
    justifyContent: 'center',
    flex: 1,
    elevation: 5,
  },
  sideText: {
    fontSize: 12,
    flex: 3,
  },
  mainHeaderText: {
    fontSize: 20,
    flex: 4,
  },
  recommendText: {
      fontSize: 18,
      marginLeft: 10,
      marginTop: 8,
      color:Values.Colors.COLOR_GRAY,
      fontWeight:'600',
      marginBottom:8
  },
  feedCardHeaderStyle1: {
    borderBottomWidth: 1,
    padding: 10,
    color: '#000',
    backgroundColor: '#fff',
    justifyContent: 'flex-start',
    flexDirection: 'row',
    borderColor: '#000',
    position: 'relative',
  },
  imgFeedHeaderStyle1: {
    width: 35,
    height: 35,
    borderRadius: 20,
    tintColor: 'gray',
  },
  textFeedHeaderStyle1: {
    fontSize: 12,
  },
  textviewFeedHeaderStyle1: {
    flexWrap: 'wrap',
    alignContent: 'flex-start',
    marginLeft: 5,
    flex: 1,
    textAlign: 'justify',
    lineHeight: 2,
  },
  feedCardHeaderStyle: {
    padding: 10,
    color: '#000',
    backgroundColor: '#fff',
    justifyContent: 'flex-start',
    flexDirection: 'row',
    position: 'relative',
  },
  imgFeedHeaderStyle: {
    width: 65,
    height: 65,
    tintColor: 'gray',
    marginTop: 10,
  },
  textviewFeedHeaderStyle: {
    marginLeft: 10,
    flex: 1,
    textAlign: 'justify',
    lineHeight: 2,
    marginTop: 10,
  },
  followersTextContainer: {
    flexDirection: 'row',
  },
  text1FeedHeaderStyle: {
    fontSize: 20,
  },
  text2FeedHeaderStyle: {
    fontSize: 12,
    color: 'gray',
  },
  parentContainer: {
    flex: 1,
    flexDirection: 'column',
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
    justifyContent: 'space-between',
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
  buttonStyleCard: {
    backgroundColor: '#ffffff',
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#ffffff',
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
  buttontextStyleCard: {
    alignSelf: 'space-between',
    color: '#fe7002',
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
    backgroundColor: '#F8F8F8',
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
};

export default withNavigation(Profile);
