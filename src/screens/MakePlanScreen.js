/*
@flow
@format
*/

import React from 'react';
import {
    View,
    Text,
    TextInput,
    StyleSheet
} from 'react-native';
import * as Contract from '../firebase/Contract';
import * as DatabaseHelpers from '../firebase/DatabaseHelpers';
import * as Values from '../res/Values';
import RestaurantHeader from '../components/RestaurantHeader';
import PlanMembers from '../components/PlanMembers';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scrollview';
import DatePicker from 'react-native-datepicker';
import { Button } from 'react-native-elements'
import moment from 'moment';
import firebase from 'react-native-firebase';

const PARAM_RESTAURANT = "restaurant";

type Params = {
    restaurant:Contract.Restaurant
}

type Props = {
    navigation:{
        state:{
            params:Params
        },
        getParam:(string)=>any,
        navigate:(string, any)=>void,
    }
}

type State = {
    description:string,
    title:string,
    date:string,
    time:string,
    members:Array<Contract.PlanMember>
}

export default class MakePlanScreen extends React.Component<Props, State> {

    static navigationOptions = {
        title:"Make Plan"
    }

    state = {
        description:'',
        title:'',
        date:'',
        time:'',
        members:[]
    }

    componentDidMount(){
        this.fetchUser()
    }

    fetchUser(){
        const uid = firebase.auth().currentUser.uid;
        DatabaseHelpers.User.getUser(uid)
            .then((user)=>{
                const planMember = new Contract.PlanMember();
                planMember.uid = user.uid;
                planMember.name = user.Name;
                planMember.photoURL = user.photoURL;
                planMember.status = Contract.PlanMember.STATUS_GOING

                this.setState(state=>{
                    state.members.push(planMember)
                    return state;
                })
            })

    }

    createPlan = () => {
        const restaurant = this.props.navigation.getParam(PARAM_RESTAURANT);
        const {members, date, time, description, title} = this.state
        const creatorUid = firebase.auth().currentUser.uid
      
        if((members.length?true:false) && date && time && title){
            //send data to database
            const plannedForMoment = moment(`${date} - ${time}`, 'Do MMM - hh:mm A');
            const timestamp = plannedForMoment.valueOf();
            const createdAt = (new Date()).getTime();
            if(timestamp < createdAt){
                alert("Please select a time in future.")
                return;
            }

            const plan = new Contract.Plan();
            plan.title = title
            plan.restaurant = restaurant;
            plan.restaurantKey = restaurant.key;
            plan.description = description;
            plan.creatorUid = creatorUid;
            plan.members = members;
            plan.plannedForTimestamp = plannedForMoment.valueOf();
            plan.priority = -plan.plannedForTimestamp;
            plan.createdAtTimestamp = createdAt

            DatabaseHelpers.Plan.createPlan(plan)
                .then(status=>{
                    if(status){
                        alert("Plan created successfully")
                        this.props.navigation.goBack();
                    }
                })
                .catch(err=>{
                    alert("Failed to create plan, " + err.message)
                })
        }else{
            console.log("Not all plan requirements are fullfilled: " + JSON.stringify(this.state))
            alert("Please fill all required fields for creating plan")
        }
    }

    onAddMembersPress = () => {
        const params = {
            selectedMembers:this.state.members,
            onMembersSelected:(members)=>{
                this.setState({members})
            }
        }
        this.props.navigation.navigate(Values.Screens.SCREEN_USER_SEARCH, params)
    }

    _renderTextInputs(){
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
                    value={this.state.title}
                />
                <TextInput
                    style={styles.descriptionText}
                    underlineColorAndroid="transparent"
                    placeholder="Plan Description"
                    placeholderTextColor="grey"
                    numberOfLines={3}
                    maxLength={90}
                    multiline={true}
                    onChangeText={text => this.setState({description:text})}
                    value={this.state.description}
                />
            </View>
        );
    }

    _renderPickers(){
        return (
            <View style={[styles.contentContainer, {flexDirection:'row', flex:1}]}>
                <View style={{flex:1}}>
                    <Text style={styles.label}>Date</Text>
                    <DatePicker 
                        style={{flex: 1}}
                        date={this.state.date}
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
                        date={this.state.time}
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
        )
    }

    _renderActionPanel(){
        return (
            <Button 
                title="Create New Plan"
                buttonStyle={styles.btnAction}
                onPress={this.createPlan}
            />
        )
    }

    render(){
        const restaurant = this.props.navigation.getParam(PARAM_RESTAURANT);
        const {members} = this.state
        const onRemoveMember = (index) => {
            members.splice(index, 1);
            this.setState({members})
        }
        
        return (
            <KeyboardAwareScrollView style={{flex:1}}>
                <View style={styles.container}>
                    <RestaurantHeader restaurant={restaurant} />
                    {this._renderTextInputs()}
                    {this._renderPickers()}
                    <PlanMembers  
                        members={members} 
                        onAddPress={this.onAddMembersPress}
                        onRemoveMember={onRemoveMember}
                        isCreator={true}/>
                    {this._renderActionPanel()}
                </View>
            </KeyboardAwareScrollView>
        )
    }

}

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
        height: 80,
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