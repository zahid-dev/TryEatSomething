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

export default class RestaurantMenu extends React.Component<{}> {


    _renderNoMenu(){
        return (
        <View style={styles.container}>
            <Text style={styles.noMenu}>Restaurant has not shared menu</Text>
        </View>
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

    _renderMenuItem = (item)=> {
        var entriesView = null;
        const entries = item.entries;
        if(entries && entries.count){
            entriesView = entries.items.map(this._renderEntryItem)
        }
        return (
            <View key={item.menuId} style={{marginBottom:16}} >
                <Text style={styles.title}>{item.name}</Text>
                {entriesView}
            </View>
        )
    }

    render(){
        const menu = this.props.menu;
        
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
        color:Values.Colors.COLOR_BLACK
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