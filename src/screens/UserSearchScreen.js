/*
@flow
@format
*/

import React from 'react';
import {
    View,
    StyleSheet,
    FlatList,
    TextInput,
    ActivityIndicator,
    Share,
    Text,
} from 'react-native';
import * as Contract from '../firebase/Contract';
import * as DatabaseHelpers from '../firebase/DatabaseHelpers';
import * as Values from '../res/Values';
import { 
    Button,
    CheckBox,
    ButtonGroup,
 } from 'react-native-elements';
import UserHeader from '../components/UserHeader';
import { TouchableOpacity } from 'react-native-gesture-handler';
import firebase from '@react-native-firebase/app';
import { values } from 'underscore';


const PARAM_ON_MEMBERS_SELECTED = "onMembersSelected";
const PARAM_SELECTED_MEMBERS = "selectedMembers";
const PARAM_ON_DONE_PRESS = "onDonePress";
const PARAM_UPDATE_SEARCH = "updateSearch";

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
    isLoading:boolean,
    query:string,
    selectedMembersMap:Map<string, Contract.PlanMember>
}

export default class UserSearchScreen extends React.Component<Props, State> {

    state = {
        users:[],
        selectedMembersMap:new Map<string, Contract.PlanMember>(),
        isLoading:false
    }

    static navigationOptions = (args:any) => {
        const navigation:Navigation = args.navigation;

        const onDonePress = navigation.getParam(PARAM_ON_DONE_PRESS)
        var query = "";
        const updateSearch = navigation.getParam(PARAM_UPDATE_SEARCH, ()=>{})

        const headerRight = (
            <Button 
                title="Done"
                type='clear'
                titleStyle={{color:Values.Colors.COLOR_PRIMARY}}
                onPress={onDonePress}
            />
        );

        const _renderSearchBar = () => {
            return (
              <View style={{flexDirection:'row', borderRadius:12, height:32, width:200, backgroundColor:Values.Colors.COLOR_LIGHT_GRAY}}>
                <TextInput 
                  style={{flex:1, paddingLeft:16, paddingRight:16, color:Values.Colors.COLOR_BLACK}} 
                  placeholder="Search Users"
                  onChangeText={(text)=>{updateSearch(text)}}
                />
              </View>
            )
          }

        return {
            headerTitle:_renderSearchBar(),
            headerRight,
            headerBackTitle: null
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
            },
            updateSearch:(query)=>{
                this.fetchUsers(query);
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
        this.setState({isLoading:true, query})
        const onResponse = (users:Array<Contract.User>) => {
            this.setState({users, isLoading:false})
        }

        const onReject = (error:Error) => {
            this.setState({isLoading:false})
        }

        if(query){
            DatabaseHelpers.User.fetchWithQuery(query)
            .then(onResponse)
            .catch(onReject)
        }else{
            this.setState({users:[]})
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

    onPressInviteContacts = async () => {
        try {
            const link = await firebase.dynamicLinks().buildShortLink({
                link:`${Values.Strings.DYNAMIC_LINK_PLAN_URL}/planKeyGoesHere`,
                domainUriPrefix:Values.Strings.DYNAMIC_LINK_URI_PREFIX,
                android:{
                    packageName:Values.Strings.ANDROID_PACKAGE_NAME
                },
                ios:{
                    bundleId:Values.Strings.IOS_BUNDLE_ID
                },
            }, 'UNGUESSABLE');

            
            const result = await Share.share({
            message:
                `Hey,\n\nUse the link below to download EatSnP app.\n${link}\n\nIt's realy great for sharing and planning your food experiences, let me know when you are done and let's plan something together.`
            });
    
            if (result.action === Share.sharedAction) {
            if (result.activityType) {
                // shared with activity type of result.activityType
            } else {
                // shared
            }
            } else if (result.action === Share.dismissedAction) {
            // dismissed
            }
        } catch (error) {
            alert(error.message);
        }
    };
    

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

    _renderListFooter = () => {
        const {isLoading, users, query} = this.state;
        const statusText = query?
        "No users found for your query":"Seems you do not have followers yet, try searching for users instead or"

        if(isLoading){
            return (
                <View>
                    <ActivityIndicator style={{marginTop:56}} animating={true} size='large' />
                </View>
            )
        }
        return (
            <View>
                {!users.length &&
                    <Text style={styles.statusText}>{statusText}</Text>
                }
                <Button 
                    title={"Invite From Contacts"}
                    type={"clear"}
                    color={Values.Colors.COLOR_PRIMARY}
                    onPress={this.onPressInviteContacts}
                />
            </View>
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
                    ListFooterComponent={this._renderListFooter}
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
    },
    statusText:{
        marginTop:56,
        fontSize:18,
        fontWeight:'600',
        textAlign:'center',
        color:Values.Colors.COLOR_GRAY,

    }
})