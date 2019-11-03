import React, {Component} from 'react';
import {
  Text,
  View,
  Button,
  Image,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  ScrollView,
  Platform,
  Linking,
} from 'react-native';
import {withNavigation} from 'react-navigation';
import firebase from 'react-native-firebase';
import axios from 'axios';
import * as Values from '../res/Values';
import RestaurantMenu from '../components/RestaurantMenu';
import { matcherErrorMessage } from 'jest-matcher-utils';

class RestaurantDetails extends React.Component {

  static navigationOptions = {title:"Restaurant Details"}

  constructor(props) {
    super(props);
  }

  state = {
    data1Array: [],
    data2Array: [],
    data3Array: [],
    menuArray: [],
    recommendsArray: [],
    restaurant:"",
  };

  componentDidMount() {
    this.getRestaurantData(this.props.navigation.getParam('restaurantKey'));
  }

  getRestaurantData(restaurantKey) {
    axios
      .get(
        'https://api.foursquare.com/v2/venues/' +
          restaurantKey +
          '?client_id=SQCAM5YS25I5GT23G52WXHGWS5FE4C300IUBNEJWUD22GG2J&client_secret=IZMZAFTA4PWEA0JVMWMEZZBJBAT3MJ5HBLK5JDFW5N55M1TN&v=20150729',
      )
      .then(async res => {
        var data = [];
        var obj;
        if (res.data.response.venue.photos.count !== 0) {
          obj = {
            name: res.data.response.venue.name,
            address: res.data.response.venue.location.formattedAddress,
            id: res.data.response.venue.id,
            categories: res.data.response.venue.categories,
            location: res.data.response.venue.location,
            photoURL:
              res.data.response.venue.bestPhoto.prefix +
              '400x225' +
              res.data.response.venue.bestPhoto.suffix,
            tier: res.data.response.venue.price.tier,
          };
        } else {
          obj = {
            name: res.data.response.venue.name,
            address: res.data.response.venue.location.formattedAddress,
            id: res.data.response.venue.id,
            categories: res.data.response.venue.categories,
            location: res.data.response.venue.location,
            photoURL:
              'https://fastly.4sqi.net/img/general/300x500/38096401_OoNd_ySbAKYic-Gm5sb4OvQQpGhsO7IHfnNO940sIJs.jpg',
            tier: res.data.response.venue.price.tier,
          };
        }
        if (res.data.response.venue.hours !== undefined) {
          obj.isOpen = res.data.response.venue.hours.isOpen;
        } else {
          obj.isOpen = '';
        }
        if (res.data.response.venue.hasMenu === true) {
          this.getMenu(restaurantKey);
        } else {
          console.warn('no menu');
        }

        //fetch firebase details
        let restaurantDetails = await firebase
          .database()
          .ref(`restaurant/${restaurantKey}`)
          .once('value', snapshot1 => {
            //console.log(snapshot1);
            //return snapshot1;
          });
        console.warn('res', restaurantDetails);

        try {
          this.getRecommends(restaurantDetails.val().recommendations);
          obj.rating = restaurantDetails.val().AggRating;
          obj.waittime = restaurantDetails.val().AggWaittime;
          obj.totalratings = restaurantDetails.val().numberOfRatings;
        } catch (e) {
          obj.rating = 'Not rated yet';
          obj.waittime = '';
          obj.totalratings = 0;
          //console.warn('yes');
        }

        console.warn('Topdata', obj);
        data.push(obj);
        this.setState({restaurant: obj});
        //console.warn('dat', this.state.dataArray);
      })
      .catch((err)=>{
        console.warn("Failed to fetch resturant details: "+ JSON.stringify(err));
        alert("Failed to fetch resturant details: "+ err.message);
      })
  }


  async getRecommends(recommendids) {
    console.warn('idsr', recommendids);
    const array = [];
    for (var key in recommendids) {
      if (recommendids.hasOwnProperty(key)) {
        console.warn(key, recommendids[key]);
        array.push([key, recommendids[key]]);
      }
    }
    console.warn('ids', array);
    await Promise.all(
      array.map(async item => {
        //console.warn(item[0]);
        let recommend = await firebase
          .database()
          .ref(`recommendations/${item[0]}`)
          .once('value', snapshot1 => {
            //console.log(snapshot1);
            //return snapshot1;
          });
        //console.warn('rec', recommend);
        return recommend;
      }),
    ).then(async res => {
      //console.warn('rec', res);
      await Promise.all(
        res.map(async item => {
          var obj = [];
          console.warn('item', item);
          //console.warn(item.val().priority);
          let userDetails = await firebase
            .database()
            .ref(`users/${item.val().uid}`)
            .once('value', snapshot1 => {
              //console.log(snapshot1);
              //return snapshot1;
            });
          console.warn('name', userDetails.val().Name);
          obj = {
            priority: item.val().priority,
            description: item.val().description,
            name: userDetails.val().Name,
          };
          //console.warn(obj);
          return obj;
          //onsole.warn(userDetails);
          //console.warn(restaurantDetail);
        }),
      ).then(data => {
        console.warn('dat', data);
        this.setState({data2Array: data});
      });
    });
  }


