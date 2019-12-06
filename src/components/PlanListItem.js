/*
@flow
@format
*/

import React from 'react';
import {
    Text,
    View,
    Platform,
    TouchableOpacity,
    StyleSheet,
    Linking,
    Image,
} from 'react-native';

import {Button} from 'react-native-elements';
import * as Values from '../res/Values';
import RatingStars from '../components/RatingStars';
import * as Contract from '../firebase/Contract';
import firebase from 'react-native-firebase';

type Props = {
    item:Contract.Plan,
    onPlanPress:(string)=>void
}

type State = {
    thisMemberStatus:string,
    numGoing:number,
    numInterested:number,
    numPending:number,
}

export default class PlanListItem extends React.Component<Props, State> {

    state = {
        thisMemberStatus:Contract.PlanMember.STATUS_PENDING,
        numGoing:0,
        numInterested:0,
        numPending:0
    }

    static getDerivedStateFromProps(props:Props, state:State){
        const plan = props.item;
        const uid  = firebase.auth().currentUser.uid;

        if(plan){
            var thisMemberStatus = Contract.STATUS_PENDING
            var going = 0;
            var interested = 0;
            var pending = 0;
            plan.members.forEach((member)=>{

                if(member.uid === uid){
                    thisMemberStatus = member.status
                }

                switch(member.status){
                    case Contract.PlanMember.STATUS_PENDING:
                        pending++;
                        break;
                    case Contract.PlanMember.STATUS_GOING:
                        going++
                        break;
                    case Contract.PlanMember.STATUS_INTERESTED:
                        interested++;
                        break;
                }
            })

            state.thisMemberStatus = thisMemberStatus;
            state.numGoing = going;
            state.numInterested = interested;
            state.numPending = pending;
        }

        return state;  
    }

    showDirectionsOnMap = () => {
        const item = this.props.item;
        const restaurant = item.restaurant;

        if(!restaurant.location) {
            alert("Location data not available for this restaurant");
            return;
        }
        const lat = restaurant.location.lat;
        const lng = restaurant.location.lng;
        const scheme = Platform.select({ ios: 'maps:0,0?q=', android: 'geo:0,0?q=' });
        const latLng = `${lat},${lng}`;
        const label = restaurant.name;
        const url = Platform.select({
            ios: `${scheme}${label}@${latLng}`,
            android: `${scheme}${latLng}(${label})`
        });

        Linking.openURL(url); 
    }


    _renderItemHeader(){
        const {mode, item} = this.props;
        const restaurant = item.restaurant
        
        if(!restaurant) return null;
        const imgSource = {uri:(restaurant.photoURL || restaurant.photo)};
        
        return (
            <View style={{marginTop:16}}>
                <Image
                    style={styles.imageRestaurant}
                    source={imgSource}
                    resizeMode='cover'
                    />
                
                <View style={styles.ratingContainer}>
                    <Text style={{fontWeight:'600'}}>
                        {item.title}
                    </Text>
                </View>
                
                <View style={styles.waitTimeContainer}>
                    <Text>
                        {"Wed 12:14"}
                    </Text>
                </View>
            </View>
        )
    }


    _renderStatusButton(){
        const thisMemberStatus = this.state.thisMemberStatus;
        const onPress = () => {
            const planKey = this.props.item.key;
            this.props.onPlanPress(planKey);
        }
        return (
            <TouchableOpacity onPress={onPress} >
                <View style={{
                        width:100, 
                        backgroundColor:Values.Colors.COLOR_PRIMARY, 
                        justifyContent:'center', 
                        alignItems:'center', 
                        borderRadius:16,
                        paddingTop:4,
                        paddingBottom:4,
                        }}>
                        <Text style={{
                            color:Values.Colors.COLOR_WHITE               
                            }}>
                            {this.state.thisMemberStatus}
                        </Text>
                </View>
            </TouchableOpacity>
        )
    }


