/* @flow */

import React, {Component} from 'react';
import {
  View,
    Image,
  Dimensions,
  TouchableOpacity,
  Button,
  Text,
} from 'react-native';

import firebase from 'react-native-firebase';
import * as Values from '../res/Values';

type Props = {
  onStarPress:(selectedStar:number)=>void,
  defaultRating:number,
}

type State = {
  selectedStar:number
}

export default class RatePanel extends React.Component<Props, State>{
  starsArray:Array<number> = [1,2,3,4,5]

  constructor(props){
    super(props)

    const selectedStar = props.defaultRating || 3;
    this.state = {selectedStar};
  }

  onStarPress(starNumber){
    this.setState({selectedStar:starNumber})
    this.props.onStarPress(starNumber);
  }

  _renderStar = (starNumber) => {
    const selectedStar = this.state.selectedStar;
    const tintColor = starNumber <= selectedStar?
      Values.Colors.COLOR_BLACK:Values.Colors.COLOR_MID_GRAY;

    return(
      <TouchableOpacity onPress={()=>{this.onStarPress(starNumber)}} >
        <Image style={{
            width:24,
            height:24,
            marginRight:8,
            tintColor:tintColor
          }}
          resizeMode='contain'
          source={Values.Images.IC_STAR}/>
      </TouchableOpacity>
    )
  }

  render(){
    const starViews = this.starsArray.map((starNumber) => this._renderStar(starNumber));

    return (
        <View style={{
          flexDirection:'row',
          alignItems:'center',       
          marginTop:8,
        }} >
          {starViews}
        </View>
    )
  }

}
