import React, {Component} from 'react';
import {
  Text,
  View,
  Button,
  FlatList,
  ScrollView,
  TextInput,
  Image,
  TouchableOpacity,
  TouchableWithoutFeedback,
} from 'react-native';
import firebase from 'react-native-firebase';
import {Card, CardSection} from '../components/common';
import {withNavigation} from 'react-navigation';
import axios from 'axios';
import * as Values from '../res/Values';

class Users extends React.Component {
  state = {data1Array: [], data2Array: [], Follow: ''};


  componentDidMount() {
    this.getUser(
      firebase.auth().currentUser.uid,
      this.props.navigation.getParam('navID'),
    );
    console.warn(this.props.navigation.getParam('navID'));
    this.getUserRecommends(this.props.navigation.getParam('navID'));
  }


  getUser(userID, navID) {
    this.setState({Follow: ''});
    firebase
      .database()
      .ref('users')
      .once('value', async snapshot => {
        const data = [];
        snapshot.forEach(uids => {
          if (uids.key === userID) {
          } else if (uids.key === navID) {
            var obj = {
              uid: uids.key,
              totalFollowers: uids.val().totalFollowers,
              totalFollowing: uids.val().totalFollowing,
              recommendations: uids.val().totalRecommendations,
              name: uids.val().Name,
            };
            data.push(obj);
          }
        });
        var isFollow = await firebase
          .database()
          .ref(`userData/${userID}/following`)
          .once('value', snapshot1 => {
            //console.log(snapshot1);
            //return snapshot1;
          });
        isFollow.forEach(item => {
          if (item.key === navID) {
            this.setState({Follow: 'Yes'});
          }
        });

        this.setState({data1Array: data});
      });
  }
  


