import {StyleSheet, Text, TouchableHighlight, View} from 'react-native';
import {RemRecords, RemStatus} from '../../types/Word';
import React, {useMemo} from 'react';

function WordRemButton({
  status,
  time,
  clickHandler,
}: RemRecords & {clickHandler: (status: RemStatus) => void}) {
  const color = useMemo(() => {
    switch (status) {
      case 'forgot':
        return '#bb4a4a';
      case 'vague':
        return '#bbbb3a';
      case 'remember':
        return '#37b237';
    }
  }, [status]);

  const translateStatus = useMemo(() => {
    switch (status) {
      case 'forgot':
        return '忘记';
      case 'vague':
        return '模糊';
      case 'remember':
        return '记得';
    }
  }, [status]);

  return (
    <TouchableHighlight
      style={{flex: 1, borderRadius: 5}}
      onPress={() => {
        clickHandler(status);
      }}>
      <View
        style={{
          backgroundColor: color,
          borderRadius: 5,
          flexDirection: 'column',
          padding: 10,
        }}>
        <Text style={{fontSize: 15, color: '#e6e6e6', textAlign: 'center'}}>{translateStatus}</Text>
        <Text style={styles.text}>{status}</Text>
        <Text style={styles.text}>{time} days later</Text>
      </View>
    </TouchableHighlight>
  );
}

const styles = StyleSheet.create({
  text: {
    fontSize: 12,
    color: '#e6e6e6',
    textAlign: 'center',
  },
});
export default WordRemButton;