  getMenu(restaurantKey) {
    axios
      .get(
        'https://api.foursquare.com/v2/venues/' +
        restaurantKey +
          '/menu?client_id=SQCAM5YS25I5GT23G52WXHGWS5FE4C300IUBNEJWUD22GG2J&client_secret=IZMZAFTA4PWEA0JVMWMEZZBJBAT3MJ5HBLK5JDFW5N55M1TN&v=20150729',
      )
      .then(res => {
        console.log("menu",res);
        const menu = res.data.response.menu;
        if(menu)
          this.setState({menu})
      });
  }

  onRecommendPress = () => {
    const restaurant = this.state.restaurant;
    this.props.navigation.navigate('Recommend', {restaurant})
  }


  showDirectionsOnMap = () => {
    const item = this.state.restaurant;
    if(!item.location) {
        alert("Location data not available for this restaurant");
        return;
    }
    const lat = item.location.lat;
    const lng = item.location.lng;
    const scheme = Platform.select({ ios: 'maps:0,0?q=', android: 'geo:0,0?q=' });
    const latLng = `${lat},${lng}`;
    const label = item.name;
    const url = Platform.select({
        ios: `${scheme}${label}@${latLng}`,
        android: `${scheme}${latLng}(${label})`
    });


    Linking.openURL(url); 
  }

  _renderRestaurantTextualContent(restaurant){
        var categoryText = "Food";
        try{
           categoryText = restaurant.categories[0].name;
        }catch{}

        const subText = restaurant.address? restaurant.address.join(', '):""
        return (
            <View style={styles.bottomLine1}>
                <View style={{flex:1}}>
                    <Text style={{color:Values.Colors.COLOR_PRIMARY, fontWeight:'600'}}>{categoryText}</Text>
                    
                    <Text style={styles.title}>{restaurant.name}</Text>
    
                    <Text style={styles.subTitle} multiline={true} >
                    {subText}
                    </Text>
                </View>
            </View>
        )
  }


  _renderActionPanel(item){
    return (
        <View style={styles.actionPanel}>
          <Button 
            title={'Recommend'} 
            color={Values.Colors.COLOR_BLACK} 
            onPress={this.onRecommendPress} />
    
          <View style={{width:StyleSheet.hairlineWidth, height:'100%', backgroundColor:Values.Colors.COLOR_MID_GRAY}}/>
    
          <Button 
            title={'Directions'} 
            color={Values.Colors.COLOR_BLACK}  
            onPress={this.showDirectionsOnMap} />

        </View>
    )
}


  plotRestaurantData(item) {
    return (

          <View>
    
              <Image
                style={styles.imageRestaurant}
                source={{uri: item.photoURL}}
              />

              <View style={styles.subContainer}>
                {this._renderRestaurantTextualContent(item)}
                {this._renderActionPanel(item)}
              </View>
           
          </View>
        )
  }


  plotRecommends(DatArray) {
    //console.log(DatArray);
    return (
      <FlatList
        style={{flex: 1}}
        data={DatArray}
        renderItem={({item, index}) => (
          <View style={styles.subContainer}>
            <Text style={styles.recommendTextTitle}>{item.name}</Text>
            <Text style={styles.recommendText}>{item.description}</Text>
          </View>
        )}
        keyExtractor={DatumArray => DatumArray}
      />
    );
  }

  recommendPageNav(item, userID) {
    this.props.navigation.navigate('Recommend', {
      id: item,
      userID: userID,
    });
  }
  logOut() {
    firebase.auth().signOut();
    this.props.navigation.navigate('Main');
  }


  render() {
    const {navigation} = this.props;
    const restaurantKey = navigation.getParam('restaurantKey');
    //console.warn(userID);
    return (
      <ScrollView style={{flex: 1}}>
    
        {this.plotRestaurantData(this.state.restaurant)}
        <Text style={{fontSize: 16, marginTop: 16, marginLeft:16, fontWeight:'600', color:Values.Colors.COLOR_GRAY}}>MENU</Text>
    
        <RestaurantMenu menu={this.state.menu} />
    
  
        <Text style={{fontSize: 16, marginTop: 16, marginLeft:16, fontWeight:'600', color:Values.Colors.COLOR_GRAY}}>WHAT PEOPLE ARE SAYING</Text>
      
          {this.plotRecommends(this.state.data2Array)}
    
      </ScrollView>
    );
  }
}

