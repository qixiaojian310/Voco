import {Platform, StatusBar, StyleSheet, Text, View} from 'react-native';
// import { BarChart } from 'react-native-gifted-charts';
import {Tab, TabView} from '@rneui/themed';
import React from 'react';

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
        variant="primary">
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
        <TabView.Item style={{backgroundColor: '#ffffff52', width: '100%'}}>
          <Text>Recent</Text>
        </TabView.Item>
        <TabView.Item style={{backgroundColor: '#ffffff52', width: '100%'}}>
          <Text>Favorite</Text>
        </TabView.Item>
        <TabView.Item style={{backgroundColor: '#ffffff52', width: '100%'}}>
          <Text>Cart</Text>
        </TabView.Item>
      </TabView>
    </View>
  );
}

const styles = StyleSheet.create({
  toolbar: {
    backgroundColor: '#a2bfc3c5',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
    boxSizing: 'content-box',
  },
});
export default StatisticsScreen;
