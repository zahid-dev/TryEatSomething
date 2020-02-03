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
import firebase from '@react-native-firebase/app';
import {Card, CardSection} from '../components/common';
import {withNavigation} from 'react-navigation';
import * as Contract from '../firebase/Contract';
import * as DatabaseHelpers from '../firebase/DatabaseHelpers';
import * as Values from '../res/Values';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scrollview';
import PlanMembers from '../components/PlanMembers';
import RestaurantHeader from '../components/RestaurantHeader';
import DatePicker from 'react-native-datepicker';
import moment from 'moment';
import { ButtonGroup, Button } from 'react-native-elements';
import _ from 'underscore';

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
  prevPlan:Contract.Plan|null,
  isLoading:boolean,
  thisMemberStatus:string,
}

class PlanDetailsScreen extends React.Component<Props, State> {
  planFirebaseRef:any
  planFirebaseSnapshotCallback:any
  state = {
    plan:null,
    prevPlan:null,
    isLoading:false,
    thisMemberStatus:Contract.PlanMember.STATUS_PEDNING
  }

  static navigationOptions = ({navigation}) => {
    return {
      headerTitle:"Details"
    }
  }

  componentDidMount(){
    this.listenForPlan();
  }

  componentWillUnmount(){
    this.unlistenForPlan();
  }


  planCallbackListener = (plan) => {
    var thisMemberStatus = Contract.STATUS_PENDING;
    var isNewInvite = true;
    plan.members.forEach(member=>{
      if(member.uid === firebase.auth().currentUser.uid){
        thisMemberStatus = member.status;
        isNewInvite = false;
      }
    })

    if(isNewInvite){
      //add member to plan with status pending
      const uid = firebase.auth().currentUser.uid;
      DatabaseHelpers.User.getUser(uid)
        .then((user)=>{
          if(user){
            const member = new Contract.PlanMember();
            member.uid = uid;
            member.name = user.Name;
            member.status = Contract.PlanMember.STATUS_PENDING;
            plan.members.push(member);
            DatabaseHelpers.Plan.updatePlan(plan.key, plan)
            .then((status)=>{
              if(status){
                console.log("Successfully updated plan with new member")
              }
            })
          }
        })
     
    }

    this.setState({plan, isLoading:false, thisMemberStatus, prevPlan:Object.assign({}, plan)})
  }


  listenForPlan(){
    const planKey = this.props.navigation.getParam(PARAM_PLAN_KEY);
    this.setState({isLoading:true})
    const retPacket = DatabaseHelpers.Plan.listenForPlan(
      planKey, 
      this.planCallbackListener, 
      (err)=>{
        this.setState({isLoading:false})
        console.warn("Failed to fetch plan: " + JSON.stringify(err))
        alert("Failed to fetch plan details, please try again later. " + err.message);
        this.props.navigation.goBack();
      });
    
    this.planFirebaseRef = retPacket.ref;
    this.planFirebaseSnapshotCallback = retPacket.snapshotCallback;
  }


  unlistenForPlan(){
    if(this.planFirebaseRef && this.planFirebaseSnapshotCallback){
      this.planFirebaseRef.off('value', this.planFirebaseSnapshotCallback)
    }
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
    const {navigation} = this.props;
    const params = { 
        planKey:navigation.getParam(PARAM_PLAN_KEY)
    }

    this.props.navigation.navigate(Values.Screens.SCREEN_INVITE_CONTACTS, params)
  }


  _updateThisMemberStatus = (selectedIndex) => {
    var updatedStatus = '';
    switch(selectedIndex){
      case 0:
        updatedStatus = Contract.PlanMember.STATUS_GOING;
        break;
      case 1:
        updatedStatus = Contract.PlanMember.STATUS_INTERESTED;
        break;
      case 2:
        updatedStatus = Contract.PlanMember.STATUS_NOT_GOING;
        break;
      default:
        updatedStatus = Contract.PlanMember.STATUS_PENDING;
        break;
    }

    //set satus to designated member or update plan object directly
    const uid = firebase.auth().currentUser.uid;
    const plan = this.state.plan;

    plan.members.forEach((member, index)=>{
      if(member.uid === uid){
        plan.members[index].status = updatedStatus;
      }
    })

    //update plan object
    this.setState({plan})
    if(!plan) return;

    const planKey = plan.key;
    DatabaseHelpers.Plan.updatePlan(planKey, plan)
      .then((status)=>{
        //reload object on success
        //this.fetchPlan();
        console.log("Successfully updated plan with new member status")
      })
      .catch((err)=>{
        //display error message
        console.warn("Failed to update plan status, " + JSON.stringify(err))
        alert("Failed to update plan member status, please try again later. " + err.message)
      })
  }


