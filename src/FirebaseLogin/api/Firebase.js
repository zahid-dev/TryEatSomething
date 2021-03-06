import firebase from '@react-native-firebase/app';

class Firebase {
  userLogin = (email, password) => {
    return new Promise(resolve => {
      firebase
        .auth()
        .signInWithEmailAndPassword(email, password)
        .catch(error => {
          switch (error.code) {
            case 'auth/invalid-email':
              console.warn('Invalid email address format.');
              alert('Invalid email address format.')
              break;
            case 'auth/user-not-found':
            case 'auth/wrong-password':
              console.warn('Invalid email address or password');
              alert('Invalid email address or password')
              break;
            default:
              console.warn('Check your internet connection');
              alert('Check your internet connection');
          }
          resolve(null);
        })
        .then(user => {
          if (user) {
            resolve(user);
            console.warn('Done: login');
          }
        });
    });
  };



  createFirebaseAccount = (name:string, email, password) => {
    return new Promise(resolve => {
      firebase
        .auth()
        .createUserWithEmailAndPassword(email, password)
        .catch(error => {
          switch (error.code) {
            case 'auth/email-already-in-use':
              console.warn('This email address is already taken');
              alert('This email address is already taken');
              break;
            case 'auth/invalid-email':
              console.warn('Invalid e-mail address format');
              alert('Invalid e-mail address format');
              break;
            case 'auth/weak-password':
              console.warn('Password is too weak');
              alert('Password is too weak');
              break;
            default:
              console.warn('Check your internet connection');
              alert('Check your internet connection');
          }
          resolve(false);
        })
        .then(data => {
          console.log('User ID :- ', data.user.uid);
          firebase
            .database()
            .ref(`users/${data.user.uid}`)
            .set({
              Name: name,
              tag: name.toLowerCase(),
              totalRecommendations: 0,
              totalFollowers: 0,
              totalFollowing: 0,
            });
          firebase
            .database()
            .ref(`userData/${data.user.uid}`)
            .set({
              recommendations: true,
              feed: true,
              followers: 0,
              following: 0,
            });
          console.warn('Done: create');
          resolve(true);
        });
    });
  };

  sendEmailWithPassword = email => {
    return new Promise(resolve => {
      firebase
        .auth()
        .sendPasswordResetEmail(email)
        .then(() => {
          console.warn('Email with new password has been sent');
          alert('Email with new password has been sent');
          resolve(true);
        })
        .catch(error => {
          switch (error.code) {
            case 'auth/invalid-email':
              console.warn('Invalid email address format');
              alert('Invalid email address format');
              break;
            case 'auth/user-not-found':
              console.warn('User with this email does not exist');
              alert('User with this email does not exist');
              break;
            default:
              console.warn('Check your internet connection');
              alert('Check your internet connection');
          }
          resolve(false);
        });
    });
  };
}

export default new Firebase();
