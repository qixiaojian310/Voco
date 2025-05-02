import {Platform, StatusBar, StyleSheet, View} from 'react-native';
// import { BarChart } from 'react-native-gifted-charts';
import {Tab, TabView} from '@rneui/themed';
import React from 'react';
import ForgetCurve from './StatisticsTabs/ForgetCurve';
import Schedule from './StatisticsTabs/Schedule';
import MemoryList from './StatisticsTabs/MemoryList';

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
        style={{
          backgroundColor: '#a4a3e895',
        }}
        variant="default">
        <Tab.Item
          title="Forget curve"
          titleStyle={{fontSize: 12, color: 'white'}}
          icon={{name: 'analytics', type: 'ionicon', color: 'white'}}
        />
        <Tab.Item
          title="Your plan"
          titleStyle={{fontSize: 12, color: 'white'}}
          icon={{name: 'clipboard', type: 'ionicon', color: 'white'}}
        />
        <Tab.Item
          title="Memory"
          titleStyle={{fontSize: 12, color: 'white'}}
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
          <MemoryList />
        </TabView.Item>
      </TabView>
    </View>
  );
}

const styles = StyleSheet.create({
  toolbar: {
    backgroundColor: '#a4a3e895',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
    boxSizing: 'content-box',
  },
});
export default StatisticsScreen;
