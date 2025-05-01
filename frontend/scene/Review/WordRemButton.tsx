import {StyleSheet, Text, TouchableHighlight, View} from 'react-native';
import {RemRecords, RemStatus} from '../../types/Word';
import React, {useMemo} from 'react';

function WordRemButton({
  memory_status,
  record_time,
  clickHandler,
}: RemRecords & {clickHandler: (memory_status: RemStatus) => void}) {
  const color = useMemo(() => {
    switch (memory_status) {
      case 'forgot':
        return '#bb4a4a';
      case 'vague':
        return '#bbbb3a';
      case 'remembered':
        return '#37b237';
    }
  }, [memory_status]);

  const translateStatus = useMemo(() => {
    switch (memory_status) {
      case 'forgot':
        return '忘记';
      case 'vague':
        return '模糊';
      case 'remembered':
        return '记得';
    }
  }, [memory_status]);

  return (
    <TouchableHighlight
      style={{flex: 1, borderRadius: 5}}
      onPress={() => {
        clickHandler(memory_status);
      }}>
      <View
        style={{
          backgroundColor: color,
          borderRadius: 5,
          flexDirection: 'column',
          padding: 10,
        }}>
        <Text style={{fontSize: 15, color: '#e6e6e6', textAlign: 'center'}}>{translateStatus}</Text>
        <Text style={styles.text}>{memory_status}</Text>
        <Text style={styles.text}>{record_time} days later</Text>
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
