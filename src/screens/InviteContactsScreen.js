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
    PermissionsAndroid,
    Clipboard,
    Platform,
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
import Contacts from 'react-native-contacts';

import SendSMS from 'react-native-sms'

const PARAM_PLAN_KEY = "planKey";
const PARAM_HOST_NAME = "hostName";
const PARAM_DATE_TIME_STRING = "dateTimeString";
const PARAM_RESTAURANT_NAME = "restaurantName";
const PARAM_ON_DONE_PRESS = "onDonePress";
const PARAM_UPDATE_SEARCH = "updateSearch";
const PARAM_HOME_SCREEN_KEY = "homeScreenKey";

type Params = {
    planKey:string,
    restaurantName:string,
    hostName:string,
    dateTimeString:string,
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
    contacts:Array<any>,
    isLoading:boolean,
    selectedContacts:Map<string, any>,
    processedContacts:boolean,
    linkCopied:boolean,
    planKey:string,
    hostName:string,
    restaurantName:string,
    dateTimeString:string,
}

export default class InviteContactsScreen extends React.Component<Props, State> {

    state = {
        isLoading:false,
        contacts:[],
        selectedContacts:new Map<string, any>(),
        planKey:'',
        linkCopied:false,
        processedContacts:false,
        planKey:'',
        hostName:'',
        restaurantName:'',
        dateTimeString:'',
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
                  placeholder="Search Contacts"
                  onChangeText={(text)=>{updateSearch(text)}}
                />
              </View>
            )
          }

        return {
            headerTitle:_renderSearchBar(),
            headerRight,
        }
    }

    constructor(props){
        super(props)
        const {navigation} = props

        navigation.setParams({
            onDonePress:()=>{


                const {linkCopied, processedContacts, selectedContacts} = this.state;
                if((selectedContacts.size > 0 && processedContacts) || linkCopied){
                    const homeScreenKey = navigation.getParam(PARAM_HOME_SCREEN_KEY);
                    navigation.goBack(homeScreenKey);
                    
                }
                else{
                    alert("Please send atleast one invite to continue")
                }
            },

            updateSearch:(query)=>{
                this.getContacts(query);
            }
        })

    }

    componentDidMount(){
        const planKey = this.props.navigation.getParam(PARAM_PLAN_KEY);
        const restaurantName = this.props.navigation.getParam(PARAM_RESTAURANT_NAME);
        const hostName = this.props.navigation.getParam(PARAM_HOST_NAME);
        const dateTimeString = this.props.navigation.getParam(PARAM_DATE_TIME_STRING);
        this.setState({planKey, restaurantName, hostName, dateTimeString})
        if(Platform.OS === 'ios'){
            this.getContacts();
        }
        else{
            this.checkPermission();
        }
    }

    checkPermission(){
        PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.READ_CONTACTS,
            {
              'title': 'Contacts',
              'message': 'Required for sending invites',
              'buttonPositive': 'Allow'
            }
          ).then(() => {
            this.getContacts();
          })
    }

    phonebookContactCallback = (err, contacts) => {
        if (err === 'denied'){
          // error
          this.setState({isLoading:false})
        } else {
          // contacts returned in Array
          contacts = contacts.map((contact)=>{
            if(!contact.displayName){
                contact.displayName = `${contact.givenName}${contact.middleName?" ":""}${contact.middleName} ${contact.familyName}`
            }
            return contact
          })
          contacts = contacts.sort((a, b)=>{
            const nameA = a.displayName
            const nameB = b.displayName;

            if (nameA < nameB) //sort string ascending
                return -1 
            if (nameA > nameB)
                return 1
            return 0 //default return value (no sorting)
          })
          this.setState({contacts, isLoading:false})
        }
      }

    getContacts(query:string = ''){
        this.setState({isLoading:true})
        if(query){
            Contacts.getContactsMatchingString(query, this.phonebookContactCallback)
        }else{
            Contacts.getAll(this.phonebookContactCallback)
        }

    }

    async makeInvitationLink(){
        //compile link
        const link = await firebase.dynamicLinks().buildShortLink({
            link:`${Values.Strings.DYNAMIC_LINK_PLAN_URL}/${this.state.planKey}`,
            domainUriPrefix:Values.Strings.DYNAMIC_LINK_URI_PREFIX,
            android:{
                packageName:Values.Strings.ANDROID_PACKAGE_NAME
            },
            ios:{
                bundleId:Values.Strings.IOS_BUNDLE_ID
            },
        }, 'UNGUESSABLE')

        return link;
    }

    sendSMSInvite = () => {
        this.makeInvitationLink()
        .then((link)=>{
            const {hostName, restaurantName, dateTimeString} = this.state;
            const message = `Hello,\n\n${hostName} has invited you to meet up at ${restaurantName} on ${dateTimeString}.\n\nPlease follow the link below to see details.\n${link}`;
        
            // compile contact phone numbers
            const phoneNumbers = [];
            const contactsMap = this.state.selectedContacts;
            contactsMap.forEach((contact)=>{
                if(contact.phoneNumbers && contact.phoneNumbers.length){
                    phoneNumbers.push(contact.phoneNumbers[0].number)
                }
            })

            //send sms
            SendSMS.send({
                body: message,
                recipients: phoneNumbers,
                successTypes: ['sent', 'queued'],
                allowAndroidSendWithoutReadPermission: true,
            }, (completed, cancelled, error) => {
                this.setState({processedContacts:true});
                console.log('SMS Callback: completed: ' + completed + ' cancelled: ' + cancelled + 'error: ' + error);
            });
        
        })
    }

    copyInvitationLink = async () => {
        try{
            const link = await this.makeInvitationLink();
            const {hostName, restaurantName, dateTimeString} = this.state;
            const message = `Hello,\n\n${hostName} has invited you to meet up at ${restaurantName} on ${dateTimeString}.\n\nPlease follow the link below to see details.\n${link}`;
                
            Clipboard.setString(message);
            const result = await Share.share({message});
        
            if (result.action === Share.sharedAction) {
            if (result.activityType) {
                // shared with activity type of result.activityType
            } else {
                // shared
            }
            } else if (result.action === Share.dismissedAction) {
            // dismissed
            }

            this.setState({linkCopied:true})
        }
        catch(err){
            console.warn("Failed to copy and share invitation link")
        }   
    }

    _renderItem = ({item}) => {

        const isSelected = this.state.selectedContacts.get(item.recordID);
        const onContactPress = () => {

                //add contact to map
                this.setState((state)=>{
                    if(state.selectedContacts.has(item.recordID)){
                        state.selectedContacts.delete(item.recordID)
                    }else{
                        state.selectedContacts.set(item.recordID, item);
                    }
                    return state;
                });
            // })

            
        }
        return (
            <View style={styles.itemContainer}>
                <Text style={styles.textName}> 
                    {item.displayName}
                </Text>
                <CheckBox 
                    checked={isSelected}
                    onPress={onContactPress}
                />
            </View>
            
        )
    }

    _renderActivityIndicator(){
        if(this.state.isLoading){
            return (
                <ActivityIndicator style={{marginTop:56}} animating={true} size='large' color={Values.Colors.COLOR_PRIMARY}/>
            )        
        }else{
            return null;
        }
    }

    _renderKeyExtractor = (item) => {return item.id}

    _renderActionPanel = () => {
        const totalSelected = this.state.selectedContacts.size;
        return (
            <View>
                <Button
                    title={'Copy Invitation Link'}
                    titleStyle={{color:Values.Colors.COLOR_PRIMARY}}
                    type='clear'
                    onPress={this.copyInvitationLink}
                />
                <Button 
                    title={`SMS Invite (${totalSelected}) Members`}
                    buttonStyle={styles.btnAction}
                    onPress={this.sendSMSInvite}
                />
                
            </View>
        )
    }

    render(){
        const planKey = this.props.navigation.getParam(PARAM_PLAN_KEY);
        const contacts = this.state.contacts;
        return(
            <View style={{padding:16, flex:1}}>
                
                {this._renderActivityIndicator()}
                <View style={{flex:1}}>
                <FlatList
                    keyboardShouldPersistTaps={'handled'}
                    data={contacts}
                    renderItem={this._renderItem}
                    keyExtractor={this._renderKeyExtractor}
                    extraData={this.state}/>
                </View>
                {this._renderActionPanel()}
            </View>
        )
    }

}

const styles = StyleSheet.create({
    itemContainer:{
        padding:8,
        flexDirection:'row',
        alignItems:'center',
        borderBottomWidth:StyleSheet.hairlineWidth,
        borderColor:Values.Colors.COLOR_LIGHT_GRAY,
    },
    textName:{
        flex:1,
        fontSize:18,
        fontWeight:'600',
    },
    btnAction:{
        backgroundColor:Values.Colors.COLOR_PRIMARY,
        margin:16,
        borderRadius:12,
    }
})