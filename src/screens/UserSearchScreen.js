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
import { 
    Button,
    CheckBox,
 } from 'react-native-elements';
import UserHeader from '../components/UserHeader';
import { TouchableOpacity } from 'react-native-gesture-handler';


const PARAM_ON_MEMBERS_SELECTED = "onMembersSelected";
const PARAM_SELECTED_MEMBERS = "selectedMembers";
const PARAM_ON_DONE_PRESS = "onDonePress";

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

        const onDonePress = navigation.getParam(PARAM_ON_DONE_PRESS)

        const headerRight = (
            <Button 
                title="Done"
                type='clear'
                titleStyle={{color:Values.Colors.COLOR_PRIMARY}}
                onPress={onDonePress}
            />
        );

        return {
            headerTitle:"Select Users",
            headerRight,
        }
    }

    constructor(props:Props){
        super(props);
        const {navigation} = props
        

        navigation.setParams({
            onDonePress:()=>{
                const onMembersSelected = navigation.getParam(PARAM_ON_MEMBERS_SELECTED, ()=>{})
                const selectedMembers = [];
                const membersMap = this.state.selectedMembersMap;
                membersMap.forEach((member)=>{
                    selectedMembers.push(member)
                })
                onMembersSelected(selectedMembers)
                navigation.goBack();
            }
        })
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

    onUserPress = (user:Contract.User) => {
        const uid = user.uid;

        const membersMap = this.state.selectedMembersMap
        if(membersMap.get(uid)){
           membersMap.delete(uid);
        }else{
           const member = new Contract.PlanMember();
           member.uid = uid;
           member.name = user.Name;
           member.status = Contract.PlanMember.STATUS_PENDING;
           member.photoURL = user.photoURL;
           membersMap.set(uid, member)
        }
        this.setState({selectedMembersMap:membersMap})
    }

    _renderItem = (args) => {
        const user:Contract.User = args.item;
        const member = this.state.selectedMembersMap.get(user.uid)
        const isSelected = member? true:false

        const onUserPress = () => {
            this.onUserPress(user);
        }

        return (
            <TouchableOpacity onPress={onUserPress} >
                <View style={styles.itemContainer}>  
                    <UserHeader user={user} />
                    <CheckBox 
                        checked={isSelected}
                        checkedColor={Values.Colors.COLOR_PRIMARY}
                    />
                </View>
            </TouchableOpacity>
            
        )
    }

    render(){
        const users = this.state.users
        return (
            <View style={styles.container}>
                <FlatList 
                    data={users}
                    renderItem={this._renderItem}
                    keyExtractor={item=>item.uid}
                    extraData={this.state}
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
        padding:16,
        justifyContent:'space-between'
    }
})