import {
  View,
  Image,
  TextInput,
  ScrollView,
  Text,
  TouchableOpacity,
} from 'react-native';
import React, {Component} from 'react';
import * as Values from './res/Values';

class App extends Component {
  state = {onChangeText: '', value: ''};
  render() {
    return (
      // <View style={{ flexDirection: 'row',flex: 1, height: 50,marginTop: 10, }}>
      /* <Button onPress={() => firebase.auth().signOut()}>Log Out</Button> */
      // </View>
      <View style={styles.parentContainer}>
        <View style={styles.headerStyle}>
          <Image style={styles.imgStyle} source={Values.Images.BLACK_PIC} />
          <TextInput
            style={styles.searchStyle}
            onChangeText={this.state.onChangeText}
            autoCorrect={false}
            placeholder='Search for city "New York"'
            placeholderTextColor="#000"
            value={this.state.value}
          />
        </View>
        <ScrollView style={styles.scrollContainer}>
          <View style={styles.feedCardStyle}>
            <View style={styles.feedCardHeaderStyle}>
              <Image
                style={styles.imgFeedHeaderStyle}
                source={Values.Images.BLACK_PIC}
              />
              <View style={styles.textviewFeedHeaderStyle}>
                <Text style={styles.textFeedHeaderStyle}>Zahid Shakeel</Text>
                <Text style={styles.textFeedHeaderStyle}>
                  Some information about user
                </Text>
              </View>
              <Text style={styles.timeFeedHeaderStyle}>13:30</Text>
            </View>
            <View>
              <Image style={styles.imageFeed} source={Values.Images.HOWDY} />
              <View style={styles.imageFeedContainer}>
                <Text style={styles.imagetextHoverLeft}>Restaurant Name</Text>
                <Text style={styles.imagetextHoverRight}>30 min</Text>
              </View>
              <View style={styles.imageFeedSecContainer}>
                <Text style={styles.imagetextHoverLeft}>Stars</Text>
                <Text style={styles.imagetextHoverRight}>$$$</Text>
              </View>
            </View>
            <View style={styles.feedCardBottomBar}>
              <Text style={styles.feedCardBottomBarText}>
                Details on what user eat and etc, just like social update post
              </Text>
              <View style={styles.feedCardBottomBarButtonContainer}>
                <View style={styles.buttonSideSpacer} />
                <TouchableOpacity style={styles.buttonStyle}>
                  <Text style={styles.buttontextStyle}>Add To Plan</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.buttonStyle}>
                  <Text style={styles.buttontextStyle}>Get Directions</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </ScrollView>
        <View style={styles.bottomBarContainer}>
          <View style={styles.bottomItemLayout}>
            <Image
              style={styles.imgbottomStyle}
              source={Values.Images.BLACK_PIC}
            />
            <Text style={styles.bottomBarTextStyle}>Feed</Text>
          </View>
          <View style={styles.bottomItemLayout}>
            <Image
              style={styles.imgbottomStyle}
              source={Values.Images.BLACK_PIC}
            />
            <Text style={styles.bottomBarTextStyle}>Restaurants</Text>
          </View>
          <View style={styles.bottomItemLayout}>
            <Image
              style={styles.imgbottomStyle}
              source={Values.Images.BLACK_PIC}
            />
            <Text style={styles.bottomBarTextStyle}>Plans</Text>
          </View>
          <View style={styles.bottomItemLayout}>
            <Image
              style={styles.imgbottomStyle}
              source={Values.Images.BLACK_PIC}
            />
            <Text style={styles.bottomBarTextStyle}>Chats</Text>
          </View>
        </View>
      </View>
    );
  }
}

const styles = {
  parentContainer: {
    flex: 1,
    flexDirection: 'column',
  },
  headerStyle: {
    backgroundColor: '#F8F8F8',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 50,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    position: 'relative',
    flexDirection: 'row',
    elevation: 5,
    padding: 25,
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
  feedCardHeaderStyle: {
    borderBottomWidth: 1,
    padding: 10,
    color: '#000',
    backgroundColor: '#fff',
    justifyContent: 'flex-start',
    flexDirection: 'row',
    borderColor: '#000',
    position: 'relative',
  },
  imgFeedHeaderStyle: {
    width: 35,
    height: 35,
    borderRadius: 20,
  },
  textFeedHeaderStyle: {
    fontSize: 12,
  },
  textviewFeedHeaderStyle: {
    flexWrap: 'wrap',
    alignContent: 'flex-start',
    marginLeft: 5,
    flex: 1,
    textAlign: 'justify',
    lineHeight: 2,
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
    justifyContent: 'flex-end',
  },
  buttonSideSpacer: {
    flex: 4,
  },
  buttonStyle: {
    backgroundColor: '#000',
    borderRadius: 5,
    borderWidth: 1,
    flex: 6,
    borderColor: '#000 ',
    marginLeft: 5,
    marginRight: 5,
    marginTop: 5,
    marginBottom: 5,
  },
  buttontextStyle: {
    alignSelf: 'center',
    color: '#fff',
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

export default App;