    _renderContent(){
        const {mode, item} = this.props;
    
        const restaurant = item.restaurant;
        if(!restaurant) return null;

        var categoryText = "Food";
        try{
           categoryText = restaurant.categories[0].name;
        }catch{}

        const subText = restaurant.address.join(', ');
        return (
            <View style={styles.bottomLine1}>
                <View style={{flex:1}}>
                    
                    <View style={{flexDirection:'row', justifyContent:'space-between'}}>
                        <View>
                            <Text style={{color:Values.Colors.COLOR_PRIMARY, fontWeight:'600'}}>{categoryText}</Text>
                            <Text style={styles.title}>{restaurant.name}</Text>
                        </View>
                        {this._renderStatusButton()}
                    </View>
    
                    <Text style={styles.subTitle} numberOfLines={1}>
                        {subText}
                    </Text>

                    { item.description && (
                        <Text style={styles.subTitle}>
                            {item.description}
                        </Text>
                        )
                    }    
                   {
                       this._renderStats()
                   }   
   
                </View>
            </View>
        )
    }


    _renderStats(){
        const {numGoing, numInterested, numPending} = this.state
        const statsLabel = `${numGoing} Going, ${numInterested} Interseted, ${numPending} Pending`;
        return (
            <View>
                <Text>
                    {statsLabel}
                </Text>
            </View>
        )
    }


    _renderActionPanel(){
        const item = this.props.item;
        const mode = this.props.mode;

        const planKey = item.key
        return (
            <View style={styles.actionPanel}>
            
                <Button 
                    title={'Details'} 
                    titleStyle={{color:Values.Colors.COLOR_BLACK}}  
                    type='clear'
                    onPress={()=>{this.props.onPlanPress(planKey)}} />
                <View style={{width:StyleSheet.hairlineWidth, height:'100%', backgroundColor:Values.Colors.COLOR_MID_GRAY}}/>
                <Button 
                    title={'Directions'} 
                    titleStyle={{color:Values.Colors.COLOR_BLACK}}  
                    type='clear'
                    onPress={this.showDirectionsOnMap} />
            </View>
        )
    }


    render(){
        const plan = this.props.item;
        const onContainerPress = () => {
            const planKey = plan.key; 
            this.props.onPlanPress(planKey)
        }
        return (
            <TouchableOpacity onPress={onContainerPress}>
                <View style={styles.container}>
 
                {
                    this._renderItemHeader()
                }
        
                <View style={styles.bottomContentContainer}>
                   {
                       this._renderContent()
                   }
         
                   <View style={{height:StyleSheet.hairlineWidth, width:'100%', backgroundColor:Values.Colors.COLOR_MID_GRAY}}/>
                   {
                       this._renderActionPanel()
                   }
                
                </View>

                </View>
            </TouchableOpacity>
          )
    }
}


const styles = StyleSheet.create({
    container: {
        marginLeft: 16,
        marginRight:16,
        marginBottom:16
    },
    ratingContainer:{
        position: 'absolute',
        top: 120,
        left: 0,
        paddingLeft:8,
        paddingRight:8,
        paddingTop:4,
        paddingBottom:4,
        marginBottom:16,
        backgroundColor:Values.Colors.COLOR_WHITE,
        borderBottomEndRadius:12,
        borderTopEndRadius:12
    },
    waitTimeContainer:{
        position: 'absolute',
        top: 120,
        right: 0,
        paddingLeft:8,
        paddingRight:8,
        paddingTop:4,
        paddingBottom:4,
        marginBottom:16,
        backgroundColor:Values.Colors.COLOR_WHITE,
        borderBottomStartRadius:12,
        borderTopStartRadius:12
    },
    imageRestaurant: {
        height: 176,
        width: '100%',
        borderRadius:12,
    },
    actionPanel:{
        flexDirection:'row',
        justifyContent:'space-around',
       
    },
    bottomContentContainer: {
        marginTop:8,
        paddingLeft:16,
        paddingRight:16,
        paddingTop:8,
        paddingBottom:8,
        backgroundColor: Values.Colors.COLOR_LIGHT_GRAY,
        justifyContent: 'flex-start',
        borderRadius:12,
      },
    bottomLine1:{
        flexDirection:'row',
        justifyContent:'space-between',
        paddingBottom:8,
    },
    title: {
        fontSize: 18,
        color: Values.Colors.COLOR_BLACK,
        fontWeight: '600',
        textAlign: 'left',
        flex: 1,
        position: 'relative',
      },
      subTitle:{
        color:Values.Colors.COLOR_GRAY
      }
      
})