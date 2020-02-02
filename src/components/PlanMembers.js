/*
@flow
@format
*/

import React from 'react';
import { 
    View, 
    Text, 
    Image,
    StyleSheet
} from "react-native";
import {
    Button
} from 'react-native-elements';

import * as Values from '../res/Values';
import { FlatList, TextInput } from 'react-native-gesture-handler';
import * as Contract from '../firebase/Contract';
import firebase from '@react-native-firebase/app';


type Props = {
    members:Array<Contract.PlanMember>,
    onAddPress:()=>void,
    onRemoveMember:(number)=>void,
    isCreator:boolean,
}

type State = {

}


export default class PlanMembers extends React.Component<Props, State> {

    _renderItem=(args)=>{
        const isCreator = this.props.isCreator;
        const member:Contract.PlanMember = args.item;
        const removeMember = () => {
            console.log("Remove member:  " + member.uid + " at index: " + args.index)
            this.props.onRemoveMember(args.index);
        }

        const isInvitedUser = isCreator && (member.uid !== firebase.auth().currentUser.uid);

        return (
            <View style={{flexDirection:'row', flex:1}}>
                <View style={{flexDirection:'row', marginTop:8, flex:1}}>
                    <Image 
                        style={{width:32, height:32, tintColor:Values.Colors.COLOR_GRAY, marginRight:8}}
                        source={Values.Images.USER}
                        resizeMode="contain"
                    />
                    <View>
                        <Text>{member.name} </Text>
                        <Text style={{color:Values.Colors.COLOR_GRAY}}>
                            {member.status}
                        </Text>
                    </View>
                </View>

                {isCreator && isInvitedUser &&
                    <Button 
                        title="X"
                        type='clear'
                        titleStyle={{color:Values.Colors.COLOR_BLACK}}
                        onPress={removeMember}
                    />
                }
            </View>
        )
    }

    render(){
        const members = this.props.members;
        return (
            <View style={styles.contentContainer}>
                <Text style={styles.label}>Members</Text>
                <FlatList 
                    data={members}
                    renderItem={this._renderItem}
                />
                <Button 
                    title={"+ Add Members"} 
                    type={'clear'}
                    titleStyle={styles.btnTitleStyle}
                    buttonStyle={styles.btnAddWrapperStyle}
                    onPress={this.props.onAddPress}
                />
            </View>
        )
    }
}

const styles = StyleSheet.create({
    contentContainer:{
        backgroundColor:Values.Colors.COLOR_LIGHT_GRAY,
        borderRadius: 16,
        padding: 16,
        margin: 16,
        position: 'relative',
    },
    label:{
        fontWeight:'600',
        color:Values.Colors.COLOR_GRAY
    },
    btnTitleStyle:{
        color:Values.Colors.COLOR_PRIMARY,
    },
    btnAddWrapperStyle:{
        justifyContent: 'flex-start',
    }
})