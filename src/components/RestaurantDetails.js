import React, {Component, Platform} from 'react';
import {Text, View, Button} from 'react-native';
import {withNavigation} from 'react-navigation';
import axios from 'axios';

class RestaurantDetails extends React.Component {
  constructor(props) {
    super(props);
  }
  getLocationandName = id => {
    console.warn(id);
    axios
      // eslint-disable-next-line no-undef
      .get(
        'https://api.foursquare.com/v2/venues/' +
          id +
          '?client_id=0ZRQFYTWFUAOKLRVJ3I3W1VKW0FUGDQL5RZ24N0O4JWMSPJG&client_secret=VWJPW1FDJHZZNZSMTQOOEJETX5TZBCH0G5R4WYWA1IGL1OLZ&v=20150729',
      )
      .then(res => {
        console.warn(res.data.response.venue.name);
        console.warn(res.data.response.venue.price.message);
        console.warn(res.data.response.venue.location);
        console.warn(res.data.response.venue.location.formattedAddress);
        console.warn(res.data.response.venue.categories.name);
      })
      .catch(error => {
        console.warn(error);
      });
  };

  recommendPageNav(item) {
    this.props.navigation.navigate('recommend', {
      id: item,
    });
  }
  render() {
    const {navigation} = this.props;
    const id = navigation.getParam('id');
    return (
      <View>
        <Text>{id}</Text>
        {/* {this.getLocationandName(id)} */}
        <Button title="Recommend" onPress={() => this.recommendPageNav(id)} />
      </View>
    );
  }
}

export default withNavigation(RestaurantDetails);
