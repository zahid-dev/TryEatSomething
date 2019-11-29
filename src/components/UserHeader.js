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

type Props = {
    user:Contract.User
}

export default class UserHeader extends React.Component<Props, *>{

    render(){
        const user = this.props.user;
        
        if(!user) return null;

        const username = user.Name;
        const subTitle = `${user.totalRecommendations} Recommendataions - ${user.totalFollowers} Followers`;
        
        return (
            <View style={{flexDirection:'row', marginTop:8}}>
                <Image 
                    style={{width:32, height:32, tintColor:Values.Colors.COLOR_GRAY, marginRight:8}}
                    source={Values.Images.USER}
                    resizeMode="contain"
                />
                <View>
                    <Text>{username} </Text>
                    <Text style={{color:Values.Colors.COLOR_GRAY}}>
                        {subTitle}
                    </Text>
                </View>
            </View>
        )
    }

}

const styles = StyleSheet.create({
    container:{
        flexDirection:'row',
    }
})