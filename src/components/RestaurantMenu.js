/*
@flow
@format
*/


import React from 'react';
import {
    View,
    Text,
    StyleSheet,
} from 'react-native';
import * as Values from '../res/Values';
import { TouchableOpacity } from 'react-native-gesture-handler';
import {Button} from 'react-native-elements'

type Props = {

}

type State = {
    showMenuMap:Map<string, boolean>
}


export default class RestaurantMenu extends React.Component<Props, State> {


    state = {
        showMenuMap:new Map<string, boolean>()
    }

    _renderNoMenu(){
        return (
        <View style={styles.container}>
            <Text style={styles.noMenu}>Restaurant has not shared menu</Text>
        </View>
        )
    }

    _renderShowButton(){
        return (
            <TouchableOpacity onPress={()=>{this.setState({showMenu:true})}}>
                <View style={styles.container}>
                    <Text style={styles.noMenu}>Tap To Show Menu</Text>
                </View>
            </TouchableOpacity>
        )
    }

    _renderEntryItem = (item) => {
        var subEntriesView = null;
        const entries = item.entries;
        if(entries && entries.count){
            subEntriesView = entries.items.map(this._renderEntryItem)
        }

        return (
            <View key={item.entryId} style={{marginLeft:16, marginTop:8,}}>
                <Text style={styles.subTitle}>{item.name}</Text>
                {item.description && 
                    <Text style={styles.description}>{item.description}</Text>}
                {subEntriesView}
            </View>
        )
    }

    _renderMenuItem = (item, index)=> {
        var entriesView = null;
        const showMenu = this.state.showMenuMap.get(item.menuId) || false
        const entries = item.entries;
        const onPress = () => {
           this.setState((state)=>{
                state.showMenuMap.set(item.menuId, !showMenu)
                return state;
           })
        }
        if(entries && entries.count){
            entriesView = entries.items.map(this._renderEntryItem)
        }
        return (
            <View key={item.menuId} style={{marginBottom:16}} >
                <Button 
                    buttonStyle={styles.titleWrapper}
                    titleStyle={styles.title} 
                    title={item.name} 
                    onPress={onPress}
                    type="outline"
            
                />
                {showMenu && entriesView}
            </View>
        )
    }

    render(){
        const menu = this.props.menu;
        const showMenu = this.state.showMenu;
        
        if(!menu) return this._renderNoMenu();

        const menuItems = menu.menus.items;

        const retView = menuItems.map(this._renderMenuItem)

        return (
            <View style={styles.container}>
                {retView}
            </View>
        )
    }
}

const styles = StyleSheet.create({
    container:{
        margin:12,
        paddingLeft:16,
        paddingRight:16,
        paddingTop:8,
        paddingBottom:8,
        backgroundColor: Values.Colors.COLOR_LIGHT_GRAY,
        justifyContent: 'flex-start',
        borderRadius:12,
    },
    title:{
        fontSize:18,
        fontWeight:'600',
        color:Values.Colors.COLOR_BLACK,
        textAlign:"left",
    },
    titleWrapper:{
        borderColor:Values.Colors.COLOR_GRAY,
        borderTopWidth:0,
        borderRightWidth:0,
        borderLeftWidth:0,
        justifyContent:'flex-start'
    },
    noMenu:{
        fontSize:18,
        fontWeight:'600',
        color:Values.Colors.COLOR_GRAY
    },
    subTitle:{
        color:Values.Colors.COLOR_BLACK
    },
    description:{
        color:Values.Colors.COLOR_GRAY
    }

})