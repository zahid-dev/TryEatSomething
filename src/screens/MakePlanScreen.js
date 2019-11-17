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
import * as Values from '../res/Values';
import RestaurantHeader from '../components/RestaurantHeader';
import PlanMembers from '../components/PlanMembers';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scrollview';
import DatePicker from 'react-native-datepicker';
import { Button } from 'react-native-elements'

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
        date:'',
        time:'',
        members:[]
    }

    onAddMembersPress = () => {
        const params = {
            members:this.state.members,
            onMembersSelected:(members)=>{
                this.setState({members})
            }
        }
        this.props.navigation.navigate(Values.Screens.SCREEN_USER_SEARCH, params)
    }

    _renderDescriptionTextInput(){
        return (
            <View style={styles.contentContainer}>
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
            />
        )
    }

    render(){
        const restaurant = this.props.navigation.getParam(PARAM_RESTAURANT);
        const members = this.state.members
        return (
            <KeyboardAwareScrollView style={{flex:1}}>
                <View style={styles.container}>
                    <RestaurantHeader restaurant={restaurant} />
                    {this._renderDescriptionTextInput()}
                    {this._renderPickers()}
                    <PlanMembers members={members} onAddPress={this.onAddMembersPress}/>
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