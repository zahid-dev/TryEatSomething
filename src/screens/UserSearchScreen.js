/*
@flow
@format
*/

import React from 'react';
import {
    View,
    StyleSheet,
    FlatList,
    Text,
} from 'react-native';
import * as Contract from '../firebase/Contract';
import * as DatabaseHelpers from '../firebase/DatabaseHelpers';
import * as Values from '../res/Values';
import { Button } from 'react-native-elements';


const PARAM_ON_MEMBERS_SELECTED = "onMembersSelected";
const PARAM_SELECTED_MEMBERS = "selectedMembers";

type Params = {
    selectedMembers:Array<Contract.PlanMember>,
    onMembersSelected:(Array<Contract.PlanMember>)=>void
}

type Navigation = {
    state:{
        params:Params
    },
    setParams:(any)=>void,
    getParam:(string, any)=>any,
    goBack:()=>void
}

type Props = {
    navigation:Navigation
}

type State = {
    users:Array<Contract.User>,
    selectedMembersMap:Map<string, Contract.PlanMember>
}

export default class UserSearchScreen extends React.Component<Props, State> {

    state = {
        users:[],
        selectedMembersMap:new Map<string, Contract.PlanMember>()
    }

    static navigationOptions = (args:any) => {
        const navigation:Navigation = args.navigation;

        const onDonePress = () => {
            const onMembersSelected = navigation.getParam(PARAM_ON_MEMBERS_SELECTED, ()=>{})
            const selectedMembers = navigation.getParam(PARAM_SELECTED_MEMBERS, [])
            onMembersSelected(selectedMembers)
        }

        const headerRight = (
            <Button 
                title="Done"
                type='clear'
                titleStyle={{color:Values.Colors.COLOR_PRIMARY}}
                onPress={onDonePress}
            />
        );

        return {
            headerTitle:"User Search",
            headerRight,
        }
    }


    componentDidMount(){
        this.mapMembersArrayToMap()
        this.fetchUsers();
    }

    mapMembersArrayToMap(){
        const selectedMembers:Array<Contract.PlanMember> = this.props.navigation.getParam(PARAM_SELECTED_MEMBERS, [])
        if(selectedMembers.length){
            const memberMap = new Map<string, Contract.PlanMember>
            selectedMembers.map((member:Contract.PlanMember)=>{
                memberMap.set(member.uid, member)
            })
            this.setState({selectedMembersMap:memberMap})
        }
    }

    fetchUsers(query:string = ''){
        const onResponse = (users:Array<Contract.User>) => {
            this.setState({users})
        }

        const onReject = (error:Error) => {

        }

        if(query){
            DatabaseHelpers.User.fetchWithQuery(query)
            .then(onResponse)
            .catch(onReject)
        }else{
            DatabaseHelpers.UserData.fetchFollowers()
            .then(onResponse)
            .catch(onReject)
        }
    }

    _renderItem = (args) => {
        const user:Contract.User = args.item;

        const member = this.state.selectedMembersMap.get(user.uid)

        const value = member? "Selected":"Not Selected";

        return (
            <View style={styles.itemContainer}>
                <Text>{value}</Text>
            </View>
        )
    }

    render(){
        const users = this.state.users
        return (
            <View style={styles.container}>
                    <Text>{"TODO: Update methods for fetching users for this lists.....\n\nDatabaseHelpers.User.fetchWithQuery\nDatabaseHelpers.UserData.fetchFollowers"}</Text>
        
                <FlatList 
                    data={users}
                    renderItem={this._renderItem}
                />
                    </View>

        )
    }
}

const styles = StyleSheet.create({
    container:{
        flex:1,
    },
    itemContainer:{
        flexDirection:'row',
        padding:16
    }
})