import React, {Component, Platform} from 'react';
import {Text, View, Button, TextInput, StyleSheet} from 'react-native';
import {withNavigation} from 'react-navigation';
import axios from 'axios';
import firebase from '../components/FirebaseConfig';

class Recommend extends React.Component {
  constructor(props) {
    super(props);
  }
  state = {text: '', rating: 0, waittime: 0};

  addToDB(id, rating, waittime, description, userID) {
    const newRecommendKey = firebase
      .database()
      .ref('recommend')
      .push().key;
    const unixTimeStamp = Date.now();
    firebase
      .database()
      .ref(`restaurant/${id}`)
      .once('value', snapshot => {
        if (snapshot.exists()) {
          console.warn('wtf if');
          console.warn(userID);
          firebase
            .database()
            .ref(`restaurant/${id}`)
            .child('AggRating')
            .once(
              'value',
              snapshot1 => {
                const newRating =
                  (parseInt(snapshot1.val()) + parseInt(rating)) / 2;

                snapshot.ref.child('AggRating').set(newRating);
              },
              err => {
                console.warn('Failed to update rating' + JSON.stringify(err));
              },
            );
          firebase
            .database()
            .ref(`restaurant/${id}`)
            .child('AggWaittime')
            .once(
              'value',
              snapshot2 => {
                const newTime =
                  (parseInt(snapshot2.val()) + parseInt(waittime)) / 2;

                snapshot.ref.child('AggWaittime').set(newTime);
              },
              err => {
                console.warn('Failed to update waittime' + JSON.stringify(err));
              },
            );

          firebase
            .database()
            .ref(`restaurant/${id}`)
            .child('numberOfRatings')
            .once(
              'value',
              snapshot3 => {
                const newNumofRatings = parseInt(snapshot3.val()) + 1;

                snapshot.ref.child('numberOfRatings').set(newNumofRatings);
              },
              err => {
                console.warn(
                  'Failed to update numofrating' + JSON.stringify(err),
                );
              },
            );

          firebase
            .database()
            .ref(`users/${userID}`)
            .child('totalRecommendations')
            .once(
              'value',
              snapshot4 => {
                const newRecommendations = parseInt(snapshot4.val()) + 1;

                firebase
                  .database()
                  .ref(`users/${userID}`)
                  .child('totalRecommendations')
                  .set(newRecommendations);
              },
              err => {
                console.warn(
                  'Failed to update numofrating' + JSON.stringify(err),
                );
              },
            );

          firebase
            .database()
            .ref(`recommendations/${newRecommendKey}`)
            .set({
              restaurantKey: id,
              description: description,
              rating: rating,
              waittime: waittime,
              uid: userID,
              timeStamp: unixTimeStamp,
              priority: -unixTimeStamp,
            });
          firebase
            .database()
            .ref(`restaurant/${id}`)
            .child('recommendations')
            .update({
              [newRecommendKey]: -unixTimeStamp,
            });
          firebase
            .database()
            .ref(`userData/${userID}`)
            .child('recommendations')
            .update({
              [newRecommendKey]: -unixTimeStamp,
            });
          firebase
            .database()
            .ref(`userData/${userID}`)
            .child('feed')
            .update({
              [newRecommendKey]: -unixTimeStamp,
            });
        } else {
          console.warn('wtf else');
          console.warn(userID);
          firebase
            .database()
            .ref(`recommendations/${newRecommendKey}`)
            .set({
              restaurantKey: id,
              description: description,
              rating: rating,
              waittime: waittime,
              uid: userID,
              timeStamp: unixTimeStamp,
              priority: -unixTimeStamp,
            });
          firebase
            .database()
            .ref(`restaurant/${id}`)
            .set({
              AggRating: rating,
              AggWaittime: waittime,
              numberOfRatings: 1,
              recommendations: true,
            });
          firebase
            .database()
            .ref(`restaurant/${id}`)
            .child('recommendations')
            .update({
              [newRecommendKey]: -unixTimeStamp,
            });
          firebase
            .database()
            .ref(`userData/${userID}`)
            .child('recommendations')
            .update({
              [newRecommendKey]: -unixTimeStamp,
            });
          firebase
            .database()
            .ref(`userData/${userID}`)
            .child('feed')
            .update({
              [newRecommendKey]: -unixTimeStamp,
            });
          firebase
            .database()
            .ref(`users/${userID}`)
            .child('totalRecommendations')
            .once(
              'value',
              snapshot4 => {
                const newRecommendations = parseInt(snapshot4.val()) + 1;

                firebase
                  .database()
                  .ref(`users/${userID}`)
                  .child('totalRecommendations')
                  .set(newRecommendations);
              },
              err => {
                console.warn(
                  'Failed to update totrecommend' + JSON.stringify(err),
                );
              },
            );
        }
      });
  }

  render() {
    const {navigation} = this.props;
    const id = navigation.getParam('id');
    const userID = navigation.getParam('userID');
    console.warn(userID);
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
                userID,
              )
            }
          />
          <Button
            title="Go back"
            onPress={() => this.props.navigation.goBack()}
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
