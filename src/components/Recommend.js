import React, {Component, Platform} from 'react';
import {Text, View, Button, TextInput, StyleSheet} from 'react-native';
import {withNavigation} from 'react-navigation';
import axios from 'axios';
import firebase from './FirebaseConfig';

class Recommend extends React.Component {
  constructor(props) {
    super(props);
  }
  state = {text: '', rating: 0, waittime: 0};

  addToDB(id, rating, waittime, description) {
    const newRecommendKey = firebase
      .database()
      .ref(`recommend`)
      .push().key;
    const unixTimeStamp = Date.now();
    firebase.auth().onAuthStateChanged(user => {
      if (user) {
        firebase
          .database()
          .ref(`restaurant/${id}`)
          .once('value', snapshot => {
            if (snapshot.exists()) {
              const userData = snapshot.val();
              console.warn('exists!', userData);
            } else {
              firebase
                .database()
                .ref(`recommendations/${newRecommendKey}`)
                .set({
                  restaurantKey: id,
                  description: description,
                  rating: rating,
                  waittime: waittime,
                  uid: user.uid,
                  timeStamp: unixTimeStamp,
                  priority: -unixTimeStamp,
                });
              firebase
                .database()
                .ref(`restaurant/${id}`)
                .set({
                  rating: rating,
                  waittime: waittime,
                  numberOfRatings: 0,
                  recommendations: true,
                });
              firebase
                .database()
                .ref(`restaurant/${id}`)
                .child(`recommendations`)
                .update({
                  [newRecommendKey]: -unixTimeStamp,
                });
              firebase
                .database()
                .ref(`userData/${user.uid}`)
                .child(`recommendations`)
                .update({
                  [newRecommendKey]: -unixTimeStamp,
                });
              firebase
                .database()
                .ref(`userData/${user.uid}`)
                .child(`feed`)
                .update({
                  [newRecommendKey]: -unixTimeStamp,
                });
            }
          });
      }
    });
  }

  render() {
    const {navigation} = this.props;
    const id = navigation.getParam('id');
    return (
      <View>
        <Text>{id}</Text>
        <View style={styles.textAreaContainer}>
          <TextInput
            style={styles.textArea}
            underlineColorAndroid="transparent"
            placeholder="Share Your Experience"
            placeholderTextColor="grey"
            numberOfLines={10}
            multiline={true}
            onChangeText={text => this.setState({text})}
            value={this.state.text}
          />
        </View>
        <View style={styles.containerStyle}>
          <Text style={styles.labelStyle}>Rate Your Experience: </Text>
          <TextInput
            placeholder="Stars"
            autoCorrect={false}
            keyboardType={'numeric'}
            value={String(this.state.rating)}
            onChangeText={rating => this.setState({rating})}
          />
        </View>
        <View style={styles.containerStyle}>
          <Text style={styles.labelStyle}>Wait Time: </Text>
          <TextInput
            placeholder="Minutes"
            autoCorrect={false}
            keyboardType={'numeric'}
            value={String(this.state.waittime)}
            onChangeText={waittime => this.setState({waittime})}
          />
          <Button
            title="SendToDB"
            onPress={() =>
              this.addToDB(
                id,
                this.state.rating,
                this.state.waittime,
                this.state.text,
              )
            }
          />
        </View>
      </View>
    );
  }
}
const styles = StyleSheet.create({
  textAreaContainer: {
    borderColor: '#778899',
    borderWidth: 1,
    padding: 5,
    position: 'relative',
  },
  textArea: {
    height: 150,
    fontSize: 20,
    justifyContent: 'flex-start',
  },
  inputStyle: {
    color: '#000',
    paddingRight: 5,
    paddingLeft: 5,
    fontSize: 18,
    lineHeight: 23,
  },
  labelStyle: {
    fontSize: 18,
    paddingLeft: 20,
  },
  containerStyle: {
    height: 40,
    flexDirection: 'row',
    position: 'relative',
    alignItems: 'center',
  },
});
export default withNavigation(Recommend);
