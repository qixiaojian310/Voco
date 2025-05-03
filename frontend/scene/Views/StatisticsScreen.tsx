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
          backgroundColor: '#866833',
          height: 3,
        }}
        style={{
          backgroundColor: '#c0c0c099',
        }}
        variant="default">
        <Tab.Item
          title="Forget curve"
          titleStyle={{fontSize: 12, color: '#866833'}}
          icon={{name: 'analytics', type: 'ionicon', color: '#866833'}}
        />
        <Tab.Item
          title="Your plan"
          titleStyle={{fontSize: 12, color: '#866833'}}
          icon={{name: 'clipboard', type: 'ionicon', color: '#866833'}}
        />
        <Tab.Item
          title="Memory"
          titleStyle={{fontSize: 12, color: '#866833'}}
          icon={{name: 'book', type: 'ionicon', color: '#866833'}}
        />
      </Tab>

      <TabView value={index} onChange={setIndex} animationType="spring">
        <TabView.Item style={{width: '100%'}}>
          <ForgetCurve />
        </TabView.Item>
        <TabView.Item style={{width: '100%'}}>
          <Schedule />
        </TabView.Item>
        <TabView.Item style={{width: '100%'}}>
          <MemoryList />
        </TabView.Item>
      </TabView>
    </View>
  );
}

const styles = StyleSheet.create({
  toolbar: {
    backgroundColor: '#c0c0c099',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
    boxSizing: 'content-box',
  },
});
export default StatisticsScreen;
