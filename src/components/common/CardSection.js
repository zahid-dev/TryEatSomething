import React from 'react';
import {View} from 'react-native';

const CardSection = props => {
  return <View style={styles.containerStyle}>{props.children}</View>;
};

const styles = {
  containerStyle: {
    height: 40,
    flex: 1,
    borderBottomWidth: 1,
    padding: 5,
    color: '#000',
    backgroundColor: '#fff',
    justifyContent: 'flex-start',
    flexDirection: 'row',
    borderColor: '#ddd',
    position: 'relative',
  },
};

export {CardSection};
