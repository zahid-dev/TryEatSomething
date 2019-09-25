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
import firebase from './FirebaseConfig';
import {Card, CardSection} from './common';
import {withNavigation} from 'react-navigation';
import axios from 'axios';

class Restaurants extends React.Component {
  state = {
    error: '',
    type: 'explore',
    location: 'islamabad,pk',
    query: 'food',
    dataArray: [],
  };
  getRecommends = () => {
    this.setState({dataArray: ''});

    axios
      // eslint-disable-next-line no-undef
      .get(
        'https://api.foursquare.com/v2/venues/' +
          this.state.type +
          '?client_id=0ZRQFYTWFUAOKLRVJ3I3W1VKW0FUGDQL5RZ24N0O4JWMSPJG&client_secret=VWJPW1FDJHZZNZSMTQOOEJETX5TZBCH0G5R4WYWA1IGL1OLZ&v=20150729&near=' +
          this.state.location +
          '&query=' +
          this.state.query +
          '&limit=50',
      )
      .then(res => {
        const data = [];
        //console.log(res.data.response.groups[0].items[0].venue.name);
        if (this.state.type === 'explore') {
          res.data.response.groups[0].items.map((item, index) => {
            console.log(item.venue.name);
            var obj = {
              name: item.venue.name,
              address: item.venue.location.formattedAddress,
              id: item.venue.id,
            };
            data.push(obj);
          });
        } else if (this.state.type === 'search') {
          res.data.response.venues.map((item, index) => {
            console.log(item.name);
            var obj = {
              name: item.name,
              address: item.formattedAddress,
              id: item.id,
            };
            data.push(obj);
          });
        }
        this.setState({dataArray: data});
      })

      .catch(error => {
        console.log('Error' + error);
      });
  };
  plotRecommends(DatArray) {
    console.log(DatArray);
    return (
      <FlatList
        // eslint-disable-next-line prettier/prettier
        // eslint-disable-next-line react-native/no-inline-styles
        style={{flex: 1}}
        data={DatArray}
        renderItem={({item, index}) => (
          <TouchableWithoutFeedback onPress={() => this.actionOnRow(item.id)}>
            <View>
              <Text style={{padding: 18}}>
                {item.name + '  ' + item.address}
              </Text>
            </View>
          </TouchableWithoutFeedback>
        )}
        keyExtractor={DatumArray => DatumArray}
      />
    );
  }
  actionOnRow(item) {
    this.props.navigation.navigate('restaurantDetail', {
      id: item,
    });
  }
  render() {
    return (
      // eslint-disable-next-line react-native/no-inline-styles
      <ScrollView style={{flex: 1}}>
        {/* <Text style={styles.errorTextStyle}>{this.state.error}</Text> */}
        <Card>
          <CardSection>
            <TextInput
              placeholder="type"
              label="type"
              value={this.state.type}
              onChangeText={type =>
                this.setState({type}, this.setState({dataArray: ''}))
              }
            />
          </CardSection>

          <CardSection>
            <TextInput
              placeholder="location"
              label="Location"
              value={this.state.location}
              onChangeText={location =>
                this.setState({location}, this.setState({dataArray: ''}))
              }
            />
          </CardSection>
          <CardSection>
            <TextInput
              placeholder="query"
              label="query"
              value={this.state.query}
              onChangeText={query =>
                this.setState({query}, this.setState({dataArray: ''}))
              }
            />
          </CardSection>
          <CardSection>
            <Button title="Execute" onPress={this.getRecommends} />
            <Button title="Log Out" onPress={() => firebase.auth().signOut()} />
          </CardSection>
          {this.plotRecommends(this.state.dataArray)}
        </Card>
      </ScrollView>
    );
  }
}

export default withNavigation(Restaurants);
