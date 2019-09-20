import React from 'react';
import {View} from 'react-native';

const Card = props => {
  return <View style={styles.containerStyle}>{props.children}</View>;
};

const styles = {
  containerStyle: {
    borderWidth: 0.5,
    borderRadius: 5,
    borderColor: '#ddd',
    borderBottomWidth: 0,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,

    elevation: 3,
    marginLeft: 10,
    marginRight: 10,
    marginTop: 10,
    marginBottom: 10,
  },
};

export {Card};
