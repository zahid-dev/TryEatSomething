/*
@flow
@format
*/

import React from 'react';
import {
    View,
    StyleSheet,
    Image, 
    Text,
} from 'react-native'

import * as Values from '../res/Values';
import * as Contract from '../firebase/Contract';

type Props = {
    restaurant:Contract.Restaurant
}

type State = {

}

export default class RestaurantHeader extends React.Component<Props, State> {

    render(){
        const restaurant = this.props.restaurant;
        return (
            <View style={styles.container}>
                <Image
                style={styles.image}
                source={Values.Images.RESTAURANTS}
                />
                <View style={styles.contentContainer} >
                    <Text style={styles.title}>{restaurant.name}</Text>
                    <Text style={styles.subTitle}>{restaurant.address}</Text>
                </View>
            </View>     
        )
    }

}

const styles = StyleSheet.create({
    container:{
        padding: 10,
        color: '#000',
        backgroundColor: '#fff',
        justifyContent: 'flex-start',
        flexDirection: 'row',
        alignItems:'center',
        position: 'relative',
    },
    image:{
        width: 50,
        height: 50,
        marginLeft: 10,
        marginRight: 5,
        tintColor:Values.Colors.COLOR_GRAY
    },
    contentContainer:{
        flexWrap: 'wrap',
        alignContent: 'flex-start',
        marginLeft: 5,
        marginTop: 2,
        flex: 1,
        textAlign: 'justify',
        lineHeight: 2,
    },
    title:{
        fontSize:20
    },
    subTitle:{
        fontSize: 12,
        flexWrap: 'wrap',
        color:Values.Colors.COLOR_GRAY,
        width: 250,
    }
})