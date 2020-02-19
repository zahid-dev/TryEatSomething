import React, {Component} from 'react';
import {
  Text,
  View,
  FlatList,
  ScrollView,
  TextInput,
  Platform,
  TouchableOpacity,
  Image,
  PermissionsAndroid,
  ActivityIndicator,
} from 'react-native';
import firebase from '@react-native-firebase/app';
import {Card, CardSection} from '../components/common';
import {withNavigation} from 'react-navigation';
import Geolocation from 'react-native-geolocation-service';
import axios from 'axios';
import * as Values from '../res/Values';
import RatingStars from '../components/RatingStars';
import ResturantListItem from '../components/ResturantListItem';
import {Button} from 'react-native-elements';
import {IonIcons} from 'react-native-vector-icons';


type DataItem = {
  id:string,
  name:string,
  address:string,
  tier:number,
  photoURL:string,
}

type State = {
  isLoading:boolean,
  dataArray:Array<DataItem>,
  offset:number,
}


class Restaurants extends React.Component<Props, State> {

  static navigationOptions = ({navigation}) => {
    var query = "";
    const updateSearch = navigation.getParam('updateSearch', ()=>{})
    const onFunnelPress = navigation.getParam('onFunnelPress', ()=>{})

    const _renderSearchBar = () => {
      return (
        <View style={{flexDirection:'row', borderRadius:12, backgroundColor:Values.Colors.COLOR_LIGHT_GRAY}}>
          <TextInput 
            style={{flex:1, paddingLeft:16, paddingRight:16, color:Values.Colors.COLOR_BLACK}} 
            placeholder="Search Restaurants"
            
            onChangeText={(text)=>query = text}
          />
          <Button 
            type={"clear"}
            titleStyle={{color:Values.Colors.COLOR_GRAY, fontSize:14}}
            onPress={()=>updateSearch(query)}
            icon={{ name:'search', size: 18, color:Values.Colors.COLOR_GRAY }}
          />
        </View>
      )
    }
    return ({
      headerTitle:_renderSearchBar(),
      headerRight:<Button icon={{ name:'ios-funnel', size: 24, color:Values.Colors.COLOR_GRAY, type:"ionicon"}} onPress={onFunnelPress} type={"clear"}/>
    })
  }

  state = {
    error: '',
    text: '',
    dataArray: [],
    Itenerary: 'Food',
    latitude: [],
    longitude: [],
    uid: '',
    offset:0,
    showFilter:false,
    category:'default',
    isLoading:false,
  };

  componentDidMount() {
    this.setState({uid: firebase.auth().currentUser.uid});

    if(Platform.OS = 'ios'){
      this.getLocationCoords();
    }else{
      this.requestLocationPermission();
    }

    this.props.navigation.setParams({
      updateSearch:(query)=>{
        console.log("Searching for: " + query)
        this.setState({dataArray:[], query});
        this.getVenues({query})
      },
      onFunnelPress:()=>{
        this.setState(state=>{state.showFilter = !state.showFilter; return state})
      }
    })
  }

