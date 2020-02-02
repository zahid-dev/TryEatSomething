/*
@format
@flow
*/

import firebase from '@react-native-firebase/app'
import * as Contract from '../firebase/Contract'


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
          if(recommendation){
            recommendation.key = recommendationSnap.key;
            recommendations.push(recommendation);
          }
        });
    
        return Recommendation.getLinkedDataForRecommendations(recommendations);
      }

      static async getLinkedDataForRecommendations(recommendations) {

        const retArray = [];

        const promises = [];
        const restaurantsPromises = [];

        const usersMap = new Map<String, Object>();
        const restaurantsMap = new Map<String, Object>();
    
        for(var i = 0; i < recommendations.length; i++){

          //feed data fetch v2
          const recommendation = recommendations[i];

          const uid = recommendation.uid;
          // if(!usersMap.has(uid)){
            // usersMap.set(uid, null);
            const userPromise = firebase.database().ref(Contract.User.PATH_BASE)
            .child(uid)
            .once("value");
            promises.push(userPromise);
          // }

          const restaurantKey = recommendation.restaurantKey;
          // if(!restaurantsMap.has(restaurantKey)){
            // restaurantsMap.set(restaurantKey, null);
            const restaurantPromise = firebase.database().ref(Contract.Restaurant.PATH_BASE)
            .child(restaurantKey)
            .once('value');
            promises.push(restaurantPromise);
          // }

          //feed data fetch v1
          // const recommendation = recommendations[i];

          // //get user data
          // let userSnapshot = await firebase
          // .database()
          // .ref(`users/${recommendation.uid}`)
          // .once('value', snapshot1 => {});
          // const user = userSnapshot.val();
    
          // //get resturant data
          // let restaurantSnapshot = await firebase
          // .database()
          // .ref(`restaurant/${recommendation.restaurantKey}`)
          // .once('value', snapshot1 => {});
          // const restaurant = restaurantSnapshot.val();
    
          // recommendation.user = user;
          // recommendation.restaurant = restaurant
          // retArray.push(recommendation);
        }

        const snapshots = await Promise.all(promises);
        const restaurantSnapshots = await Promise.all(restaurantsPromises);

        for(var i = 0, j = 0; i < recommendations.length; i++, j = j + 2){
        
          const recommendation = recommendations[i];

          recommendation.user = snapshots[j].val();
          recommendation.restaurant = snapshots[j+1].val();
          retArray.push(recommendation);

        }
    
        return retArray;
      };
}


export class User {

  static async getUser(uid:string):Contract.User{
    let userSnapshot = await firebase
    .database()
    .ref(`users/${uid}`)
    .once('value', snapshot1 => {
      //console.log(snapshot1);
      return snapshot1;
    });
    const user = userSnapshot.val();
    user.uid = userSnapshot.key;
    return user;
  }

  static fetchWithQuery(query:string):Promise<Array<Contract.User>>{
    return new Promise((resolve, reject)=>{
      //TODO: update method with proper query
      query = query.toLowerCase();
      firebase.database().ref(Contract.User.PATH_BASE)
        .orderByChild(Contract.User.CHILD_TAG)
        .startAt(query)
        .endAt(query+"\uf8ff")
        .once(
          'value',
          (snapshot)=>{
            const users = [];
            snapshot.forEach((userSnap)=>{
              const user = userSnap.val();
              if(user){
                user.uid = userSnap.key;
                users.push(user);
              }
            })
            resolve(users);
          },
          (err)=>{
            reject(err);
          }
        )
    })
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


  static fetchFollowers():Promise<Array<Contract.User>>{
    return new Promise((resolve, reject)=>{
      const uid = firebase.auth().currentUser.uid;
      firebase.database().ref(Contract.UserData.PATH_BASE)
        .child(uid)
        .child(Contract.UserData.PATH_FOLLOWERS)
        .once('value', (snapshot)=>{
          if(snapshot.val()){
            const promises = []
            snapshot.forEach((childSnap)=>{
              if(childSnap.val()){
                const followerUid = childSnap.key;
                //fetch users
                promises.push(User.getUser(followerUid))
              }
            })

            Promise.all(promises)
            .then(users => resolve(users))
            .catch((err)=>{
              console.warn("Failed to fetch users using follower ids");
              reject(err)
            })
          }else{
            reject(new Error("User has no followers"))
          }
        },(error)=>{

        })
    });
  }

  static addPlan(uid, planKey, priority){
    firebase.database().ref(Contract.UserData.PATH_BASE)
      .child(uid)
      .child(Contract.UserData.PATH_PLANS)
      .child(planKey)
      .set(priority, (err)=>{
        if(!err){

        }
      })
  }

  static removePlan(uid, planKey){
    firebase.database().ref(Contract.UserData.PATH_BASE)
      .child(uid)
      .child(Contract.UserData.PATH_PLANS)
      .child(planKey)
      .remove((err)=>{
        if(!err){
          console.log("Removed plan entry from user data")
        }
      })
  }

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

  static async fetchUserPlans(){
    try {
      //fetch plan keys for uesr
      const uid = firebase.auth().currentUser.uid;
      const snapshot = await firebase.database().ref(Contract.UserData.PATH_BASE)
      .child(uid)
      .child(Contract.UserData.PATH_PLANS)
      .orderByValue()
      .once('value', (snapshot)=>{}, (err)=>{console.warn(err)});

      //iterate and fetch plans
      const promises = []
      snapshot.forEach(childSnap => {
        const planKey = childSnap.key;
        promises.push(Plan.getPlan(planKey))
      })

      const plans = await Promise.all(promises);
      console.log("Returning plans list: " + JSON.stringify(plans));
      return plans;

    }
    catch(error){
      console.warn("Failed to get plans list: " + JSON.stringify(error))
    }
  }
}


export class Plan {

