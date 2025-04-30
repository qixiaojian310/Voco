import AsyncStorage from '@react-native-async-storage/async-storage';
import {Button} from '@rneui/base';
import {View} from 'react-native';
import React from 'react';
import userStore from '../../stores/UserStore';


function ProfileScreen() {

  const logoutHandler = async () => {
    await AsyncStorage.removeItem('access_token');
    userStore.logout();
  };
  return (
    <View style={{flex: 1}}>
      <Button
        title="Logout"
        onPress={() => {
          logoutHandler();
        }}
      />
    </View>
  );
}
export default ProfileScreen;