  updatePlan = () => {
    const plan = this.state.plan;
    const planKey = this.props.navigation.getParam(PARAM_PLAN_KEY);
    DatabaseHelpers.Plan.updatePlan(planKey, plan)
      .then((status)=>{
        if(status){
          console.log("Successfully updated plan")
        }
      })
      .catch((err)=>{
        console.warn("Failed to update plan, " + JSON.stringify(err))
        alert("Failed to update plan, " + err.message);
      })
  }

  _renderStatusPanel(){

    const buttons = ['Going', 'Interested', 'Not Going']
    var selectedIndex = -1;
    
    switch(this.state.thisMemberStatus){
      case Contract.PlanMember.STATUS_GOING: selectedIndex = 0; break;
      case Contract.PlanMember.STATUS_INTERESTED: selectedIndex = 1; break;
      case Contract.PlanMember.STATUS_NOT_GOING: selectedIndex = 2; break;
      default: selectedIndex = -1; break;
    }

    return (
      <View>
        <ButtonGroup 
          onPress={this._updateThisMemberStatus}
          selectedIndex={selectedIndex}
          buttons={buttons}
          containerStyle={{height:32, borderRadius:16, marginTop:16, marginLeft:0, marginRight:0}}
          selectedButtonStyle={{backgroundColor:Values.Colors.COLOR_PRIMARY}}
        />
      </View>
    )
  }


  _renderDetails(){
      const plan = this.state.plan;
     const date = new Date(plan.plannedForTimestamp);

     const updatePlanObject = (values:Contract.Plan) => {
        this.setState((state)=>{
          const plan = state.plan;

          for(const key in values){
            if(plan.hasOwnProperty(key)){
              plan[key] = values[key];
            }
          }
          
          return state;
        })
     }

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
                  onChangeText={text => updatePlanObject({title:text})}
                  value={plan.title}
              />
              <TextInput
                  style={styles.descriptionText}
                  underlineColorAndroid="transparent"
                  placeholder="Plan Description"
                  placeholderTextColor="grey"
           
                  maxLength={90}
                  multiline={true}
                  onChangeText={text => updatePlanObject({description:text})}
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
                      onDateChange={(date) => {
                        const momentDate = moment(`${date}`,'Do MMM')
                        const plannedForMoment = moment(plan.plannedForTimestamp)
                        plannedForMoment.date(momentDate.date());
                        plannedForMoment.month(momentDate.month());
                        plannedForMoment.year(momentDate.year());
                        updatePlanObject({plannedForTimestamp:plannedForMoment.valueOf()})
                      }}
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
                      onDateChange={(time) => {
                        const momentTime = moment(`${time}`,'hh:mm A')
                        const plannedForMoment = moment(plan.plannedForTimestamp)
                        plannedForMoment.minute(momentTime.minute());
                        plannedForMoment.hour(momentTime.hour());
                        updatePlanObject({plannedForTimestamp:plannedForMoment.valueOf()})
                      }}
                  />
              </View>

            
          </View>
          {
            this._renderStatusPanel()
          }
          </View>
      );
  }


  _renderChatPanel(){
    return null;
    // return (
    //   <View style={styles.contentContainer}>
    //     <Text>Group Chat</Text>
    //   </View>
    // )
  }

  _renderActionPanel(){
    const {plan, prevPlan} = this.state;
    if(!_.isEqual(plan,prevPlan)){
      return (
          <Button 
              title="Update Plan"
              buttonStyle={styles.btnAction}
              onPress={this.updatePlan}
          />
      )
    }else {
      return null;
    }
  }


  _renderContent(){
      const plan = this.state.plan;
      const restaurant = plan.restaurant 
      const {members} = plan;
      const isCreator = plan.creatorUid === firebase.auth().currentUser.uid;

      const onRemoveMember = (index) => {
          const planKey = this.props.navigation.getParam(PARAM_PLAN_KEY);
          const removedMember = members.splice(index, 1)[0];
          DatabaseHelpers.UserData.removePlan(removedMember.uid, planKey)
          plan.members = members;
          this.updatePlan();
          this.setState({plan})
      }
      return (
          <KeyboardAwareScrollView style={{flex:1}}>
              <View style={styles.container}>
                  <RestaurantHeader restaurant={restaurant} />
                  {this._renderDetails()}
                  {this._renderChatPanel()}
                  <PlanMembers 
                      members={members}
                      onAddPress={this.onAddMembersPress}
                      onRemoveMember={onRemoveMember}
                      isCreator={isCreator}/>
                      
                  {this._renderActionPanel()}
                
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
    height:40,
    fontSize: 20,
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    color:Values.Colors.COLOR_BLACK,
    fontWeight:'700'
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

