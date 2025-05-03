import {StyleSheet, View, Text, Image} from 'react-native';
import UserInfoContainer from '../CoreComponents/UserInfoContainer';
import React from 'react';

function RegisterScreen() {
  return (
    <View style={{flex: 1}}>
      {/* 背景图：绝对定位放最底层 */}
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'center',
          alignItems: 'center',
          height: 300,
        }}>
        <Text
          style={{
            color: '#424242',
            fontSize: 24,
            textAlign: 'center',
            fontWeight: 900,
          }}>
          Welcome to
        </Text>
        <Image
          style={{width: 100, height: 100, marginLeft: 10}}
          source={require('../../assets/icon.png')}
        />
      </View>
      <View style={styles.controller}>
      <UserInfoContainer />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  background: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
  },
  controller: {
    position: 'absolute',
    bottom: 40,
    zIndex: 3,
    left: 20,
    right: 20,
  },
});

export default RegisterScreen;
