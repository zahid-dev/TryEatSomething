import React from 'react';
import {Text, TouchableOpacity} from 'react-native';

const Button = ({whenPressed, children}) => {
  const {buttonStyle, textStyle} = styles;
  return (
    <TouchableOpacity onPress={whenPressed} style={buttonStyle}>
      <Text style={textStyle}>{children}</Text>
    </TouchableOpacity>
  );
};

const styles = {
  textStyle: {
    alignSelf: 'center',
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    paddingTop: 10,
    paddingBottom: 10,
  },
  buttonStyle: {
    flex: 1,
    alighSelf: 'stretch',
    backgroundColor: '#000',
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#000 ',
    marginLeft: 10,
    marginRight: 10,
    marginTop: 10,
    marginBottom: 10,
  },
};

export {Button};
