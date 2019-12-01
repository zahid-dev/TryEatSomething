/*
@flow
@format
*/

import React, {Component} from 'react';
import {
  Text,
  View,
  FlatList,
  ScrollView,
  TextInput,
  StyleSheet,
  TouchableWithoutFeedback,
  ActivityIndicator,
} from 'react-native';
import firebase from 'react-native-firebase';
import {Card, CardSection, Button} from '../components/common';
import {withNavigation} from 'react-navigation';
import * as Contract from '../firebase/Contract';
import * as DatabaseHelpers from '../firebase/DatabaseHelpers';
import * as Values from '../res/Values';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scrollview';
import PlanMembers from '../components/PlanMembers';
import RestaurantHeader from '../components/RestaurantHeader';
import DatePicker from 'react-native-datepicker';
import * as moment from 'moment';


const PARAM_PLAN_KEY = "planKey";

type Params = {
    planKey:string
}

type Props = {
    navigation:{
        state:{
            params:Params
        },
        getParam:(string)=>any,
        goBack:()=>void,
    }
}

type State = {
  plan:Contract.Plan|null,
  isLoading:boolean
}

class PlanDetailsScreen extends React.Component<Props, State> {

  state = {
    plan:null,
    isLoading:false,
  }

  static navigationOptions = ({navigation}) => {
    return {
      headerTitle:"Plan Details"
    }
  }

  componentDidMount(){
    this.fetchPlan()
  }


  fetchPlan(){
    const planKey = this.props.navigation.getParam(PARAM_PLAN_KEY);
    this.setState({isLoading:true})
    DatabaseHelpers.Plan.getPlan(planKey)
      .then((plan) => {
        this.setState({plan, isLoading:false})
      })
      .catch((err)=>{
        this.setState({isLoading:false})
        console.warn("Failed to fetch plan: " + JSON.stringify(err))
        alert("Failed to fetch plan details, please try again later. " + err.message);
        this.props.navigation.goBack();
      })
  }

  _renderActivityInidcator(){
    return (
      <View style={{flex:1, alignItems:"center", marginTop:56}}>
        <ActivityIndicator 
          animating={true} size='large' />
      </View>
    )
  }


  onAddMembersPress = () => {
    const params = {
        selectedMembers:this.state.plan.members,
        onMembersSelected:(members)=>{
            this.setState({members})
        }
    }
    this.props.navigation.navigate(Values.Screens.SCREEN_USER_SEARCH, params)
  }

  _renderTextInputs(){
      const plan = this.state.plan;

     const date = new Date(plan.plannedForTimestamp);

      return (
          <View style={styles.contentContainer}>
              <TextInput
                  style={styles.titleText}
                  underlineColorAndroid="transparent"
                  placeholder="Plan Title"
                  placeholderTextColor="grey"
                  numberOfLines={31}
                  maxLength={30}
                  multiline={false}
                  onChangeText={text => this.setState({title:text})}
                  value={plan.title}
              />
              <TextInput
                  style={styles.descriptionText}
                  underlineColorAndroid="transparent"
                  placeholder="Plan Description"
                  placeholderTextColor="grey"
           
                  maxLength={90}
                  multiline={true}
                  onChangeText={text => this.setState({description:text})}
                  value={plan.description}
              />

            <View style={{flexDirection:'row', flex:1, marginTop:16}}>
              <View style={{flex:1}}>
                  <Text style={styles.label}>Date</Text>
                  <DatePicker 
                      style={{flex: 1}}
                      date={date}
                      mode="date"
                      placeholder="Tap Here"
                      format="Do MMM"
                      confirmBtnText="Confirm"
                      cancelBtnText="Cancel"
                      iconSource={{}}
                      customStyles={stylesDatePicker}
                      onDateChange={(date) => {this.setState({date: date})}}
                  />
              </View>

              <View style={{flex:1}}>
                  <Text style={styles.label}>Time</Text>
                  <DatePicker 
                      style={{flex: 1}}
                      date={date}
                      mode="time"
                      placeholder="Tap Here"
                      format="hh:mm A"
                      iconSource={{}}
                      confirmBtnText="Confirm"
                      cancelBtnText="Cancel"
                      customStyles={stylesDatePicker}
                      onDateChange={(time) => {this.setState({time: time})}}
                  />
              </View>
          </View>
          </View>
      );
  }


  _renderContent(){
      const plan = this.state.plan;
      const restaurant = plan.restaurant 
      const {members} = plan;

      const onRemoveMember = (index) => {
          members.splice(index, 1);
          this.setState({members})
      }
      return (
          <KeyboardAwareScrollView style={{flex:1}}>
              <View style={styles.container}>
                  <RestaurantHeader restaurant={restaurant} />
                  {this._renderTextInputs()}
              
                  <PlanMembers 
                      members={members} 
                      onAddPress={this.onAddMembersPress}
                      onRemoveMember={onRemoveMember}/>
                
              </View>
          </KeyboardAwareScrollView>
      )
  }


  render() {
    const {plan, isLoading} = this.state;

    if(isLoading){
      return this._renderActivityInidcator();
    }

    if(!plan){
      return null;
    }

    return this._renderContent();
  }

}


export default withNavigation(PlanDetailsScreen);

const styles = StyleSheet.create({
container:{
    backgroundColor: '#FFFFFF',
    flex: 1,
    padding:16
},
contentContainer:{
    backgroundColor:Values.Colors.COLOR_LIGHT_GRAY,
    borderRadius: 16,
    padding: 16,
    margin: 16,
    position: 'relative',
},
titleText:{
    fontSize: 20,
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    color:Values.Colors.COLOR_BLACK,
    fontWeight:'600'
},
descriptionText:{

    fontSize: 20,
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
},
label:{
    color:Values.Colors.COLOR_GRAY,
},
btnAction:{
    backgroundColor:Values.Colors.COLOR_PRIMARY,
    margin:16,
    borderRadius:12,
}
})

const stylesDatePicker = StyleSheet.create({
    dateInput: {
        position: 'absolute',
        left: 0,
        top: 4,
        marginLeft: 0,
        borderWidth:0,
    },
    dateText:{
        fontSize:20,
    },
    placeholderText:{
        color:Values.Colors.COLOR_BLACK,
        fontSize:20
    },
   
})

