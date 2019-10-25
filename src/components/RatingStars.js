/*@flow*/

import React, {Component}  from 'react';

import {Platform,
  Image,
  Button,
  Text,
  View, } from 'react-native';

import * as Values from '../res/Values';


type Props = {
  size:number,
  rating:number,
}

type State = {}

export default class RatingStars extends React.Component<Props, State>{
  starsArray = [1,2,3,4,5]

  render(){
    const starsView = this.starsArray.map((starNumber:number)=>{

      const selectedStar = Math.round(this.props.rating || 1);
      const starSize = this.props.size || 32;

      const tintColor = starNumber <= selectedStar?
        Values.Colors.COLOR_BLACK:Values.Colors.COLOR_MID_GRAY;

      return(
          <Image style={{
              width:starSize,
              height:starSize,
              tintColor:tintColor
            }}
            key={starNumber+""}
            resizeMode='contain'
            source={Values.Images.IC_STAR}/>
      )
    })

    return (
      <View style={{flexDirection:'row'}} >
        {starsView}
      </View>
    );
  }

}
