import {Divider} from '@rneui/themed';
import {Text, View} from 'react-native';
import React from 'react';

function WordContentCard({
  children,
  title,
}: {
  children: React.JSX.Element | React.JSX.Element[];
  title: string;
}) {
  return (
    <View style={{borderColor: '#d5d0d0', marginBottom: 10}}>
      <View
        style={{
          paddingLeft: 10,
          paddingRight: 10,
          paddingTop: 5,
          paddingEnd: 5,
        }}>
        <Text style={{fontSize: 12, color: '#ffffff'}}>{title}</Text>
      </View>
      <Divider width={2} color="#383838" />
      <View
        style={{
          paddingLeft: 10,
          paddingRight: 10,
          backgroundColor: '#00000056',
        }}>
        {children}
      </View>
    </View>
  );
}

export default WordContentCard;
