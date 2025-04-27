import {BarChart} from 'react-native-gifted-charts';
import React, {useState} from 'react';
import {LayoutChangeEvent, Text, View, ScrollView} from 'react-native';

function Schedule() {
  const [height, setHeight] = useState(0);

  const handleLayout = (event: LayoutChangeEvent) => {
    const {height:layoutHeight} = event.nativeEvent.layout;
    setHeight(layoutHeight - 100);
  };

  const forgetData = [
    {
      label: '1 days bafore',
      stacks: [
        {value: 10, color: 'orange'},
        {value: 20, color: '#4ABFF4', marginBottom: 2},
      ],
    },
    {
      label: '2 days bafore',
      stacks: [
        {value: 10, color: '#4ABFF4'},
        {value: 11, color: 'orange', marginBottom: 2},
        {value: 15, color: '#28B2B3', marginBottom: 2},
      ],
    },
    {
      label: '3 days bafore',
      stacks: [
        {value: 14, color: 'orange'},
        {value: 18, color: '#4ABFF4', marginBottom: 2},
      ],
    },
  ];
  return (
    <View style={{flex: 1}}>
      <ScrollView
        style={{
          flex: 1,
          marginHorizontal: 20,
        }}
        onLayout={handleLayout}>
        <BarChart stackData={forgetData} height={height} isAnimated spacing={100} />
      </ScrollView>
      <View
        style={{
          height: 200,
        }}>
        <Text>123</Text>
      </View>
    </View>
  );
}
export default Schedule;
