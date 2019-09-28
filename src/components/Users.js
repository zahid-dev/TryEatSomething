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
  componentDidMount() {}
  getUsers(userID) {
    firebase
      .database()
      .ref('users')
      .once('value', snapshot => {
        const data = [];
        snapshot.forEach(uids => {
          if (uids.key === userID) {
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

  followUser(uid, userID) {
    firebase
      .database()
      .ref(`userData/${userID}`)
      .child('following')
      .update({
        [uid]: true,
      });
    firebase
      .database()
      .ref(`userData/${uid}`)
      .child('followers')
      .update({
        [userID]: true,
      });
    firebase
      .database()
      .ref(`userData/${uid}/recommendations`)
      .once('value', snapshot => {
        snapshot.forEach(feed => {
          firebase
            .database()
            .ref(`userData/${userID}/feed`)
            .update({
              [feed.key]: feed.val(),
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
      .ref(`users/${userID}`)
      .child('totalFollowing')
      .once(
        'value',
        snapshot4 => {
          const totalFollowing = parseInt(snapshot4.val()) + 1;

          firebase
            .database()
            .ref(`users/${userID}`)
            .child('totalFollowing')
            .set(totalFollowing);
        },
        err => {
          console.warn('Failed to update following' + JSON.stringify(err));
        },
      );
  }

  unfollowUser(uid, userID) {
    firebase
      .database()
      .ref(`userData/${userID}/following`)
      .child(uid)
      .remove();
    firebase
      .database()
      .ref(`userData/${uid}/followers`)
      .child(userID)
      .remove();
    firebase
      .database()
      .ref(`userData/${userID}/feed`)
      .once('value', snapshot => {
        snapshot.forEach(feed => {
          firebase
            .database()
            .ref(`userData/${uid}`)
            .child('recommendations')
            .once('value', snapshot1 => {
              snapshot1.forEach(recommend => {
                if (
                  feed.key === recommend.key &&
                  feed.val() === recommend.val()
                ) {
                  firebase
                    .database()
                    .ref(`userData/${userID}/feed`)
                    .child(recommend.key)
                    .remove();
                }
              });
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
      .ref(`users/${userID}`)
      .child('totalFollowing')
      .once(
        'value',
        snapshot4 => {
          const totalFollowing = parseInt(snapshot4.val()) - 1;

          firebase
            .database()
            .ref(`users/${userID}`)
            .child('totalFollowing')
            .set(totalFollowing);
        },
        err => {
          console.warn('Failed to update following' + JSON.stringify(err));
        },
      );
  }
  populateUsers(DatArray, userID) {
    console.log(DatArray);
    this.getUsers(userID);
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
                  onPress={() => this.followUser(item.uid, userID)}
                />
                <Button
                  title="UnFollow"
                  onPress={() => this.unfollowUser(item.uid, userID)}
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
    const {navigation} = this.props;
    const userID = navigation.getParam('userID');
    return <View>{this.populateUsers(this.state.dataArray, userID)}</View>;
  }
}

export default withNavigation(Users);
