import React, {Component} from 'react';
import {View, Button} from 'react-native';
import firebase from 'react-native-firebase';
import {createAppContainer} from 'react-navigation';
import {createStackNavigator} from 'react-navigation-stack';
import {Header, Spinner} from './components/common';
import LoginForm from './components/LoginForm';
class HomeScreen extends React.Component {
  state = {loggedIn: null, email: ''};
  _isMounted = false;
  componentDidMount() {
    this._isMounted = true;
    if (this._isMounted) {
      firebase.auth().onAuthStateChanged(user => {
        if (user) {
          this.setState({loggedIn: true});
          //console.log(user.email);
          this.setState({email: user.email});
        } else {
          this.setState({loggedIn: false});
        }
      });
    }
  }
  componentWillUnmount() {
    this._isMounted = false;
  }

  renderContent() {
    switch (this.state.loggedIn) {
      case true:
        return (
          // <View style={{ flexDirection: 'row',flex: 1, height: 50,marginTop: 10, }}>
          /* <Button onPress={() => firebase.auth().signOut()}>Log Out</Button> */
          // </View>
          <View>
            <Header headerText="Dairy Hawk" />
            {/* <DatePickerForm email={this.state.email} /> */}
            <Button title="Log Out" onPress={() => firebase.auth().signOut()} />
          </View>
        );
      case false:
        return (
          <View>
            <Header headerText="Authentication" />
            <LoginForm />
          </View>
        );
      default:
        return <Spinner size="large" />;
    }
  }

  render() {
    return <View>{this.renderContent()}</View>;
  }
}

const RootStack = createStackNavigator(
  {
    Home: HomeScreen,
  },
  {
    initialRouteName: 'Home',
    headerMode: 'none',
  },
);

const AppContainer = createAppContainer(RootStack);

type Props = {};
class App extends Component<Props> {
  render() {
    return <AppContainer />;
  }
}
export default App;
