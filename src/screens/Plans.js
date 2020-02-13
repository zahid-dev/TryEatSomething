import React, {Component} from 'react';
import {
  Text,
  View,
  Button,
  FlatList,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableWithoutFeedback,
  ActivityIndicator,
} from 'react-native';
import firebase from '@react-native-firebase/app';
import {Card, CardSection} from '../components/common';
import {withNavigation} from 'react-navigation';
import axios from 'axios';
import * as DatabaseHelpers from '../firebase/DatabaseHelpers';
import * as Contract from '../firebase/Contract';
import * as Values from '../res/Values';
import PlanListItem from '../components/PlanListItem';

type State = {
  plans:Array<Contract.Plan>
}

class Plans extends React.Component {

  static navigationOptions = {
    title:"Plans"
  }

  state = {
    isLoading:false,
    plans:[]
  }

  componentDidMount(){
    this.fetchPlans();
  }

  fetchPlans(){
    this.setState({isLoading:true})
    DatabaseHelpers.UserData.fetchUserPlans()
      .then((plans) => {
        const state = {isLoading:false}
        if(plans){
          state.plans = plans
        }else{
          state.plans = []
        }

        this.setState(state)
      })
      .catch((error:Error)=>{
        this.setState({plans:[], isLoading:false})
        console.warn("Failed to fetch plans: " + JSON.stringify(error));
        alert("Failed to fetch plans: " + error.message);
      })
  }

  openPlanDetails = (planKey:string) => {
    if(!planKey){
      console.warn("Cannot open plan details screen, Plan key not passed")
      return;
    }

    const {navigation} = this.props;
    navigation.navigate(Values.Screens.SCREEN_PLAN_DETAILS, {planKey})
  }

  _renderActivityIndicator(){
    return (
      <View style={styles.loadingPlaceholder}>
        <ActivityIndicator animating={true} size='large' />
      </View>
    )
  }

  _renderItem = ({item, index}) => {
    return (
      <PlanListItem 
        item={item} 
        onPlanPress={this.openPlanDetails}
        />
    )
  }

  render() {
    const {isLoading, plans} = this.state;
    if(isLoading){
      return this._renderActivityIndicator();
    }
    return (
      <View style={styles.container}>
        {
          plans.length?
            <FlatList 
              data={this.state.plans}
              renderItem={this._renderItem}
            />
            :
            <View style={styles.loadingPlaceholder}>
              <Text style={styles.textPlaceholder}>No Plans Found</Text>
            </View>
        }
      </View>
    );
  }
}


export default withNavigation(Plans);


const styles = StyleSheet.create({
  container:{
    flex:1
  },
  loadingPlaceholder:{
    flex:1,
    alignItems:'center',
    marginTop:128
  },
  textPlaceholder:{
    fontSize:18,
    fontWeight:'600',
    color:Values.Colors.COLOR_GRAY
  }
})