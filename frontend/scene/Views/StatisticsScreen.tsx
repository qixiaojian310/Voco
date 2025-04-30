import {Platform, StatusBar, StyleSheet, Text, View} from 'react-native';
// import { BarChart } from 'react-native-gifted-charts';
import {Tab, TabView} from '@rneui/themed';
import React from 'react';
import ForgetCurve from './StatisticsTabs/ForgetCurve';
import Schedule from './StatisticsTabs/Schedule';

function StatisticsScreen() {
  const [index, setIndex] = React.useState(0);

  return (
    <View style={{flex: 1}}>
      <View style={styles.toolbar} />
      <Tab
        value={index}
        onChange={e => setIndex(e)}
        indicatorStyle={{
          backgroundColor: 'white',
          height: 3,
        }}
        variant="default">
        <Tab.Item
          title="Forget curve"
          titleStyle={{fontSize: 12}}
          icon={{name: 'analytics', type: 'ionicon', color: 'white'}}
        />
        <Tab.Item
          title="Your plan"
          titleStyle={{fontSize: 12}}
          icon={{name: 'clipboard', type: 'ionicon', color: 'white'}}
        />
        <Tab.Item
          title="Memory"
          titleStyle={{fontSize: 12}}
          icon={{name: 'book', type: 'ionicon', color: 'white'}}
        />
      </Tab>

      <TabView value={index} onChange={setIndex} animationType="spring">
        <TabView.Item style={{backgroundColor: '#00000052', width: '100%'}}>
          <ForgetCurve />
        </TabView.Item>
        <TabView.Item style={{backgroundColor: '#00000052', width: '100%'}}>
          <Schedule />
        </TabView.Item>
        <TabView.Item style={{backgroundColor: '#00000052', width: '100%'}}>
          <Text>Cart</Text>
        </TabView.Item>
      </TabView>
    </View>
  );
}

const styles = StyleSheet.create({
  toolbar: {
    backgroundColor: '#d784ec6e',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
    boxSizing: 'content-box',
  },
});
export default StatisticsScreen;
