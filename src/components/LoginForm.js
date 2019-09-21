import React, {Component} from 'react';
import {Text, View} from 'react-native';
import firebase from 'react-native-firebase';
import {Button, Card, CardSection, Input, Spinner} from './common';

class LoginForm extends Component {
  state = {email: '', password: '', error: '', loading: false};
  state = {
    isMounted: false,
  };
  componentDidMount() {
    this.state.isMounted = true;
  }
  componentWillUnmount() {
    this.state.isMounted = false;
  }
  onButtonPressLogIn() {
    const {email, password} = this.state;
    if (this.handleEmail(email)) {
      if (this.handlePassword(password)) {
        if (this.state.isMounted) {
          this.setState({error: '', loading: true});
        }
        firebase
          .auth()
          .signInWithEmailAndPassword(email, password)
          .then(this.onLoginSuccess.bind(this))
          .catch(this.onLoginFailNoAcc.bind(this));

        /*firebase
              .auth()
              .createUserWithEmailAndPassword(email, password)
              .then(this.onLoginSuccess.bind(this))
              .catch(this.onLoginFail.bind(this));*/
      } else {
        this.onLoginFailPass();
      }
    } else {
      this.onLoginFailEmail();
    }
  }
  onButtonPressSignUp() {
    const {email, password} = this.state;
    if (this.handleEmail(email)) {
      if (this.handlePassword(password)) {
        if (this.state.isMounted) {
          this.setState({error: '', loading: true});
        }
        firebase
          .auth()
          .createUserWithEmailAndPassword(email, password)
          .then(this.onLoginSuccess.bind(this))
          .catch(this.onLoginFail.bind(this));

        /*firebase
              .auth()
              .createUserWithEmailAndPassword(email, password)
              .then(this.onLoginSuccess.bind(this))
              .catch(this.onLoginFail.bind(this));*/
      } else {
        this.onLoginFailPass();
      }
    } else {
      this.onLoginFailEmail();
    }
  }
  onLoginFailNoAcc() {
    if (this.state.isMounted) {
      this.setState({
        error: 'Please enter correct credentials or Sign Up!',
        loading: false,
      });
    }
  }
  onLoginFail() {
    if (this.state.isMounted) {
      this.setState({
        error: 'Authentication Failed! Check You Network.',
        loading: false,
      });
    }
  }
  onLoginFailEmail() {
    if (this.state.isMounted) {
      this.setState({error: 'Failed! Email Format Incorrect', loading: false});
    }
  }
  onLoginFailPass() {
    if (this.state.isMounted) {
      this.setState({
        error: 'Failed! Password Format Incorrect',
        loading: false,
      });
    }
  }
  onLoginSuccess() {
    if (this.state.isMounted) {
      this.setState({
        email: '',
        password: '',
        loading: false,
        error: '',
      });
    }
  }
  handleEmail = email => {
    // don't remember from where i copied this code, but this works.
    let re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

    if (re.test(email)) {
      // this is a valid email address
      // call setState({email: email}) to update the email
      // or update the data in redux store.
      return true;
    } else {
      // invalid email, maybe show an error to the user.
      return false;
    }
  };
  handlePassword = password => {
    if (password == null) {
      //return 'too_short';
      return false;
    } else if (password.length < 6) {
      //return 'too_short';
      return false;
    } else if (password.length > 50) {
      //return 'too_long';
      return false;
    } else if (password.search(/\d/) === -1) {
      //return 'no_num';
      return false;
    } else if (password.search(/[a-zA-Z]/) === -1) {
      //return 'no_letter';
      return false;
    } else if (
      password.search(/[^a-zA-Z0-9\!\@\#\$\%\^\&\*\(\)\_\+\.\,\;\:]/) !== -1
    ) {
      //return 'bad_char';
      return false;
    } else {
      return true;
    }
  };
  renderForm() {
    if (this.state.loading) {
      return <Spinner size="small" />;
    }

    return (
      <View style={{flexDirection: 'row', flex: 2}}>
        <Button onPress={this.onButtonPressLogIn.bind(this)}>Log In</Button>
        <Button onPress={this.onButtonPressSignUp.bind(this)}>Sign Up</Button>
      </View>
    );
  }

  render() {
    return (
      <Card>
        <CardSection>
          <Input
            placeholder="user@gmail.com"
            label="Email"
            value={this.state.email}
            onChangeText={email => this.setState({email})}
          />
        </CardSection>

        <CardSection>
          <Input
            secureTextEntry
            placeholder="password"
            label="Password"
            value={this.state.password}
            onChangeText={password => this.setState({password})}
          />
        </CardSection>

        <Text style={styles.errorTextStyle}>{this.state.error}</Text>

        <CardSection>{this.renderForm()}</CardSection>
      </Card>
    );
  }
}

const styles = {
  errorTextStyle: {
    fontSize: 20,
    alignSelf: 'center',
    color: 'red',
  },
};

export default LoginForm;