  static getPlan(planKey:string):Promise<Contract.Plan>{
    return new Promise((resolve, reject)=>{
      console.log("Fetching plan for key: " + planKey)
      firebase.database().ref(Contract.Plan.PATH_BASE)
      .child(planKey)
      .once(
        'value',
        (snapshot)=>{
          const plan = snapshot.val();
          if(plan){
            plan.key = snapshot.key;
            resolve(plan)
          }else{
            reject(new Error("No plan returned in snapshot"))
          }
        },
        (err)=>{
          console.warn("Failed to get plan: " + JSON.stringify(err))
          reject(err)
        }
      )
    })
  }


  static listenForPlan(planKey:string, onCallback:(Contract.Plan)=>void, onError:(Error)=>void){
    console.log("Fetching plan for key: " + planKey)
    const ref = firebase.database().ref(Contract.Plan.PATH_BASE)
      .child(planKey);

    const snapshotCallback = (snapshot) => {
      const plan = snapshot.val();
      if(plan){
        plan.key = snapshot.key;
        onCallback(plan)
      }else{
        onError(new Error("No plan returned in snapshot"))
      }
    }

    ref.on(
      'value',
      snapshotCallback,
      (err)=>{
        console.warn("Failed to get plan: " + JSON.stringify(err))
        onError(err)
      }
    )
    return {ref, snapshotCallback};
  }


  static createPlan(plan:Contract.Plan):Promise<boolean>{
    return new Promise((resolve, reject)=>{
      //set plan in fireabse
      const ref = firebase.database().ref(Contract.Plan.PATH_BASE).push()
      const planKey = ref.key;

      ref.set(plan, (err)=>{
        if(!err){
          resolve(true);
        }else{
          reject(err)
        }
      })

      //do indexing for invited users
      plan.members.forEach((member)=>{
        const uid = member.uid
        UserData.addPlan(uid, planKey, plan.priority)
      })
    })
  }

  static updatePlan(planKey:string, plan:Contract.Plan):Promise<boolean>{
    return new Promise((resolve, reject)=>{
      
      firebase.database().ref(Contract.Plan.PATH_BASE)
      .child(planKey)
      .update(plan, (error)=>{
        if(!error){
          resolve(true)
        }else{
          reject(error)
        }
      })

      //do indexing for invited users
      plan.members.forEach((member)=>{
        const uid = member.uid
        UserData.addPlan(uid, planKey, plan.priority)
      })

    })
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
      .once('value');

    const recommendations = [];
    recommendationSnaps.forEach((childSnap)=>{
      const recommendation = childSnap.val();
      if(recommendation){
        recommendation.key = childSnap.key;
        recommendations.push(recommendation)
      }
    }) 
    //console.warn(allrecommendations);
    return Recommendation.getLinkedDataForRecommendations(recommendations);
  }

}