const styles = {
  headerTextMap: {},
  subContainer:{
      margin:12,
      paddingLeft:16,
      paddingRight:16,
      paddingTop:8,
      paddingBottom:8,
      backgroundColor: Values.Colors.COLOR_LIGHT_GRAY,
      justifyContent: 'flex-start',
      borderRadius:12,
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
  recommendCardStyle: {
    padding:16
  },
  recommendText: {
    fontSize: 12,
  },
  recommendTextTitle: {
    fontSize: 12,
    fontWeight:'600'
  },
  feedCardHeaderStyle: {
    borderBottomWidth: 1,
    padding: 10,
    color: '#000',
    backgroundColor: '#fff',
    justifyContent: 'center',
    flexDirection: 'row',
    borderColor: '#000',
    position: 'relative',
  },
  buttonStyleCard: {
    backgroundColor: '#ffffff',
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#ffffff',
    marginLeft: 15,
    marginRight: 15,
    marginTop: 5,
    marginBottom: 5,
  },
  buttontextStyleCard: {
    alignSelf: 'space-between',
    color: '#fe7002',
    fontSize: 12,
    fontWeight: '600',
    paddingTop: 5,
    paddingBottom: 5,
  },
  mapTextContainer: {
    padding: 10,
  },

  sideText: {
    fontSize: 12,
    flex: 3,
  },
  mainHeaderText: {
    fontSize: 20,
    flex: 4,
  },
  parentContainer: {
    flex: 1,
    flexDirection: 'column',
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
  imgStyle: {
    width: 25,
    height: 25,
    flex: 1,
    borderRadius: 20,
  },
  RestaurantCardStyle: {
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
  RestaurantCenteredCardStyle: {
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
    marginLeft: 10,
    marginRight: 10,
    elevation: 5,
    marginTop: 10,
    marginBottom: 10,
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

  imageRestaurantContainer: {
    position: 'absolute',
    top: 125,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    flexDirection: 'row',
  },
  imageRestaurantSecContainer: {
    position: 'absolute',
    top: 145,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    flexDirection: 'row',
  },
  RestaurantCardBottomBar: {
    padding: 10,
    color: '#000',
    backgroundColor: '#fff',
    justifyContent: 'flex-start',
    borderColor: '#000',
  },
  RestaurantCardBottomBarButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  buttonStyle: {
    backgroundColor: '#ffffff',
    borderRadius: 5,
    borderWidth: 1,
    flex: 1,
    justifyContent: 'space-between',
    borderColor: '#ffffff',
    marginLeft: 5,
    marginRight: 5,
    marginTop: 5,
    marginBottom: 5,
  },
  buttonStyleSelected: {
    backgroundColor: '#ffffff',
    borderRadius: 5,
    borderWidth: 1,
    flex: 1,
    justifyContent: 'space-between',
    borderColor: '#fe7002',
    marginLeft: 5,
    marginRight: 5,
    marginTop: 5,
    marginBottom: 5,
  },
  buttontextStyle: {
    alignSelf: 'center',
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
  RestaurantCardBottomBarTextContainer: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  RestaurantCardBottomBarText: {
    flexWrap: 'wrap',
    width: '70%',
  },
  RestaurantCardBottomBarSeeMoreText: {
    fontSize: 12,
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
  imageRestaurant: {
    height: 256,
    width: '100%',
    resizeMode: 'cover',
  },
  imgFeedHeaderStyle: {
    width: 35,
    height: 35,
    borderRadius: 20,
  },
  textFeedHeaderStyle: {
    fontSize: 12,
  },
  textviewFeedHeaderStyle: {
    flexWrap: 'wrap',
    alignContent: 'flex-start',
    marginLeft: 5,
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
  buttonHeaderStyle: {
    flexDirection: 'row',
  },
     actionPanel:{
        flexDirection:'row',
        justifyContent:'space-around',
       
    },
    bottomContentContainer: {
        marginTop:8,
        paddingLeft:16,
        paddingRight:16,
        paddingTop:8,
        paddingBottom:8,
        backgroundColor: Values.Colors.COLOR_LIGHT_GRAY,
        justifyContent: 'flex-start',
        borderRadius:12,
      },
    bottomLine1:{
        flexDirection:'row',
        justifyContent:'space-between',
        paddingBottom:8,
    },
    title: {
        fontSize: 18,
        color: Values.Colors.COLOR_BLACK,
        fontWeight: '600',
        textAlign: 'left',
        flex: 1,
        position: 'relative',
      },
      subTitle:{
        color:Values.Colors.COLOR_GRAY
      }
};

export default withNavigation(RestaurantDetails);
