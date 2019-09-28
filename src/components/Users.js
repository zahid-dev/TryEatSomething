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

class Users extends React.Component {
  state = {dataArray: []};
  componentDidMount() {
    this.getUsers();
  }
  getUsers() {
    firebase.auth().onAuthStateChanged(user => {
      if (user) {
        firebase
          .database()
          .ref('users')
          .once('value', snapshot => {
            const data = [];
            snapshot.forEach(uids => {
              if (uids.key === user.uid) {
              } else {
                var obj = {
                  uid: uids.key,
                  totalFollowers: uids.val().totalFollowers,
                  totalFollowing: uids.val().totalFollowing,
                  name: uids.val().Name,
                };
                data.push(obj);
              }
            });
            this.setState({dataArray: data});
          });
      }
    });
  }
  followUser(uid) {
    firebase.auth().onAuthStateChanged(id => {
      if (id) {
        firebase
          .database()
          .ref(`userData/${id.uid}`)
          .child('following')
          .update({
            [uid]: true,
          });
        firebase
          .database()
          .ref(`userData/${uid}`)
          .child('followers')
          .update({
            [id.uid]: true,
          });
        firebase
          .database()
          .ref(`userData/${uid}/recommendations`)
          .once('value', snapshot => {
            snapshot.forEach(feed => {
              firebase
                .database()
                .ref(`userData/${id.uid}`)
                .child('followers')
                .update({
                  [feed.key]: feed.data,
                });
            });
          });
        firebase
          .database()
          .ref(`users/${uid}`)
          .child('totalFollowers')
          .once(
            'value',
            snapshot4 => {
              const totalFollowers = parseInt(snapshot4.val()) + 1;

              firebase
                .database()
                .ref(`users/${uid}`)
                .child('totalFollowers')
                .set(totalFollowers);
            },
            err => {
              console.warn('Failed to update followers' + JSON.stringify(err));
            },
          );
        firebase
          .database()
          .ref(`users/${id.uid}`)
          .child('totalFollowing')
          .once(
            'value',
            snapshot4 => {
              const totalFollowing = parseInt(snapshot4.val()) + 1;

              firebase
                .database()
                .ref(`users/${id.uid}`)
                .child('totalFollowing')
                .set(totalFollowing);
            },
            err => {
              console.warn('Failed to update following' + JSON.stringify(err));
            },
          );
      }
    });
  }
  unfollowUser(uid) {
    firebase.auth().onAuthStateChanged(id => {
      if (id) {
        firebase
          .database()
          .ref(`userData/${id.uid}/following`)
          .child(uid)
          .remove();
        firebase
          .database()
          .ref(`userData/${uid}/followers`)
          .child(id.uid)
          .remove();

        firebase
          .database()
          .ref(`users/${uid}`)
          .child('totalFollowers')
          .once(
            'value',
            snapshot4 => {
              const totalFollowers = parseInt(snapshot4.val()) - 1;

              firebase
                .database()
                .ref(`users/${uid}`)
                .child('totalFollowers')
                .set(totalFollowers);
            },
            err => {
              console.warn('Failed to update followers' + JSON.stringify(err));
            },
          );
        firebase
          .database()
          .ref(`users/${id.uid}`)
          .child('totalFollowing')
          .once(
            'value',
            snapshot4 => {
              const totalFollowing = parseInt(snapshot4.val()) - 1;

              firebase
                .database()
                .ref(`users/${id.uid}`)
                .child('totalFollowing')
                .set(totalFollowing);
            },
            err => {
              console.warn('Failed to update following' + JSON.stringify(err));
            },
          );
      }
    });
  }
  populateUsers(DatArray) {
    console.log(DatArray);
    return (
      <FlatList
        // eslint-disable-next-line prettier/prettier
        // eslint-disable-next-line react-native/no-inline-styles
        data={DatArray}
        renderItem={({item}) => (
          <TouchableWithoutFeedback>
            <View style={{padding: 18}}>
              <Text>{item.name}</Text>
              <Text>{item.uid}</Text>
              <Text> Total Followers </Text>
              <Text>{item.totalFollowers}</Text>
              <Text> Total Following </Text>
              <Text>{item.totalFollowing}</Text>
              <CardSection>
                <Button
                  title="Follow"
                  onPress={() => this.followUser(item.uid)}
                />
                <Button
                  title="UnFollow"
                  onPress={() => this.unfollowUser(item.uid)}
                />
              </CardSection>
            </View>
          </TouchableWithoutFeedback>
        )}
        keyExtractor={DatumArray => DatumArray}
      />
    );
  }

  render() {
    return <View>{this.populateUsers(this.state.dataArray)}</View>;
  }
}

export default withNavigation(Users);
