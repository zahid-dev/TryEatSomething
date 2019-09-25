import * as firebase from 'firebase';

let config = {
  apiKey: 'AIzaSyDRWuwGirSrPHR0ugEu4iiVvkpVOtq3YVc',
  authDomain: 'tester-fe130.firebaseapp.com',
  databaseURL: 'https://tester-fe130.firebaseio.com',
  projectId: 'tester-fe130',
  storageBucket: '',
  messagingSenderId: '525533606438',
  appId: '1:525533606438:web:2f662df02942191a582ce7',
};
export default (!firebase.apps.length
  ? firebase.initializeApp(config)
  : firebase.app());
