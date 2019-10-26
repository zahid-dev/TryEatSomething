/*
@format
@flow
*/

import firebase from 'react-native-firebase'

export class Recommendation {

    static makeRecommendation(id, rating, waittime, description, restaurant):Promise<any> {
        return new Promise((resolve, reject)=>{

            const userID = firebase.auth().currentUser.uid;

            const newRecommendKey = firebase.database()
            .ref('recommend')
            .push().key;
  
          const unixTimeStamp = Date.now();
          firebase
            .database()
            .ref(`restaurant/${id}`)
            .once('value', snapshot => {
              if (snapshot.val()) {
                console.warn('wtf if');
                console.warn(userID);
                firebase
                  .database()
                  .ref(`restaurant/${id}`)
                  .child('AggRating')
                  .once(
                    'value',
                    snapshot1 => {
                      const newRating = (parseInt(snapshot1.val()) + parseInt(rating)) / 2;
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
                      const newRecommendations = parseInt(snapshot4.val() || 0) + 1;
      
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
                  }, ()=>{
                      resolve(true)
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
                  .ref(`userData/${userID}`)
                  .child('followers')
                  .once('value', snapshot => {
                    snapshot.forEach(ids => {
                      console.warn(ids);
                      firebase
                        .database()
                        .ref(`userData/${ids.key}/feed`)
                        .update({
                          [newRecommendKey]: -unixTimeStamp,
                        });
                    });
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
                  }, ()=>{
                    resolve(true)
                });
      
                //create new restaurant object
                restaurant.AggRating = rating;
                restaurant.AggWaittime = waittime;
                restaurant.numberOfRatings = 1;
                restaurant.recommendations = true;
                firebase.database()
                  .ref(`restaurant/${id}`)
                  .set(restaurant);
      
      
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
                firebase
                  .database()
                  .ref(`userData/${userID}`)
                  .child('followers')
                  .once('value', snapshot => {
                    snapshot.forEach(ids => {
                      console.warn(ids);
                      firebase
                        .database()
                        .ref(`userData/${ids.key}/feed`)
                        .update({
                          [newRecommendKey]: -unixTimeStamp,
                        });
                    });
                  });
              }
            });
        });
      }

      static async getRecommendationsUsingKeySnaps(feedSnapshot){
        //compile promises
        const promises = [];
        feedSnapshot.forEach((feedItemSnap)=>{
          const recommendationKey = feedItemSnap.key;
          const firebaseRef = firebase.database()
            .ref('recommendations')
            .child(recommendationKey)
            .once('value', snapshot1 => {});
          promises.push(firebaseRef)
        })
    
        const snapshotsArray = await Promise.all(promises)
    
        //process snapshot array
        const recommendations = [];
        snapshotsArray.forEach((recommendationSnap) => {
          const recommendation = recommendationSnap.val();
          recommendation.key = recommendationSnap.key;
          recommendations.push(recommendation);
        });
    
        return Recommendation.getLinkedDataForRecommendations(recommendations);
      }

      static async getLinkedDataForRecommendations(recommendations) {

        const retArray = [];
    
        for(var i = 0; i < recommendations.length; i++){
          const recommendation = recommendations[i];
          //get user data
          let userSnapshot = await firebase
          .database()
          .ref(`users/${recommendation.uid}`)
          .once('value', snapshot1 => {});
          const user = userSnapshot.val();
    
          //get resturant data
          let restaurantSnapshot = await firebase
          .database()
          .ref(`restaurant/${recommendation.restaurantKey}`)
          .once('value', snapshot1 => {});
          const restaurant = restaurantSnapshot.val();
    
          recommendation.user = user;
          recommendation.restaurant = restaurant
          retArray.push(recommendation);
        }
    
        return retArray;
      };
}


export class User {
  static async getUser(uid){
    let userData = await firebase
    .database()
    .ref(`users/${uid}`)
    .once('value', snapshot1 => {
      //console.log(snapshot1);
      return snapshot1;
    });
    const user = userData.val();
    return user;
  }


  static followUser(uid, currentUid) {

    console.warn('uid', uid);
    console.warn('currentUid', currentUid);
    firebase
      .database()
      .ref(`userData/${currentUid}`)
      .child('following')
      .update({
        [uid]: true,
      });

    firebase
      .database()
      .ref(`userData/${uid}`)
      .child('followers')
      .update({
        [currentUid]: true,
      });

    firebase
      .database()
      .ref(`userData/${uid}/recommendations`)
      .once('value', snapshot => {
        snapshot.forEach(feed => {
          firebase
            .database()
            .ref(`userData/${currentUid}/feed`)
            .update({
              [feed.key]: feed.val(),
            });
        });
        DeviceEventEmitter.emit('REFRESH_FEED', {})
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
      .ref(`users/${currentUid}`)
      .child('totalFollowing')
      .once(
        'value',
        snapshot4 => {
          const totalFollowing = parseInt(snapshot4.val()) + 1;

          firebase
            .database()
            .ref(`users/${currentUid}`)
            .child('totalFollowing')
            .set(totalFollowing);
        },
        err => {
          console.warn('Failed to update following' + JSON.stringify(err));
        },
      );
      
  }


  static unfollowUser(uid, currentUid) {
   
    console.warn('uid', uid);
    console.warn('currentUid', currentUid);
    firebase
      .database()
      .ref(`userData/${currentUid}/following`)
      .child(uid)
      .remove();
    firebase
      .database()
      .ref(`userData/${uid}/followers`)
      .child(currentUid)
      .remove();
    firebase
      .database()
      .ref(`userData/${currentUid}/feed`)
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
                    .ref(`userData/${currentUid}/feed`)
                    .child(recommend.key)
                    .remove();
                }
              });
              DeviceEventEmitter.emit('REFRESH_FEED', {})
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
      .ref(`users/${currentUid}`)
      .child('totalFollowing')
      .once(
        'value',
        snapshot4 => {
          const totalFollowing = parseInt(snapshot4.val()) - 1;

          firebase
            .database()
            .ref(`users/${currentUid}`)
            .child('totalFollowing')
            .set(totalFollowing);
        },
        err => {
          console.warn('Failed to update following' + JSON.stringify(err));
        },
      );
  }

}


export class UserData {

  static async getRecommendations(uid){
    let feedSnapshot = await firebase
      .database()
      .ref(`userData/${uid}/recommendations`)
      .orderByValue()
      .once('value', snapshot => {
        return snapshot;
      });

    return Recommendation.getRecommendationsUsingKeySnaps(feedSnapshot);
  }
}



export class Feed {

  static async getUserFeed(){
    const uid = firebase.auth().currentUser.uid;
    let feedSnapshot = await firebase
      .database()
      .ref(`userData/${uid}/feed`)
      .orderByValue()
      .once('value', snapshot => {
        return snapshot;
      });

    return Recommendation.getRecommendationsUsingKeySnaps(feedSnapshot);
  }


  static async getGlobalFeed() {

    let recommendationSnaps = await firebase
      .database()
      .ref('recommendations')
      .orderByChild('priority')
      .once('value', snapshot => {
        return snapshot;
      });

    const recommendations = [];
    recommendationSnaps.forEach((childSnap)=>{
      const recommendation = childSnap.val();
      recommendation.key = childSnap.key;
      recommendations.push(recommendation)
    }) 
    //console.warn(allrecommendations);
    return Recommendation.getLinkedDataForRecommendations(recommendations);
  }

}