  async requestLocationPermission() {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          title: 'Location Permission',
          message: 'MyMapApp needs access to your location',
        },
      );
      const granted1 = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION,
      );
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        console.warn('You can use the location');
        try {
          this.getLocationCoords();
        } catch (e) {
          console.warn('Error', e);
        }
      } else {
        console.warn('location permission denied');
      }
    } catch (err) {
      console.warn(err);
    }
  }

  getLocationCoords(){
    Geolocation.getCurrentPosition(
      position => {
        console.warn(position.coords.latitude, position.coords.longitude);
        this.setState({latitude: position.coords.latitude});
        this.setState({longitude: position.coords.longitude});
        this.getVenues();
      },
      error => {
        // See error code charts below.
        console.log(error.code, error.message);
      },
      {enableHighAccuracy: false, timeout: 15000, maximumAge: 10000},
    );
  }


  getCategoryId(category:string){
    switch(category){
      case 'food': return "4d4b7105d754a06374d81259";
      case 'drinks': return "4bf58dd8d48988d112941735";
      case 'coffee': return "4bf58dd8d48988d1e0931735";
      default: return "4d4b7105d754a06374d81259"
    }
  }

  getVenues(params = {}) {
    if(this.state.isLoading) return null;

    this.setState({isLoading:true});

    const category = params.category || this.state.category;
    const query = params.query || this.state.query;
    const lat = params.latitude || this.state.latitude;
    const long = params.longitude || this.state.longitude;
    const offset = params.offset || 0;

    var url = 'https://api.foursquare.com/v2/venues/explore?'
    url += 'client_id=SQCAM5YS25I5GT23G52WXHGWS5FE4C300IUBNEJWUD22GG2J'
    url += '&client_secret=IZMZAFTA4PWEA0JVMWMEZZBJBAT3MJ5HBLK5JDFW5N55M1TN'
    url += '&v=20150729'
    url += `&ll=${lat},${long}`;
    url += `&limit=${Values.Numbers.FOURSQUARE_RESULT_LIMIT}`;
    url += `&offset=${offset}`
    

    if(query){
      url += `&query=${query}`
    }else{
      url += `&categoryId=${this.getCategoryId(category)}`;
    }

    
    axios
      .get(url)
      .then(res => {
        console.log("Response for explore endpoint: " + JSON.stringify(res, null, '\t'));
        const data = [];

        res.data.response.groups[0].items.map((item, index) => {
          
          var obj = {
            id: item.venue.id,
            name: item.venue.name,
            address: item.venue.location.formattedAddress,
            tier:0,
            photoURL: Values.Strings.PLACEHOLDER_IMAGE_URL,
            location: item.venue.location,
            categories: item.venue.categories,
          };

          if(item.venue.price) obj.tier = item.venue.price.tier;
          if(item.categories && item.category.length){
            const category = item.category[0]
            item.category[0].icon
          }
          data.push(obj);
        });
        this.setState((state) => {
          if(offset){
            state.dataArray = state.dataArray.concat(data);
          }else{
            state.dataArray = data;
          }
          state.offset = offset + Values.Numbers.FOURSQUARE_RESULT_LIMIT;
          state.isLoading = false;
          console.log("Updating State To: " + JSON.stringify(state, null, '\t'))
          return state;
        });
        this.getVenueDetails(data, offset);
      })
      .catch((err)=>{
        this.setState({isLoading:false})
        console.warn("Failed to fetch resturants: " + JSON.stringify(err) );
      })
   
  }



  getVenueDetails = async (venues, offset) => {
    //console.warn(venues);
    await Promise.all(
      venues.map((item, index) => {
        //console.warn(item.id);
        const url = 'https://api.foursquare.com/v2/venues/' +
        item.id +
        '?client_id=SQCAM5YS25I5GT23G52WXHGWS5FE4C300IUBNEJWUD22GG2J&client_secret=IZMZAFTA4PWEA0JVMWMEZZBJBAT3MJ5HBLK5JDFW5N55M1TN&v=20150729'
        
        return axios.get(url);
      }),
    ).then(responses => {
      const data = [];
      responses.map((res, index) => {
        var obj;
        const venue = res.data.response.venue;

        //initialize data item;
        const dataItem = {
          name: venue.name,
          address: venue.location.formattedAddress,
          id: venue.id,
          categories: venue.categories,
          location: venue.location,
          tier:0,
          photoURL:
            Values.Strings.PLACEHOLDER_IMAGE_URL,
        };

        //set price tier
        if(venue.price) dataItem.tier = venue.price.tier || 0;
        
        //set photo url
        if (venue.photos && venue.photos.count !== 0) {
          dataItem.photoURL =
              res.data.response.venue.bestPhoto.prefix +
              '400x225' +
              res.data.response.venue.bestPhoto.suffix;
        }
        data.push(dataItem);

      });


      this.setState((state)=>{
        Array.prototype.splice.apply(state.dataArray, [offset, data.length].concat(data));
        return state;
      });
    })
    .catch(err=>{
      console.warn("Failed to fetch venue details: " + JSON.stringify(err));
    })
  };


  /*
  Screen related methods below
  */

  showResturantDetails = (restaurantKey:string) => {
    this.props.navigation.navigate('RestaurantDetails', {restaurantKey})
  }

  _renderItem = ({item, index}) => {
    const onRecommendPress = () => {
      this.props.navigation.navigate('Recommend', {restaurant:item})
    };

    const onPlanPress = () => {
      this.props.navigation.navigate(Values.Screens.SCREEN_MAKE_PLAN, {restaurant:item})
    }

    return (
      <ResturantListItem 
        item={item}
        onRecommendPress={onRecommendPress}
        onRestaurantPress={this.showResturantDetails}
        onPlanPress={onPlanPress}
      />
    );
    
  }

  _renderListHeader = () => {

    if(!this.state.showFilter) return <View style={{height:16}} />;

    const category = this.state.category;

    const _renderHeaderItem = (label, isSelected, onPress) => {
      const textStyle = isSelected? styles.buttontextStyle:styles.buttontextStyleSelected
      return (
        <TouchableOpacity onPress={onPress}>
            <Text style={textStyle}>{label}</Text>
        </TouchableOpacity>
      )
    }

    return (
      <View style={styles.RestaurantCardTopBarButtonContainer}>
        {_renderHeaderItem('FOOD', category === 'food', ()=>{ this.setState({dataArray:[], category:'food'}); this.getVenues({category:'food'})} )}
        {_renderHeaderItem('DRINKS', category === 'drinks', ()=>{this.setState({dataArray:[], category:'drinks'}); this.getVenues({category:'drinks'})} )}
        {_renderHeaderItem('COFFEE', category === 'coffee', ()=>{this.setState({dataArray:[], category:'coffee'}); this.getVenues({category:'coffee'})} )}
      </View>
    )
  }

  _renderActivitIndicator = () => {
    return (
      <View>
        <ActivityIndicator size={'large'} animating={true} />
      </View>
    )
  }

  _renderResturantList() {
    //console.log(DatArray);
    const data = this.state.dataArray;
    return (
      <FlatList
        style={{flex: 1}}
        data={data}
        extraData={this.state}
        onEndReached={()=>{
          this.getVenues({offset:this.state.offset})
        }}
        renderItem={this._renderItem}
        keyExtractor={(item, index)=>item.id}
        ListHeaderComponent={this._renderListHeader}
        ListFooterComponent={this._renderActivitIndicator}
      />
    );
  }
  
  render() {
    return (
      <View style={{flex: 1}}>
        {this._renderResturantList()}
      </View>
    );
  }
}

const styles = {
  parentContainer: {
    flex: 1,
    flexDirection: 'column',
  },


  imagetextHoverRight: {
    fontSize: 14,
    color: 'white',
    fontWeight: 'bold',
    marginRight: 10,
    marginTop: 5,
    textAlign: 'right',
  },


  RestaurantCardBottomBarButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  RestaurantCardTopBarButtonContainer: {
    flex:1,
    flexDirection: 'row',
    justifyContent: 'space-around',
    margin:12,
  },
  buttonStyle: {
    backgroundColor: '#fe7002',
    borderRadius: 5,
    borderWidth: 1,
    flex: 1,
    height:40,
    justifyContent: 'space-between',
    borderColor: '#fe7002',
    marginLeft: 5,
    marginRight: 5,
    marginTop: 5,
    marginBottom: 5,
  },
  buttonStyleSelected: {
    backgroundColor: '#ffffff',
    borderRadius: 5,
    borderWidth: 1,
        height:40,
    flex: 1,
    justifyContent: 'space-between',
    borderColor: 'gray',
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
  RestaurantCardBottomBarTextContainer: {
    flex: 1,
    flexDirection: 'row',
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
};

export default withNavigation(Restaurants);
