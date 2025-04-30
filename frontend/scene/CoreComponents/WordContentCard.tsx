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
    <View style={{borderColor: '#b5b5b5'}}>
      <View
        style={{
          paddingLeft: 10,
          paddingRight: 10,
          paddingTop: 5,
          paddingEnd: 5,
        }}>
        <Text style={{fontSize: 12, color: '#000000'}}>{title}</Text>
      </View>
      <Divider width={2} color="#e0e0e0" />
      <View
        style={{
          paddingLeft: 10,
          paddingRight: 10,
          backgroundColor: '#ffffff57',
        }}>
        {children}
      </View>
      <Divider width={4} color="#c4c4c4" />
    </View>
  );
}

export default WordContentCard;
