/*
@flow
@format
*/

import React from 'react';
import {
    Text,
    View,
    Button,
    Platform,
    TouchableOpacity,
    StyleSheet,
    Linking,
    Image,
} from 'react-native';

import * as Values from '../res/Values';
import RatingStars from '../components/RatingStars';
import { getImageSource } from 'react-native-vector-icons/FontAwesome';
import * as Contract from '../firebase/Contract';

const MODE_RESTAURANT = 'restaurant'
const MODE_RECOMMENDATION = 'recommendation'

type Props = {
    item:Contract.Plan,
    mode:MODE_RECOMMENDATION|MODE_RESTAURANT,
    onRestaurantPress:(string)=>void
}

type State = {

}

export default class PlanListItem extends React.Component<Props, State> {

    showDirectionsOnMap = () => {
        const item = this.props.item;

        const restaurant = item.restaurant?item.restaurant:item;
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


    _renderUserRelatedInfo(){
        const item = this.props.item;
        const user = item.user;

        if(!user) return null;

        const username = item.user.Name;
        const subTitle = `${item.user.totalRecommendations} Recommendataions - ${item.user.totalFollowers} Followers`;
        
        const onUserPress = () => {
            this.props.onUserPress(item.uid)
        }

        return (
            <TouchableOpacity onPress={onUserPress}>
                <View style={{flexDirection:'row', marginTop:8}}>
                    <Image 
                        style={{width:32, height:32, tintColor:Values.Colors.COLOR_GRAY, marginRight:8}}
                        source={Values.Images.USER}
                        resizeMode="contain"
                    />
                    <View>
                        <Text>{item.user.Name} </Text>
                        <Text style={{color:Values.Colors.COLOR_GRAY}} >{subTitle}</Text>
                    </View>
                </View>
            </TouchableOpacity>
        )
    }

    _renderItemHeader(){
        const {mode, item} = this.props;

        const recommendationMode = mode === MODE_RECOMMENDATION;
        const restaurant = recommendationMode? item.restaurant:item;
        
        if(!restaurant) return null;

        const waitTimeText = item.waittime + " Min";
        const imgSource = {uri:(restaurant.photoURL || restaurant.photo)};
        
        return (
            <View>
                
                <Image
                    style={styles.imageRestaurant}
                    source={imgSource}
                    resizeMode='cover'
                    />
        
                {
                    item.rating &&
                    <View style={styles.ratingContainer}>
                        <RatingStars rating={item.rating||4} size={16} />
                    </View>
                }
                {
                    // item.waittime &&
                    // <View style={styles.waitTimeContainer}>
                    //     <Text style={{color:Values.Colors.COLOR_GRAY, fontWeight:'600'}}>{waitTimeText}</Text> 
                    // </View>
                }
            </View>
        )
    }

    _renderContent(){
        const {mode, item} = this.props;
        const recommendationMode = mode === MODE_RECOMMENDATION;
        const restaurant = recommendationMode? item.restaurant:item;
        if(!restaurant) return null;

        var categoryText = "Food";
        try{
           categoryText = restaurant.categories[0].name;
        }catch{}

        const subText = recommendationMode? item.description:restaurant.address.join(', ');
        return (
            <View style={styles.bottomLine1}>
                <View style={{flex:1}}>
                    <Text style={{color:Values.Colors.COLOR_PRIMARY, fontWeight:'600'}}>{categoryText}</Text>
                    
                    <Text style={styles.title}>{restaurant.name}</Text>
    
                    <Text style={styles.subTitle} numberOfLines={recommendationMode?0:1}>
                    {subText}
                    </Text>
                    {mode === MODE_RECOMMENDATION &&
                        this._renderUserRelatedInfo()
                    }
                </View>
            </View>
        )
    }

    _renderActionPanel(){
        const item = this.props.item;
        const mode = this.props.mode;
        const recommendationMode = mode === MODE_RECOMMENDATION;
        const restaurantKey = recommendationMode? item.restaurantKey:item.id
        return (
            <View style={styles.actionPanel}>
                {!recommendationMode &&
                    <Button 
                        title={'Recommend'} 
                        color={Values.Colors.COLOR_BLACK} 
                        onPress={this.props.onRecommendPress} />
                }
                {!recommendationMode &&
                    <View style={{width:StyleSheet.hairlineWidth, height:'100%', backgroundColor:Values.Colors.COLOR_MID_GRAY}}/>
                }
                <Button 
                    title={'Details'} 
                    color={Values.Colors.COLOR_BLACK}  
                    onPress={()=>{this.props.onRestaurantPress(restaurantKey)}} />
                <View style={{width:StyleSheet.hairlineWidth, height:'100%', backgroundColor:Values.Colors.COLOR_MID_GRAY}}/>
                <Button 
                    title={'Directions'} 
                    color={Values.Colors.COLOR_BLACK}  
                    onPress={this.showDirectionsOnMap} />
            </View>
        )
    }

    render(){
        const item = this.props.item;
        const onContainerPress = () => {
            const restaurantKey = this.props.mode === MODE_RECOMMENDATION? item.restaurantKey:item.id; 
            this.props.onRestaurantPress(restaurantKey)
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