  unfollowUser(uid, userID) {
    this.setState({Follow: ''});
    console.warn('uid', uid);
    console.warn('userId', userID);
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


  async getUserRecommends(uid) {
    let feedids = await firebase
      .database()
      .ref(`userData/${uid}/recommendations`)
      .once('value', snapshot => {
        return snapshot;
      });
    //console.warn(feedids);
    this.processAllRecommends(feedids);
  }


  processAllRecommends = async feedids => {
    //console.warn(feedids);
    const array = [];
    feedids.forEach(main => {
      array.push([main.key, main.val()]);
    });
    //console.warn('ids', array);
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
          //console.warn("item",item);
          let userDetails = await firebase
            .database()
            .ref(`users/${item.val().uid}`)
            .once('value', snapshot1 => {
              //console.log(snapshot1);
              //return snapshot1;
            });
          let restaurantDetail = await firebase
            .database()
            .ref(`restaurant/${item.val().restaurantKey}`)
            .once('value', snapshot1 => {
              //console.log(snapshot1);
              //return snapshot1;
            });
          console.warn(restaurantDetail);
          obj = {
            priority: item.val().priority,
            rating: item.val().rating,
            waittime: item.val().waittime,
            name: userDetails.val().Name,
            restName: restaurantDetail.val().name,
            restPhoto: restaurantDetail.val().photo,
            tier: restaurantDetail.val().tier,
          };
          //console.warn(obj);
          return obj;
          //onsole.warn(userDetails);
          //console.warn(restaurantDetail);
        }),
      ).then(data => {
        //console.warn(data);
        this.setState({data2Array: data});
      });
    });
  };



  plotUserRecommends(DatArray) {
    console.log(DatArray);
    return (
      <FlatList
        // eslint-disable-next-line prettier/prettier
        // eslint-disable-next-line react-native/no-inline-styles
        style={{flex: 1}}
        data={DatArray}
        renderItem={({item, index}) => (
          <View style={styles.feedCardStyle}>
            <View style={styles.feedCardHeaderStyle1}>
              <Image
                style={styles.imgFeedHeaderStyle1}
                source={Values.Images.USER}
              />
              <View style={styles.textviewFeedHeaderStyle1}>
                <Text style={styles.textFeedHeaderStyle1}>{item.name}</Text>
                <Text style={styles.textFeedHeaderStyle1}>
                  Some information about user
                </Text>
              </View>
              <Text style={styles.timeFeedHeaderStyle}>13:30</Text>
            </View>
            <View>
              <Image style={styles.imageFeed} source={{uri: item.restPhoto}} />
              <View style={styles.imageFeedContainer}>
                <Text style={styles.imagetextHoverLeft}>{item.restName}</Text>
                <Text style={styles.imagetextHoverRight}>{item.waittime}</Text>
              </View>
              <View style={styles.imageFeedSecContainer}>
                <Text style={styles.imagetextHoverLeft}>{item.rating}</Text>
                <Text style={styles.imagetextHoverRight}>{item.tier}</Text>
              </View>
            </View>
            <View style={styles.feedCardBottomBar}>
              <Text style={styles.feedCardBottomBarText}>
                Details on what user eat and etc, just like social update post
              </Text>
              <View style={styles.feedCardBottomBarButtonContainer}>
                <TouchableOpacity style={styles.buttonStyleCard}>
                  <Text style={styles.buttontextStyleCard}>Add To Plan</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.buttonStyleCard}>
                  <Text style={styles.buttontextStyleCard}>Get Directions</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
        keyExtractor={DatumArray => DatumArray}
      />
    );
  }



  populateUsers(DatArray, userID) {
    console.log(DatArray);
    return (
      <FlatList
        // eslint-disable-next-line prettier/prettier
        // eslint-disable-next-line react-native/no-inline-styles
        style={{flex: 1}}
        data={DatArray}
        renderItem={({item}) => (
          <TouchableWithoutFeedback>
            <View style={{backgroundColor: '#FFFFFF', flex: 1}}>
              <View>
                <View style={styles.feedCardHeaderStyle}>
                  <Image
                    style={styles.imgFeedHeaderStyle}
                    source={Values.Images.USER}
                  />
                  <View style={styles.textviewFeedHeaderStyle}>
                    <Text style={styles.text1FeedHeaderStyle}>{item.name}</Text>
                    <Text style={styles.text2FeedHeaderStyle}>
                      {item.recommendations} Recommendations
                    </Text>
                    <View style={styles.followersTextContainer}>
                      <Text style={styles.text2FeedHeaderStyle}>
                        {item.totalFollowers} Followers
                      </Text>
                      <Text> </Text>
                      <Text style={styles.text2FeedHeaderStyle}>
                        {item.totalFollowing} Following
                      </Text>
                    </View>
                  </View>
                  <View style={styles.followUnfollowButtonContainer}>
                    {this.state.Follow === 'Yes' ? (
                      <TouchableOpacity
                        style={styles.followUnfollowButton}
                        onPress={() => this.unfollowUser(item.uid, userID)}>
                        <Text style={styles.followUnfollowButtonText}>
                          UnFollow
                        </Text>
                      </TouchableOpacity>
                    ) : (
                      <TouchableOpacity
                        style={styles.followUnfollowButton}
                        onPress={() => this.followUser(item.uid, userID)}>
                        <Text style={styles.followUnfollowButtonText}>
                          Follow
                        </Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              </View>
            </View>
          </TouchableWithoutFeedback>
        )}
        keyExtractor={DatumArray => DatumArray}
      />
    );
  }



  render() {
    const {navigation} = this.props;
    const navID = navigation.getParam('navID');
    return (
      <ScrollView style={{flex: 1}}>
        <View>
          {this.populateUsers(
            this.state.data1Array,
            firebase.auth().currentUser.uid,
          )}
          <Text style={styles.recommendText}>Recommendations </Text>
          {this.plotUserRecommends(this.state.data2Array)}
        </View>
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
  followUnfollowButtonContainer: {
    justifyContent: 'center',
  },
  followUnfollowButton: {
    backgroundColor: '#fe7002',
    width: 70,
    height: 30,
    color: '#fe7002',
    borderRadius: 5,
  },
  followUnfollowButtonText: {
    alignSelf: 'center',
    color: '#ffffff',
    fontSize: 14,
  },
  mainHeaderText: {
    fontSize: 20,
    flex: 4,
  },
  recommendText: {
    fontSize: 16,
    marginLeft: 10,
    marginTop: 15,
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
export default withNavigation(Users);
