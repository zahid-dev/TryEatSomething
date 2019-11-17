/*
@flow
@format
*/

import React from 'react';
import { 
    View, 
    Text, 
    StyleSheet
} from "react-native";
import {
    Button
} from 'react-native-elements';

import * as Values from '../res/Values';
import { FlatList, TextInput } from 'react-native-gesture-handler';
import * as Contract from '../firebase/Contract';


type Props = {
    members:Array<Contract.PlanMember>,
    onAddPress:()=>void
}

type State = {

}


export default class PlanMembers extends React.Component<Props, State> {

    _renderItem=(args)=>{
        const member:Contract.PlanMember = args.item;
        return (
            <View>
                <Text>{member.name}</Text>
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
        color:Values.Colors.COLOR_BLACK,
    },
    btnAddWrapperStyle:{
        justifyContent: 'flex-start',
    }
})