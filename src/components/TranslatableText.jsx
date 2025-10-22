import React from 'react';
import { Text } from 'react-native';

const TranslatableText = ({ children, style, numberOfLines }) => {
  return (
    <Text style={style} numberOfLines={numberOfLines}>
      {children}
    </Text>
  );
};

export default TranslatableText;
