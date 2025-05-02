import AsyncStorage from '@react-native-async-storage/async-storage';
import {Button} from '@rneui/base';
import {Platform, StatusBar, StyleSheet, Text, View} from 'react-native';
import React from 'react';
import userStore from '../../stores/UserStore';
import {Avatar} from '@rneui/themed';
import {useFocusEffect} from '@react-navigation/native';

function SettingComponent({title}) {
  return (
    <View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
      <Text>{title}</Text>
    </View>
  );
}

function ProfileScreen() {
  const [userInfo, setUserInfo] = React.useState<any>(null);

  const logoutHandler = async () => {
    await AsyncStorage.removeItem('access_token');
    userStore.logout();
  };

  const initInfo = async () => {
    const userInfoJSON = await AsyncStorage.getItem('userInfo');
    if (userInfoJSON) {
      const userInfo = JSON.parse(userInfoJSON);
      console.log(userInfo);
      setUserInfo(userInfo);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      initInfo();
    }, []),
  );
  return (
    <View style={{flex: 1}}>
      <View style={styles.toolbar} />
      {userInfo && (
        <View style={styles.userInfo}>
          <Avatar
            size={64}
            title={userInfo.username.substring(0, 2)}
            containerStyle={{backgroundColor: '#767676', borderRadius: 10}}
          />
          <Text style={styles.username}>{userInfo.username}</Text>
        </View>
      )}
      {
        userInfo && (
         <View style={{flex: 1}}>
          <SettingComponent title="Daily Goal" />
          <SettingComponent title="Language" />
          <SettingComponent title="Theme" />
        </View>
        )
      }
      <Button
        title="Logout"
        onPress={() => {
          logoutHandler();
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  toolbar: {
    backgroundColor: '#8684ec6d',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
    boxSizing: 'content-box',
  },
  userInfo:{
    padding: 10,
    marginHorizontal: 10,
    marginVertical: 20,
    borderRadius: 10,
    flexDirection: 'row',
    gap: 10,
    backgroundColor: '#ffffff98',
    boxShadow: '0 0 10 1 #000000',
  },
  username:{
    fontSize: 20,
    fontWeight: 'bold',
  },
});
export default ProfileScreen;
